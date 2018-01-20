  $('#summernote').summernote({
    lang: 'ko-KR', // default: 'en-US'
    height: 300,                 // set editor height
    minHeight: null,             // set minimum height of editor
    maxHeight: null,             // set maximum height of editor
    focus: true                  // set focus to editable area after initializing summernote
    
  });
  
  $("#notify-edit").on("click",function(){
    $('#summernote').summernote({
       lang: 'ko-KR', // default: 'en-US'
        height: 300,                 // set editor height
        minHeight: null,             // set minimum height of editor
        maxHeight: null,             // set maximum height of editor
        focus: true                  // set focus to editable area after initializing summernote
    });
    
    $("#write-title").attr("disabled",false);
    $("#write-done").attr("disabled",false);
    $("#notify-save").attr("disabled",false);
    $("#notify-edit").attr("disabled",true);
  });
  
    $("#notify-save").on("click",function(){
      var makrup = $('#summernote').summernote('code');
      $('#summernote').summernote('destroy');
      $("#write-done").attr("disabled",true);
      $("#notify-edit").attr("disabled",false);
      $(this).attr("disabled",true);
      $("#write-title").attr("disabled",true);
    });
    
$(".not-login").on("click",function(){
	alert("로그인이 필요합니다");
});

$(".write-login").on("click",function(){
	if($("#writemodal").css("display")=="none"){
		 $("#write-title").val("");
		 $("#write-title").attr("disabled",false);
		 $("#write-done").attr("disabled",false);
		 $("#notify-save").attr("disabled",false);
		 $("#notify-edit").attr("disabled",true);
		 $('#summernote').summernote({
		       lang: 'ko-KR', // default: 'en-US'
		        height: 300,                 // set editor height
		        minHeight: null,             // set minimum height of editor
		        maxHeight: null,             // set maximum height of editor
		        focus: true                  // set focus to editable area after initializing summernote
		    });
		 $(".note-editable").html("");
	}
});

$("#write-done").on("click",function(){
	if($("#write-title").val()==""){
		$('#write-title-label').css("color","red");
        var msg=$("#write-title-label");
        msg.animate({ opacity: '1'}, "slow");
        msg.animate({ opacity: '0'}, "slow");
        msg.animate({ opacity: '1'}, "slow");
        return false;
	}
	else if($(".note-editable").html()=="<p><br></p>"||$(".note-editable").html()==""){
		alert("내용을 입력하세요");
		return false;
	}
	else{
		var content=$(".note-editable").html();
		
		var db="title="+$("#write-title").val()+"&content="+$(".note-editable").html();
        $.ajax({
           url:"addboard",
           type:"post",
           data: db,
           dataType:"xml",
           error:function(){alert("Ajax error!!")},
           success:function(result){
        	  location.replace("/project3/notify");
           }//통신완료
        });//ajax끝		
	}
});
$(".note-image-input").attr("disabled",true);
$(".modal").css("overflow","auto");
