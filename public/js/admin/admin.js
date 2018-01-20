var socket= io();

var load_id = function(id){
	socket.emit('question-detail', id);

	socket.on('question-detail', function(msg){
		if(msg == "fail"){
			alert("네트워크 상태가 불안정합니다. 잠시후 시도하세요.");
			location.reload();
		}
		else {
			if(msg.answer==null){
				$('.answer-ok').show();
				$('#question-modal .modal-title').text('[제목]'+msg.title);
				$('#th-q-email').text(msg.email);
				$('#th-q-write_date').text(msg.write_date);
				$('#q-content').text(msg.content);
				$('#hiddenid-question').val(msg._id);
			}
			else{
				$('.answer-ok').hide();
				$('#question-ta').hide();
				$('#question-modal .modal-title').text('[제목]'+msg.title);
				$('#th-q-email').text(msg.email);
				$('#th-q-write_date').text(msg.write_date);
				$('#q-content').text(msg.content);
				$('#question-answer-content').html('<p>[답변내용]<br>'+msg.answer+'<br><br><br><br><br><br><br><br>[답변일]'+msg.answer_date+'</p>');
			}
		}
	});
}

//공지사항에서 제목 누를 시
var load_writingId = function(writingId){
	socket.emit('notify-detail',writingId);

	socket.on('notify-detail', function(msg) {
		$('#detailmodal .modal-title').text('[제목] '+msg.title);
		$('#detailmodal .th-writer').text(msg.email);
		$('#detailmodal .th-write_date').text(msg.write_date);
		$('#detailmodal .notify-detail-content').text(msg.content);
		$('#detailmodal .notify-detail_id').text(msg.writingId);

	});//socket on
}

var load_email = function(email){

	$('#hidden-email').val(email);
	$.ajax({
	   url:"member-order-detail",
	   type:"post",
	   data: {email : email},
	   error:function(error){console.log(error);},
	   success:function(result){
	   	if(result == 'fail'){
	   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
	   		location.reload();
	   	}
	  	if(result!=null){
	  		$('#member-order-box').html(result);
	  	}
	   }//통신완료
	});//ajax끝
}

//응답내역 클릭 시
var rec_result = function(){
	$.ajax({
	   url:"rec_result",
	   type:"post",
	   data: {
	   	order_no : $('.hidden-order-no').val()
	   },
	   error:function(error){console.log(error);},
	   success:function(result){
	   	if(result == 'fail'){
	   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
	   		location.reload();
	   	}
	  	if(result!=null){
	  		$("#rec-result").css("overflow-y","auto");
	  		$('.rec-reuslt-content').html(result);
	  	}
	   }//통신완료
	});//ajax끝
}

//주문관리 테이블에서 주문번호 클릭시
var load_order_num = function(order_no){

	// $('#res-order-no').val($(this).attr('id'));
	// $('.unable').val($(this).attr('id'));
	// $('.hidden-order-no').val($(this).attr('id'));
	// socket.emit('order-detail',$(this).attr('id'));

	$('#res-order-no').val(order_no);
	$('.unable').val(order_no);
	$('.hidden-order-no').val(order_no);
	socket.emit('order-detail',order_no);

	socket.on('order-detail', function(msg) {
		var base = msg.datas.buying;

		if(base.trade_type == "대행" ){
			$('#url').html('<a href="'+base.request.url+'" target="_blank">'+base.request.url+'</a>');
			$('#price').text(base.request.req_price+"만원");
			$('#seller-phone').text(base.request.seller_phone);
			$('#seller-location').text(base.request.seller_location);
			$('#customer-mention').text(base.request.customer_mention);
			if(msg.datas.order_state.step == 0){
				$('#proxy-ok').show();
				$('.rec-result').hide();
			}else{
				$('#proxy-ok').hide();
				$('.rec-result').show();
			}
		}else{
			if(msg.datas.order_state.step == 0){
				$('#recommend-btn').show();
				$('.rec-result').hide();
			}else{
				$('#recommend-btn').hide();
				$('.rec-result').show();
			}

			var th = $('#search tbody th');
			var td = $('#search tbody td');
			for(var i = 0; i <8; i++) td.eq(i).text('');
			if(base.request.choice == 0){//네
				th.eq(0).text('모델명');
				td.eq(0).text(base.request.model_name);
				th.eq(1).text('매물선별기준');
				td.eq(1).text(base.request.priority_1);
				th.eq(2).text('S등급 구매 희망');
				td.eq(2).text(base.request.priority_2);
				th.eq(3).text('필수요청사항');
				td.eq(3).text(base.request.essential);
				th.eq(4).text('기타요청사항');
				td.eq(4).text(base.request.customer_mention);
				th.eq(5).text('유사모델 포함 추천 받기 희망');
				td.eq(5).text(base.request.other_ok);
				th.eq(6).text('당일 배송 희망');
				td.eq(6).text(base.request.day_delivery);
				th.eq(7).text('당일 배송 지역');
				td.eq(7).text(base.request.day_destination);
				$('#res-cate-name').val(base.request.model_name);
			}
			else if(base.request.choice == 1){//아니오
				th.eq(0).text('예산금액');
				td.eq(0).text(base.request.req_price+"원");
				th.eq(1).text('매물선별기준');
				td.eq(1).text(base.request.priority_1);
				th.eq(2).text('S등급 구매 희망');
				td.eq(2).text(base.request.priority_2);
				th.eq(3).text('선호 제조사');
				td.eq(3).text(base.request.brand);
				th.eq(4).text('주사용 기능');
				td.eq(4).text(base.request.customer_mention);
				th.eq(5).text('당일 배송 희망');
				td.eq(5).text(base.request.day_delivery);
				th.eq(6).text('당일 배송 지역');
				td.eq(6).text(base.request.day_destination);
				th.eq(7).text('');
			}
		}
	});//socket.on

};


