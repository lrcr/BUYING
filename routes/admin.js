var express = require('express');
var router = express.Router();

var multer = require('multer');
var moment = require('moment');
var firebase = require("firebase");
var async = require('async');
var FCM = require('fcm-push');

var logger = require('../logger');
var firebaseDB = require('../models/firebaseDB');

var db = firebase.database();

var apiKey = 'AAAAck3rlow:APA91bFI4DewoGHj32lnbfBU-aYqnVsOWqoG6ffr_PMbfiOTMPevTi__7n7Z9tm5nMFutaW0lGE1iVuRgOWqc2laeWjMWt8OLXJD2_aN-X59tQUaO_fmWe7pv7x1fHerzfPtKYrwnXbDhgcTnxAU7zAu-mXGILLQiw'; // fcm
var fcm = new FCM(apiKey);


/* GET admin listing. */
router.get('/', function (req, res, next) {
	res.render('admin/login');
});

router.post('/login', function (req, res, next) {

	if (req.body.email == "admin" && req.body.pw == "1") {
		res.redirect('resell');
	} else {
		res.send("<script>alert('잘못된 로그인 정보 입니다.'); history.back(); </script>");
	}

});

router.get("/texts", function (req, res, next) {


	res.render("admin/texts");
});

router.get("/resell", function (req, res, next) {

	var obj = [];

	db.ref("item").once("value", function (datas) {
		if (datas.numChildren() != 0) {
			datas.forEach(function (data) {

				obj.push({ key: data.key, name: data.child("name").val(), date: data.child("date").val(), state: data.child("state").val() });
			});
			res.render('admin/resell', { datas: obj });
		} else {
			res.render('admin/resell', { datas: {} });
		}
	});
});

router.get("/ad_img", function (req, res, next) {

	firebaseDB.load_all_item(null, function (result) {
		if (result != null) {
			firebaseDB.load_ad_info(null, function (result_ad) {
				if (result_ad != null) {

					res.render('admin/ad_img', { datas: result, ad: result_ad });

				} else {
					res.render('admin/ad_img', { datas: result, ad: {} });
				}
			});

		} else {
			res.render('admin/ad_img', { datas: {}, ad: {} });
		}
	});
});

router.post("/addAd", function (req, res, next) {

	if (req.body.data != null) {
		var obj = JSON.parse(req.body.data);
		obj.date = moment().add(9, 'hours').format("YYYY-MM-DD hh:mm:ss a");

		var data_set = {};
		data_set.data = obj;

		db.ref("ad").once("value", function (data) {
			if (data != null) {
				data_set.index = data.numChildren() + 1;
			} else {
				data_set.index = 1;
			}
			firebaseDB.addAd(data_set, function (result) {
				if (result != "success") {
					res.send("fail");
				} else {
					res.send("success");
				}
			});
		});
	} else {
		res.send("fail");
	}
});

router.post("/ad_change", function (req, res, next) {

	if (req.body.data != null) {
		var obj = JSON.parse(req.body.data);
		firebaseDB.ad_change(obj, function (result) {
			if (result != "success") {
				res.send("fail");
			} else {
				res.send("success");
			}
		});
	}
});

router.post("/del_ad", function (req, res, next) {
	if (req.body.data != null) {
		db.ref("ad/" + req.body.data).set(null, function (err) {
			if (err) {
				res.send("fail");
			} else {
				res.send("success");
			}
		});
	} else {
		res.send("fail");
	}
});


router.post("/addItem", function (req, res, next) {
	if (req.body.data != null) {
		var obj = JSON.parse(req.body.data);
		obj.date = moment().add(9, 'hours').format("YYYY-MM-DD hh:mm:ss a");
		obj.state = "판매중";
		obj.bookmark = 0;

		firebaseDB.addItem(obj, function (result) {
			if (result != "success") {
				res.send("fail");
			} else {
				res.send("success");
			}
		});
	} else {
		res.send("fail");
	}

});

router.post("/load_detail", function (req, res, next) {

	if (req.body.key != null) {

		firebaseDB.load_detail(req.body.key, function (result) {
			if (result == null) {
				res.render('sub/item_detail_tmp', { data: {} });
			} else if (result != null) {
				res.render('sub/item_detail_tmp', { data: result });
			} else if (result == "fail") {
				res.send("fail");
			}
		});
	} else {
		res.send("fail");
	}
});

