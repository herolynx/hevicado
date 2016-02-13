// RESPONSIVE

	$(window).resize(function() {
		var windowSize = $(window).outerWidth();

		if ($(window).width() <= 767) {


			console.log('mobile');
		}

		// else if (($(window).width() >= 768) && ($(window).width() <= 1024)) {


			// console.log('tablet');
		// }



		else {

			// RESIZE FILTER IF SCROLL

			$(function(){
				$(window).scroll(function() {
					if ($(this).scrollTop() > 20) {
						$('.filter').addClass('small');
						$('label[for="trigger"]').addClass('small');
					} else {
						$('.filter').removeClass('small');
						$('label[for="trigger"]').removeClass('small');
					}
				});
			});

			$(window).change(function(){

				$(window).resize(function(){
					var screen = $(this);
					var screen_width = $(this).outerWidth();
					var check = $('#trigger');

					if(check.is(':checked'))  {
						$('#main-content').animate({
							width: screen_width - 200,
						},190);
					} else {
						$('#main-content').animate({
							width: screen_width,
						},50);
					}
				});

			 $(window).resize();
			});

			console.log('destop');
		}
	});

	$(window).resize();



	$(window).resize(function(){
		var height_box = $('#calendar .week ul li+li .day .box, #calendar .oneday ul li+li .day .box').outerHeight();

		$('#calendar .week ul li.hour .day, #calendar .oneday ul li.hour .day').css('height', height_box);

	});

	$(window).resize();



// -----------------------------------------------------------------------------------


// DELETE COMPONENT LETTER

	// WINDOW ACTION

		$('#layer .close').click(function(e){
			e.preventDefault();
			$('#layer').slideToggle('fast');
			$('#page').css({
				'height': 'auto',
				'overflow': 'visible'
			});
		});

		$('.title-window .btn-calendar').click(function(e){
			e.preventDefault();
			$('.calendar_mini').slideToggle('fast');
			$('#page').css({
				'height': '100%',
				'overflow': 'hidden'
			});
		});

		$('#cabinet ul li .delete').click(function(e){
			e.preventDefault();
			$('.delete_cabinet').slideToggle('fast');
			$('#page').css({
				'height': '100%',
				'overflow': 'hidden'
			});
		});

	// TABS

	$(document).ready(function(){

		$('nav li').click(function(){
			var tab_id = $(this).attr('data-tab');

			$('nav li').removeClass('current');
			$('.tab-content').removeClass('current');

			$(this).addClass('current');
			$("#"+tab_id).addClass('current');
		});

	});


	// SLIDER SEARCH
	if ($('.bxslider').length > 0) {
	   $('.bxslider').bxSlider({
			pagerCustom: '#bx-pager',
			mode: 'horizontal',
		});
	}

	// CHART

	$(document).ready(function() {
	var randomScalingFactor = function(){ return Math.round(Math.random()*100)};

		var barChartData = {
			labels : ["January","February","March","April","May","June","July"],
			 datasets : [
				{
					fillColor : "rgba(220,220,220,0.5)",
					strokeColor : "rgba(220,220,220,0.8)",
					highlightFill: "rgba(220,220,220,0.75)",
					highlightStroke: "rgba(220,220,220,1)",
					data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
				},
				{
					fillColor : "rgba(151,187,205,0.5)",
					strokeColor : "rgba(151,187,205,0.8)",
					highlightFill : "rgba(151,187,205,0.75)",
					highlightStroke : "rgba(151,187,205,1)",
					data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
				}
			]

		}
		window.onload = function(){
			var canvasElement = document.getElementById("canvas");
			if (canvasElement) {
				var ctx = canvasElement.getContext("2d");
				window.myBar = new Chart(ctx).Bar(barChartData, {responsive : true});
			}
		}
	});


// ---------------------------------------------------------------------------





// SCROLL NAVIGATON

$(window).load(function(){
	$("#navigation #wrapper").mCustomScrollbar({
		scrollbarPosition:"outside"
	});
});


// RESIZE FILTER IF SCROLL


$(document).ready(function() {

	// TITLE PAGE

	if ($("#title nav").length > 0){
	} else {
		$('#title').addClass('small');
	}




	// MASONRY DASHBOARD

	$(function(){
		var container = $('#grid');
		container.masonry({
		itemSelector: '.window',
		columnWidth: function( containerWidth ) {
		return containerWidth /3;
		}(),
		isAnimated: true,
		percentPosition: true
		});
	});


	// HIDE FILTER FIELD - CREATE BEAUTIFU HIDDEN ANIMATION :)

	$('.hide').click(function(){
		$(this).parent().toggleClass('hidden');

	});

	// LEGEND CALLENDAR SHOW / HIDE

	$('.btn-legend').click(function(e){
		e.preventDefault();
		$('.legend').slideToggle('fast');
	});

	// TEXTAREA CABINET HEIGHT

	if ($('.elastic').length > 0) {
		$('.elastic').elastic();
	}

	// SELECT STYLE

	$('select').niceSelect();

	// COLOR PICKER

	if ($('.colorpicker').length > 0) {
		$('.colorpicker').each( function() {
				$(this).minicolors({
				control: $(this).attr('data-control') || 'hue',
				defaultValue: $(this).attr('data-defaultValue') || '',
				format: $(this).attr('data-format') || 'hex',
				keywords: $(this).attr('data-keywords') || '',
				inline: $(this).attr('data-inline') === 'true',
				letterCase: $(this).attr('data-letterCase') || 'lowercase',
				opacity: $(this).attr('data-opacity'),
				position: $(this).attr('data-position') || 'bottom left',
				change: function(value, opacity) {
					if( !value ) return;
					if( opacity ) value += ', ' + opacity;
					if( typeof console === 'object' ) {
						console.log(value);
					}
				},
				theme: 'default'
			});

		});
	}
});