//쿠폰, 마일리지 내역 버튼 클릭시
var discount = function(type){
	$.ajax({
	   url:"discount-detail",
	   type:"post",
	   data: {
	   	email : $('#hidden-email').val(),
	   	type : type
	   },
	   error:function(error){console.log(error);},
	   success:function(result){
	   	if(result == 'fail'){
	   		alert("네트워크 상태가 불안정합니다. 잠시 후 다시 시도해하세요");
	   		location.reload();
	   	}
	  	if(result!=null){
	  		$('#discount-content').html(result);
	  	}
	   }//통신완료
	});//ajax끝

}


//공지사항 작성 이벤트
$("#notify-form").on('submit',function(){
	if($('#write-title').val()==""){
		alert("제목을 입력하세요");
		return false;
	}
	else if($('#write-content').val()==""){
		alert("내용을 입력하세요");
		return false;
	}
	else { return true; }
});


//매물추천 버튼 클릭시
$("#recommend-btn").on('click',function() {
	$("#recommend").css("overflow-y","auto");
	$("#add-item").show();
	$("#new-item-space").show();
});

//직거래 수락 버튼 클릭시
$("#proxy-ok").on('click',function() {
	$("#recommend").css("overflow-y","auto");
	$("#add-item").hide();
	$("#new-item-space").hide();
});

//알림 등록
$('.event-btn').on('click',function() {
	var length = $(".selected").length;
	if(length==0){
		alert("최소 한명 이상 선택 하세요!");
		return false;
	}
	else return true;
});

$('#alarm-done').on('click',function() {
	var str=$("#alarm-input").val();
	if(str==="") {
		alert("내용 작성 필수");
		return false;
	}
	else{
		var length = $(".selected").length;
		var arr=[];
		for(var i=0; i<length; i++){
			var email = $(".selected:first .email").text();
			arr.push( email );
			$(".selected:first").removeClass("selected");
		}//for
		var datas ={ type : 'event', content : str, datas : arr };
		$.ajax({
		   url:"add_alarm",
		   type:"post",
		   data: datas,
		   // dataTypes:"json",
		   error:function(error){console.log(error);},
		   success:function(result){
		   	if(result=="ok"){
		   		alert('전송되었습니다!');
			  	location.reload();
		   	}else{
					alert("네트워크 상태가 불안정 합니다. 잠시후 시도하세요");
					history.back();
				}
		   }//통신완료
		});//ajax끝
	}//else
});


//쿠폰 등록
$('#coupon-done').on('click',function() {
	var str=$("#coupon-name").val();
	var amount = parseInt($("#coupon-amount").val());
	if(str==="") {
		alert("쿠폰명 기입 필수");
		return false;
	}
	else if((amount==="")||(amount%1000!=0)){
		alert("1000단위만 가능!!");
		return false;
	}
	else{
		var length = $(".selected").length;
		var arr=[];
		for(var i=0; i<length; i++){
			var email = $(".selected:first .email").text();
			arr.push( email );
			$(".selected:first").removeClass("selected");
		}//for
		var datas ={ type : 'coupon', name : str, amount : amount, datas : arr };
		$.ajax({
		   url:"add_alarm",
		   type:"post",
		   data: datas,
		   // dataTypes:"json",
		   error:function(error){console.log(error);},
		   success:function(result){
		   	if(result=="ok"){
		   		alert("등록되었습니다!");
			  	location.reload();
		   	}
				else{
					alert("네트워크 상태가 불안정 합니다. 잠시후 시도하세요");
					history.back();
				}
		   }//통신완료
		});//ajax끝
	}//else
});


