var multer = require('multer');
var moment = require('moment');
var firebase = require("firebase");
var admin= require("firebase-admin");
var async = require('async');

var logger = require('../logger');
var db = firebase.database();

exports.findAdmin_to_FCM = function(data, callback){

	var find_admin_kakao = function(callBack){
		var cnt = 0;
		var token_set = [];

		db.ref("member/kakao").once("value", function(datas){

			datas.forEach(function(person){
				cnt++;
				if(person.child("admin").exists()){
					token_set.push(person.child("token").val());
				}
				if(datas.numChildren() == cnt){
					callBack(null, token_set);
				}
			});
		});
	}

	var find_admin_facebook = function(callBack){
		var cnt = 0;
		var token_set = [];

		db.ref("member/facebook").once("value", function(datas){

			datas.forEach(function(person){
				cnt++;
				if(person.child("admin").exists()){
					token_set.push(person.child("token").val());
				}
				if(datas.numChildren() == cnt){
					callBack(null, token_set);
				}
			});
		});
	}

	var find_admin_email = function(callBack){
		var cnt = 0;
		var token_set = [];

		db.ref("member/email").once("value", function(datas){

			datas.forEach(function(person){
				cnt++;
				if(person.child("admin").exists()){
					token_set.push(person.child("token").val());
				}
				if(datas.numChildren() == cnt){
					callBack(null, token_set);
				}
			});
		});
	}
	var tasks = [];
	tasks.push(find_admin_email);
	tasks.push(find_admin_facebook);
	tasks.push(find_admin_kakao);

	async.parallel( tasks, function(err, results){

  	var token_set = [];
  	for(var i =0 ; i < results.length ; i++){
  		for(var j = 0 ; j <results[i].length; j++){
  			token_set.push(results[i][j]);
  		}
  	}
  	callback(token_set);
	});//async
}

exports.kakao_user_check = function(data, callback){
	db.ref("member/kakao").once("value", function(datas){
		if(datas.numChildren() == 0){
			callback(null);
		}else{
			if(datas.child(data.uid).exists()){
				db.ref("member/kakao").child(data.uid).child("token").set(data.token);
				callback(true);
			}else{
				callback(null);
			}
		}
	});
}

exports.facebook_user_check = function(data, callback){
	db.ref("member/facebook").once("value", function(datas){
		if(datas.numChildren() == 0){
			callback(null);

		}else{
			var cnt = 0;
			var uid;

			datas.forEach(function(child_data) {
				cnt++;
				if(child_data.child("id").val() == data.id){
					db.ref("member/facebook").child(child_data.key).child("token").set(data.token);
					uid = child_data.key;
				}
				if(datas.numChildren() == cnt){
					callback(uid);
				}
		  });

		}
	});
}


exports.phone_number_check = function(phone, callback){
	db.ref("member/email").once("value", function(datas){

		if(datas.numChildren() == 0){
			callback(null);

		}else{
			var cnt = 0;
			var email;
			datas.forEach(function(data) {
				cnt++;
				if(data.child("phone").val() == phone){
					email = data.child("email").val();
				}
				if(datas.numChildren() == cnt){
					callback(email);
				}
		  });
		}

	});
}

exports.loadRequest = function(data, callback){

	db.ref("request").once("value", function(datas){
		if(datas.numChildren() == 0){
			callback(null);
		}else{
			var dataSet = [];
			var cnt = 0;

			datas.forEach(function(data) {
				var obj = {};
				obj.key = data.key;
				obj.date = data.child("date").val();
				obj.location = data.child("location").val();
				obj.name = data.child("name").val();
				obj.type = data.child("type").val();
				obj.uid = data.child("uid").val();
				obj.url = data.child("url").val();
				obj.ect = data.child("ect").val();
				obj.step = data.child("step").val();

				dataSet.push(obj);
				cnt++;

				if(datas.numChildren() == cnt){
					callback(dataSet);
				}
		  });
		}
	});
}

exports.response_for_order = function(datas, callback){

	db.ref("response").child(datas.key).child(datas.uid).set(datas.data, function(err){
		if(err){
			callback("fail");
		}else{
			callback("success");
		}
	});

	db.ref("request").child(datas.key).child("step").set("응답완료");
}

exports.unable_for_order = function(key, callback){

	db.ref("request").child(key).child("step").set("cancle", function(err){
		if(err){
			callback("fail");
		}else{
			callback("success");
		}
	});

}

exports.load_response = function(datas, callback){

	var data_set = [];
	db.ref("response").child(datas.key).child(datas.uid).once("value", function(datas){
		if(datas != null){

			datas.forEach(function(data) {

				var obj = {};

				obj.id = data.key;
				obj.name = data.child("name").val();
				obj.brand = data.child("brand").val();
				obj.grade = data.child("grade").val();
				obj.price = data.child("price").val();
				obj.component = data.child("component").val();
				obj.trade_date = data.child("trade_date").val();
				obj.mention = data.child("mention").val();
				// obj.spec = data.child("spec").val();
				obj.img = data.child("img").val();
				obj.date = data.child("date").val();


				data_set.push(obj);
				if(data_set.length == datas.numChildren()){
					callback(data_set);
				}
		  });

		}else{
			callback(null);
		}

	});
}