router.post("/del_item", function (req, res, next) {
	var key = req.body.key;
	if (key != null) {
		firebaseDB.del_item(key, function (result) {
			if (result == "err") {
				res.send("fail");
			} else {
				res.send("success");
			}
		});

	} else {
		res.send("fail");
	}
});

router.get('/apk', function (req, res, next) {
	res.render("admin/apk");
});

router.get("/member", function (req, res, next) {
	// if(req.session.admin_id==null){
	// 	res.send("<script>alert('로그인이 필요합니다.'); location.href='/admin'; </script>");
	// }else{
	// 	member.list(null, function(result){
	// 		if(result == "err") {
	// 			logger.debug('관리자 페이지 회원조회 에러');
	// 			res.send("<script>alert('네트워크 상태가 불안정합니다. 잠시후 다시 시도하세요.'); history.back(); </script>");
	// 		}
	// 		else{
	// 			res.render('admin/admin',{ title : "리스트", results : result});
	// 		}
	// 	});
	// }
	res.render('admin/admin', { title: "리스트", results: {} });
});

router.get("/order", function (req, res, next) {
	// if(req.params.uid != null){
	// 	res.send("<script>alert('로그인이 필요합니다.'); location.href='/admin'; </script>");
	// }else{

	// }

	firebaseDB.loadRequest(null, function (result) {
		if (result == null) {
			res.render('admin/order', { docs: {} });
		} else {
			var tasks = [];

			result.forEach(function (child) {
				var find_member_with_uid = function (callback) {
					firebaseDB.find_member_with_uid(child, function (result2) {
						callback(null, result2);
					});
				}
				tasks.push(find_member_with_uid);
			});

			async.parallel(tasks, function (err, results) {

				var docs = [];
				for (var i = 0; i < results.length; i++) {
					docs.push(results[i]);

				}

				res.render('admin/order', { docs: docs });
			});//async
		}
	});
});

router.post("/response_for_order", function (req, res, next) {

	if (req.body.data != null && req.body.key != null && req.body.uid != null) {
		var obj = JSON.parse(req.body.data);

		for (var i = 0; i < obj.length; i++) {
			obj[i].date = moment().add(9, 'hours').format("YYYY-MM-DD hh:mm:ss a");
		}

		firebaseDB.response_for_order({ data: obj, key: req.body.key, uid: req.body.uid }, function (result) {
			if (result == "fail") {
				res.send("fail");
			} else {
				res.send(result);
			}
		});

		firebaseDB.find_member_with_uid({ uid: req.body.uid }, function (result2) {
			if (result2 != null) {
				var message = {
					to: result2.token, // required
					data: {
						'type': '응답',
						'title': '제목',
						'body': '내용'
					},
					notification: {
						"title": "'대행 신청 결과 도착!'",
						"body": "바로 확인해주세요."
					}
				};
				fcm.send(message, function (err, response) {
					if (err) {
						logger.debug('응답 푸시 에러!');
					}
				});
			}
		});



	} else {
		res.send("fail");
	}
});

router.post("/unable_for_order", function (req, res, next) {

	if (req.body.key != null) {

		firebaseDB.unable_for_order(req.body.key, function (result) {

		});

	} else {
		res.send("fail");
	}
});

router.post("/load_response", function (req, res, next) {
	if (req.body.key != null && req.body.uid != null) {
		firebaseDB.load_response({ key: req.body.key, uid: req.body.uid }, function (result) {
			if (result == null) {
				res.send("fail");
			} else {
				res.render('sub/ordermodal_tmp', { data: result });
			}
		});
	} else {
		res.send("fail");
	}
});

router.get("/recommend", function (req, res, next) {
	res.render("admin/recommend");
});

router.post("/read_recommend_question", function (req, res, next) {
	if (req.body.category != null && req.body.model != null) {
		firebaseDB.read_recommend_question({ category: req.body.category, model: req.body.model }, function (result) {
			if (result == "fail") {
				res.send("fail");
			} else if (result == null) {
				res.send("empty");
			} else {
				res.send(result);
			}
		});
	}
});