//마일리지
$('#milage-done').on('click',function() {
	var str=$("#milage-title").val();
	var amount = parseInt($("#milage-amount").val());
	if(str==="") {
		alert("제목 작성 필수");
		return false;
	}
	else if(amount%100!==0)
	{
		alert("100 단위만 가능!!");
		return false;
	}
	else{
		var length = $(".selected").length;
		var arr=[];
		for(var i=0; i<length; i++){
			var email = $(".selected:first .email").text();
			arr.push( email );
			$(".selected:first").removeClass("selected");
		}//for
		var datas ={ type : 'mileage', title : str, amount : amount, datas : arr };
		console.log(datas);
		$.ajax({
		   url:"add_alarm",
		   type:"post",
		   data: datas,
		   // dataTypes:"json",
		   error:function(error){console.log(error);},
		   success:function(result){
		   	if(result=="ok"){
		   		alert("지급되었습니다!");
			  	location.reload();
		   	}else{
					alert("네트워크 상태가 불안정 합니다. 잠시후 시도하세요");
					history.back();
				}
		   }//통신완료
		});//ajax끝
	}//else
});

//사진추가1
var inputcnt = 2;
$('#add-image').on('click',function(){
	var tmp =	$('#image-forms').html();
	var add =  '<div class="form-group">'+
                '<label class="col-lg-2 control-label">사진'+inputcnt+'</label>'+
                '<div class="col-lg-10">'+
                 '<input type="file" class="form-control" name = "item1" >'+
                '</div>'+
              '</div>';

	$('#image-forms').html(tmp+add);
	inputcnt++;
	if(inputcnt == 11){
		$(this).hide();
	}
	return false;
});

//매물추가
var itemcnt=2;
$('#add-item').on('click',function(){
	var tmp = $("#new-item-space").html();
	var add = '<div class="form-group">'+
                '<label class="col-lg-2 control-label">매물명</label>'+
                '<div class="col-lg-10">'+
                  '<input class="form-control" name="product_name2" id="res-cate-name'+itemcnt+'">'+
                '</div>'+
              '</div>'+

         '<div class="form-group">'+
		'<label class="col-lg-2 control-label">등급</label>'+
    		'<div class="col-lg-10 btn-group" data-toggle="buttons">'+
	 '<label class="btn btn-primary grade-lb2">'+
	   '<input type="radio" class="join-radio" autocomplete="off" checked> S급'+
 '</label>'+
  '<label class="btn btn-success grade-lb2">'+
    '<input type="radio" class="join-radio" autocomplete="off"> A급'+
  '</label>'+
  '<label class="btn btn-default grade-lb2">'+
    '<input type="radio" class="join-radio" autocomplete="off"> B급'+
  '</label>'+
'</div>'+
     		 '</div>'+

     		 '<input type="hidden" id="grade-val2" name ="grade_val2" >'+


     		 '<div class="form-group">'+
     		   '<label class="col-lg-2 control-label">가격</label>'+
     		   '<div class="col-lg-10">'+
     		     '<input class="form-control" name="res_price2" id="res-price'+itemcnt+'">'+
     		   '</div>'+
     		 '</div>'+


     		 '<div class="form-group">'+
     		   '<label class="col-lg-2 control-label">거래 예정 시간</label>'+
     		   '<div class="col-lg-10">'+
     		     '<input class="form-control" name="trade_time2" id="trade-time">'+
     		   '</div>'+
     		 '</div>'+

     		 '<div class="form-group">'+
     		   '<label class="col-lg-2 control-label">구성품</label>'+
     		   '<div class="col-lg-10">'+
     		     '<input class="form-control" name="component2" id="component">'+
     		   '</div>'+
     		 '</div>'+


              '<div class="form-group">'+
                '<label for="textArea" class="col-lg-2 control-label">추천사</label>'+
                '<div class="col-lg-10">'+
                  '<textarea class="form-control" name="buyer_mention2" rows="3" id="textArea'+itemcnt+'"></textarea>'+
                '</div>'+
              '</div>'+

              '<div id="image-forms'+itemcnt+'">'+
                '<div class="form-group">'+
                  '<label class="col-lg-2 control-label">사진1</label>'+
                  '<div class="col-lg-10">'+
                    '<input type="file" class="form-control" name = "item2">'+
                  '</div>'+
                '</div>'+
              '</div>'+

             '<div class="form-group">'+
                '<div class="col-lg-10 col-lg-offset-2">'+
                  '<input type= "button" value="사진추가" id="add-image'+itemcnt+'" class="btn btn-info" onclick = "addimg()"/>'+
                '</div>'+
              '</div>'+
              '<script>'+
              '$(".grade-lb2").on("click",function(){'+
              	'$("#grade-val2").val($(this).text().trim());'+
              '});'+
              '</script>';
  $('#new-item-space').html(add);
  itemcnt++;
	if(itemcnt == 3){
		$(this).hide();
	}
	return false;
});

//사진추가2
var inputcnt2 = 2;
function addimg(){
	var tmp =	$('#image-forms2').html();
	var add =  '<div class="form-group">'+
                '<label class="col-lg-2 control-label">사진'+inputcnt2+'</label>'+
                '<div class="col-lg-10">'+
                 '<input type="file" class="form-control" name = "item2" >'+
                '</div>'+
              '</div>';

	$('#image-forms2').html(tmp+add);
	inputcnt2++;
	if(inputcnt2 == 11){
		$('#add-image2').hide();
	}
}


$('.grade-lb').on('click',function(){
	$('#grade-val').val($(this).text().trim());
});


