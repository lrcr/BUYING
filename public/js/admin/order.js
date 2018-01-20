var socket= io();
var connection = false;

var spec_key = [];
var spec_key2 = [];

var spec_value = [];
var spec_value2 = [];

var img_arr = [];
var img_arr2 = [];

var url_arr = [];
var url_arr2 = [];

socket.emit('check', 'buying');
socket.on('config', function(msg) {
	if(msg !='fail'){
	  if(connection == false){
	    connection = true;
	    firebase.initializeApp(msg);
	  }
	}
});

var key;
var uid;

function response_result(){
	if(key != null && uid != null){
		$.ajax({

		   url:"load_response",
		   type:"post",
		   data: {key : key, uid : uid},
		   error:function(error){console.log(error);},
		   success:function(result){
		   	if(result == 'fail'){
		   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도하세요");
		   		location.reload();
		   	}
		  	else{
		  		$(".response_result_content").html(result);
		  	}
		   }//통신완료
		});//ajax끝
	}
}

function load_order_detail(datas){
	key = datas.key;
	uid = datas.uid;

	$("#url").text(datas.url);
	$("#seller-location").text(datas.location);
	$("#ect").text(datas.ect);
	$("#name").text(datas.user_name);
	$("#phone").text(datas.phone);

	if(datas.step =="응답전"){
		$("#proxy_result_btn").hide();
		$("#proxy_ok").show();
	}else if(datas.step =="응답완료"){
		$("#proxy_result_btn").show();
		$("#proxy_ok").hide();
	}
}

$("#proxy_ok").on("click", function(){
	$("#recommend_count").val("선택");
	$("#one").hide();
	$("#two").hide();
});

$("#unable").on("click", function(){
	var chk = confirm("거래를 취소하시겠습니까?");
	if(chk){

			$.ajax({
		   url:"unable_for_order",
		   type:"post",
		   data: {key : key},
		   error:function(error){console.log(error);},
		   success:function(result){
		   	if(result == 'fail'){
		   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도하세요");
		   	}
		  	if(result=="success"){
		  		alert("취소 완료");
		  		location.reload();
		  	}
		   }//통신완료
		});//ajax끝

		return false;
	}else{
		return false;
	}
});



$("#done").on("click", function(){
	var done = confirm("완료시 바로 푸쉬가 전송 됩니다. 진행하시겠습니까?");
	if(done){

		if($("#recommend_count").val() == "1"){

			// for(var i = 1; i <=parseInt($(".spec_box").children("div").length)/2; i++){

			// 	if($("#"+i+"_spec_key").val() != "" && $("#"+i+"_spec_key").val() != null && $("#"+i+"_spec_key").val() != " "){
			// 		// var tmp = JSON.parse('{"'+$("#"+i+"_spec_key").val()+'":"'+$("#"+i+"_spec_value").val()+'"}');
			// 		// spec_arr.push(tmp);
			// 		spec_key.push($("#"+i+"_spec_key").val());
			// 		spec_value.push($("#"+i+"_spec_value").val());
			// 	}
			// }

			if(img_arr.length != 0){
				for(var i = 0; i <img_arr.length; i++){
					uploadImg(img_arr[i], i, "first");
				}
			}

			return false;

		}else if($("#recommend_count").val() == "2"){

			// for(var i = 1; i <=parseInt($(".spec_box").children("div").length)/2; i++){

			// 	if($("#"+i+"_spec_key").val() != "" && $("#"+i+"_spec_key").val() != null && $("#"+i+"_spec_key").val() != " "){
			// 		// var tmp = JSON.parse('{"'+$("#"+i+"_spec_key").val()+'":"'+$("#"+i+"_spec_value").val()+'"}');
			// 		// spec_arr.push(tmp);
			// 		spec_key.push($("#"+i+"_spec_key").val());
			// 		spec_value.push($("#"+i+"_spec_value").val());
			// 	}
			// }

			// for(var i = 1; i <=parseInt($(".spec_box2").children("div").length)/2; i++){

			// 	if($("#"+i+"_spec_key2").val() != "" && $("#"+i+"_spec_key2").val() != null && $("#"+i+"_spec_key2").val() != " "){
			// 		// var tmp = JSON.parse('{"'+$("#"+i+"_spec_key").val()+'":"'+$("#"+i+"_spec_value").val()+'"}');
			// 		// spec_arr.push(tmp);
			// 		spec_key2.push($("#"+i+"_spec_key2").val());
			// 		spec_value2.push($("#"+i+"_spec_value2").val());
			// 	}
			// }

			if(img_arr.length != 0){
				for(var i = 0; i <img_arr.length; i++){
					uploadImg(img_arr[i], i, "first");
				}
			}

			if(img_arr2.length != 0){
				for(var i = 0; i <img_arr2.length; i++){
					uploadImg(img_arr2[i], i, "second");
				}
			}
			return false;
		}
	}else{
		return false;
	}

});

