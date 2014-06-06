$(function() {	

// NAV 
	$('nav li').hover(		
		function () {
			$(this).find('.description').stop().animate({
			 left:"65px",
			opacity: 1,
		  }, 300 );
		  $(this, 'description').find('a').addClass('select');
		}, 
		function () {
			$(this).find('.description').stop().animate({
			 left:"-35px",
			opacity: 0,
		  }, 100 );
		    $(this).find('a').removeClass('select');
		}
	);	

// SIDEBAR CLOSE
	$(".close").click(function(event){
	event.preventDefault();
		if ($(this).hasClass("start") ) {
			$('.sidebar').stop().animate({left:"98%"}, 500);   
			$('.main').stop().animate({width:"98%"}, 500);         	
			$(this).removeClass("start");
			$(".close span").removeClass('icon-right-open');
			$(".close span").addClass('icon-left-open');
		} else {
			$('.sidebar').stop().animate({left:"55%"}, 500);  
			$('.main').stop().animate({width:"55%"}, 500);       	
			$(this).addClass("start");
			$(".close span").addClass('icon-right-open');
			$(".close span").removeClass('icon-left-open');
		}
		return false;
	});

// WINDOW INFO 
	$("#delete, #deactive").click(function() {
		$('.widget-window').addClass('visible').animate({
			opacity: "1",			
			}, 500);
		}
	);
	
	$(".widget-window .icon-cancel").click(function() {
		$('.widget-window').removeClass('visible');
	});
	
	
// INPUT CHANGE USER

$("#edit, #save").click(function(event){
	event.preventDefault();
	if ($(this).hasClass("no") ) {
		$(".USER .personal-data input").attr('disabled', 'disabled');
		$(".USER .action #save").removeClass('visible').addClass('hidden').animate({opacity: '1'}, 500);
	$(this).removeClass("no");
	} else {
		$(this).addClass("no");
		$(".USER .personal-data input").removeAttr('disabled', 'disabled');
		$(".USER .action #save").removeClass('hidden').addClass('visible');
	}		
	return false;
});

// CALENDAR 



// MESSAGES 


	$('.messages table tr').click(function() {
		$(this).next('tr.info').slideToggle('fast').siblings('tr.info').slideUp('fast');
	});	
	
// USER
	$('.USER .list-USER .USER-view').hover(
		function () {
			$(this).css('border', '1px solid #000');
			$(this).find('img').animate({
				width: "105%",
				duration: 3000,
			});
			$(this).find('.name').animate({
				duration: 3000,
				 opacity: "show"
			});
		 }, 
		 function () {	
			$(this).css('border', '1px solid #c3c3c3');
			$(this).find('img').animate({
				width: "100%",
				duration: 3000,
			});
			$(this).find('.name').animate({
				duration: 3000,
				 opacity: "hide"
			});
		} 
	);

	
	
	
// START SCRIPT

	$('.messages .list').perfectScrollbar();
	$('.sidebar .tabs').perfectScrollbar();
	$('#tab-container').easytabs();
	
});




