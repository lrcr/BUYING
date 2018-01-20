var socket= io();
var connection = false;

var spec_key = [];
var spec_value = [];
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


$("#addForm").on("submit", function(){
	var category = $("#category").val();
	var product_name = $("#product_name").val();
	var grade = $("#grade").val();

	if(category == "선택(필수)"){
		alert("카테고리 선택안함");
		return false;
	}else if(product_name == ""){
		alert("모델명 기입 안함");
		return false;
	}else if(grade == "선택(필수)"){
		alert("상태등급 선택안함");
		return false;
	}else if(img_arr.length == 0 ){
		alert("사진을 등록하세요(대표사진+상세사진)");
		return false;
	}
	else{
		var chk = confirm("완료하시겠습니까?");
		if(chk){

			for(var i = 1; i <=parseInt($(".spec_box").children("div").length)/2; i++){

				if($("#"+i+"_spec_key").val() != "" && $("#"+i+"_spec_key").val() != null && $("#"+i+"_spec_key").val() != " "){
					// var tmp = JSON.parse('{"'+$("#"+i+"_spec_key").val()+'":"'+$("#"+i+"_spec_value").val()+'"}');
					// spec_arr.push(tmp);
					spec_key.push($("#"+i+"_spec_key").val());
					spec_value.push($("#"+i+"_spec_value").val());
				}
			}

			if(img_arr.length != 0){
				for(var i = 0; i <img_arr.length; i++){
					uploadImg(img_arr[i], i);
				}
			}

			return false;
		}else{
			return false;
		}
	}

	return false;
});

function addSpec(){
	var leng = parseInt($(".spec_box").children("div").length)/2;

	var beforeHTML = $(".spec_box").html();

		var str = ''+
			'<label for="textArea" class="col-lg-2 control-label"></label>'+
	    '<div class="col-lg-2"><input class="form-control spec_key" id="'+leng+'_spec_key"></div>'+
	    '<div class="col-lg-8"><input class="form-control spec_value" id="'+leng+'_spec_value" placeholder="내용"></div>';

	$(".spec_box").html(beforeHTML+str);
}

function addImg(){
	var leng = parseInt($(".image_box").children("div").length);

	var beforeHTML = $(".image_box").html();
	var str = ""+
		'<label class="col-lg-2 control-label">사진</label>'+
		'<div class="col-lg-10">'+
		  '<input type="file" class="form-control item_image" name ="image" id="'+leng+'_image">'+
		'</div>';
	$(".image_box").html(beforeHTML+str);
}


//대표사진 업로드시
$('#mainImage').on('change', function (e) {
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
			img_arr[0] = e.target.files[0];
		}
	}
});



//사진 업로드시
$('.item_image').on('change', function (e) {

		if($(this).val() != null){

			var index = parseInt($(this).attr("id"));
			var file = e.target.files[0];
			var select_img = this.value;
			//파일 확장자를 잘라내고, 비교를 위해 소문자로 만듭니다.
			var select_img_chk = select_img.slice(select_img.indexOf(".") + 1).toLowerCase();
			if($("#mainImage").val() == ""){
				alert("대표사진부터 먼저 업로드해주세요.");
				$(this).val('');
			}else if(e.target.files[0].size >= 70000){
				alert("사진크기는 70KB보다 작아야합니다.");
				$(this).val('');
			}else if (select_img_chk != "jpg" && select_img_chk != "png" && select_img_chk != "gif" && select_img_chk != "bmp") { //확장자를 확인합니다.
				    alert('프로필은 이미지 파일(jpg, png, gif, bmp)만 등록 가능합니다.');
				    $(this).val('');
				    return;
			} else { // 이미지 파일일 경우
					img_arr[index] = e.target.files[0];

			}
		}
});


function uploadImg(file, i){


			if(file != null){
			    var storageRef = firebase.storage().ref('item/'+$("#category").val()+"/"+new Date()+"/"+$("#product_name").val()+i+'.jpg');
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
			            	if(url_arr.length != img_arr.length){//이미지 업로드 완료시

			            	}else{

			            		var obj = {};
			            		obj.category = $("#category").val().split(".")[1];

			            		obj.name = $("#product_name").val();
			            		obj.brand = $("#brand_name").val();
			            		obj.grade = $("#grade").val();
			            		obj.price = $("#price").val();
			            		obj.component = $("#component").val();
			            		obj.mention = $("#mention").val();
			            		// obj.spec = spec_arr;
			            		obj.spec = {
			            			key : spec_key,
			            			value : spec_value
			            		}
			            		obj.img = url_arr;

			            		$.ajax({
			            		   url:"addItem",
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
			            		  		location.href= "/admin/resell";
			            		  	}
			            		   }//통신완료
			            		});//ajax끝
			            	}

		              }, function(err){
		                  alert("사진 업로드 에러"+err);
		              });
			        }
			    );
			}
}

function loadItem(id){
	$.ajax({
	   url:"load_detail",
	   type:"post",
	   data: {key : id},
	   error:function(error){console.log(error);},
	   success:function(result){
	   	if(result == 'fail'){
	   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
	   		location.reload();
	   	}else{
	   		$("#item_detail_view").html(result);
	   	}

	   }//통신완료
	});//ajax끝
}

function del_item(id){
	var chk = confirm("삭제하시면 데이터가 영구적으로 지워집니다. 삭제하시겠습니까?");
	if(chk){
		$.ajax({
		   url:"del_item",
		   type:"post",
		   data: {key : id},
		   error:function(error){console.log(error);},
		   success:function(result){
		   	if(result == 'fail'){
		   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
		   		location.reload();
		   	}else if(result=="success"){
		   		location.reload();
		   	}

		   }//통신완료
		});//ajax끝
	}

}