function uploadImg(file, i, sequence){

			if(file != null){
			    var storageRef = firebase.storage().ref('response/'+sequence+'/'+new Date()+"/"+i+'.jpg');
			    var task = storageRef.put(file);
			    task.on('state_changed',
			        function progress(snapshot){

			        },
			        function error(err){
			            console.log('업로드 에러');
			        },
			        function complete(){

			            storageRef.getDownloadURL().then(function(url) {

			            	if(sequence == "first"){
			            		url_arr.push(url);
			            	}else{
			            		url_arr2.push(url);
			            	}
			            	var objs = [];

			            	if($("#recommend_count").val() == "1"){
			            		if(url_arr.length == img_arr.length){//이미지 업로드 완료시
			            			var obj = {};

			            			obj.name = $("#product_name").val();
			            			obj.brand = $("#brand_name").val();
			            			obj.grade = $("#grade").val();
			            			obj.price = $("#price").val();
			            			obj.component = $("#component").val();
			            			obj.mention = $("#mention").val();
			            			obj.trade_date = $("#trade_date").val();
			            			// obj.spec = {
			            			// 	key : spec_key,
			            			// 	value : spec_value
			            			// }
			            			obj.img = url_arr;

			            			objs.push(obj);

			            			$.ajax({
		            			   url:"response_for_order",
		            			   type:"post",
		            			   data: {data : JSON.stringify(objs), key : key, uid : uid},
		            			   error:function(error){console.log(error);},
		            			   success:function(result){
		            			   	if(result == 'fail'){
		            			   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도하세요");

		            			   	}
		            			  	if(result=="success"){
		            			  		alert("업로드 완료");
		            			  		location.reload();
		            			  	}
		            			   }//통신완료
		            			});//ajax끝
			            		}
			            	}else{ // 2개 등록시
			            		if(url_arr.length == img_arr.length && url_arr2.length == img_arr2.length){
			            			var obj = {};
			            			var obj2 ={};

			            			obj.name = $("#product_name").val();
			            			obj.brand = $("#brand_name").val();
			            			obj.grade = $("#grade").val();
			            			obj.price = $("#price").val();
			            			obj.component = $("#component").val();
			            			obj.mention = $("#mention").val();
			            			obj.trade_date = $("#trade_date").val();
			            			// obj.spec = {
			            			// 	key : spec_key,
			            			// 	value : spec_value
			            			// }
			            			obj.img = url_arr;

			            			obj2.name = $("#product_name2").val();
			            			obj2.brand = $("#brand_name2").val();
			            			obj2.grade = $("#grade2").val();
			            			obj2.price = $("#price2").val();
			            			obj2.component = $("#component2").val();
			            			obj2.mention = $("#mention2").val();
			            			obj2.trade_date = $("#trade_date2").val();

			            			// obj2.spec = {
			            			// 	key : spec_key2,
			            			// 	value : spec_value2
			            			// }
			            			obj2.img = url_arr2;


			            			objs.push(obj);
			            			objs.push(obj2);

			            			$.ajax({
			            			   url:"response_for_order",
			            			   type:"post",
			            			   data: {data : JSON.stringify(objs), key : key, uid : uid},
			            			   error:function(error){console.log(error);},
			            			   success:function(result){
			            			   	if(result == 'fail'){
			            			   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도하세요");

			            			   	}
			            			  	if(result=="success"){
			            			  		alert("업로드 완료");
			            			  		location.reload();
			            			  	}
			            			   }//통신완료
			            			});//ajax끝
			            		}

			            	}

		              }, function(err){
		                  alert("사진 업로드 에러"+err);
		              });
			        }
			    );
			}
}

function addSpec(){
	var leng = parseInt($(".spec_box").children("div").length)/2;

	var beforeHTML = $(".spec_box").html();

		var str = ''+
			'<label for="textArea" class="col-lg-2 control-label"></label>'+
	    '<div class="col-lg-2"><input class="form-control spec_key" id="'+leng+'_spec_key"></div>'+
	    '<div class="col-lg-8"><input class="form-control spec_value" id="'+leng+'_spec_value" placeholder="내용"></div>';

	$(".spec_box").html(beforeHTML+str);
}

function addSpec2(){
	var leng = parseInt($(".spec_box2").children("div").length)/2;

	var beforeHTML = $(".spec_box2").html();

		var str = ''+
			'<label for="textArea" class="col-lg-2 control-label"></label>'+
	    '<div class="col-lg-2"><input class="form-control spec_key2" id="'+leng+'_spec_key2"></div>'+
	    '<div class="col-lg-8"><input class="form-control spec_value2" id="'+leng+'_spec_value2" placeholder="내용"></div>';

	$(".spec_box2").html(beforeHTML+str);
}

function addImg(){
	var leng = parseInt($(".image_box").children("div").length);

	var beforeHTML = $(".image_box").html();
	var str = ""+
		'<label class="col-lg-2 control-label">사진</label>'+
		'<div class="col-lg-10">'+
		  '<input type="file" class="form-control item_image" id="'+leng+'_image">'+
		'</div>';
	$(".image_box").html(beforeHTML+str);
}

function addImg2(){
	var leng = parseInt($(".image_box2").children("div").length);

	var beforeHTML = $(".image_box2").html();
	var str = ""+
		'<label class="col-lg-2 control-label">사진2</label>'+
		'<div class="col-lg-10">'+
		  '<input type="file" class="form-control item_image2" id="'+leng+'_image2">'+
		'</div>';
	$(".image_box2").html(beforeHTML+str);
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

//대표사진2 업로드시
$('#mainImage2').on('change', function (e) {
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
			img_arr2[0] = e.target.files[0];
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

//사진2 업로드시
$('.item_image2').on('change', function (e) {

		if($(this).val() != null){

			var index = parseInt($(this).attr("id"));
			var file = e.target.files[0];
			var select_img = this.value;
			//파일 확장자를 잘라내고, 비교를 위해 소문자로 만듭니다.
			var select_img_chk = select_img.slice(select_img.indexOf(".") + 1).toLowerCase();
			if($("#mainImage2").val() == ""){
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
					img_arr2[index] = e.target.files[0];

			}
		}
});


$("#recommend_count").on("change", function(){
	if($(this).val() == "1"){
		$("#one").show();
		$("#two").hide();
	}else if($(this).val() == "2"){
		$("#one").show();
		$("#two").show();
	}else{
		$("#one").hide();
		$("#two").hide();
	}
});