router.post("/save_one_question", function (req, res, next) {
	var data;
	if (req.body.data != null) data = JSON.parse(req.body.data);

	var category = data.category;
	var model = data.model;
	var question = data.question;
	var type = data.type;
	var type_id = data.type_id;
	var answer = data.answer;
	var sequence = data.sequence;

	if (category != null && model != null && question != null && type != null && type_id != null && sequence != null) {
		var obj = {
			category: category,
			model: model,
			question: question,
			type_id: type_id,
			type: type,
			sequence: sequence,
			answer: answer
		};


		firebaseDB.save_one_question(obj, function (result) {
			if (result == "fail") {
				res.send("fail")
			} else {
				res.send("success");
			}
		});

	} else {
		res.send("fail");
	}
});

router.get("/logout", function (req, res, next) {
	// req.session.destroy(function(err){
	// 	if(err) { logger.debug('로그아웃 에러'); next(err); return;}
	// 	else {
	// 		res.send('<script>location.href="/admin"</script>');
	// 	}
	// });
	res.send('<script>location.href="/admin"</script>');
});

router.get("/board", function (req, res, next) {
	// if(req.session.admin_id==null){
	// 	res.send("<script>alert('로그인이 필요합니다.'); location.href='/admin'; </script>");
	// }else{
	// 	notify.list(null, function(result){
	// 		if(result=="err"){
	// 			res.send("<script>alert('네트워크 상태가 불안정합니다. 잠시후 다시 시도하세요.'); history.back(); </script>");
	// 		}else{
	// 			res.render("admin/board", {result : result });
	// 		}
	// 	});
	// }
	res.render("admin/board", { result: {} });
});

router.get("/question", function (req, res, next) {
	// if(req.session.admin_id==null){
	// 	res.send("<script>alert('로그인이 필요합니다.'); location.href='/admin'; </script>");
	// }else{
	// 	question.list(null, function(result){
	// 		if(result == "err"){
	// 			res.send("<script>alert('네트워크 상태가 불안정합니다. 잠시후 다시 시도하세요.'); history.back(); </script>");
	// 		}else{
	// 			res.render("admin/question", {result : result });
	// 		}
	// 	});
	// }
	res.render("admin/question", { result: {} });
});


router.post('/question-answer', function (req, res, next) {
	// if(req.session.admin_id==null){
	// 	res.send("<script>alert('로그인이 필요합니다.'); location.href='/admin'; </script>");
	// }else{
	// 	question.answer([req.body, req.session.admin_id],function(result){
	// 		if(result == "fail"){
	// 					res.send("<script>alert('네트워크 상태가 불안정합니다. 잠시후 다시 시도하세요.'); history.back(); </script>");
	// 					logger.debug("1:1 답변 에러");
	// 		}else if(result == "ok"){
	// 				res.redirect("/admin/question");
	// 		}
	// 	});
	// }
	res.redirect("/admin/question");
});

router.post('/add_alarm', function (req, res, next) {
	// var datas=[];
	// for (var key in req.body) {
	//   if (req.body.hasOwnProperty(key)) {
	//     datas.push(req.body[key]);
	//   }
	// }
	// var length = datas.length-1;
	// if(Object.prototype.toString.call(datas[length]) =='[object String]'){
	// 	var tmp = datas[length];
	// 	datas[length] = [];
	// 	datas[length].push(tmp);
	// }
	// alarm.add(datas,function(result){
	// 	if(result=="fail"){
	// 		res.send("fail");
	// 	}
	// 	else{
	// 		res.send("ok");
	// 	}
	// });
	res.send("ok");
});

router.post('/write_notify', function (req, res, next) {

	// notify.save(req.body,function(result){
	// 	if(result=="fail") res.send("<script>alert('네트워크 상태가 불안정합니다. 잠시후 다시 시도하세요.'); history.back(); </script>");
	// 	else if(result=="success") res.redirect('/admin/board');

	// });
	res.redirect('/admin/board');
});

router.post('/edit-notify', function (req, res, next) {
	// notify.edit(req.body,function(result){

	// 	if(result=="fail") res.send("<script>alert('네트워크 상태가 불안정합니다. 잠시후 다시 시도하세요.'); history.back(); </script>");
	// 	else if(result=="success") res.redirect('/admin/board');

	// });
	res.redirect('/admin/board');
});


router.post('/member-order-detail', function (req, res, next) {

	// order.foremail(req.body.email, function(result){
	//    if(result == "err"){
	//    	res.send('fail');
	//    }else if(result != null){
	//    	res.render('sub/membermodal_tmp', {docs : result});
	//    }
	//  });
	res.render('sub/membermodal_tmp', { docs: {} });
});

