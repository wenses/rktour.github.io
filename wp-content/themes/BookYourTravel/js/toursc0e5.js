/*jslint browser: true*/ /*jslint long:true*/ /*jslint for:true*/ /*global bookyourtravel_scripts*/ /*global bookyourtravel_extra_items*/ /*global jQuery*/ /*jslint this:true */ /*global window*/ /*global BYTAjax*/ /*global console*/

(function ($) {

    "use strict";

    var bookyourtravel_tours;

    $(document).ready(function () {
        bookyourtravel_tours.init();
    });

    bookyourtravel_tours = {
        init: function () {
            if ($(".tour-booking-form-calendar .booking_form_controls_holder").length > 0) {
                bookyourtravel_tours.initBookingRequestObject();

                $(".toggle_breakdown").off("click");
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

                bookyourtravel_tours.bindResetButton();
                bookyourtravel_tours.bindNextButton();
                bookyourtravel_tours.bindCancelButton();

                if (window.enableExtraItems) {
                    bookyourtravel_extra_items.bindExtraItemsQuantitySelect();
                    bookyourtravel_extra_items.buildExtraItemsTable();
                }

                $("#booking-form-calendar .loading").parent().show();
                $(".booking_form_controls_holder").hide();

                bookyourtravel_tours.populateAvailableTourDates(bookyourtravel_tours.checkPreselectedTourDateAndPopulateAccordingly, true, true);
            }

            if ($("[data-tour-id]").length > 0) {
                bookyourtravel_tours.populateTourPrices();
            }

            if ($("[data-location-id]").length > 0 && $("[data-min-price-type='tour']").length > 0) {
                bookyourtravel_scripts.populateLocationPrices("tour");
            }
        },
        populateTourPrices: function () {
            if ($("[data-tour-id]").length > 0) {
                var tourItems = $("[data-tour-id]");
                $.each(tourItems, function () {
                    if (!$(this).hasClass('skip-ajax-call')) {                    
                        var tourId = parseInt($(this).data("tour-id"));
                        var price = 0;

                        if ($("[data-tour-id='" + tourId + "'] .price .amount").length > 0) {
                            $("[data-tour-id='" + tourId + "'] .price .amount").html("");
                            $("[data-tour-id='" + tourId + "'] .price .curr").html("");

                            var dataObj = {
                                "action": "tour_load_min_price_ajax_request",
                                "start_date": window.requestedDateFrom,
                                "end_date": window.requestedDateTo,
                                "tour_id": tourId,
                                "nonce": BYTAjax.nonce
                            };

                            $.ajaxQueue({
                                url: BYTAjax.slimajaxurl,
                                data: dataObj,
                                success: function (data) {;
                                    if (data !== undefined && data !== '') {
                                        price = JSON.parse(data)
                                        $("[data-tour-id='" + tourId + "'] .item_price").show();
                                        $("[data-tour-id='" + tourId + "'] .price .curr").html(window.currencySymbol);
                                        $("[data-tour-id='" + tourId + "'] .price .amount").html(bookyourtravel_scripts.formatPriceOnly(price));
                                    } else {
                                        $("[data-tour-id='" + tourId + "'] .item_price").hide();
                                    }
                                },
                                error: function (errorThrown) {
                                    console.log(errorThrown);
                                }
                            },
                            'tours');
                        }
                    }
                });
            }
        },
        initBookingRequestObject: function () {

            if (!window.bookingRequest || window.bookingRequest === undefined || window.bookingRequest.length === 0) {
                window.bookingRequest = {};
            }

            window.bookingRequest.extraItems = {};
            window.bookingRequest.adults = 1;
            window.bookingRequest.children = 0;
            window.bookingRequest.units = 1;
            window.bookingRequest.people = 1;
            window.bookingRequest.extraItemsTotalPrice = 0;
            window.bookingRequest.totalTourOnlyPrice = 0;
            window.bookingRequest.totalPrice = 0;
            window.bookingRequest.totalDays = window.tourDurationDays;
            window.bookingRequest.selectedDate = null;
            window.bookingRequest.selectedTime = null;
            window.bookingRequest.maxAllowedPeople = 1;
        },
        bindTourDropDowns: function () {

            var maxCountOffset = window.bookingRequest.maxAllowedPeople - window.bookingRequest.adults - window.bookingRequest.children;
            var maxAdultCount = window.bookingRequest.adults + maxCountOffset;
            if (maxAdultCount < window.bookingRequest.adults) {
                maxAdultCount = parseInt(window.bookingRequest.adults);
            } else if (maxAdultCount > window.bookingRequest.maxAllowedPeople) {
                maxAdultCount = parseInt(window.bookingRequest.adults);
            }

            $("#booking_form_adults").unbind();
            $("#booking_form_adults").find("option").remove();
            var i = 1;
            for (i = 1; i <= maxAdultCount; i += 1) {
                $("<option " + (
                    i === window.bookingRequest.adults
                    ? "selected"
                    : ""
                ) + ">").val(i).text(i).appendTo("#booking_form_adults");
            }

            $("#booking_form_adults").on("change", function (ignore) {
                if (parseInt($(this).val()) !== window.bookingRequest.adults) {
                    window.bookingRequest.adults = parseInt($(this).val());
                    $("span.adults_text").html(window.bookingRequest.adults);
                    window.bookingRequest.people = window.bookingRequest.adults + window.bookingRequest.children;

                    bookyourtravel_tours.bindTourDropDowns();
                    bookyourtravel_tours.buildRatesTable();
                }
            });

            maxCountOffset = window.bookingRequest.maxAllowedPeople - window.bookingRequest.adults - window.bookingRequest.children;
            var maxChildrenCount = window.bookingRequest.children + maxCountOffset;
            if (maxChildrenCount < window.bookingRequest.children) {
                maxChildrenCount = parseInt(window.bookingRequest.children);
            } else if (maxChildrenCount > window.bookingRequest.maxAllowedPeople) {
                maxChildrenCount = parseInt(window.bookingRequest.children);
            }

            $("#booking_form_children").unbind();
            $("#booking_form_children").find("option").remove();
            var j = 1;
            for (j = 0; j <= maxChildrenCount; j += 1) {
                $("<option " + (
                    j === window.bookingRequest.children
                    ? "selected"
                    : ""
                ) + ">").val(j).text(j).appendTo("#booking_form_children");
            }

            $("#booking_form_children").on("change", function (ignore) {
                if (parseInt($(this).val()) !== window.bookingRequest.children) {
                    window.bookingRequest.children = parseInt($(this).val());
                    $("span.children_text").html(window.bookingRequest.children);
                    bookyourtravel_tours.bindTourDropDowns();
                    bookyourtravel_tours.buildRatesTable();
                }
            });

            $("#booking_form_children").val(window.bookingRequest.children);
            $("#booking_form_adults").val(window.bookingRequest.adults);

            $("#booking_form_adults").uniform();
            $("#booking_form_children").uniform();

            window.bookingRequest.people = window.bookingRequest.adults + window.bookingRequest.children;
        },
        checkPreselectedTourDateAndPopulateAccordingly: function () {
            if (window.bookingRequest.requestedDateFrom && window.availableTourDates && window.availableTourDates.indexOf(window.bookingRequest.requestedDateFrom) >= 0) {
                var dateFrom = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.requestedDateFrom));
                var timeFrom = Date.UTC(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
                bookyourtravel_tours.selectTourDate(timeFrom, window.bookingRequest.requestedDateFrom);
            }

            $("#booking-form-calendar .loading").parent().hide();
            $(".booking_form_controls_holder").show();
            bookyourtravel_tours.bindTourDatePicker();
        },
        populateAvailableTourDates: function (callDelegate, skipLoaderStart, skipLoaderEnd) {

            if (!skipLoaderStart) {
                $("#booking-form-calendar .loading").parent().show();
                $(".booking_form_controls_holder").hide();
            }

            var dateArray = [];
            window.availableTourDates = [];
            var startDate = new Date();
            if (window.minTourDate > 0 && window.minTourDate > startDate) {
                startDate = window.minTourDate;
            }

            var dataObj = {
                "action": "tour_available_dates_ajax_request",
                "tour_id": window.tourId,
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
                        for (i = 0; i < retrievedEntries.length; i += 1) {
                            if (retrievedEntries[i].the_date !== null) {
                                dateArray.push(retrievedEntries[i].the_date);
                            }
                        }

                        window.availableTourDates = dateArray;

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

            $(".book-tour-proceed").unbind("click");
            $(".book-tour-proceed").on("click", function (event) {

                if (!window.tourIsReservationOnly && window.useWoocommerceForCheckout) {
                    bookyourtravel_tours.addProductToCart();
                } else {

                    $("#booking-form-calendar .loading").parent().show();

                    bookyourtravel_tours.showTourBookingForm();

                    $("#booking-form-calendar .loading").parent().hide();
                }

                event.preventDefault();
            });
        },
        destroyDatePicker: function () {
            if ($(".booking_form_datepicker") !== undefined) {
                $(".booking_form_datepicker").datepicker("destroy");
            }
        },
        resetTheForm: function () {

            // bookyourtravel_tours.destroyDatePicker();

            $("html, body").animate({
                scrollTop: $("#booking-form-calendar").offset().top
            }, 500);

            $(".booking_form_datepicker").hide();

            if (window.bookingRequest.selectedTime && window.bookingRequest.selectedTime > 0) {
                delete window.bookingRequest;
            }

            bookyourtravel_tours.initBookingRequestObject();
            bookyourtravel_tours.bindTourDropDowns();

            $("#selected_date").val("");
            $(".extra_item_quantity").val("0");
            $("#tour_date_span").html("");
            $("#tour_date").val("");
            $(".dates_row").hide();
            $(".price_row").hide();
            $(".booking-commands").hide();
            $("table.booking_price_breakdown tbody").html("");

            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalTourOnlyPrice));
            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));
            $(".confirm_total_price_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

            $("table.extra_items_price_breakdown tbody").html("");

            // bookyourtravel_tours.bindTourDatePicker();
            bookyourtravel_tours.refreshDatePicker();
        },
        bindResetButton: function () {
            $(".book-tour-reset").unbind("click");
            $(".book-tour-reset").on("click", function (event) {
                event.preventDefault();
                bookyourtravel_tours.resetTheForm();
            });
        },
        bindCancelButton: function () {
            $("#cancel-tour-booking, .close-btn").unbind("click");
            $("#cancel-tour-booking, .close-btn").on("click", function (event) {
                $(".modal").hide();
                bookyourtravel_tours.hideTourBookingForm();
                bookyourtravel_tours.showTourScreen();
                bookyourtravel_tours.resetTheForm();
                $("#tour-booking-form .error-summary").hide();
                $("#tour-booking-form label.error").hide();
                $("#tour-booking-form input.error").removeClass("error");
                $("#tour-booking-form input, #tour-booking-form textarea").val("");

                event.preventDefault();
            });
        },
        showTourScreen: function () {
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
        showTourBookingForm: function () {

            $("body").addClass("modal-open");

            var adults = (
                (window.bookingRequest.adults !== undefined && window.bookingRequest.adults)
                ? window.bookingRequest.adults
                : "1"
            );

            var children = (
                (window.bookingRequest.children !== undefined && window.bookingRequest.children)
                ? window.bookingRequest.children
                : "0"
            );

            $(".booking_form_tour_name_p").html(window.tourTitle);
            $(".booking_form_adults_p").html(adults);
            $(".booking_form_children_p").html(children);
            $(".booking_form_tour_date_p").html(window.bookingRequest.selectedDate);
            $(".booking_form_reservation_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalTourOnlyPrice));
            $(".booking_form_extra_items_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".booking_form_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

            $(".section-" + window.postType + "-content").hide();

            $(".tour-booking-section").show();

            if (window.tourIsReservationOnly || !window.useWoocommerceForCheckout) {

                $("#tour-booking-form").validate({
                    onkeyup: false,
                    ignore: [],
                    invalidHandler: function (ignore, validator) {
                        var errors = validator.numberOfInvalids();
                        if (errors) {
                            var message = (
                                errors === 1
                                ? window.formSingleError
                                : window.formMultipleError.format(errors)
                            );

                            $("#tour-booking-form div.error-summary div p").html(message);
                            $("#tour-booking-form div.error-summary").show();
                        } else {
                            $("#tour-booking-form div.error-summary").hide();
                            $(".error").hide();
                        }

                        $(".booking-section").animate({
                            scrollTop: $("#tour-booking-form div.error-summary").offset().top - 100
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
                        bookyourtravel_tours.processBooking();
                    }
                });

                if ($("#tour-booking-form input[name='agree_gdpr']").length > 0) {
                  $("#tour-booking-form input[name='agree_gdpr']").rules("add", {
                      required: true,
                      messages: {
                          required: window.gdprError
                      }
                  });
                }

                $("#submit-tour-booking").on('click', function (e) {
                    e.preventDefault();
                    if ($("#tour-booking-form").valid()) {
                        $("#tour-booking-form").submit();
                    }
                });

                $.each(window.bookingFormFields, function (ignore, field) {

                    if (field.hide !== "1" && field.id !== null && field.id.length > 0) {
                        var $input = null;
                        if (field.type === "text" || field.type === "email") {
                            $input = $("#tour-booking-form").find("input[name=" + field.id + "]");
                        } else if (field.type === "textarea") {
                            $input = $("#tour-booking-form").find("textarea[name=" + field.id + "]");
                        } else if (field.type === "checkbox") {
                            $input = $("#tour-booking-form").find("input[name=" + field.id + "]");
                        } else if (field.type === "select") {
                            $input = $("#tour-booking-form").find("select[name=" + field.id + "]");
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

            if (!window.tourIsReservationOnly && window.useWoocommerceForCheckout) {
                $("html, body").animate({
                    scrollTop: $("#booking-form-calendar").offset().top
                }, 500);
            }
        },
        hideTourBookingForm: function () {
            $("body").removeClass("modal-open");
            $(".tour-booking-section").hide();
        },
        showTourConfirmationForm: function () {
            $(".tour-confirmation-section").show();
        },
        bindTourDatePicker: function () {
            if (window.minTourDate instanceof Date) {
                var firstDayOfMonth = new Date(window.minTourDate.getFullYear(), window.minTourDate.getMonth(), 1);
                window.minTourDate = firstDayOfMonth;
            }
            
            if ($(".booking_form_datepicker") !== undefined) {
                $(".booking_form_datepicker").datepicker({
                    dateFormat: window.datepickerDateFormat,
                    numberOfMonths: [window.calendarMonthRows, window.calendarMonthCols],
                    minDate: window.minTourDate,
                    onSelect: function (dateText, inst) {
                        var selectedTime = Date.UTC(inst.currentYear, inst.currentMonth, inst.currentDay);
                        bookyourtravel_tours.selectTourDate(selectedTime, dateText);
                        $("#booking-form-calendar .loading").parent().hide();
                    },
                    onChangeMonthYear: function (year, month, ignore) {

                        window.currentMonth = month;
                        window.currentYear = year;
                        window.currentDay = 1;

                        bookyourtravel_tours.populateAvailableTourDates(bookyourtravel_tours.refreshDatePicker);
                    },
                    beforeShowDay: function (d) {
                        var dUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

                        var selectedTime = null;

                        if ($("#tour_date").val()) {
                            selectedTime = parseInt($("#tour_date").val());
                        }

                        if (window.availableTourDates) {
                            var dateTextToCompare = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

                            if (dUtc === selectedTime) {
                                return [false, "dp-hightlight dp-highlight-selected"];
                            }
                            if ($.inArray(dateTextToCompare, window.availableTourDates) === -1) {
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
                $(".booking_form_controls_holder, .booking-commands .book-tour-proceed").hide();
                $("#booking-form-calendar .loading").parent().show();

                var selectedDate = bookyourtravel_tours.getSelectedTourDate();
                var tourDate = selectedDate.getFullYear() + "-" + (selectedDate.getMonth() + 1) + "-" + selectedDate.getDate();

                var dataObj = {
                    "action": "tour_process_booking_ajax_request",
                    "user_id": window.currentUserId,
                    "tour_id": window.tourId,
                    "adults": window.bookingRequest.adults,
                    "children": window.bookingRequest.children,
                    "extra_items": window.bookingRequest.extraItems,
                    "tour_date": tourDate,
                    "nonce": BYTAjax.nonce
                };

                $.each(window.bookingFormFields, function (ignore, field) {
                    if (field.hide !== "1") {
                        dataObj[field.id] = $("#" + field.id).val();
                        $(".confirm_" + field.id + "_p").html($("#" + field.id).val());
                    }
                });

                $(".confirm_tour_name_p").html(window.tourTitle);
                $(".confirm_tour_name_div").addClass("one-half");

                $(".confirm_adults_p").html(window.bookingRequest.adults);
                $(".confirm_children_p").html(window.bookingRequest.children);
                $(".confirm_tour_date_p").html(window.bookingRequest.selectedDate);

                if ($(".confirm_reservation_total_p").length > 0) {
                    $(".confirm_reservation_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalTourOnlyPrice));
                }
                if ($(".confirm_extra_items_total_p").length > 0) {
                    $(".confirm_extra_items_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
                }
                $(".confirm_total_price_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

                bookyourtravel_tours.hideTourBookingForm();
                bookyourtravel_tours.showTourConfirmationForm();

                $.ajax({
                    url: BYTAjax.ajaxurl,
                    data: dataObj,
                    success: function (ignore) {
                        // This outputs the result of the ajax request
                        $("div.error div p").html("");
                        $("div.error").hide();

                        $(".booking_form_controls_holder, .booking-commands .book-tour-proceed").show();
                        $("#booking-form-calendar .loading").parent().hide();
                    },
                    error: function (errorThrown) {
                        console.log(errorThrown);
                    }
                });
            }
        },
        buildRatesTable: function () {
            var selectedTime = bookyourtravel_tours.getSelectedTourTime();

            $(".price_row").show();
            $.uniform.update(".extra_item_quantity");

            $("table.booking_price_breakdown tbody").html("");

            if (selectedTime) {

                $("#booking-form-calendar .loading").parent().show();

                $(".reservation_total").html(bookyourtravel_scripts.getSmallLoaderHtml());
                $(".total_price").html(bookyourtravel_scripts.getSmallLoaderHtml());
                $(".extra_items_total").html(bookyourtravel_scripts.getSmallLoaderHtml());

                window.bookingRequest.totalPrice = 0;
                window.bookingRequest.totalTourOnlyPrice = 0;

                bookyourtravel_tours.buildRatesTableStructure();
                bookyourtravel_tours.buildRateRow(selectedTime);
            }
        },
        buildRatesTableStructure: function () {

            $("table.booking_price_breakdown thead").html("");
            $("table.booking_price_breakdown tfoot").html("");

            var colCount = 2;

            var headerRow = "";
            headerRow += "<tr class='rates_head_row'>";
            headerRow += "<th>" + window.dateLabel + "</th>";

            if (!window.tourIsPricePerGroup) {
                headerRow += "<th>" + window.adultCountLabel + "</th>";
                headerRow += "<th>" + window.pricePerAdultLabel + "</th>";
                headerRow += "<th>" + window.childCountLabel + "</th>";
                headerRow += "<th>" + window.pricePerChildLabel + "</th>";
                colCount = 6;
            }

            headerRow += "<th>" + window.pricePerDayLabel + "</th>";

            $("table.booking_price_breakdown thead").append(headerRow);

            var footerRow = "";

            footerRow += "<tr>";
            footerRow += "<th colspan='" + (colCount - 1) + "'>" + window.priceTotalLabel + "</th>";
            footerRow += "<td class='reservation_total'>" + bookyourtravel_scripts.formatPrice(0) + "</td>";
            footerRow += "</tr>";

            $("table.booking_price_breakdown tfoot").append(footerRow);
        },
        buildRateRow: function (tourTime) {
            var tourDate = bookyourtravel_scripts.convertLocalToUTC(new Date(tourTime));
            var theDate = tourDate.getFullYear() + "-" + (tourDate.getMonth() + 1) + "-" + tourDate.getDate();

            var pricePerPeriod = 0;
            var childPricePerPeriod = 0;
            var totalPricePerPeriod = 0;
            var children = window.bookingRequest.children;
            var adults = window.bookingRequest.adults;
            var tableRow = "";

            var dataObj = {
                "action": "tour_get_day_price_ajax_request",
                "tour_id": window.tourId,
                "the_date": theDate,
                "nonce": BYTAjax.nonce
            };

            $.ajax({
                url: BYTAjax.slimajaxurl,
                data: dataObj,
                success: function (data) {
                    if (data !== undefined && data !== '') {
                        var price_data = JSON.parse(data);

                        window.bookingRequest.totalPrice = 0;
                        window.bookingRequest.totalTourOnlyPrice = 0;                  

                        if (price_data && price_data.regular_price) {

                            window.bookingRequest.maxAllowedPeople = price_data.running_available_total - price_data.booked_places;
                            bookyourtravel_tours.bindTourDropDowns();

                            tableRow += "<tr>";
                            tableRow += "<td>" + $.datepicker.formatDate(window.datepickerDateFormat, tourDate) + "</td>";

                            pricePerPeriod = parseFloat(price_data.regular_price);
                            childPricePerPeriod = parseFloat(price_data.regular_price_child);

                            if (!window.tourIsPricePerGroup) {
                                tableRow += "<td>" + adults + "</td>";
                                tableRow += "<td>" + bookyourtravel_scripts.formatPrice(pricePerPeriod) + "</td>";
                                tableRow += "<td>" + window.bookingRequest.children + "</td>";
                                tableRow += "<td>" + bookyourtravel_scripts.formatPrice(childPricePerPeriod) + "</td>";
                            }

                            if (!window.tourIsPricePerGroup) {
                                totalPricePerPeriod = (pricePerPeriod * adults) + (childPricePerPeriod * children);
                            } else {
                                totalPricePerPeriod = pricePerPeriod;
                            }

                            tableRow += "<td>" + bookyourtravel_scripts.formatPrice(totalPricePerPeriod) + "</td>";

                            window.bookingRequest.totalPrice += totalPricePerPeriod;
                            window.bookingRequest.totalTourOnlyPrice += totalPricePerPeriod;

                            tableRow += "</tr>";

                            bookyourtravel_extra_items.recalculateExtraItemTotals(window.bookingRequest.totalTourOnlyPrice);

                            $("table.booking_price_breakdown tbody").append(tableRow);

                            if ($("table.booking_price_breakdown").data("tablesorter") === null || $("table.booking_price_breakdown").data("tablesorter") === undefined) {
                                $("table.booking_price_breakdown").tablesorter({
                                    debug: false,
                                    dateFormat: window.datepickerDateFormat, // "ddmmyyyy",
                                    sortList: [[0, 0]]
                                });
                            }

                            $("table.booking_price_breakdown").trigger("update");
                            $("table.booking_price_breakdown").trigger("sorton", [[[0, 0]]]);

                            $("table.responsive").trigger("updated");

                            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalTourOnlyPrice));
                            $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

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

                            bookyourtravel_tours.bindNextButton();
                            bookyourtravel_tours.bindCancelButton();

                            $("html, body").animate({
                            scrollTop: $(".price_row").first().offset().top
                            }, 500);

                            $("#booking-form-calendar .loading").parent().hide();
                            $(".booking-commands").show();
                            $(".booking-commands .book-tour-proceed").show();
                        }
                    }
                }
            });
        },
        addProductToCart: function () {

            $(".booking_form_controls_holder, .booking-commands .book-tour-proceed").hide();
            $("#booking-form-calendar .loading").parent().show();

            $("html, body").animate({
                scrollTop: $("#booking-form-calendar").offset().top - 100
            }, 500);

            var selectedDate = bookyourtravel_tours.getSelectedTourDate();
            var tourDate = selectedDate.getFullYear() + "-" + (selectedDate.getMonth() + 1) + "-" + selectedDate.getDate();

            var dataObj = {
                "action": "tour_booking_add_to_cart_ajax_request",
                "user_id": window.currentUserId,
                "tour_id": window.tourId,
                "adults": window.bookingRequest.adults,
                "children": window.bookingRequest.children,
                "extra_items": window.bookingRequest.extraItems,
                "tour_date": tourDate,
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
        getSelectedTourTime: function () {
            if ($("#tour_date").val()) {
                return parseInt($("#tour_date").val());
            }
            return null;
        },
        getSelectedTourDate: function () {
            if ($("#tour_date").val()) {
                return bookyourtravel_scripts.convertLocalToUTC(new Date(parseInt($("#tour_date").val())));
            }
            return null;
        },
        selectTourDate: function (time, dateText) {

            bookyourtravel_tours.initBookingRequestObject();

            $("div.error.step1-error div p").html("");
            $("div.error.step1-error").hide();
            $(".price_breakdown").show();
            $("table.booking_price_breakdown tbody").html("");

            $(".dates_row").show();
            $(".price_row").show();
            $(".deposits_row").hide();

            $("#tour_date").val(time);
            $("#tour_date_span").html(dateText);
            $("#duration_days_span").html(window.tourDurationDays);
            $("#duration_days").val(window.tourDurationDays);

            window.bookingRequest.selectedTime = time;
            window.bookingRequest.selectedDate = dateText;

            bookyourtravel_extra_items.bindRequiredExtraItems();
            bookyourtravel_tours.buildRatesTable();
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
