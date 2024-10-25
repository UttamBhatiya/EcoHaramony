/* ----------------- Start Document ----------------- */
(function ($) {
  "use strict";

  $(document).ready(function () {
    // Bidding Slider Average Value

    // Thousand Separator
    function ThousandSeparator(nStr) {
      nStr += "";
      var x = nStr.split(".");
      var x1 = x[0];
      var x2 = x.length > 1 ? "." + x[1] : "";
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + "," + "$2");
      }
      return x1 + x2;
    }

    // Bidding Slider Average Value
    var avgValue =
      (parseInt($(".bidding-slider").attr("data-slider-min")) +
        parseInt($(".bidding-slider").attr("data-slider-max"))) /
      2;
    if ($(".bidding-slider").data("slider-value") === "auto") {
      $(".bidding-slider").attr({ "data-slider-value": avgValue });
    }

    // Bidding Slider Init
    $(".bidding-slider").bootstrapSlider();

    $(".bidding-slider").on("slide", function (slideEvt) {
      $(".biddingVal").text(ThousandSeparator(parseInt(slideEvt.value)));
    });
    $(".bidding-slider-widget").on("slide", function (slideEvt) {
      $(".bidding-slider").bootstrapSlider("setValue", slideEvt.value);
    });
    $(".bidding-slider-popup").on("slide", function (slideEvt) {
      $(".bidding-slider").bootstrapSlider("setValue", slideEvt.value);
    });

    $(".biddingVal").text(
      ThousandSeparator(parseInt($(".bidding-slider").val()))
    );

    // Default Bootstrap Range Slider
    var currencyAttr = $(".range-slider").attr("data-slider-currency");

    $(".range-slider").bootstrapSlider({
      formatter: function (value) {
        return (
          currencyAttr +
          ThousandSeparator(parseInt(value[0])) +
          " - " +
          currencyAttr +
          ThousandSeparator(parseInt(value[1]))
        );
      },
    });

    //$(".range-slider-single").slider();

    /*--------------------------------------------------*/
    /*  Quantity Buttons
	  /*--------------------------------------------------*/
    function qtySum() {
      var arr = document.getElementsByName("qtyInput");
      var tot = 0;
      for (var i = 0; i < arr.length; i++) {
        if (parseInt(arr[i].value)) tot += parseInt(arr[i].value);
      }
    }
    qtySum();

    $(".qtyDec, .qtyInc").on("click", function () {
      var $button = $(this);
      var oldValue = $button.parent().find("input").val();

      if ($button.hasClass("qtyInc")) {
        $button
          .parent()
          .find("input")
          .val(parseFloat(oldValue) + 1);
      } else {
        if (oldValue > 1) {
          $button
            .parent()
            .find("input")
            .val(parseFloat(oldValue) - 1);
        } else {
          $button.parent().find("input").val(1);
        }
      }

      qtySum();
      $(".bidding-time").trigger("change");
      $(".qtyTotal").addClass("rotate-x");
    });

    $(".bidding-time-widget").on("change", function () {
      var value = $(this).val();

      $(".bidding-time-popup").val(value);
    });

    $(".bidding-time-popup").on("change", function () {
      var value = $(this).val();
      $(".bidding-time-widget").val(value);
    });
    /*--------------------------------------------------*/
    /*  Bidding
	  /*--------------------------------------------------*/
    $(".bid-now-btn").on("click", function (e) {
      e.preventDefault();
      $(".trigger-bid-popup").trigger("click");
    });

    $("#form-bidding").on("submit", function (e) {
      var success;

      var task_id = $("#form-bidding").data("post_id");
      var budget = $(".bidding-slider").val();
      var time = $("input[name='bid-time']").val();
      var proposal = $("textarea#bid-proposal").val();

      var ajax_data = {
        action: "workscout_task_bid",
        nonce: workscout_core.nonce, // pass the nonce here
        task_id: task_id,
        budget: budget,
        proposal: proposal,
        time: time,
        //'nonce': nonce
      };

      $.ajax({
        type: "POST",
        dataType: "json",
        url: workscout_core.ajax_url,
        data: ajax_data,
      })
        .done(function (data) {
          //refresh bids
          $(".mfp-close").trigger("click");
          $(".bidding-inner").hide();
          $(".bidding-inner-success").show();
          Snackbar.show({
            text: "Your bid has been placed!",
          });
        })
        .fail(function (reason) {
          // Handles errors only
          console.debug("reason" + reason);
        })

        .then(function (data, textStatus, response) {
          if (success) {
            alert("then");
          }

          // In case your working with a deferred.promise, use this method
          // Again, you'll have to manually separates success/error
        });
      e.preventDefault();
    });

    /*--------------------------------------------------*/
    /*  Bidding actions
	  /*--------------------------------------------------*/

    $(document).on("click", ".bids-action-delete-bid", function (e) {
      e.preventDefault();
      var bid_id = $(this).parent().data("bid-id");
      var ajax_data = {
        action: "workscout_remove_bid",
        nonce: workscout_core.nonce, // pass the nonce here
        bid_id: bid_id,
      };

      $.ajax({
        type: "POST",
        dataType: "json",
        url: workscout_core.ajax_url,
        data: ajax_data,
      })
        .done(function (data) {
          //refresh bids
          console.log(data);
        })
        .fail(function (reason) {
          // Handles errors only
          console.debug("reason" + reason);
        });

      // var referral = $(this).data("booking_id");

      // $("#send-message-from-widget textarea")
      //   .data("referral", referral)
      //   .data("recipient", recipient);
    });
    $(document).on("click", ".bids-action-accept-offer", function (e) {
      e.preventDefault();
      $(this).addClass("loading");
      var bid_id = $(this).parent().data("bid-id");
      var ajax_data = {
        action: "workscout_get_bid_data",
        nonce: workscout_core.nonce, // pass the nonce here
        bid_id: bid_id,
      };

      $.ajax({
        type: "POST",
        dataType: "json",
        url: workscout_core.ajax_url,
        data: ajax_data,
      })
        .done(function (data) {
          //refresh bids
          console.log(data);
          $(".bid-accept-popup h3").html(data.title);
          $(".bid-accept-popup .bid-acceptance").html(data.content);
          $(".bid-accept-popup .bid-proposal .bid-proposal-text").html(
            data.proposal
          );
          $(".bid-accept-popup #task_id").val(data.task_id);
          $(".bid-accept-popup #bid_id").val(data.bid_id);
          $(".bids-popup-accept-offer").trigger("click");
          $(".bids-action-accept-offer").removeClass("loading");
        })
        .fail(function (reason) {
          // Handles errors only
          console.debug("reason" + reason);
        });

      // var referral = $(this).data("booking_id");

      // $("#send-message-from-widget textarea")
      //   .data("referral", referral)
      //   .data("recipient", recipient);
    });

    $(document).on("submit", "#accept-bid-form", function (e) {
      var task_id = $(".bid-accept-popup #task_id").val();
      var bid_id = $(".bid-accept-popup #bid_id").val();
      var ajax_data = {
        action: "workscout_accept_bid_on_task",
        nonce: workscout_core.nonce, // pass the nonce here
        bid_id: bid_id,
        task_id: task_id,
      };

      $.ajax({
        type: "POST",
        dataType: "json",
        url: workscout_core.ajax_url,
        data: ajax_data,
        success: function (data) {
          if (data.type == "success") {
            window.setTimeout(closepopup, 3000);
            //redirect to previous page
            history.back();
          } else {
          }
        },
      });

      e.preventDefault();
    });

    $(".fieldset-competencies > .field").sortable({
      items: ".resume-manager-data-row",
      cursor: "move",
      axis: "y",
      scrollSensitivity: 40,
      forcePlaceholderSize: !0,
      helper: "clone",
      opacity: 0.65,
    });

    $(document).on(
      "click",
      ".task-dashboard-action-contact-bidder",
      function (e) {
        e.preventDefault();
        var task = $(this).data("task");

        var ajax_data = {
          action: "workscout_get_bid_data_for_contact",
          nonce: workscout_core.nonce, // pass the nonce here

          task_id: task,
        };

        $.ajax({
          type: "POST",
          dataType: "json",
          url: workscout_core.ajax_url,
          data: ajax_data,
        })
          .done(function (data) {
            $(".bidding-widget").html(data.message);

            $(".contact-popup").trigger("click");
          })
          .fail(function (reason) {
            // Handles errors only
            console.debug("reason" + reason);
          });
        // $(".popup-with-zoom-anim").trigger("click");
      }
    );

    $(document).on("click", ".task-dashboard-action-review", function (e) {
      e.preventDefault();
      var task = $(this).data("task");

      var ajax_data = {
        action: "workscout_get_review_form",
        nonce: workscout_core.nonce, // pass the nonce here
        task_id: task,
      };

      $.ajax({
        type: "POST",
        dataType: "json",
        url: workscout_core.ajax_url,
        data: ajax_data,
      })
        .done(function (data) {
          $(".rate-form").html(data.message);
          $(".rate-popup").trigger("click");
        })
        .fail(function (reason) {
          // Handles errors only
          console.debug("reason" + reason);
        });
    });

    $(document).on("submit", "#popup-commentform", function (e) {
      $("#popup-commentform button").addClass("loading").prop("disabled", true);

      $.ajax({
        type: "POST",
        dataType: "json",
        url: ws.ajaxurl,
        data: {
          action: "workscout_review_freelancer",
          data: $(this).serialize(),
          //'nonce': nonce
        },
        success: function (data) {
          if (data.success == true) {
            $("#popup-commentform").removeClass("loading").hide();
            $("#popup-commentform").hide();
            $(".workscout-rate-popup .notification").show().html(data.message);
            window.setTimeout(closepopup, 3000);
          } else {
            $(".workscout-rate-popup .notification")
              .removeClass("success")
              .addClass("error")
              .show()
              .html(data.message);
            $("#popup-commentform button")
              .removeClass("loading")
              .prop("disabled", false);
          }
        },
      });
      e.preventDefault();
    });

    $(".tasks-sort-by").on("change", function () {
      //refresh current page with value of select added to URL

      //submit form
      $("#tasks-sort-by-form").submit();
    });

    //message
    $(document).on("click", ".bids-action-send-msg", function (e) {
      var recipient = $(this).data("recipient");
      var referral = $(this).data("bid_id");

      $("#send-message-from-task textarea").val("");
      $("#send-message-from-task .notification").hide();

      $("#send-message-from-task textarea")
        .data("referral", referral)
        .data("recipient", recipient);

      $(".popup-with-zoom-anim").trigger("click");
    });

    $("body").on("submit", "#send-message-from-task", function (e) {
      $("#send-message-from-task button")
        .addClass("loading")
        .prop("disabled", true);

      $.ajax({
        type: "POST",
        dataType: "json",
        url: ws.ajaxurl,
        data: {
          action: "workscout_send_message",
          recipient: $(this).find("textarea#contact-message").data("recipient"),
          referral: $(this).find("textarea#contact-message").data("referral"),
          message: $(this).find("textarea#contact-message").val(),
          //'nonce': nonce
        },
        success: function (data) {
          if (data.type == "success") {
            $("#send-message-from-task button").removeClass("loading");
            $("#send-message-from-task .notification")
              .show()
              .html(data.message);
            window.setTimeout(closepopup, 3000);
          } else {
            $("#send-message-from-task .notification")
              .removeClass("success")
              .addClass("error")
              .show()
              .html(data.message);
            $("#send-message-from-task button")
              .removeClass("loading")
              .prop("disabled", false);
          }
        },
      });
      e.preventDefault();
    });

    function closepopup() {
      var magnificPopup = $.magnificPopup.instance;
      if (magnificPopup) {
        magnificPopup.close();
        $("#send-message-from-task button")
          .removeClass("loading")
          .prop("disabled", false);
      }
    }

    //
    //  Edit bid on My Bids page
    //
    $(document).on("click", ".bids-action-edit-bid", function (e) {
      e.preventDefault();
      var bid_id = $(this).parent().data("bid-id");
      var ajax_data = {
        action: "workscout_get_bid_data_for_edit",
        nonce: workscout_core.nonce, // pass the nonce here
        bid_id: bid_id,
      };

      $.ajax({
        type: "POST",
        dataType: "json",
        url: workscout_core.ajax_url,
        data: ajax_data,
      })
        .done(function (data) {
          if (data.task_type == "hourly") {
            $(".bidding-detail-hourly").show();
            $(".bidding-detail-fixed").hide();
          } else {
            $(".bidding-detail-hourly").hide();
            $(".bidding-detail-fixed").show();
          }

          $(".bidding-time").val(data.time);
          $(".biddingVal").text(ThousandSeparator(parseInt(data.budget)));

          $(".bidding-widget #bid-proposal").val(data.proposal);
          $(".bidding-widget #bid_id").val(data.bid_id);
          // Bidding Slider Init

          $(".bidding-slider-popup").attr("data-slider-min", data.range_min);
          $(".bidding-slider-popup").attr("data-slider-max", data.range_max);
          $(".bidding-slider-popup").attr("data-slider-step", data.slider_step);
          // console.log(mySlider);
          $(".bidding-slider-popup").bootstrapSlider();
          $(".bidding-slider-popup").bootstrapSlider("setValue", data.budget);
          $(".bidding-slider-popup").on("slide", function (slideEvt) {
            $(".biddingVal").text(ThousandSeparator(parseInt(slideEvt.value)));
          });

          $(".popup-with-zoom-anim").trigger("click");
        })
        .fail(function (reason) {
          // Handles errors only
          console.debug("reason" + reason);
        });
    });

    $("#form-bidding-update").on("submit", function (e) {
      var success;

      var bid_id = $("input[name='bid_id']").val();
      var budget = $(".bidding-slider-popup").val();
      var time = $("input[name='bid-time']").val();
      var proposal = $("textarea#bid-proposal").val();

      var ajax_data = {
        action: "workscout_update_bid",
        nonce: workscout_core.nonce, // pass the nonce here
        budget: budget,
        proposal: proposal,
        time: time,
        bid_id: bid_id,
        //'nonce': nonce
      };

      $.ajax({
        type: "POST",
        dataType: "json",
        url: workscout_core.ajax_url,
        data: ajax_data,
      })
        .done(function (data) {
          //refresh bids
          $(".mfp-close").trigger("click");
          $(".bidding-inner").hide();
          $(".bidding-inner-success").show();
          Snackbar.show({
            text: "Your bid has been updated!",
          });
          $("#my-bids-bid-id-" + bid_id + " #bid-info-budget strong").html(
            ThousandSeparator(parseInt(budget))
          );
          $("#my-bids-bid-id-" + bid_id + " #bid-info-time strong").html(time);
        })
        .fail(function (reason) {
          // Handles errors only
          console.debug("reason" + reason);
        })

        .then(function (data, textStatus, response) {
          if (success) {
            alert("then");
          }

          // In case your working with a deferred.promise, use this method
          // Again, you'll have to manually separates success/error
        });
      e.preventDefault();
    });

    var $tabsNav = $(".popup-tabs-nav"),
      $tabsNavLis = $tabsNav.children("li");

    $tabsNav.each(function () {
      var $this = $(this);

      $this
        .next()
        .children(".popup-tab-content")
        .stop(true, true)
        .hide()
        .first()
        .show();
      $this.children("li").first().addClass("active").stop(true, true).show();
    });

    $tabsNavLis.on("click", function (e) {
      var $this = $(this);

      $this.siblings().removeClass("active").end().addClass("active");

      $this
        .parent()
        .next()
        .children(".popup-tab-content")
        .stop(true, true)
        .hide()
        .siblings($this.find("a").attr("href"))
        .fadeIn();

      e.preventDefault();
    });

    var hash = window.location.hash;
    var anchor = $('.tabs-nav a[href="' + hash + '"]');
    if (anchor.length === 0) {
      $(".popup-tabs-nav li:first").addClass("active").show(); //Activate first tab
      $(".popup-tab-content:first").show(); //Show first tab content
    } else {
      anchor.parent("li").click();
    }

    $(
      ".workscout-bid-action-delete,.task-dashboard-action-delete,.bids-action-delete-bid"
    ).click(function () {
      return window.confirm(ws.i18n_confirm_delete);
    });

    /*--------------------------------------------------*/
    /*  Keywords
	/*--------------------------------------------------*/

    $(".keyword-input-container input").autocomplete({
      source: function (req, response) {
        $.getJSON(
          workscout_core.ajax_url +
            "?callback=?&action=workscout_incremental_skills_suggest",
          req,
          response
        );
      },
      select: function (event, ui) {
        // use ui.item.label as the input's value to display the label
        // use ui.item.value to display the value
        $(".keyword-input").val(ui.item.label);
        $(".keyword-input-button").trigger("click");
        $(".keyword-input").val("");
        //window.location.href = ui.item.link;
      },
      close: function (event, ui) {
        $(".keyword-input").val("");
      },
      minLength: 3,
    });

    $(".keywords-container").each(function () {
      var keywordLimit = $(this).data("limit");
 

      //if keywordlimit is undefined set it to 5
      if (typeof keywordLimit === "undefined") {
        keywordLimit = 5;
      }

      var keywordInput = $(this).find(".keyword-input");
      var keywordsList = $(this).find(".keywords-list");
      var hiddenInput = $(this).find(".keyword-input-real");
      var keywordCounter = keywordsList.children("span").length;
      
      // adding keyword
      function addKeyword() {
        var $newKeyword = $(
          "<span class='keyword'><span class='keyword-remove'></span><span class='keyword-text'>" +
            keywordInput.val() +
            "</span></span>"
        );
        keywordsList.append($newKeyword).trigger("resizeContainer");
        keywordInput.val("");
        // add $newkeyword to hidden input for form submit
        var keywordValue = keywordsList
          .find(".keyword-text")
          .map(function () {
            return $(this).text();
          })
          .get();
        keywordCounter++;

        hiddenInput.val(keywordValue);
      }

      // add via enter key
      keywordInput.on("keyup", function (e) {
        if (e.keyCode == 13 && keywordInput.val() !== "") {
          if(keywordCounter < keywordLimit){
          addKeyword();
          } else {
            Snackbar.show({
              text: "You can only add " + keywordLimit + " skills",
            });
          }
        }
      });

      // add via button
      $(".keyword-input-button").on("click", function (e) {
        e.preventDefault();
        if (keywordInput.val() !== "") {
           if(keywordCounter < keywordLimit){
            addKeyword();
           }  else {
            Snackbar.show({
              text: "You can only add " + keywordLimit + " keywords",
            });
          }
        }
      });

      // removing keyword
      $(document).on("click", ".keyword-remove", function () {
        $(this).parent().addClass("keyword-removed");

        function removeFromMarkup() {
          $(".keyword-removed").remove();
          keywordInput.val("");
          // add $newkeyword to hidden input for form submit
          var keywordValue = keywordsList
            .find(".keyword-text")
            .map(function () {
              return $(this).text();
            })
            .get();

          hiddenInput.val(keywordValue);
        }
        setTimeout(removeFromMarkup, 500);
        keywordsList.css({ height: "auto" }).height();
        keywordLimit--;

      });

      // animating container height
      keywordsList.on("resizeContainer", function () {
        var heightnow = $(this).height();
        var heightfull = $(this)
          .css({ "max-height": "auto", height: "auto" })
          .height();

        $(this).css({ height: heightnow }).animate({ height: heightfull }, 200);
      });

      $(window).on("resize", function () {
        keywordsList.css({ height: "auto" }).height();
      });

      // Auto Height for keywords that are pre-added
      $(window).on("load", function () {
        var keywordCount = $(".keywords-list").children("span").length;

        // Enables scrollbar if more than 3 items
        if (keywordCount > 0) {
          keywordsList.css({ height: "auto" }).height();
        }
      });
    });


    // if checkbox with id remote-job is checked, make input with id location not required
    // check also on page load if this chekcbox is checked
    if ($("#remote_position").is(":checked")) {
      $("#task_location").prop("required", false);
    } else {
      $("#task_location").prop("required", true);
    }
    $("#remote_position").on("change", function () {
      if ($(this).is(":checked")) {
        $("#task_location").prop("required", false);
      } else {
        $("#task_location").prop("required", true);
      }
    });
    /*--------------------------------------------------*/
    /*  Full Screen Tasks
  /*--------------------------------------------------*/

    /*--------------------------------------------------*/
    /*  Tippy JS 
	  /*--------------------------------------------------*/
    /* global tippy */
    tippy("[data-tippy-placement]", {
      delay: 100,
      arrow: true,
      arrowType: "sharp",
      size: "regular",
      duration: 200,

      // 'shift-toward', 'fade', 'scale', 'perspective'
      animation: "shift-away",

      animateFill: true,
      theme: "dark",

      // How far the tooltip is from its reference element in pixels
      distance: 10,
    });

    tippy("div.resumes", {
      target: "strong",
    });
    /*----------------------------------------------------*/
    /*  Indicator Bar
    /*----------------------------------------------------*/
    $(".indicator-bar").each(function () {
      var indicatorLenght = $(this).attr("data-indicator-percentage");
      $(this)
        .find("span")
        .css({
          width: indicatorLenght + "%",
        });
    });

    /*----------------------------------------------------*/
    /*  Share URL and Buttons
	/*----------------------------------------------------*/
    /* global ClipboardJS */
    $(".copy-url input").val(window.location.href);
    new ClipboardJS(".copy-url-button");

    $(".share-buttons-icons a").each(function () {
      var buttonBG = $(this).attr("data-button-color");
      if (buttonBG !== undefined) {
        $(this).css("background-color", buttonBG);
      }
    });

    /*----------------------------------------------------*/
    /*  Ratings Script
/*----------------------------------------------------*/

    /*  Numerical Script
/*--------------------------*/
    $(".numerical-rating").numericalRating();

    $(".star-rating").starRating();

    
    //submit

    var hourly_min_field = $(".task-submit-form-container-hourly_min");
    var hourly_max_field = $(".task-submit-form-container-hourly_max");
    var budget_min_field = $(".task-submit-form-container-budget_min");
    var budget_max_field = $(".task-submit-form-container-budget_max");

   
    $('input[name="task_type"]').on("change", function () {
      var this_val = $(this).val();

      if (this_val == "fixed") {
        //using replaceWith switch the element
        hourly_min_field.replaceWith(budget_min_field);
        hourly_max_field.replaceWith(budget_max_field);
      } else {
        budget_min_field.replaceWith(hourly_min_field);
        budget_max_field.replaceWith(hourly_max_field);
      }
    });
    //check which radio button is seelcted by defaulot

    // ------------------ End Document ------------------ //
  });
})(this.jQuery);

