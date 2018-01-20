var express = require('express');
var moment = require('moment');
var crypto = require('crypto');
var firebase = require("firebase");
var async = require('async');
var FCM = require('fcm-push');

var router = express.Router();

var logger = require('../logger');
var firebaseDB = require('../models/firebaseDB');

var apiKey = 'AAAAck3rlow:APA91bFI4DewoGHj32lnbfBU-aYqnVsOWqoG6ffr_PMbfiOTMPevTi__7n7Z9tm5nMFutaW0lGE1iVuRgOWqc2laeWjMWt8OLXJD2_aN-X59tQUaO_fmWe7pv7x1fHerzfPtKYrwnXbDhgcTnxAU7zAu-mXGILLQiw'; // fcm
var fcm = new FCM(apiKey);

function checkToken(token){
	var sha256 = crypto.createHash('sha256');
	// sha256.update("!7VcMJ^d"+moment().format('YYYYMMDD'));
	sha256.update("!7VcMJ^d"+moment().add(9, 'hour').format('YYYYMMDD'));
	var digest = sha256.digest('hex');

	if(digest === token){
		return true;
	}
	else return false;
}


function load_data_init(uid, res, exist){

	var load_bookmark_info = function(callback){
		firebaseDB.load_bookmark_info(uid, function(result){
			if(result != null){
				callback(null, result);
			}else if(result == "fail"){
				callback(null, "fail");
			}
		});
	}

	var load_recommend_question = function(callback){
		firebaseDB.load_recommend_question(null, function(result){
			if(result != null){
				callback(null, result);
			}else{
				callback(null, "fail");
			}
		});
	}

	var tasks = [];
	tasks.push(load_all_item);
	tasks.push(load_ad_info);
	tasks.push(load_bookmark_info);
	tasks.push(load_recommend_question);

	async.parallel( tasks, function(err, results){
		var err_cnt = 0;
		for(var i in results){
			if(results[i] == "fail") {
				err_cnt++;
			}
		}
		if(err_cnt > 0) {
			var result = {
				"valid" : true,
				"result" : false,
				"exist" : exist
			};

			res.json(result);

	  }else if(err_cnt ==0){
	  	var result = {
				valid : true,
				result : true,
				product_data : results[0],
				ad_data : results[1],
				bookmark : results[2],
				recommend : results[3],
				exist : exist
			};

			res.json(result);
		}//else

	});//async
}

function load_data_kakao_init(uid, res, exist){

	var load_recommend_question = function(callback){
		firebaseDB.load_recommend_question(null, function(result){
			if(result != null){
				callback(null, result);
			}else{
				callback(null, "fail");
			}
		});
	}

	var create_custom_token = function(callback){
		firebaseDB.create_custom_token(uid, function(result){
			if(result == "fail"){
				callback(null, "fail");
			}else{
				callback(null, result);
			}
		});
	}

	var load_bookmark_info = function(callback){
		firebaseDB.load_bookmark_info(uid, function(result){
			if(result != null){
				callback(null, result);
			}else if(result == "fail"){
				callback(null, "fail");
			}
		});
	}

	var tasks = [];

	if(exist){
		tasks.push(load_all_item);
		tasks.push(load_ad_info);
		tasks.push(create_custom_token);
		tasks.push(load_bookmark_info);
		tasks.push(load_recommend_question);

		async.parallel( tasks, function(err, results){
			var err_cnt = 0;
			for(var i in results){
				if(results[i] == "fail") {
					err_cnt++;
				}
			}
			if(err_cnt > 0) {
				var result = {
					"valid" : true,
					"result" : false,
					"exist" : exist,
					"msg" : "네트워크 상태가 불안정합니다."
				};

				res.json(result);

		  }else if(err_cnt ==0){
  	  	var result = {
  				valid : true,
  				result : true,
  				product_data : results[0],
  				ad_data : results[1],
  				customToken : results[2],
  				bookmark : results[3],
  				recommend : results[4],
  				exist : exist
  			};
  			res.json(result);

			}//else

		});//async

	}else{//exist == false
		res.json({
			valid : true,
			result : true,
			exist : exist
		});
	}
}

