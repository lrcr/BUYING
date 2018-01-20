var socket= io();
var connection = false;
var sequence;

socket.emit('check', 'buying');
socket.on('config', function(msg) {
	if(msg !='fail'){
	  if(connection == false){
	    connection = true;
	    firebase.initializeApp(msg);
	  }
	}
});

$("#question_box").hide();

$(".model").on("change", function(e){
	$("#model").val(e.target.defaultValue);

	var category = $("#category").val().split("-")[1];
	var model = $("#model").val();

	load_question_info(category, model);

});

$("#category").on("change", function(e){
	if(e.currentTarget.selectedIndex != 0){

		var category = $(this).val().split("-")[1];
		var model = $("#model").val();

		load_question_info(category, model);

		$("#question_box").show();
	}else{
		$("#question_box").hide();
	}
});

function load_question_info(category, model){
	$.ajax({
	   url:"read_recommend_question",
	   type:"post",
	   data: {category : category, model : model},
	   error:function(error){console.log(error);},
	   success:function(result){
	   	if(result == 'fail'){
	   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도하세요");
	   		location.reload();
	   	}
	  	else if(result == "empty"){
	  		$(".question").val("없음");
	  		$("#datas").val("");
	  	}else{
	  		$("#datas").val(JSON.stringify(result));
	  		$(".question").val("없음");
	  		for(var i= 0; i<result.length; i++){
	  			$("#q"+(i+1)).val("작성완료");
	  		}
	  	}
	   }//통신완료
	});//ajax끝
}

$(".question").on("click", function(e){
	sequence = parseInt(e.target.id.split("q")[1]);
	var datas;
	if($("#datas").val() != "") datas = JSON.parse($("#datas").val());
	else datas = [];
	hide_modal_element();
	if(sequence == 1){
		if(datas.length != 0){
			$("#type").val($("#type").children("option").eq(parseInt(datas[sequence-1].type_id)).val());
			$("#question_input").val(datas[sequence-1].question);
			if(datas[sequence-1].answer != null){
				$("#preview").text("");
				for(var i = 0; i < datas[sequence-1].answer.length; i++ ){
					$("#preview").text($("#preview").text()+"#"+datas[sequence-1].answer[i]);
				}
				$("#preview").show();
			}

		}else{
			$("#type").val($("#type").children("option").eq(0).val());
			$("#question_input").val("");
		}
	}else{
		if(datas.length +1 < sequence){
			alert("이전 질문 완료 안됨");
			return false;
		}else if(sequence == datas.length +1){
			$("#type").val($("#type").children("option").eq(0).val());
			$("#question_input").val("");
		}else{
			$("#type").val($("#type").children("option").eq(parseInt(datas[sequence-1].type_id)).val());
			$("#question_input").val(datas[sequence-1].question);
			if(datas[sequence-1].answer != null){
				$("#preview").text("");
				for(var i = 0; i < datas[sequence-1].answer.length; i++ ){
					$("#preview").text($("#preview").text()+"#"+datas[sequence-1].answer[i]);
				}
				$("#preview").show();
			}
		}
	}
});

$("#reset").on("click", function(){
	hide_modal_element();
	$("#type").val("유형선택");
	$("#question_input").val("");
});


function hide_modal_element(){
	$("#brand_box").hide();
	$("#purpose_box").hide();
	$("#priority_box").hide();
	$("#others_box").hide();
	$("#preview").hide();
}

hide_modal_element();

$("#type").on("change", function(e){
	if(e.currentTarget.selectedIndex != 0){
		var type_id = $("#type").val().split(".")[0];
		var type = $("#type").val().split("-")[1];
		if(type_id == 3){//브랜드
			hide_modal_element();
			$("#brand_box").show();
		}else if(type_id ==4){//	주사용기능
			hide_modal_element();
			$("#purpose_box").show();
		}else if(type_id ==5){//네. 아니오
			hide_modal_element();
			$("#priority_box").show();
		}else if(type_id ==7){//그외 (체크 박스)
			hide_modal_element();
			$("#others_box").show();
		}else{
			hide_modal_element();
		}
	}
});

$("#question_save").on("click", function(){
	var q = $("#question_input").val();
	if(q == "" || q == null){
		alert("질문작성요망");
	}else if($("#type").val().split(".")[1] == null || $("#type").val().split(".")[1] == ""){
		alert("질문유형을 선택하세요.");
	}
	else{
		var chk = confirm("저장하시겠습니까?");
		if(chk){
			var category = $("#category").val().split("-")[1];
			var model = $("#model").val();
			var type_id = $("#type").val().split(".")[0];
			var type = $("#type").val().split("-")[1];
			var answer = [];
			if(type_id == 3){//브랜드
				for(var i = 1; i<=6; i++){
					if($(".brand"+i).val()!=null){
						answer.push($(".brand"+i).val());
					}
				}

			}else if(type_id ==4){//	주사용기능
				for(var i = 1; i<=12; i++){
					if($(".purpose"+i).val()!=null){
						answer.push($(".purpose"+i).val());
					}
				}

			}else if(type_id ==5){//네. 아니오
				for(var i = 1; i<=2; i++){
					if($(".priority"+i).val()!=null){
						answer.push($(".priority"+i).val());
					}
				}
			}else if(type_id ==7){//그외 (체크 박스)
				for(var i = 1; i<=5; i++){
					if($(".others"+i).val()!=null){
						answer.push($(".others"+i).val());
					}
				}
			}//담기 완료

			var obj = {
		   	category : category,
		   	model : model,
		   	question : q,
		   	type_id : type_id,
		   	type : type,
		   	answer : answer,
		   	sequence : sequence
		   }

			$.ajax({
			   url:"save_one_question",
			   type:"post",
			   data: {data : JSON.stringify(obj)},
			   error:function(error){console.log(error);},
			   success:function(result){
			   	if(result == 'fail'){
			   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도하세요");
			   		location.reload();
			   	}else{
			  		alert("저장되었습니다.");
			  		location.reload();
			  	}
			   }//통신완료
			});//ajax끝




		}//chk == true
	}

	return false;
});