exports.find_member_with_uid = function(datas, callback){
	var result = datas;
	db.ref("member").once("value", function(mem_datas){
		mem_datas.forEach(function(mem_child_data){

			if(mem_child_data.child(datas.uid).exists()){
				result.phone = mem_child_data.child(datas.uid).child("phone").val();
				result.user_name = mem_child_data.child(datas.uid).child("name").val();
				result.token = mem_child_data.child(datas.uid).child("token").val();

				callback(result);
			}
		});
	});
}

exports.saveRequest = function(datas, callback){
	db.ref("request").push().set(datas, function(err){
		if(err){
			callback("fail");
			logger.debug('대행 신청 에러');
		}else{
			callback("success");
		}
	});
}

exports.load_bookmark_info = function(uid, callback){
	db.ref("item").once("value", function(datas){

		var arr = [];
		var cnt = 0;
		datas.forEach(function(data) {
			cnt++;
			if(data.child("bookmark").child(uid).exists()){
				arr.push(data.key);
			}
			if(datas.numChildren() == cnt){
				callback(arr);
			}
	  });
	});
}

exports.changeBookmark = function(data, callback){
	if(data.bookmark){

		db.ref("item/"+data.id+"/bookmark").once("value", function(datas){
			if(datas.child(data.uid).exists()){//이미 찜하기 한 상태
				callback("exist");
			}else if(!datas.child(data.uid).exists()){
				db.ref("item/"+data.id+"/bookmark/"+data.uid).set(true, function(err){
					if(err){
						callback("fail");
						logger.debug('bookmark 에러'+err);
					}else{
						callback("success");
					}
				});
			}
		});

		// db.ref("member/"+data.uid+"/bookmark/"+data.id).set(true, function(err){
		// 	if(err){
		// 		logger.debug('bookmark 회원 정보에 저장 에러'+err);
		// 	}else{

		// 	}
		// });

	}else{
		db.ref("item/"+data.id+"/bookmark/"+data.uid).set(null, function(err){
			if(err){
				callback("fail");
				logger.debug('bookmark 취소 에러'+err);
			}else{
				callback("success");
			}
		});
	}
}

exports.create_custom_token = function(uid, callback){
	admin.auth().createCustomToken(uid)
	.then(function(customToken){
		callback(customToken);
	}).catch(function(err){
		logger.debug('카톡 customToken 생성 에러'+err);
		callback("fail");
	});
}

exports.join_with_facebook = function(data, callback){
	db.ref("member/facebook").child(data.uid).set({
		id : data.id,
		token : data.token,
		name : data.name,
		phone : data.phone,
		photo : data.photo
	}, function(err){
		if(err){
			logger.debug('페북 가입 저장 에러');
			callback("fail");
		}else{
			callback("success");
		}
	});
}

exports.join_with_email = function(data, callback){
	db.ref("member/email").child(data.uid).set({
		email : data.email,
		token : data.token,
		name : data.name,
		phone : data.phone
	}, function(err){
		if(err){
			logger.debug('이메일 가입 저장 에러');
			callback("fail");
		}else{
			callback("success");
		}
	});
}

exports.join_with_kakao = function(data, callback){
	db.ref("member/kakao").child(data.uid).set({
		token : data.token,
		name : data.name,
		phone : data.phone,
		photo : data.photo

	}, function(err){
		if(err){
			logger.debug('카카오 가입 저장 에러');
			callback("fail");
		}else{
			callback("success");
		}
	});
}

exports.del_item = function(key, callback){
	db.ref("item").child(key).set(null , function(err){
		if(err){
			callback("err")
		}else{
			callback("success");
		}
	});
}

exports.addAd = function(data, callback){
	db.ref("ad/"+data.index).set(data.data, function(err){
		if(err){
			callback("fail");
		}else{
			callback("success");
		}
	});
}


exports.ad_change = function(data, callback){

	var before = data.before;
	var after = data.after;

	var data_set = [];

	db.ref("ad").once("value", function(datas){

		datas.forEach(function(data) {

			var obj = {};

			obj.name = data.child("name").val();
			obj.img = data.child("img").val();
			obj.item = data.child("item").val();
			obj.event = data.child("event").val();

			data_set[parseInt(data.key)] = obj;
			if(data_set.length == datas.numChildren()+1){
				var tmp = {};

				tmp = data_set[before];
				data_set[before] = data_set[after];
				data_set[after] = tmp;

				db.ref("ad").set(null, function(err){
					if(err){
						callback("fail");
					}else{
						db.ref("ad").set(data_set, function(err){
							if(err){
								callback("fail");
							}else{
								callback("success");
							}
						});
					}
				});

			}
	  });
	});
}

