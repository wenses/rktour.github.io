/*jslint browser: true*/ /*jslint for:true*/ /*global bookyourtravel_scripts*/
/*global bookyourtravel_extra_items*/
/*global jQuery*/ /*jslint this:true */
/*global window*/
/*global BYTAjax*/ /*global console*/ /*jslint long:true */

(function ($) {

    "use strict";

    var bookyourtravel_cruises;

    $(document).ready(function () {
        bookyourtravel_cruises.init();
    });

    bookyourtravel_cruises = {
        init: function () {
            if ($(".cruise_calendar .booking_form_controls_holder").length > 0) {
                $(".more-information").slideUp();
                $(".more-info-cruise").on('click', function (e) {
                    var moreInformationDiv = $(this).closest("li").find(".more-information");
                    var txt = (
                        moreInformationDiv.is(":visible") ?
                        window.moreInfoText :
                        window.lessInfoText
                    );
                    $(this).text(txt);
                    moreInformationDiv.stop(true, true).slideToggle("slow");
                    e.preventDefault();
                });

                $("a[rel^='prettyPhoto']").prettyPhoto({
                    animation_speed: "normal",
                    theme: "light_square"
                });

                $(".book-cruise-select-dates").unbind("click");
                $(".book-cruise-select-dates").on("click", function (e) {
                    e.preventDefault();

                    var cabinTypeId = $(this).attr("id").replace("book-cruise-", "");
                    window.cabinTypeId = cabinTypeId;

                    $("#booking-form-calendar .loading").parent().show();

                    if (window.bookingRequest !== undefined && window.bookingRequest.selectedTime > 0 && window.bookingRequest.cabinTypeId !== undefined) {
                        bookyourtravel_cruises.resetTheForm();
                    } else {
                        bookyourtravel_cruises.initBookingRequestObject();
                        bookyourtravel_cruises.initBookingFormControls();
                    }

                    $(".book-cruise-select-dates").show(); // show select buttons
                    $(this).hide(); // hide this (current) one

                    $("#cabin_type_" + window.bookingRequest.cabinTypeId + " .booking_form_controls").show();

                    $(".cruise_calendar").appendTo($("#cabin_type_" + window.bookingRequest.cabinTypeId + " .booking_form_controls"));
                    $(".cruise_calendar").show();

                    bookyourtravel_cruises.prepareBookingScreen();

                    $("html, body").animate({
                        scrollTop: $("#booking-form-calendar").offset().top - 100
                    }, 500);
                });
            }

            if ($("[data-cruise-id]").length > 0) {
                bookyourtravel_cruises.populateCruisePrices();
            }

            if ($("[data-location-id]").length > 0 && $("[data-min-price-type='cruise']").length > 0) {
                bookyourtravel_scripts.populateLocationPrices("cruise");
            }
        },
        populateCruisePrices: function () {
            if ($("[data-cruise-id]").length > 0) {
                var cruiseItems = $("[data-cruise-id]");
                $.each(cruiseItems, function () {
                    if (!$(this).hasClass('skip-ajax-call')) {                    
                        var cruiseId = parseInt($(this).data("cruise-id"));
                        var price = 0;

                        if ($("[data-cruise-id='" + cruiseId + "'] .price .amount").length > 0) {
                            $("[data-cruise-id='" + cruiseId + "'] .price .amount").html("");
                            $("[data-cruise-id='" + cruiseId + "'] .price .curr").html("");

                            var dataObj = {
                                "action": "cruise_load_min_price_ajax_request",
                                "start_date": window.requestedDateFrom,
                                "end_date": window.requestedDateTo,
                                "cruise_id": cruiseId,
                                "nonce": BYTAjax.nonce
                            };

                            $.ajaxQueue({
                                url: BYTAjax.slimajaxurl,
                                data: dataObj,
                                success: function (data) {
                                    if (data !== undefined && data !== '') {
                                        price = JSON.parse(data);
                                        $("[data-cruise-id='" + cruiseId + "'] .item_price").show();
                                        $("[data-cruise-id='" + cruiseId + "'] .price .curr").html(window.currencySymbol);
                                        $("[data-cruise-id='" + cruiseId + "'] .price .amount").html(bookyourtravel_scripts.formatPriceOnly(price));
                                    } else {
                                        $("[data-cruise-id='" + cruiseId + "'] .item_price").hide();
                                    }
                                },
                                error: function (errorThrown) {
                                    console.log(errorThrown);
                                }
                            },
                            'cruises');
                        }
                    }
                });
            }
        },
        initBookingRequestObject: function () {

            if (!window.bookingRequest || window.bookingRequest === undefined || window.bookingRequest.length === 0) {
                window.bookingRequest = {};
            }

            window.bookingRequest.cabinTypeId = window.cabinTypeId;
            window.bookingRequest.cabinTypeTitle = $("li#cabin_type_" + window.cabinTypeId + " .cabin_type h3").html();

            window.bookingRequest.extraItems = {};
            window.bookingRequest.adults = 1;
            window.bookingRequest.children = 0;
            window.bookingRequest.people = 1;
            window.bookingRequest.units = 1;
            if (window.requestedCabins > 0) {
                window.bookingRequest.units = window.requestedCabins;
            }
            window.bookingRequest.extraItemsTotalPrice = 0;
            window.bookingRequest.totalCruiseOnlyPrice = 0;
            window.bookingRequest.totalPrice = 0;
            window.bookingRequest.totalDays = window.cruiseDurationDays;
            window.bookingRequest.selectedDate = null;
            window.bookingRequest.selectedTime = null;

            window.bookingRequest.maxAdults = 0;
            window.bookingRequest.maxChildren = 0;
            window.bookingRequest.minAdults = 0;
            window.bookingRequest.minChildren = 0;

            window.bookingRequest.maxAdults = parseInt($("li#cabin_type_" + window.bookingRequest.cabinTypeId + " .room-information .max_adult_count").val());
            window.bookingRequest.maxChildren = parseInt($("li#cabin_type_" + window.bookingRequest.cabinTypeId + " .room-information .max_child_count").val());
            if ($("li#cabin_type_" + window.bookingRequest.cabinTypeId + " .room-information .min_adult_count").length > 0) {
                window.bookingRequest.minAdults = parseInt($("li#cabin_type_" + window.bookingRequest.cabinTypeId + " .room-information .min_adult_count").val());
            }
            if ($("li#cabin_type_" + window.bookingRequest.cabinTypeId + " .room-information .min_child_count").length > 0) {
                window.bookingRequest.minChildren = parseInt($("li#cabin_type_" + window.bookingRequest.cabinTypeId + " .room-information .min_child_count").val());
            }

            if (window.bookingRequest.maxAdults <= 0) {
                window.bookingRequest.maxAdults = 1;
            }

            if (window.bookingRequest.minAdults > window.bookingRequest.maxAdults) {
                window.bookingRequest.minAdults = window.bookingRequest.maxAdults;
            } else if (window.bookingRequest.minAdults <= 0) {
                window.bookingRequest.minAdults = 1;
            }

            if (window.bookingRequest.minChildren > window.bookingRequest.maxChildren) {
                window.bookingRequest.minChildren = window.bookingRequest.maxChildren;
            } else if (window.bookingRequest.minChildren < 0) {
                window.bookingRequest.minChildren = 0;
            }
        },
        initBookingFormControls: function () {

            var selectedStr = "";
            var exceptionNoteStr = (
                window.cruiseCountChildrenStayFree > 0 ?
                " *" :
                ""
            );

            $("#selected_date").val("");
            $(".extra_item_quantity").val("0");
            $("#cruise_date_span").html("");
            $("#cruise_date").val("");
            $(".dates_row").hide();
            $(".price_row").hide();
            $(".deposits_row").hide();
            $(".booking-commands").hide();
            $("table.booking_price_breakdown tbody").html("");

            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCruiseOnlyPrice));
            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));
            $(".confirm_total_price_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $("table.extra_items_price_breakdown tbody").html("");

            $("#booking_form_adults option").remove();
            if ($("#booking_form_adults option").length === 0) {
                var i = window.bookingRequest.minAdults;

                for (i = window.bookingRequest.minAdults; i <= window.bookingRequest.maxAdults; i += 1) {
                    selectedStr = (
                        i === 1 ?
                        "selected" :
                        ""
                    );

                    $("<option " + selectedStr + ">").val(i).text(i).appendTo("#booking_form_adults");
                }
            }

            if (window.bookingRequest.minAdults > 0) {
                window.bookingRequest.adults = parseInt(window.bookingRequest.minAdults);

                $("span.adults_text").html(window.bookingRequest.adults);
                $("span.people_text").html((window.bookingRequest.adults + window.bookingRequest.children) + exceptionNoteStr);
            }

            if (window.bookingRequest.maxChildren > 0) {

                var j = window.bookingRequest.minChildren;

                $("#booking_form_children option").remove();
                if ($("#booking_form_children option").length === 0) {
                    for (j = window.bookingRequest.minChildren; j <= window.bookingRequest.maxChildren; j += 1) {
                        selectedStr = (
                            j === window.bookingRequest.minChildren ?
                            "selected" :
                            ""
                        );
                        $("<option " + selectedStr + ">").val(j).text(j).appendTo("#booking_form_children");
                    }
                }

                if (window.bookingRequest.minChildren > 0) {
                    window.bookingRequest.children = parseInt(window.bookingRequest.minChildren);
                    window.bookingRequest.adults = parseInt($("#booking_form_adults").val());

                    $("span.children_text").html(window.bookingRequest.children + exceptionNoteStr);
                    $("span.people_text").html((window.bookingRequest.adults + window.bookingRequest.children) + exceptionNoteStr);
                }

                $("#booking_form_children").on("change", function (ignore) {
                    if (parseInt($(this).val()) !== window.bookingRequest.children) {
                        window.bookingRequest.children = parseInt($(this).val());
                        window.bookingRequest.adults = 1;
                        if ($("#booking_form_adults") && $("#booking_form_adults").val()) {
                            window.bookingRequest.adults = parseInt($("#booking_form_adults").val());
                        }

                        $("span.children_text").html(window.bookingRequest.children + exceptionNoteStr);
                        $("span.people_text").html((window.bookingRequest.adults + window.bookingRequest.children) + exceptionNoteStr);

                        bookyourtravel_cruises.determineBillablePeople();
                        bookyourtravel_cruises.buildRatesTable();
                    }
                });

            } else {
                $(".booking_form_children_div").hide();
                $(".booking_form_adults_div").removeClass("one-half").addClass("full-width");
                $("label[for='booking_form_adults']").html(window.peopleCountLabel);
            }

            $("#booking_form_adults").off("change");
            $("#booking_form_adults").on("change", function (ignore) {
                if (parseInt($(this).val()) !== window.bookingRequest.adults) {
                    window.bookingRequest.adults = parseInt($(this).val());
                    window.bookingRequest.children = 0;
                    if ($("#booking_form_children") && $("#booking_form_children").val()) {
                        window.bookingRequest.children = parseInt($("#booking_form_children").val());
                    }

                    bookyourtravel_cruises.determineBillablePeople();

                    $("span.adults_text").html(window.bookingRequest.adults);
                    $("span.people_text").html((window.bookingRequest.adults + window.bookingRequest.children) + exceptionNoteStr);
                    bookyourtravel_cruises.buildRatesTable();
                }
            });

            bookyourtravel_cruises.determineBillablePeople();

            $("#booking_form_children").val(window.bookingRequest.children);
            $("#booking_form_adults").val(window.bookingRequest.adults);
        },
        determineBillablePeople: function () {
            var billable_children = window.bookingRequest.children;
            if (window.cruiseIsPricePerPerson && window.bookingRequest.children > 0) {
                billable_children = window.bookingRequest.children - window.cruiseCountChildrenStayFree;
                billable_children = (
                    billable_children > 0 ?
                    billable_children :
                    0
                );
            }
            window.bookingRequest.people = billable_children + window.bookingRequest.adults;
        },
        prepareBookingScreen: function () {
            $(".toggle_breakdown").unbind("click");
            $(".toggle_breakdown").on("click", function (e) {
                if ($(".price_breakdown_row").hasClass("hidden")) {
                    $(".price_breakdown_row").removeClass("hidden");
                    if (window.enableExtraItems) {
                        $(".price_breakdown_row").show("");
                    } else {
                        $(".price_breakdown_row:not(.extra_items_breakdown_row)").show();
                    }
                    $(".toggle_breakdown").html(window.hidePriceBreakdownLabel);
                } else {
                    $(".price_breakdown_row").addClass("hidden");
                    $(".price_breakdown_row").hide();
                    $(".toggle_breakdown").html(window.showPriceBreakdownLabel);
                }

                e.preventDefault();
            });

            $(".booking-commands").hide();

            $("#booking_form_adults").uniform();
            $("#booking_form_children").uniform();
            $(".extra_item_quantity").uniform();

            $(".radio").on(
                "click.uniform",
                function (ignore) {
                    if ($(this).find("span").hasClass("checked")) {
                        $(this).find("input").attr("checked", true);
                    } else {
                        $(this).find("input").attr("checked", false);
                    }
                }
            );

            bookyourtravel_cruises.bindResetButton();
            bookyourtravel_cruises.bindNextButton();
            bookyourtravel_cruises.bindCancelButton();

            if (window.enableExtraItems) {
                bookyourtravel_extra_items.bindExtraItemsQuantitySelect();
                bookyourtravel_extra_items.buildExtraItemsTable();
            }

            $("#booking-form-calendar .loading").parent().show();
            $(".booking_form_controls_holder").hide();

            bookyourtravel_cruises.populateAvailableCruiseDates(bookyourtravel_cruises.checkPreselectedCruiseDateAndPopulateAccordingly, true, true);
        },
        checkPreselectedCruiseDateAndPopulateAccordingly: function () {
            if (window.bookingRequest.requestedDateFrom && window.availableCruiseDates && window.availableCruiseDates.indexOf(window.bookingRequest.requestedDateFrom) >= 0) {
                var dateFrom = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.requestedDateFrom));
                var timeFrom = Date.UTC(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
                bookyourtravel_cruises.selectCruiseDate(timeFrom, window.bookingRequest.requestedDateFrom);
            }

            $("#booking-form-calendar .loading").parent().hide();
            $(".booking_form_controls_holder").show();

            bookyourtravel_cruises.setupCabinsDropdown();

            if ($(".booking_form_datepicker") !== undefined && $(".booking_form_datepicker").hasClass("hasDatepicker")) {
                bookyourtravel_cruises.refreshDatePicker();
            } else {
                bookyourtravel_cruises.bindCruiseDatePicker();
            }
        },
        setupCabinsDropdown: function () {
            var i = 0;
            if ($("#booking_form_cabins option").length === 0) {
                for (i = 1; i <= window.bookingRequest.maxCabins; i += 1) {
                    var opt = $("<option>").val(i).text(i);
                    if (window.bookingRequest.units == i) {
                        opt.attr("selected", "selected");
                    }
                    opt.appendTo("#booking_form_cabins");
                }
                $("#booking_form_cabins").uniform();
            } else {
                $("#booking_form_cabins option").remove();
                for (i = 1; i <= window.bookingRequest.maxCabins; i += 1) {
                    var opt = $("<option>").val(i).text(i);
                    if (window.bookingRequest.units == i) {
                        opt.attr("selected", "selected");
                    }
                    opt.appendTo("#booking_form_cabins");
                }
                $.uniform.update("#booking_form_cabins");
            }

            $("#booking_form_cabins").off("change");
            $("#booking_form_cabins").on("change", function (ignore) {
                if (parseInt($(this).val()) !== window.bookingRequest.units) {
                    window.bookingRequest.units = parseInt($(this).val());
                    $("span.rooms_text").html(window.bookingRequest.units);
                    $.uniform.update("#booking_form_cabins");
                    bookyourtravel_cruises.buildRatesTable();
                }
            });

            $("#booking_form_cabins").val(window.bookingRequest.units);
        },
        populateAvailableCruiseDates: function (callDelegate, skipLoaderStart, skipLoaderEnd) {

            if (!skipLoaderStart) {
                $("#booking-form-calendar .loading").parent().show();
                $(".booking_form_controls_holder").hide();
            }

            var dateArray = [];
            if (window.availableCruiseDates !== undefined && window.availableCruiseDates.length > 0) {
                delete window.availableCruiseDates;
            }
            window.availableCruiseDates = [];
            var startDate = new Date();
            if (window.minCruiseDate > 0 && window.minCruiseDate > startDate) {
                startDate = window.minCruiseDate;
            }

            var dataObj = {
                "action": "cruise_available_dates_ajax_request",
                "cabins": window.bookingRequest.units,
                "cruise_id": window.cruiseId,
                "cabin_type_id": window.cabinTypeId,
                "month": window.currentMonth,
                "year": window.currentYear,
                "start_date": (startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate()),
                "month_range": window.calendarMonthRows * window.calendarMonthCols,
                "nonce": BYTAjax.nonce
            };

            $.ajax({
                url: BYTAjax.slimajaxurl,
                data: dataObj,
                success: function (data) {
                    if (data !== undefined && data !== '') {
                        var retrievedEntries = JSON.parse(data);

                        var i = 0;
                        window.bookingRequest.maxCabins = 1;
                        var entry = null;
                        var availableCabins = 0;
                        for (i = 0; i < retrievedEntries.length; i += 1) {
                            entry = retrievedEntries[i];
                            availableCabins = parseInt(entry.available_cabins) - parseInt(entry.booked_cabins);
                            if (i === 0) {
                                window.bookingRequest.maxCabins = availableCabins;
                            } else if (window.bookingRequest.maxCabins > availableCabins) {
                                window.bookingRequest.maxCabins = availableCabins;
                            }
                            if (entry.the_date !== null) {
                                dateArray.push(retrievedEntries[i].the_date);
                            }
                        }

                        window.availableCruiseDates = dateArray;

                        if (callDelegate !== undefined) {
                            callDelegate();
                        }

                        if (!skipLoaderEnd) {
                            $(".booking_form_controls_holder").show();
                            $("#booking-form-calendar .loading").parent().hide();
                        }
                    }
                },
                error: function (errorThrown) {
                    console.log(errorThrown);
                }
            });
        },
        bindNextButton: function () {

            $(".book-cruise-proceed").unbind("click");
            $(".book-cruise-proceed").on("click", function (event) {
                if (!window.cruiseIsReservationOnly && window.useWoocommerceForCheckout) {
                    bookyourtravel_cruises.addProductToCart();
                } else {
                    $("#booking-form-calendar .loading").parent().show();

                    bookyourtravel_cruises.showCruiseBookingForm();

                    $("#booking-form-calendar .loading").parent().hide();
                }

                event.preventDefault();
            });
        },
        resetTheForm: function () {

            // bookyourtravel_cruises.destroyDatePicker();

            $("html, body").animate({
                scrollTop: $("#booking-form-calendar").offset().top - 300
            }, 500);

            if (window.bookingRequest.selectedTime && window.bookingRequest.selectedTime > 0) {
                delete window.bookingRequest;
            }

            bookyourtravel_cruises.initBookingRequestObject();
            bookyourtravel_cruises.initBookingFormControls();

            $.uniform.update("#booking_form_children");
            $.uniform.update("#booking_form_adults");

            $(".booking_form_controls_holder, .booking-commands .book-cruise-proceed").hide();
            $("#booking-form-calendar .loading").parent().hide();
            $(".book-cruise-select-dates").show();

            bookyourtravel_cruises.refreshDatePicker();
        },
        bindResetButton: function () {

            $(".book-cruise-reset").unbind("click");
            $(".book-cruise-reset").on("click", function (event) {
                event.preventDefault();
                bookyourtravel_cruises.resetTheForm();
            });
        },
        bindCancelButton: function () {
            $("#cancel-cruise-booking, .close-btn").unbind("click");
            $("#cancel-cruise-booking, .close-btn").on("click", function (event) {
                $(".modal").hide();
                bookyourtravel_cruises.hideCruiseBookingForm();
                bookyourtravel_cruises.showCruiseScreen();
                bookyourtravel_cruises.resetTheForm();
                $("#cruise-booking-form .error-summary").hide();
                $("#cruise-booking-form label.error").hide();
                $("#cruise-booking-form input.error").removeClass("error");
                $("#cruise-booking-form input, #cruise-booking-form textarea").val("");

                event.preventDefault();
            });
        },
        showCruiseScreen: function () {
            $(".section-" + window.postType + "-content").show();
            if ($(".inner-nav li.active").length > 0) {
                var tabAnchor = $(".inner-nav li.active a");
                var tabUrl = tabAnchor.attr("href");
                var hashbang = tabUrl.substring(tabUrl.indexOf("#") + 1);
                var anch = $(".inner-nav li a[href='#" + hashbang + "']");
                if (anch.length > 0) {
                    if (anch.parent().length > 0) {
                        $(".inner-nav li").removeClass("active");
                        anch.parent().addClass("active");
                        $(".tab-content").hide();
                        $(".tab-content#" + hashbang).show();
                    }
                }
            }
        },
        showCruiseBookingForm: function () {

            $("body").addClass("modal-open");

            var adults = (
                (window.bookingRequest.adults !== undefined && window.bookingRequest.adults) ?
                window.bookingRequest.adults :
                "1"
            );

            var children = (
                (window.bookingRequest.children !== undefined && window.bookingRequest.children) ?
                window.bookingRequest.children :
                "0"
            );

            $(".booking_form_cruise_name_p").html(window.cruiseTitle);
            $(".booking_form_cabin_type_p").html(window.bookingRequest.cabinTypeTitle);
            $(".booking_form_cabin_count_p").html(window.bookingRequest.units);
            $(".booking_form_adults_p").html(adults);
            $(".booking_form_children_p").html(children);
            $(".booking_form_cruise_date_p").html(window.bookingRequest.selectedDate);
            $(".booking_form_reservation_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCruiseOnlyPrice));
            $(".booking_form_extra_items_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".booking_form_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

            $(".section-" + window.postType + "-content").hide();

            $(".cruise-booking-section").show();

            if (window.cruiseIsReservationOnly || !window.useWoocommerceForCheckout) {

                $("#cruise-booking-form").validate({
                    onkeyup: false,
                    ignore: [],
                    invalidHandler: function (ignore, validator) {
                        var errors = validator.numberOfInvalids();
                        if (errors) {
                            var message = (
                                errors === 1 ?
                                window.formSingleError :
                                window.formMultipleError.format(errors)
                            );

                            $("#cruise-booking-form div.error-summary div p").html(message);
                            $("#cruise-booking-form div.error-summary").show();
                        } else {
                            $("#cruise-booking-form div.error-summary").hide();
                            $(".error").hide();
                        }

                        $(".booking-section").animate({
                            scrollTop: $("#cruise-booking-form div.error-summary").offset().top - 100
                        }, 500);
                    },
                    errorPlacement: function (error, element) {
                        if ($(element).attr("type") === "checkbox") {
                            error.appendTo($(element).closest("div").parent());
                            $(element).closest("div").addClass("error");
                        } else if ($(element)[0].tagName === 'SELECT') {
                            $(element).closest(".selector").addClass("error");
                            error.appendTo($(element).closest(".selector").parent());
                        } else {
                            error.insertAfter(element);
                        }
                    },
                    success: function (error, element) {
                        if ($(element).attr("type") === "checkbox") {
                            $(element).closest("div").removeClass("error");
                        } else if ($(element)[0].tagName === 'SELECT') {
                            $(element).closest(".selector").removeClass("error");
                        }
                        error.remove();
                    },
                    submitHandler: function () {
                        bookyourtravel_cruises.processBooking();
                    }
                });

                if ($("#cruise-booking-form input[name='agree_gdpr']").length > 0) {
                    $("#cruise-booking-form input[name='agree_gdpr']").rules("add", {
                        required: true,
                        messages: {
                            required: window.gdprError
                        }
                    });
                }

                $("#submit-cruise-booking").on('click', function (e) {
                    e.preventDefault();
                    if ($("#cruise-booking-form").valid()) {
                        $("#cruise-booking-form").submit();
                    }
                });

                $.each(window.bookingFormFields, function (ignore, field) {

                    if (field.hide !== "1" && field.id !== null && field.id.length > 0) {
                        var $input = null;
                        if (field.type === "text" || field.type === "email") {
                            $input = $("#cruise-booking-form").find("input[name=" + field.id + "]");
                        } else if (field.type === "textarea") {
                            $input = $("#cruise-booking-form").find("textarea[name=" + field.id + "]");
                        } else if (field.type === "checkbox") {
                            $input = $("#cruise-booking-form").find("input[name=" + field.id + "]");
                        } else if (field.type === "select") {
                            $input = $("#cruise-booking-form").find("select[name=" + field.id + "]");
                        }

                        if ($input !== null && $input !== undefined) {
                            if (field.required === "1") {
                                $input.rules("add", {
                                    required: true,
                                    messages: {
                                        required: window.bookingFormRequiredError
                                    }
                                });
                            }
                            if (field.type === "email") {
                                $input.rules("add", {
                                    email: true,
                                    messages: {
                                        required: window.bookingFormEmailError
                                    }
                                });
                            }
                        }
                    }
                });
            }

            if (!window.cruiseIsReservationOnly && window.useWoocommerceForCheckout) {
                $("html, body").animate({
                    scrollTop: $("#booking-form-calendar").offset().top
                }, 500);
            }
        },
        hideCruiseBookingForm: function () {
            $("body").removeClass("modal-open");
            $(".cruise-booking-section").hide();
        },
        showCruiseConfirmationForm: function () {
            $(".cruise-confirmation-section").show();
        },
        destroyDatePicker: function () {
            if ($(".booking_form_datepicker") !== undefined) {
                $(".booking_form_datepicker").datepicker("destroy");
            }
        },
        bindCruiseDatePicker: function () {
            if (window.minCruiseDate instanceof Date) {
                var firstDayOfMonth = new Date(window.minCruiseDate.getFullYear(), window.minCruiseDate.getMonth(), 1);
                window.minCruiseDate = firstDayOfMonth;
            }

            if ($(".booking_form_datepicker") !== undefined) {
                $(".booking_form_datepicker").datepicker({
                    dateFormat: window.datepickerDateFormat,
                    numberOfMonths: [window.calendarMonthRows, window.calendarMonthCols],
                    minDate: window.minCruiseDate,
                    onSelect: function (dateText, inst) {
                        var selectedTime = Date.UTC(inst.currentYear, inst.currentMonth, inst.currentDay);
                        bookyourtravel_cruises.selectCruiseDate(selectedTime, dateText);
                        $("#booking-form-calendar .loading").parent().hide();
                    },
                    onChangeMonthYear: function (year, month, ignore) {

                        window.currentMonth = month;
                        window.currentYear = year;
                        window.currentDay = 1;

                        bookyourtravel_cruises.populateAvailableCruiseDates(bookyourtravel_cruises.checkPreselectedCruiseDateAndPopulateAccordingly);
                    },
                    beforeShowDay: function (d) {
                        var dUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

                        var selectedTime = null;

                        if ($("#cruise_date").val()) {
                            selectedTime = parseInt($("#cruise_date").val());
                        }

                        if (window.availableCruiseDates) {
                            var dateTextToCompare = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

                            if (dUtc === selectedTime) {
                                return [false, "dp-hightlight dp-highlight-selected"];
                            }
                            if ($.inArray(dateTextToCompare, window.availableCruiseDates) === -1) {
                                return [false, "ui-datepicker-unselectable ui-state-disabled"];
                            }

                            return [true, "dp-highlight"];
                        }

                        return [false, ""];
                    }

                });
            }
        },
        processBooking: function () {
            if (window.bookingRequest !== undefined) {
                $(".booking_form_controls_holder, .booking-commands .book-cruise-proceed").hide();
                $("#booking-form-calendar .loading").parent().show();

                var selectedDate = bookyourtravel_cruises.getSelectedCruiseDate();
                var cruiseDate = selectedDate.getFullYear() + "-" + (selectedDate.getMonth() + 1) + "-" + selectedDate.getDate();

                var dataObj = {
                    "action": "cruise_process_booking_ajax_request",
                    "user_id": window.currentUserId,
                    "cruise_id": window.cruiseId,
                    "cabin_type_id": window.cabinTypeId,
                    "adults": window.bookingRequest.adults,
                    "children": window.bookingRequest.children,
                    "cabin_count": window.bookingRequest.units,
                    "extra_items": window.bookingRequest.extraItems,
                    "cruise_date": cruiseDate,
                    "nonce": BYTAjax.nonce
                };

                $.each(window.bookingFormFields, function (ignore, field) {
                    if (field.hide !== "1") {
                        dataObj[field.id] = $("#" + field.id).val();
                        $(".confirm_" + field.id + "_p").html($("#" + field.id).val());
                    }
                });

                $(".confirm_cruise_name_p").html(window.cruiseTitle);
                $(".confirm_cabin_type_p").html(window.bookingRequest.cabinTypeTitle);
                $(".confirm_cabin_count_p").html(window.bookingRequest.units);
                $(".confirm_cruise_name_div").addClass("one-half");
                $(".confirm_cabin_type_div").show();
                $(".confirm_cabin_count_div").show();

                $(".confirm_adults_p").html(window.bookingRequest.adults);
                $(".confirm_children_p").html(window.bookingRequest.children);
                $(".confirm_cruise_date_p").html(window.bookingRequest.selectedDate);
                if ($(".confirm_reservation_total_p").length > 0) {
                    $(".confirm_reservation_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCruiseOnlyPrice));
                }
                if ($(".confirm_extra_items_total_p").length > 0) {
                    $(".confirm_extra_items_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
                }
                $(".confirm_total_price_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

                bookyourtravel_cruises.hideCruiseBookingForm();
                bookyourtravel_cruises.showCruiseConfirmationForm();

                $.ajax({
                    url: BYTAjax.ajaxurl,
                    data: dataObj,
                    success: function (ignore) {

                        // This outputs the result of the ajax request
                        $("div.error div p").html("");
                        $("div.error").hide();

                        $(".booking_form_controls_holder, .booking-commands .book-cruise-proceed").show();
                        $("#booking-form-calendar .loading").parent().hide();
                    },
                    error: function (errorThrown) {
                        console.log(errorThrown);
                    }
                });
            }
        },
        selectCruiseDate: function (cruiseTime, cruiseDate) {
            $("div.error.step1-error div p").html("");
            $("div.error.step1-error").hide();
            $(".price_breakdown").show();
            $("table.booking_price_breakdown tbody").html("");

            $(".dates_row").show();
            $(".price_row").show();

            window.bookingRequest.selectedTime = cruiseTime;
            window.bookingRequest.selectedDate = cruiseDate;

            $("#cruise_date_span").html(cruiseDate);
            $("#cruise_date").val(cruiseTime);
            $("#duration_days_span").html(window.cruiseDurationDays);
            $("#duration_days").val(window.cruiseDurationDays);

            bookyourtravel_extra_items.bindRequiredExtraItems();
            bookyourtravel_cruises.buildRatesTable();
        },
        buildRatesTable: function () {
            var selectedTime = bookyourtravel_cruises.getSelectedCruiseTime();

            $(".price_row").show();
            $.uniform.update(".extra_item_quantity");

            $("table.booking_price_breakdown tbody").html("");

            if (selectedTime) {

                $(".reservation_total").html(bookyourtravel_scripts.getSmallLoaderHtml());
                $(".total_price").html(bookyourtravel_scripts.getSmallLoaderHtml());
                $(".extra_items_total").html(bookyourtravel_scripts.getSmallLoaderHtml());

                window.bookingRequest.totalPrice = 0;
                window.bookingRequest.totalCruiseOnlyPrice = 0;

                bookyourtravel_cruises.buildRatesTableStructure();
                bookyourtravel_cruises.buildRateRow(selectedTime);
            }
        },
        buildRatesTableStructure: function () {

            $("table.booking_price_breakdown thead").html("");
            $("table.booking_price_breakdown tfoot").html("");

            var colCount = 3;

            var headerRow = "";
            headerRow += "<tr class='rates_head_row'>";
            headerRow += "<th>" + window.dateLabel + "</th>";

            if (window.cruiseIsPricePerPerson) {
                headerRow += "<th>" + window.adultCountLabel + "</th>";
                headerRow += "<th>" + window.pricePerAdultLabel + "</th>";
                headerRow += "<th>" + window.childCountLabel + "</th>";
                headerRow += "<th>" + window.pricePerChildLabel + "</th>";
                colCount = 7;
            }

            headerRow += "<th>" + window.pricePerDayPerCabinLabel + "</th>";
            headerRow += "<th>" + window.pricePerDayLabel + "</th>";

            $("table.booking_price_breakdown thead").append(headerRow);

            var footerRow = "";

            footerRow += "<tr>";
            footerRow += "<th colspan='" + (colCount - 1) + "'>" + window.priceTotalLabel + "</th>";
            footerRow += "<td class='reservation_total'>" + bookyourtravel_scripts.formatPrice(0) + "</td>";
            footerRow += "</tr>";

            $("table.booking_price_breakdown tfoot").append(footerRow);
        },
        buildRateRow: function (cruiseTime) {
            var cruiseDate = bookyourtravel_scripts.convertLocalToUTC(new Date(cruiseTime));
            var theDate = cruiseDate.getFullYear() + "-" + (cruiseDate.getMonth() + 1) + "-" + cruiseDate.getDate();

            var pricePerPeriod = 0;
            var childPricePerPeriod = 0;
            var totalPricePerPeriod = 0;
            var billable_children = window.bookingRequest.children;
            var adults = window.bookingRequest.adults;
            var tableRow = "";

            if (window.cruiseIsPricePerPerson) {
                billable_children = window.bookingRequest.children - window.cruiseCountChildrenStayFree;
                billable_children = (
                    billable_children > 0 ?
                    billable_children :
                    0
                );
            }

            var dataObj = {
                "action": "cruise_get_day_price_ajax_request",
                "cruise_id": window.cruiseId,
                "cabin_type_id": window.cabinTypeId,
                "the_date": theDate,
                "nonce": BYTAjax.nonce
            };

            $.ajax({
                url: BYTAjax.slimajaxurl,
                data: dataObj,
                success: function (data) {
                    if (data !== undefined && data !== '') {
                        var price_data = JSON.parse(data);

                        if (price_data && price_data.regular_price) {

                            window.bookingRequest.maxCabins = price_data.running_available_total - price_data.booked_cabins;
                            bookyourtravel_cruises.setupCabinsDropdown();

                            tableRow += "<tr>";
                            tableRow += "<td>" + $.datepicker.formatDate(window.datepickerDateFormat, cruiseDate) + "</td>";

                            pricePerPeriod = parseFloat(price_data.regular_price);
                            childPricePerPeriod = parseFloat(price_data.regular_price_child);

                            if (window.cruiseIsPricePerPerson) {
                                tableRow += "<td>" + adults + "</td>";
                                tableRow += "<td>" + bookyourtravel_scripts.formatPrice(pricePerPeriod) + "</td>";
                                if (window.bookingRequest.maxChildren > 0) {
                                    tableRow += "<td>" + window.bookingRequest.children + "</td>";
                                    tableRow += "<td>" + bookyourtravel_scripts.formatPrice(childPricePerPeriod) + "</td>";
                                }
                            }

                            if (window.cruiseIsPricePerPerson) {
                                totalPricePerPeriod = (pricePerPeriod * adults) + (childPricePerPeriod * billable_children);
                            } else {
                                totalPricePerPeriod = pricePerPeriod;
                            }

                            tableRow += "<td>" + bookyourtravel_scripts.formatPrice(totalPricePerPeriod) + "</td>";

                            totalPricePerPeriod = totalPricePerPeriod * window.bookingRequest.units;

                            tableRow += "<td>" + bookyourtravel_scripts.formatPrice(totalPricePerPeriod) + "</td>";

                            window.bookingRequest.totalPrice += totalPricePerPeriod;
                            window.bookingRequest.totalCruiseOnlyPrice += totalPricePerPeriod;

                            tableRow += "</tr>";

                            $("table.booking_price_breakdown tbody").append(tableRow);

                            if ($("table.booking_price_breakdown").data("tablesorter") === null || $("table.booking_price_breakdown").data("tablesorter") === undefined) {
                                $("table.booking_price_breakdown").tablesorter({
                                    debug: false,
                                    dateFormat: window.datepickerDateFormat, // "ddmmyyyy",
                                    sortList: [
                                        [0, 0]
                                    ]
                                });
                            }

                            $("table.booking_price_breakdown").trigger("update");
                            $("table.booking_price_breakdown").trigger("sorton", [
                                [
                                    [0, 0]
                                ]
                            ]);

                            $("table.responsive").trigger("updated");

                            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCruiseOnlyPrice));
                            $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

                            bookyourtravel_extra_items.recalculateExtraItemTotals(window.bookingRequest.totalCruiseOnlyPrice);

                            if (window.enableDeposits) {
                                window.bookingRequest.depositAmount = window.bookingRequest.totalPrice * (window.depositPercentage / 100);
                                window.bookingRequest.depositDifference = window.bookingRequest.totalPrice - window.bookingRequest.depositAmount;

                                if ($(".deposits_row").length > 0) {
                                    $(".deposits_row").show();
                                    $(".deposit_amount").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.depositAmount));
                                    if (window.depositPercentage < 100) {
                                        $(".deposit-info").html(window.depositInfo.format(window.depositPercentage, bookyourtravel_scripts.formatPrice(window.bookingRequest.depositDifference)));
                                    } else {
                                        $(".deposits_row").hide();
                                    }
                                }
                            }

                            bookyourtravel_cruises.bindNextButton();
                            bookyourtravel_cruises.bindCancelButton();

                            $("html, body").animate({
                                scrollTop: $(".price_row").first().offset().top
                            }, 500);

                            $(".booking-commands").show();
                            $(".booking-commands .book-cruise-proceed").show();
                            $("#booking-form-calendar .loading").parent().hide();
                        }
                    }
                }
            });
        },
        addProductToCart: function () {

            $(".booking_form_controls_holder, .booking-commands .book-cruise-proceed").hide();
            $("#booking-form-calendar .loading").parent().show();

            $("html, body").animate({
                scrollTop: $("#booking-form-calendar").offset().top - 100
            }, 500);

            var selectedDate = bookyourtravel_cruises.getSelectedCruiseDate();
            var cruiseDate = selectedDate.getFullYear() + "-" + (selectedDate.getMonth() + 1) + "-" + selectedDate.getDate();

            var dataObj = {
                "action": "cruise_booking_add_to_cart_ajax_request",
                "user_id": window.currentUserId,
                "cruise_id": window.cruiseId,
                "cabin_type_id": window.cabinTypeId,
                "adults": window.bookingRequest.adults,
                "children": window.bookingRequest.children,
                "cabin_count": window.bookingRequest.units,
                "extra_items": window.bookingRequest.extraItems,
                "cruise_date": cruiseDate,
                "nonce": BYTAjax.nonce
            };

            $.each(window.bookingFormFields, function (ignore, field) {
                if (field.hide !== "1") {
                    dataObj[field.id] = $("#" + field.id).val();
                }
            });

            $.ajax({
                url: BYTAjax.ajaxurl,
                data: dataObj,
                success: function (ignore) {
                    $("#booking-form-calendar .redirect-notice").show();
                    $("#booking-form-calendar .loading").parent().hide();
                    $("#booking-form-calendar .booking-commands").hide();
                    bookyourtravel_scripts.redirectToCart();
                },
                error: function (errorThrown) {
                    console.log(errorThrown);
                }
            });
        },
        getSelectedCruiseTime: function () {
            if ($("#cruise_date").val()) {
                return parseInt($("#cruise_date").val());
            }
            return null;
        },
        getSelectedCruiseDate: function () {
            if ($("#cruise_date").val()) {
                return bookyourtravel_scripts.convertLocalToUTC(new Date(parseInt($("#cruise_date").val())));
            }
            return null;
        },
        refreshDatePicker: function () {

            if ($(".booking_form_datepicker") !== undefined) {
                $(".booking_form_datepicker").datepicker("refresh");
                $(".booking_form_datepicker").show();
            }

            $("#booking-form-calendar .loading").parent().hide();
        }
    };
}(jQuery));