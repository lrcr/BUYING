var socket= io();
var connection = false;

socket.emit('check', 'buying');
socket.on('config', function(msg) {
	if(msg !='fail'){
	  if(connection == false){
	    connection = true;
	    firebase.initializeApp(msg);
	  }
	}
});


function resetSubmit(obj){
	if($("#pwv").val().length >=6){

		$.ajax({
		   url:"sendpw",
		   type:"post",
		   data: {pw : $("#pwv").val()},
		   error:function(error){console.log(error);},
		   success:function(result){
		   	if(result == 'fail'){
		   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
		   		location.reload();
		   	}
		  	else{

		  		firebase.auth().verifyPasswordResetCode(obj.oobCode).then(function(email) {
		  		    // var accountEmail = email;
		  		    // console.log(email);

		  		    // TODO: Show the reset screen with the user's email and ask the user for
		  		    // the new password.

		  		    // Save the new password.
		  		    firebase.auth().confirmPasswordReset(obj.oobCode, result).then(function(resp) {
		  		    	console.log("성공:"+resp);
		  		    	alert("변경 완료");
		  		    	location.reload();

		  		      // Password reset has been confirmed and new password updated.

		  		      // TODO: Display a link back to the app, or sign-in the user directly
		  		      // if the page belongs to the same domain as the app:
		  		      // auth.signInWithEmailAndPassword(accountEmail, newPassword);
		  		    }).catch(function(error) {
		  		    	console.log("실패1" +error);

		  		      // Error occurred during confirmation. The code might have expired or the
		  		      // password is too weak.
		  		    });
		  		  }).catch(function(error) {
		  		  	console.log("실패2" +error);

		  		    // Invalid or expired action code. Ask user to try to reset the password
		  		    // again.
		  		  });
		  	}
		   }//통신완료
		});//ajax끝


	}else{
		alert("비밀번호는 6~20자리 입니다.");
	}
}


$("#submit").on('click', function(){
	return false;
});



