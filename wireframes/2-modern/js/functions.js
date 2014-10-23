$(function() {	
	
	// LEGEND
	
	$('.widget-legend .open').click(function() {
		$('.widget-legend .place-list').slideDown('fast');
	});
	
	$('.widget-legend .place-list .close').click(function() {
		$('.widget-legend .place-list').slideUp('fast');
	});
	
	$('.widget-min-calendar .open').click(function() {
		$('.widget-min-calendar .calendar').slideDown('fast');
	});
	
	$('.widget-min-calendar .calendar .close').click(function() {
		$('.widget-min-calendar .calendar').slideUp('fast');
	});
	
	// NAV
		
	$( "nav li" ).hover(		
	   function() {			
		 $(this).find('ul.subpage').stop(true,true).animate({
			 left: '0px',
			 opacity: '1',
			 top: '0px'
		 }, 500);
	   }, function() {			
		 $(this).find('ul.subpage').stop(true,true).animate({
			 left: '0px',
			 opacity: '0',
			 top: '0px'
		 }, 500);
	   }
	);
	
	// CHECKBOX 
	
	$('input').ezMark();
	
	// SELECT BOX
	if ($('select').length > 0) {	
		var selectBox = $("select").selectBoxIt();
	}
	
	// $('nav li').click(function(e){
		// e.preventDefault();	
		// var target = $(this).attr('class');
		// $(this).find('.subpage').stop().fadeOut(300, function() {
			// $(this).find('.' + target).fadeIn(300);
		// });			
	// });
	
	// $( "nav li" ).hover(		
	  // function() {		
		// var target = $(this).attr('class');
		// $(this).find('.' + target).animate({
			// left: '0px',
			// opacity: '1',
			// top: '120px'
		// }, 500);
	  // }, function() {	
		// var target = $(this).attr('class');
		// $(this).find('.' + target).animate({
			// left: '0px',
			// opacity: '0',
			// top: '0px'
		// }, 500);
	  // }
	// );
	

	//SCROLL TO
		
	$(document).ready(function() {
		$(window).scroll(function() {
			if ($(this).scrollTop() > 100) {
				$('.back-to-top').fadeIn(500);
			} else {
				$('.back-to-top').fadeOut(500);
			}
		});
		
		$('.back-to-top').click(function(event) {
			event.preventDefault();
			$('html, body').animate({scrollTop: 0}, 500);
			return false;
		})
	});

	$(document).ready(function() {
		$(window).scroll(function() {
			if ($(this).scrollTop() > 48) {
				$('header').animate({top: '-5px'}, 0);
				$('header').addClass('small');
			} else {
				$('header').animate({top: '0px'}, 0);
				$('header').removeClass('small');
			}
		});			
	});
	
	
	
	
	
	
	
	
	
	
	
	
	// OLD CODE
	
	
	// NAV 
	
	// $('nav ul.nav li').find('ul.submenu').parent('li').addClass('add-submenu');
	
	// $('nav ul.nav li').click(function()	{		
		// $(this).find('ul.submenu').stop(true, true).slideToggle(300);
		// $(this).siblings().find('ul.submenu').stop(true, true).slideUp(300);
	// });
	
	// $('.user-list table tr:odd').addClass('select');
	
	
	// BREADCRUMBS 
	
		// $('.row .open-search, .row .close').click(function() {
			// $('.search').slideToggle(300);
		// });
	
	// WINDOW 
	
		// $('.close-window').click(function() {
			// $('section#bg-window').slideUp(300);
		// });
		
	
	
	// CALENDAR 
	
		// $('.calendar .row-content-left .event .row').hover(		
		// function () {
			// $(this).addClass('select');
		// }, 
		// function () {
			// $(this).removeClass('select');
		// });
		
		// ADD / CLOSE NOTE / VISIT
		
		// $('.add-new-visit').click(function() {
			// $('.add-visit').slideDown('fast');
		// });
		
		// $('.add-new-note').click(function() {
			// $('.add-note').slideDown('fast');
		// });
		
		// $('.read-note-link').click(function() {
			// $('.read-note').slideDown('fast');
		// });				
		
		// $('.icon-trash-link').click(function() {
			// $('.delete-visit').slideDown('fast');
		// });		
				
		// $('.calendar .row-content-left .event-day .row .note').on( 'click', '.close-note', function(e) {
			// e.preventDefault();
			// $(this).parent().slideUp('fast');
		// });
	
		// EDIT NOTE 
		
		// $("div.notes").click(divClicked);		
		
		// function divClicked() {
			// var divHtml = $(this).html();
			// var editableText = $("<textarea>");
			// editableText.val(divHtml);
			// $(this).replaceWith(editableText);
			// editableText.focus();			
			// editableText.blur(editableTextBlurred);			
		// }

		// function editableTextBlurred() {
			// var html = $(this).val();
			// var viewableText = $('<div class="notes">');
			// viewableText.html(html);
			// $(this).replaceWith(viewableText);			
			// viewableText.click(divClicked);
		// }

		
		
	// CUSTOM ELEMENT
		
		// SELECT
		
		// $("#term_visit").selectbox({
			// speed: 300
		// });
		
		// //SCROLL TO
		
		// $(document).ready(function() {
			// $(window).scroll(function() {
				// if ($(this).scrollTop() > 100) {
					// $('.back-to-top').fadeIn(500);
				// } else {
					// $('.back-to-top').fadeOut(500);
				// }
			// });
			
			// $('.back-to-top').click(function(event) {
				// event.preventDefault();
				// $('html, body').animate({scrollTop: 0}, 500);
				// return false;
			// })
		// });
	
		// $(document).ready(function() {
			// $(window).scroll(function() {
				// if ($(this).scrollTop() > 50) {
					// $('#breadcrumbs').animate({top: '-50px'}, 0);
					// $('#breadcrumbs').addClass('small');
					// $('#breadcrumbs .optional').addClass('top');
				// } else {
					// $('#breadcrumbs').animate({top: '0px'}, 0);
					// $('#breadcrumbs').removeClass('small');
					// $('#breadcrumbs .optional').removeClass('top');
				// }
			// });			
		// });
	
});