exports.load_ad_info = function(d, callback){

	var data_set = [];

	db.ref("ad").once("value", function(datas){
		if(datas.numChildren() != 0){
				datas.forEach(function(data) {

					var obj = {};

					obj.index = data.key;
					obj.img = data.child("img").val();
					// obj.kind = data.child("kind").val();
					// obj.item = data.child("item").val();
					// obj.event = data.child("event").val();

					data_set.push(obj);
					if(data_set.length == datas.numChildren()){
						callback(data_set);
					}
			  });

		}else{
			callback(null);
		}
	}, function(err_obj){
		logger.debug('ad data 로딩 실패'+err_obj.code);
		callback("fail");
	});
}

exports.addItem = function(obj, callback){

	db.ref("item").once("value", function(datas){
		var cnt = datas.numChildren();
		db.ref("item").child(cnt).set(obj, function(err){
			if(err){
				callback("fail");
			}else{
				callback("success");
			}
		});
	});
}

exports.load_all_item = function(d, callback){

	var data_set =  [];

	db.ref("item").once("value", function(datas){
		if(datas.numChildren() != 0){
			datas.forEach(function(data) {

				var obj = {};

				obj.id = data.key;
				obj.category = data.child("category").val();
				obj.name = data.child("name").val();
				obj.brand = data.child("brand").val();
				obj.grade = data.child("grade").val();
				obj.price = data.child("price").val();
				obj.component = data.child("component").val();
				obj.mention = data.child("mention").val();
				obj.spec = data.child("spec").val();
				obj.img = data.child("img").val();
				obj.bookmark = data.child("bookmark").numChildren();

				data_set.push(obj);
				if(data_set.length == datas.numChildren()){
					callback(data_set);
				}
		  });

		}else{
			callback(null);
		}
	}, function(err_obj){
		logger.debug('item 데이터 로딩 에러'+err_obj.code);
		callback("fail");
	});
}

exports.load_detail = function(key, callback){
	var obj = {};
	db.ref("item").once("value", function(datas){
		if(datas.numChildren() != 0){
			datas.forEach(function(data) {
				if(data.key == key){
					obj.key = key;
					obj.category = data.child("category").val();
					obj.name = data.child("name").val();
					obj.brand = data.child("brand").val();
					obj.grade = data.child("grade").val();
					obj.price = data.child("price").val();
					obj.component = data.child("component").val();
					obj.mention = data.child("mention").val();
					obj.spec = data.child("spec").val();
					obj.img = data.child("img").val();
					callback(obj);
				}
		  });

		}else{
			callback(null);
		}
	});
}

exports.load_recommend_question = function(d, callback){
	var arr = [];

	db.ref("recommend").once("value", function(datas){
		datas.forEach(function(data){
			var obj = {};
			obj[data.key] = data.val();
			arr.push(obj);

			if(arr.length == datas.numChildren()){
				callback(arr);
			}
		});
	});
}

exports.read_recommend_question = function(datas, callback){

	db.ref("recommend").child(datas.category).child(datas.model).once("value", function(data){
		var arr = [];


		if(data.numChildren() == 0 ){
			callback(null);
		}else{
			data.forEach(function(d){
				var obj = {};
				obj.sequence = d.key;
				obj.question = d.child("question").val();
				obj.type = d.child("type").val();
				obj.type_id = d.child("type_id").val();
				obj.answer = d.child("answer").val();
				arr.push(obj);
				if(arr.length == data.numChildren()){
					callback(arr);
				}
			});
		}
	});
}

exports.save_one_question = function(datas, callback){
	var obj = {
		question : datas.question,
		type_id : datas.type_id,
		type : datas.type,
		answer : datas.answer
	};
	var sequence = parseInt(datas.sequence)-1;

	db.ref("recommend").child(datas.category).child(datas.model).child(sequence).set(obj, function(err){
		if(err){
			logger.debug('질문저장에러'+err);
			callback("fail");
		}else{
			callback("success");
		}
	});
}

// exports.checkDuplicateEmail = function(email, callback){
// 	db.ref("member").once("value", function(datas){
// 		if(datas.numChildren() == 0){
// 			callback(false);
// 		}else{
// 			if(datas.child(email).exists()){
// 				callback(true);
// 			}else{
// 				callback(false);
// 			}
// 		}
// 	});
// };

// exports.join_with_email = function(data, callback){
// 	admin.auth().createUser({
// 		email : data.email,
// 		emailVerified : false,
// 		password : data.password,
// 		displayName : data.name,
// 		photoURL : null,
// 		disabled : false
// 	}).then(function(info){

// 		db.ref("member/"+info.uid).set({
// 			email : data.email,
// 			password : data.password,
// 			name : data.name,
// 			token : data.token,
// 			date : moment().add(9, 'hour').format('YYYYMMDD')
// 		}, function(err){
// 			logger.debug('이메일 가입 DB 저장 에러'+err);
// 			callback("fail");
// 		});

// 		admin.auth().createCustomToken(info.uid)
// 		  .then(function(customToken) {
// 		    callback(customToken);
// 		  })
// 		  .catch(function(err) {
// 		  	logger.debug('이메일 가입 customToken 생성 에러'+err);
// 		  	callback("fail");
// 		  });


// 	}).catch(function(err){
// 		logger.debug('이메일 가입 에러'+err);
// 		callback("fail");
// 	});
// }