router.post('/rec_result', function (req, res, next) {

	// order.load_detail(req.body.order_no, function(result){
	// 	if(result == "err"){
	// 		res.send('fail');
	// 	}else if(result !=null){
	// 		res.render('sub/ordermodal_tmp', {docs : result});
	// 	}
	// });
	res.render('sub/ordermodal_tmp', { docs: {} });
});


router.post('/discount-detail', function (req, res, next) {
	// var title ="";
	// if(req.body.type == 'mileage') title = "마일리지";
	// else if(req.body.type == "coupon") title ="쿠폰";
	// discount.detail(req.body,function(result){
	// 	if(result =="err"){
	// 		res.send('fail');
	// 	}else {
	// 		res.render('sub/discount_tmp', {title : title, docs : result})
	// 	}
	// });
	res.render('sub/discount_tmp', { title: {}, docs: {} })
});


//거래 불가 통보
router.post('/unable', function (req, res, next) {
	// order.unable(req.body,function(result){
	// 	if(result=="err") res.send("<script>alert('네트워크 상태가 불안정합니다. 잠시후 다시 시도하세요.'); history.back(); </script>");
	// 	else if(result=="success") res.redirect('/admin/order');
	// });
	res.redirect('/admin/order');
});

//Buying response 부분 변수 선언


var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/img');
	},
	filename: function (req, file, cb) {
		// var ext = '.png';
		if (req.files.item2 != null) {
			cb(null, file.fieldname + '-' + req.body.order_no + req.files.item2.length + '.png');
		} else {
			cb(null, file.fieldname + '-' + req.body.order_no + req.files.item1.length + '.png');
		}
		// cb(null, file.fieldname + '-' + req.body.order_no );
	}
});

var upload = multer({ storage: storage });
var itemUpload = upload.fields([{ name: 'item1', maxcount: 10 }, { name: 'item2', maxcount: 10 }])

//Buying response 부분
router.post("/buying_res", itemUpload, function (req, res, next) {//이미지 한개 올릴때
	// var img1=[];
	// var img2=[];
	// // thumnailFuc(req.files);
	// for(var i in req.files.item1){
	// 	img1.push('http://52.78.32.50:3000/img/'+req.files.item1[i].filename);
	// 	// img1.push(''+req.files.item1[i].filename+i);
	// }
	// for(var i in req.files.item2){
	// 	img2.push('http://52.78.32.50:3000/img/'+req.files.item2[i].filename);
	// 	// img2.push(''+req.files.item2[i].filename+i);
	// }

	// order.save_res({"req_body" : req.body, "img1" : img1, "img2" : img2 },function(result){
	// 	if(result=="err") {
	// 		logger.debug("바잉 res 저장 에러");
	// 		res.send('<script>alert("네트워크 상태가 불안정합니다 잠시후 다시 시도하세요."); history.back();</script>');
	// 	}
	// 	else if(result=="ok"){
	// 		res.redirect('order');
	// 	}
	// });//order.save_res

	// order.load_detail(req.body.order_no, function(result){
	// 	if(result=="err") logger.dubug('buying res 시 알림 저장 위해 email 불러오기 실패');
	// 	else{
	// 		var email = result.email;
	// 		alarm.add(["order", email ,req.body.order_no], function(result){
	// 			if(result == "err") logger.debug('buying res 알림 저장 에러');
	// 		});

	// 		var message = new gcm.Message({
	// 			data : {
	// 				message : '서비스 요청에 대한 답변이 도착했습니다.',
	// 				order_no : req.body.order_no,
	// 				page : "order"
	// 			}
	// 		});

	// 		member.check(email, function(result){
	// 			if(result == 'err'){
	// 				logger.debug('클라이언트 바잉 답변 푸시 에러');
	// 			}else{

	// 				var registrationIds = [];
	// 				// At least one required
	// 				registrationIds.push(result.token);

	// 				sender.send(message, registrationIds, 4, function (err, result) {
	// 					if(err) log.debug('클라이언트 gcm 에러');
	// 				});
	// 			}
	// 		});

	// 	}
	// });
	//client push 구글로 푸시 요청 -> 1시간 후 step이 아직 그대로면 반려 처리
	res.redirect('order');
});

module.exports = router;