/* ----------------- Start Document ----------------- */
(function ($) {
"use strict";

function starsOutput(firstStar, secondStar, thirdStar, fourthStar, fifthStar) {
		return(''+
			'<span class="'+firstStar+'"></span>'+
			'<span class="'+secondStar+'"></span>'+
			'<span class="'+thirdStar+'"></span>'+
			'<span class="'+fourthStar+'"></span>'+
			'<span class="'+fifthStar+'"></span>');
	}

$.fn.numericalRating = function(){

	this.each(function() {
		var dataRating = $(this).attr('data-rating');

		// Rules
	    if (dataRating >= 4.0) {
	        $(this).addClass('high');
	    } else if (dataRating >= 3.0) {
	        $(this).addClass('mid');
	    } else if (dataRating < 3.0) {
	        $(this).addClass('low');
	    }

	});

}; 

/*  Star Rating
/*--------------------------*/
$.fn.starRating = function(){


	this.each(function() {

		var dataRating = $(this).attr('data-rating');
		if(dataRating > 0) {
			// Rating Stars Output
			
			var fiveStars = starsOutput('star','star','star','star','star');

			var fourHalfStars = starsOutput('star','star','star','star','star half');
			var fourStars = starsOutput('star','star','star','star','star empty');

			var threeHalfStars = starsOutput('star','star','star','star half','star empty');
			var threeStars = starsOutput('star','star','star','star empty','star empty');

			var twoHalfStars = starsOutput('star','star','star half','star empty','star empty');
			var twoStars = starsOutput('star','star','star empty','star empty','star empty');

			var oneHalfStar = starsOutput('star','star half','star empty','star empty','star empty');
			var oneStar = starsOutput('star','star empty','star empty','star empty','star empty');

			// Rules
	        if (dataRating >= 4.75) {
	            $(this).append(fiveStars);
	        } else if (dataRating >= 4.25) {
	            $(this).append(fourHalfStars);
	        } else if (dataRating >= 3.75) {
	            $(this).append(fourStars);
	        } else if (dataRating >= 3.25) {
	            $(this).append(threeHalfStars);
	        } else if (dataRating >= 2.75) {
	            $(this).append(threeStars);
	        } else if (dataRating >= 2.25) {
	            $(this).append(twoHalfStars);
	        } else if (dataRating >= 1.75) {
	            $(this).append(twoStars);
	        } else if (dataRating >= 1.25) {
	            $(this).append(oneHalfStar);
	        } else if (dataRating < 1.25) {
	            $(this).append(oneStar);
	        }
		}
	});

}; 
})(jQuery);