router.post("/join_with_kakao", function(req, res, next){

	if(checkToken(req.get('buying-x-code'))){
		var token = req.body.FCMToken;
		var name = req.body.name;
		var uid = req.body.uid;
		var phone = req.body.phone;
		var photo = req.body.photo;

		if(token != null && uid != null && phone != null){
			var obj = {};
			obj.token = token;
			obj.uid = uid;
			obj.phone = phone;
			obj.name = name;
			obj.photo = photo;

			firebaseDB.join_with_kakao(obj, function(result){
				if(result == "fail"){
					res.json({
						valid : true,
						result : false,
						msg : "네트워크 상태가 불안정합니다."
					});

				}else if(result == "success"){
					load_data_kakao_init(uid, res, true);
				}
			});

		}else{
			res.json({
				valid : true,
				result : false,
				msg : "유효하지 않은 파라미터"
			});
		}

	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

router.post("/kakao_user_check", function(req, res, next){
	if(checkToken(req.get('buying-x-code'))){
		var uid = req.body.uid;
		var token = req.body.FCMToken;
		if(uid != null && token != null){

			firebaseDB.kakao_user_check({uid : uid , token : token}, function(result){
				if(result == null){
					load_data_kakao_init(uid, res, false);

				}else if(result){//kakao가입 완료
					load_data_kakao_init(uid, res, true);
				}
			});
		}else{
			res.json({
				valid : true,
				result : false,
				msg : "유효하지 않은 파라미터"
			});
		}

	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

router.post("/join_with_facebook", function(req, res, next){
	if(checkToken(req.get('buying-x-code'))){
		var uid = req.body.uid;
		var id = req.body.id;
		var photo = req.body.photo;
		var phone = req.body.phone;
		var token = req.body.FCMToken;
		var name = req.body.name;
		if(uid != null && phone != null && token != null && name != null && id != null){

			var obj = {
				id : id,
				uid : uid,
				name : name,
				token : token,
				phone : phone,
				photo : photo
			}
			firebaseDB.join_with_facebook(obj, function(result){
				if(result == "success"){
					load_data_init(uid, res, true);
				}else{
					res.json({
						valid : true,
						result : false,
						msg : "네트워크 상태가 불안정합니다."
					});
				}
			});
		}

		else{
			res.json({
				valid : true,
				result : false,
				msg : "유효하지 않은 파라미터"
			});
		}

	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

router.post("/facebook_user_check", function(req, res, next){
	if(checkToken(req.get('buying-x-code'))){
		var id = req.body.id;
		var token = req.body.FCMToken;

		if(id != null && token != null){
			firebaseDB.facebook_user_check({id : id, token : token}, function(result){
				if(result == null){//가입 안한 상태
					res.json({
						valid : true,
						result : true,
						exist : false
					});

				}else{//facebook가입 완료
					load_data_init(result, res, true);
				}
			});

		}else{
			res.json({
				valid : true,
				result : false
			});
		}

	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

router.post("/phone_number_check", function(req, res, next){
	if(checkToken(req.get('buying-x-code'))){
		var phone = req.body.phone;
		if(phone != null){
			firebaseDB.phone_number_check(phone, function(result){
				if(result == null){
					res.json({
						valid : true,
						result : true,
						exist : false
					});

				}else{
					res.json({
						valid : true,
						result : true,
						email : result,
						exist : true
					});
				}
			});
		}else{
			res.json({
				valid : true,
				result : false
			});

		}
	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

router.post("/proxy_request", function(req, res, next){
	if(checkToken(req.get('buying-x-code'))){
		var uid = req.body.uid;
		var location = req.body.location;
		var url = req.body.url;
		var name = req.body.name;
		var ect = req.body.ect;

		if(uid != null){
			var obj = {
				uid : uid,
				location : location,
				url : "http://"+url,
				name : name,
				ect : ect,
				type : "대행",
				step : "응답전",
				date : moment().add(9, 'hour').format('YYYYMMDD hh:mm:ss')
			}

			firebaseDB.saveRequest(obj, function(result){
				if(result=="success"){
					res.json({
						valid : true,
						result : true
					});

				}else{
					res.json({
						valid : true,
						result : false,
						msg : "네트워크상태가 불안정 합니다."
					});
				}
			});

			firebaseDB.findAdmin_to_FCM(null, function(tokens){

				tokens.forEach(function(token){
					var message = {
					    to: token, // required
					    data : {
					    	type : "request"
					    },
					    notification : {
				        "title" : "주문 요청 도착",
				        "body" : "대행 주문이 접수되었습니다."
				      }
					};
					fcm.send(message, function(err, response){
					    if (err) {
					        console.log("Something has gone wrong!"+err);
					    } else {
					        console.log("Successfully sent with response: ", response);
					    }
					});
				});
			});

		}

	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

router.post("/bookmark", function(req, res, next){
	if(checkToken(req.get('buying-x-code'))){
		var uid = req.body.uid;
		var id = req.body.id;
		var bookmark = req.body.bookmark;

		if(uid !=null && id != null && bookmark != null){
			var obj = {
				uid : uid,
				id : id,
				bookmark : bookmark
			};
			firebaseDB.changeBookmark(obj, function(result){
				if(result == "success"){
					res.json({
						valid : true,
						result : true,
						bookmarkCheck : true
					});
				}
				else if(result == "exist"){
					res.json({
						valid : true,
						result : true,
						bookmarkCheck : false
					});
				}
				else{
					res.json({
						valid : true,
						result : false
					});
				}
			});

		}else{
			res.json({
				valid : true,
				result : false,
				msg : "유효하지 않은 파라미터"
			});
		}


	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

router.post("/join_with_email", function(req, res, next){

	if(checkToken(req.get('buying-x-code'))){
		var token = req.body.FCMToken;
		var email = req.body.email;
		var name = req.body.name;
		var uid = req.body.uid;
		var phone = req.body.phone;
		if(token != null && email !=null && name !=null && uid != null && phone != null){
			firebaseDB.join_with_email({uid : uid, token : token, email : email, name : name, phone : phone}, function(result){
				//어떤 액션?
				if(result == "success"){
					load_data_init(uid, res, false);
				}else{
					res.json({
						valid : true,
						result : false,
						msg : "네트워크 상태가 불안정합니다."
					});
				}
			});

		}else{
			res.json({
				valid : true,
				result : false,
				msg : "유효하지 않은 파라미터"
			});
		}
	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

router.post('/load_main_data', function(req,res,next){

	if(checkToken(req.get('buying-x-code'))){
		var token = req.body.FCMToken;
		var uid = req.body.uid;
		var obj = {};

		if(token != null && uid != null){

			load_data_init(uid, res, true);

		}else{
			res.json({
				valid : true,
				result : false,
				msg : "유효하지 않은 파라미터"
			});
		}
	}else{
		res.json({
			valid : false,
			result : false
		});
	}
});

var load_all_item = function(callback){
	firebaseDB.load_all_item(null , function(result){
		if(result != null){
			callback(null, result);
		}else if(result == null){
			callback(null, null);
		}else if(result == "fail"){
			callback(null ,"fail");
		}
	});
}

var load_ad_info = function(callback){
	firebaseDB.load_ad_info(null, function(result){
		if(result != null){
			callback(null, result);
		}else if(result2 == null){
			callback(null, null);
		}else if(result2 == "fail"){
			callback(null, "fail");
		}
	});
}



router.get("/getTime", function(req, res, next){



	res.json({
		current :moment().add(9, 'hour').format('YYYYMMDD hh:mm:ss')
	});

});

router.get("/getXtoken", function(req, res, next){
	var sha256 = crypto.createHash('sha256');
	sha256.update("!7VcMJ^d"+moment().format('YYYYMMDD'));
	// sha256.update("!7VcMJ^d"+moment().add(9, 'hour').format('YYYYMMDD'));
	var digest = sha256.digest('hex');
	res.json({
		x_code : digest
	});
});

module.exports = router;