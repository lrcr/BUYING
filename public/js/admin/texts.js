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

$(".preview").on("click", function(){

	if($(this).text()=="수정하기"){
		$(".hb").text("");


		$(".ta").show();
		$(this).text("미리보기");

	}else if($(".preview").text()=="미리보기"){
		$(".html_box1 > hb").html($("#textArea1").val());
		$(".html_box2").html($("#textArea2").val());
		$(".html_box3").html($("#textArea3").val());
		$(".html_box4").html($("#textArea4").val());

		$(".ta").hide();
		$(this).text("수정하기");

	}

	return false;

});

