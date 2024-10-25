jQuery( document ).ready( function ( $ ) {
	
	var xhr = [];

	$( 'div.resumes:not(:parent.sidebar)' ).on( 'update_results', function( event, page, append ) {
		var data     = '';
		var target   = $(this);
		var form     = $('.resume_filters' );
		var showing  = ( 'h2.showing_jobs' );
		var results  = target.find( '.resumes' );
		var per_page = target.data( 'per_page' );
		var orderby  = target.data( 'orderby' );
		var order    = target.data( 'order' );
		var featured = target.data( 'featured' );
		var index    = $( 'div.resumes' ).index(this);
		var spinner 	 = $('.listings-loader');

		if ( xhr[index] ) {
			xhr[index].abort();
		}

		if ( append ) {
			$( '.load_more_resumes', target ).addClass( 'loading' );
		} else {
			$( results).addClass( 'loading' );
			$(spinner).fadeIn();
			//$( 'li.resume, li.no_resumes_found', results ).css( 'visibility', 'hidden' );
		}

		

		var categories = form.find(':input[name^="search_categories"]').map(function () { return $(this).val(); }).get();
		var keywords  = '';
		var location  = '';
		//var $keywords = $(':input[name="search_keywords"]');
		var $keywords = $('input#search_keywords');
		var $location = form.find(':input[name="search_location"]');

		// Workaround placeholder scripts
		if ( $keywords.val() != $keywords.attr( 'placeholder' ) )
			keywords = $keywords.val();

		if ( $location.val() != $location.attr( 'placeholder' ) )
			location = $location.val();

		var data = {
			action: 			'resume_manager_get_resumes',
			search_keywords: 	keywords,
			search_location: 	location,
			search_categories:  categories,
			per_page: 			per_page,
			orderby: 			orderby,
			order: 			    order,
			page:               page,
			featured:           featured,
			show_pagination:    target.data( 'show_pagination' ),
			form_data:          form.serialize()
		};


		xhr[index] = $.ajax( {
			type: 		'POST',
			url: 		resume_manager_ajax_filters.ajax_url,
			data: 		data,
			success: 	function( result ) {

				if ( result ) {
					try {

						
						if ( result.showing ) {
							$( showing ).show().html(  result.showing );
							$('.sidebar .job_filters_links').html( result.showing_links )
						} else {
							$( showing ).html(resume_manager_ajax_filters.showing_all);
							$('.sidebar .job_filters_links').hide();
						}

						if ( result.html ) {
							if ( append ) {
								$(results).append( result.html );
							} else {
								$(results).html( result.html );
							}
						}

						if ( true == target.data( 'show_pagination' ) ) {
							target.find('.job-manager-pagination').remove();

							if ( result.pagination ) {
								target.append( result.pagination );
							}
						} else {
							if ( ! result.found_resumes || result.max_num_pages === page ) {
								$( '.load_more_resumes', target ).hide();
							} else {
								$( '.load_more_resumes', target ).show().data( 'page', page );
							}
							$( '.load_more_resumes', target ).removeClass( 'loading' );
							$( 'li.resume', results ).css( 'visibility', 'visible' );
						}

						$( results ).removeClass( 'loading' );
						$(spinner).fadeOut();
						target.triggerHandler( 'updated_results', result );
						   $(".star-rating").starRating();

    
					} catch(err) {
						console.log(err);
					}
				}
			}
		} );
	} );

  /* rate slider */
	// var current_min_price = parseInt( resume_manager_ajax_filters.rate_min, 10 ),
    // current_max_price = parseInt( resume_manager_ajax_filters.rate_max, 10 );
    
    // $( "#rate-range" ).slider({
    //   range: true,
    //   min: parseInt(resume_manager_ajax_filters.rate_min,10),
    //   max: parseInt(resume_manager_ajax_filters.rate_max,10),
    //   values: [ current_min_price, current_max_price ],
    //   step: 1,
    //   slide: function( event, ui ) {
    //     $( "input#rate_amount" ).val(  ui.values[ 0 ] + "-" + ui.values[ 1 ] );
    //     $( ".rate_amount .from" ).text(resume_manager_ajax_filters.currency+ui.values[ 0 ]);
    //     $( ".rate_amount .to" ).text(resume_manager_ajax_filters.currency+ui.values[ 1 ]);
    //   }
    // });
    
    // $( ".rate_amount .from" ).text(resume_manager_ajax_filters.currency + $( "#rate-range" ).slider( "values", 0 ));
    // $( ".rate_amount .to" ).text(resume_manager_ajax_filters.currency + $( "#rate-range" ).slider( "values", 1 ));
    // $( "input#rate_amount" ).val(  $( "#rate-range" ).slider( "values", 0 ) + "-" + $( "#rate-range" ).slider( "values", 1 ) );
    

 	$("#rate-range").bootstrapSlider("disable");
    $( "#filter_by_rate" ).change(function(){
      var ckb_status = $("#filter_by_rate").prop('checked');
      if(ckb_status){
        $("#rate-range").bootstrapSlider("enable");
      } else {
        $("#rate-range").bootstrapSlider("disable");
      }
  	});
    /* eof rate slider */


	$( '#search_keywords, #search_region, #search_radius, #radius_check, #search_categories, #search_skills, .filter_by_check' ).change( function() {
		var target = $( 'div.resumes' );
		
		target.triggerHandler( 'update_results', [ 1, false ] );
	} ).change().on( "keyup", function(e) {
		if ( e.which === 13 ) {
			$( this ).trigger( 'change' );
		}
	} );
	if(wsmap.address_provider == 'off') {
		$( '#search_location' ).change( function() {
			var target   = $('div.resumes' );
		
			target.triggerHandler( 'update_results', [ 1, false ] );
			
		} )

		.on( "keyup", function(e) {
			if ( e.which === 13 ) {
				$( this ).trigger( 'change' );
			}
		} );
	}
	
	var filter_by_radius_status = $(".filter_by_radius").prop('checked');
	if(filter_by_radius_status){
		$('.search_location').find('.widget_range_filter-inside').toggleClass("slider-enabled");
		$( "#radius-range" ).slider( "enable" );
	} else {
		$('#radius-range').slider( "disable" );
	}
	$('.filter_by_radius').change(function(event) {
		$(this).parents('.search_location').find('.widget_range_filter-inside').toggleClass("slider-enabled");
		 var ckb_status = $("#radius_check").prop('checked');
	      if(ckb_status){
	        $( "#radius-range" ).slider( "enable" );
	      } else {
	        $( "#radius-range" ).slider( "disable" );
	      }
	});

	
	$('.filter_by_check').change(function(event) {
		$(this).parents('.widget').find('.widget_range_filter-inside').toggleClass("slider-enabled");
	});
	

	$("#rate-range").on("slideStop", function (event, ui) {
		
    var target = $("div.resumes");
    target.triggerHandler("update_results", [1, false]);
  });


	$( '.resume_filters' ).on( 'click', '.reset', function() {
		var target  = $( 'div.resumes' );
		var form    = $(this).closest( 'form' );

		form.find(':input[name="search_keywords"]').not(':input[type="hidden"]').val('');
		form.find(':input[name="search_location"]').not(':input[type="hidden"]').val('');
		form.find(':input[name^="search_categories"]').not(':input[type="hidden"]').val( 0 ).trigger( 'chosen:updated' ).val(null).trigger('change');
		form.find(':input[name^="search_skills"]').not(':input[type="hidden"]').val( 0 ).trigger( 'chosen:updated' ).val(null).trigger('change');
		form.find( ':input[name^="search_region"]' ).not(':input[type="hidden"]').val( 0 ).trigger( 'chosen:updated' ).val(null).trigger('change');
		$( ':input[name="filter_job_type[]"]', form ).not(':input[type="hidden"]').attr( 'checked', 'checked' );
		$('.search_keywords #search_keywords').val("");
		$('#search_radius').val("");
		$('.job_filters #search_keywords').val("");
		$('.filter_by_check').prop('checked', false);
		$('.widget_range_filter-inside').hide();
		$( "#salary-range,#rate-range" ).each(function(){
	      var options = $(this).slider( 'option' );
	      $(this).slider( 'values', [ options.min, options.max ] );
	  	});

		target.triggerHandler( 'reset' );
		target.triggerHandler( 'update_results', [ 1, false ] );

		return false;
	} );

	$( '.load_more_resumes' ).click( function () {
		var target = $( this ).closest( 'div.resumes' );
		var page = $( this ).data( 'page' );

		if ( ! page ) {
			page = 1;
		} else {
			page = parseInt( page );
		}

		$( this ).data( 'page', ( page + 1 ) );

		target.triggerHandler( 'update_results', [ page + 1, true ] );

		return false;
	} );

	$( 'div.resumes' ).on( 'click', '.job-manager-pagination a', function() {
		var target = $( this ).closest( 'div.resumes' );
		var page   = $( this ).data( 'page' );

		target.triggerHandler( 'update_results', [ page, false ] );
		$( "body, html" ).animate({
            scrollTop: target.offset().top-40
        }, 600 );

		return false;
	} );

	if ( $.isFunction( $.fn.chosen ) ) {
		$( 'select[name^="search_categories"]' ).chosen();
	}
});
