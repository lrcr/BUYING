var express = require('express');
var crypto = require('crypto');
var firebase = require("firebase");
var admin= require("firebase-admin");

var router = express.Router();
firebase.initializeApp({
  serviceAccount: "buying-7f232b0e20c8.json",
  databaseURL: "https://buying-73369.firebaseio.com/"
});

var serviceAccount = require("../buying-7f232b0e20c8.json");

admin.initializeApp({
  // serviceAccount: "buying-7f232b0e20c8.json",
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://buying-73369.firebaseio.com/"
});

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('intro');

});

router.post('/sendpw', function(req, res, next){

	if(req.body.pw !=null ){
		var pw= req.body.pw;

		var sha256 = crypto.createHash('sha256');
		sha256.update(pw+"b7uy2i9n7g'");
		var digest = sha256.digest('hex');

		res.send(digest);

	}else{
		res.send("fail");
	}

});

router.get('/reset_password', function(req, res, next){

	var key = req.query.apiKey;
	var oobCode = req.query.oobCode;

	res.render('reset_password', { obj : {key : key, oobCode : oobCode}});
});

router.post('/test', function(req,res,next){
	var uid = req.body.uid;

	res.json({
		result : firebase.auth().createCustomToken(uid)
	});
});

router.get('/intro', function(req,res,next){
	res.render('index', { title: 'BUYING' });
});

router.post('/member/check-membervalid', function(req, res, next) {


	var token = req.get('x-buying-token');
	if(token === getToken()){
		var uid = req.body.uid;
		var customToken = firebase.auth().createCustomToken(uid);
		res.json({
			result : true,
			msg : true,
			valid : true,
			token : customToken
		});
	}
});

function getToken(){
	var sha256 = crypto.createHash('sha256');
	sha256.update("b7uy2i9n7g'");
	var digest = sha256.digest('hex');

	return digest;
}

function getDate(){

	var now = new Date();
	var year = now.getFullYear();
	var month = ""+now.getMonth();
	if(month.length == 1){
		month = "0"+month;
	}
	var date = ""+now.getDate();
	if(date.length ==1){
		date = "0"+ date;
	}

	return year+""+month+""+date;

}
module.exports = router;