/*!
 * clipboard.js v2.0.0
 * https://zenorocha.github.io/clipboard.js
 * 
 * Licensed MIT © Zeno Rocha
 */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.ClipboardJS=e():t.ClipboardJS=e()}(this,function(){return function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=3)}([function(t,e,n){var o,r,i;!function(a,c){r=[t,n(7)],o=c,void 0!==(i="function"==typeof o?o.apply(e,r):o)&&(t.exports=i)}(0,function(t,e){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=function(t){return t&&t.__esModule?t:{default:t}}(e),r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),a=function(){function t(e){n(this,t),this.resolveOptions(e),this.initSelection()}return i(t,[{key:"resolveOptions",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action=t.action,this.container=t.container,this.emitter=t.emitter,this.target=t.target,this.text=t.text,this.trigger=t.trigger,this.selectedText=""}},{key:"initSelection",value:function(){this.text?this.selectFake():this.target&&this.selectTarget()}},{key:"selectFake",value:function(){var t=this,e="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandlerCallback=function(){return t.removeFake()},this.fakeHandler=this.container.addEventListener("click",this.fakeHandlerCallback)||!0,this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="absolute",this.fakeElem.style[e?"right":"left"]="-9999px";var n=window.pageYOffset||document.documentElement.scrollTop;this.fakeElem.style.top=n+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,this.container.appendChild(this.fakeElem),this.selectedText=(0,o.default)(this.fakeElem),this.copyText()}},{key:"removeFake",value:function(){this.fakeHandler&&(this.container.removeEventListener("click",this.fakeHandlerCallback),this.fakeHandler=null,this.fakeHandlerCallback=null),this.fakeElem&&(this.container.removeChild(this.fakeElem),this.fakeElem=null)}},{key:"selectTarget",value:function(){this.selectedText=(0,o.default)(this.target),this.copyText()}},{key:"copyText",value:function(){var t=void 0;try{t=document.execCommand(this.action)}catch(e){t=!1}this.handleResult(t)}},{key:"handleResult",value:function(t){this.emitter.emit(t?"success":"error",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})}},{key:"clearSelection",value:function(){this.trigger&&this.trigger.focus(),window.getSelection().removeAllRanges()}},{key:"destroy",value:function(){this.removeFake()}},{key:"action",set:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"copy";if(this._action=t,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function(){return this._action}},{key:"target",set:function(t){if(void 0!==t){if(!t||"object"!==(void 0===t?"undefined":r(t))||1!==t.nodeType)throw new Error('Invalid "target" value, use a valid Element');if("copy"===this.action&&t.hasAttribute("disabled"))throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');if("cut"===this.action&&(t.hasAttribute("readonly")||t.hasAttribute("disabled")))throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');this._target=t}},get:function(){return this._target}}]),t}();t.exports=a})},function(t,e,n){function o(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!c.string(e))throw new TypeError("Second argument must be a String");if(!c.fn(n))throw new TypeError("Third argument must be a Function");if(c.node(t))return r(t,e,n);if(c.nodeList(t))return i(t,e,n);if(c.string(t))return a(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function r(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function i(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function a(t,e,n){return u(document.body,t,e,n)}var c=n(6),u=n(5);t.exports=o},function(t,e){function n(){}n.prototype={on:function(t,e,n){var o=this.e||(this.e={});return(o[t]||(o[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function o(){r.off(t,o),e.apply(n,arguments)}var r=this;return o._=e,this.on(t,o,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),o=0,r=n.length;for(o;o<r;o++)n[o].fn.apply(n[o].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),o=n[t],r=[];if(o&&e)for(var i=0,a=o.length;i<a;i++)o[i].fn!==e&&o[i].fn._!==e&&r.push(o[i]);return r.length?n[t]=r:delete n[t],this}},t.exports=n},function(t,e,n){var o,r,i;!function(a,c){r=[t,n(0),n(2),n(1)],o=c,void 0!==(i="function"==typeof o?o.apply(e,r):o)&&(t.exports=i)}(0,function(t,e,n,o){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function c(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function u(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}var l=r(e),s=r(n),f=r(o),d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},h=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),p=function(t){function e(t,n){i(this,e);var o=a(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return o.resolveOptions(n),o.listenClick(t),o}return c(e,t),h(e,[{key:"resolveOptions",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action="function"==typeof t.action?t.action:this.defaultAction,this.target="function"==typeof t.target?t.target:this.defaultTarget,this.text="function"==typeof t.text?t.text:this.defaultText,this.container="object"===d(t.container)?t.container:document.body}},{key:"listenClick",value:function(t){var e=this;this.listener=(0,f.default)(t,"click",function(t){return e.onClick(t)})}},{key:"onClick",value:function(t){var e=t.delegateTarget||t.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new l.default({action:this.action(e),target:this.target(e),text:this.text(e),container:this.container,trigger:e,emitter:this})}},{key:"defaultAction",value:function(t){return u("action",t)}},{key:"defaultTarget",value:function(t){var e=u("target",t);if(e)return document.querySelector(e)}},{key:"defaultText",value:function(t){return u("text",t)}},{key:"destroy",value:function(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)}}],[{key:"isSupported",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:["copy","cut"],e="string"==typeof t?[t]:t,n=!!document.queryCommandSupported;return e.forEach(function(t){n=n&&!!document.queryCommandSupported(t)}),n}}]),e}(s.default);t.exports=p})},function(t,e){function n(t,e){for(;t&&t.nodeType!==o;){if("function"==typeof t.matches&&t.matches(e))return t;t=t.parentNode}}var o=9;if("undefined"!=typeof Element&&!Element.prototype.matches){var r=Element.prototype;r.matches=r.matchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector||r.webkitMatchesSelector}t.exports=n},function(t,e,n){function o(t,e,n,o,r){var a=i.apply(this,arguments);return t.addEventListener(n,a,r),{destroy:function(){t.removeEventListener(n,a,r)}}}function r(t,e,n,r,i){return"function"==typeof t.addEventListener?o.apply(null,arguments):"function"==typeof n?o.bind(null,document).apply(null,arguments):("string"==typeof t&&(t=document.querySelectorAll(t)),Array.prototype.map.call(t,function(t){return o(t,e,n,r,i)}))}function i(t,e,n,o){return function(n){n.delegateTarget=a(n.target,e),n.delegateTarget&&o.call(t,n)}}var a=n(4);t.exports=r},function(t,e){e.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},e.nodeList=function(t){var n=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===n||"[object HTMLCollection]"===n)&&"length"in t&&(0===t.length||e.node(t[0]))},e.string=function(t){return"string"==typeof t||t instanceof String},e.fn=function(t){return"[object Function]"===Object.prototype.toString.call(t)}},function(t,e){function n(t){var e;if("SELECT"===t.nodeName)t.focus(),e=t.value;else if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName){var n=t.hasAttribute("readonly");n||t.setAttribute("readonly",""),t.select(),t.setSelectionRange(0,t.value.length),n||t.removeAttribute("readonly"),e=t.value}else{t.hasAttribute("contenteditable")&&t.focus();var o=window.getSelection(),r=document.createRange();r.selectNodeContents(t),o.removeAllRanges(),o.addRange(r),e=o.toString()}return e}t.exports=n}])});