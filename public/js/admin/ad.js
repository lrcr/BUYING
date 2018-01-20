var socket= io();
var connection = false;

var img_arr = [];
var url_arr = [];
socket.emit('check', 'buying');
socket.on('config', function(msg) {
	if(msg !='fail'){
	  if(connection == false){
	    connection = true;
	    firebase.initializeApp(msg);
	  }
	}
});


$("#ad_upload_done").on("click", function(){
	var chk = confirm("완료하시겠습니까?");
	if(chk){
		// if($('#img').val() !="" && $('#img').val()!= null ){
		// 	if($("#item").val() == "없음"){
		// 		upload(img_arr, null );
		// 	}else{
		// 		upload(img_arr, $("#item").val().split("##")[1] );
		// 	}
		if($('#img').val() =="" || $('#img').val() == null){
			alert("대표 사진 없음");
		}else if($('#img_detail').val() =="" || $('#img_detail').val() == null){
			alert("상세 사진 없음");

		}else{
			for(var i = 0; i<img_arr.length; i++){
				upload(img_arr[i], i);
			}
		}

	}
});

$('#img').on('change', function (e) {
	if($(this).val() != null){
		var file = e.target.files[0];
		var select_img = this.value;
		var select_img_chk = select_img.slice(select_img.indexOf(".") + 1).toLowerCase();
		if(e.target.files[0].size >= 70000){
			alert("사진크기는 70KB보다 작아야합니다.");
			$(this).val('');
		}else if (select_img_chk != "jpg" && select_img_chk != "png" && select_img_chk != "gif" && select_img_chk != "bmp") {
		 //확장자를 확인합니다.
	    alert('프로필은 이미지 파일(jpg, png, gif, bmp)만 등록 가능합니다.');
	    $(this).val('');
	    return;
		}else{
			img_arr.push(e.target.files[0]);
		}
	}
});

$('#img_detail').on('change', function (e) {
	if($(this).val() != null){
		var file = e.target.files[0];
		var select_img = this.value;
		var select_img_chk = select_img.slice(select_img.indexOf(".") + 1).toLowerCase();

		if($('#img').val() =="" || $('#img').val() == null){
			alert("대표 사진 없음");
			$('#img_detail').val("");
		}else if (select_img_chk != "jpg" && select_img_chk != "png" && select_img_chk != "gif" && select_img_chk != "bmp") {
		 //확장자를 확인합니다.
	    alert('프로필은 이미지 파일(jpg, png, gif, bmp)만 등록 가능합니다.');
	    $(this).val('');
	    return;
		}else{
			img_arr.push(e.target.files[0]);
		}
	}
});

function upload(file, i){

			if(file != null){
			    var storageRef = firebase.storage().ref('ad/'+new Date()+i+'.jpg');
			    var task = storageRef.put(file);
			    task.on('state_changed',
			        function progress(snapshot){

			        },
			        function error(err){
			            console.log('업로드 에러');
			        },
			        function complete(){

			            storageRef.getDownloadURL().then(function(url) {

			            	url_arr.push(url);
			            	if(url_arr.length == 2){

			            		var obj = {};
			            		obj.img = url_arr;

			            		$.ajax({
			            		   url:"addAd",
			            		   type:"post",
			            		   data: {data : JSON.stringify(obj)},
			            		   error:function(error){console.log(error);},
			            		   success:function(result){
			            		   	if(result == 'fail'){
			            		   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
			            		   		location.reload();
			            		   	}
			            		  	if(result=="success"){
			            		  		alert("업로드 완료");
			            		  		location.href= "/admin/ad_img";
			            		  	}
			            		   }//통신완료
			            		});//ajax끝

			            	}


		            		// obj.id = id;
		            		// if($("#item_event").val() == "추천") obj.event = "recommend";
		            		// else if($("#item_event").val() == "대행") obj.event = "proxy";
		            		// else if($("#item_event").val() == "신규") obj.event = "new";

		              }, function(err){
		                  alert("사진 업로드 에러"+err);
		              });
			        }
			    );
			}
}

$("#ad_change_done").on("click", function(){
	var before_index = $("#before_index").val();
	var after_index = $("#will_change_item").val();

	var obj = {};
	obj.before = before_index;
	obj.after = after_index;

	$.ajax({
	   url:"ad_change",
	   type:"post",
	   data: {data : JSON.stringify(obj)},
	   error:function(error){console.log(error);},
	   success:function(result){
	   	if(result == 'fail'){
	   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
	   		location.reload();
	   	}
	  	if(result=="success"){
	  		location.href= "/admin/ad_img";
	  	}
	   }//통신완료
	});//ajax끝

});

$(".change_index").on("click", function(){
	var index = parseInt($(this).attr("id"));
	var total = parseInt($("#ad_total").val());
	$("#before_index").val(""+index);
	var str = "";

	for(var i = 1; i <= total; i++){
		if(i != index){
			str = str +"<option>"+i+"</option>";
		}
	}

	$("#will_change_item").html(str);

	for(var i = 1; i<= total; i++){
		if(i != index)	$("#detail_img"+i).hide();
		else $("#detail_img"+i).show();
	}

});

function ad_del(index){
	var chk = confirm("삭제하시겠습니까?");
	if(chk){
		$.ajax({
		   url:"del_ad",
		   type:"post",
		   data: {data : index},
		   error:function(error){console.log(error);},
		   success:function(result){
		   	if(result == 'fail'){
		   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
		   		location.reload();
		   	}
		  	if(result=="success"){
		  		location.href= "/admin/ad_img";
		  	}
		   }//통신완료
		});//ajax끝
	}
}