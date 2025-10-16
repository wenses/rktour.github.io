/*jslint browser: true*/ /*jslint for:true */ /*global bookyourtravel_scripts*/
/*global bookyourtravel_extra_items*/ /*global jQuery*/ /*jslint this:true */
/*global window*/ /*global BYTAjax*/ /*global console*/ /*jslint long:true */

(function ($) {

    "use strict";

    var bookyourtravel_car_rentals;

    $(document).ready(function () {
        bookyourtravel_car_rentals.init();
    });

    bookyourtravel_car_rentals = {

        init: function () {

            if ($(".car_rental-booking-form-calendar .booking_form_controls_holder").length > 0) {
                bookyourtravel_car_rentals.initBookingRequestObject();
                bookyourtravel_car_rentals.initBookingFormControls();

                $("table.booking_price_breakdown thead").html("");
                $("table.booking_price_breakdown tfoot").html("");

                var headerRow = "";
                headerRow += "<tr class='rates_head_row'>";
                headerRow += "<th>" + window.dateLabel + "</th>";
                headerRow += "<th>" + window.pricePerDayLabel + "</th>";
                headerRow += "</tr>";

                $("table.booking_price_breakdown thead").append(headerRow);

                var footerRow = "";
                footerRow += "<tr>";
                footerRow += "<th colspan='1'>" + window.priceTotalLabel + "</th>";
                footerRow += "<td class='reservation_total'>" + bookyourtravel_scripts.formatPrice(0) + "</td>";
                footerRow += "</tr>";

                $("table.booking_price_breakdown tfoot").append(footerRow);

                $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
                $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));
                $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCarRentalOnlyPrice));

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

                if (window.carRentalIsReservationOnly || !window.useWoocommerceForCheckout) {

                    $("#car_rental-booking-form").validate({
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

                                $("#car_rental-booking-form div.error-summary div p").html(message);
                                $("#car_rental-booking-form div.error-summary").show();
                            } else {
                                $("#car_rental-booking-form div.error-summary").hide();
                                $(".error").hide();
                            }

                            $(".booking-section").animate({
                                scrollTop: $("#car_rental-booking-form div.error-summary").offset().top - 100
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
                            bookyourtravel_car_rentals.processBooking();
                        }
                    });

                    if ($("#car_rental-booking-form input[name='agree_gdpr']").length > 0) {
                      $("#car_rental-booking-form input[name='agree_gdpr']").rules("add", {
                          required: true,
                          messages: {
                              required: window.gdprError
                          }
                      });
                    }

                    $("#submit-car_rental-booking").on('click', function (e) {
                        e.preventDefault();
                        if ($("#car_rental-booking-form").valid()) {
                            $("#car_rental-booking-form").submit();
                        }
                    });

                    $.each(window.bookingFormFields, function (ignore, field) {

                        if (field.hide !== "1" && field.id !== null && field.id.length > 0) {
                            var $input = null;
                            if (field.type === "text" || field.type === "email") {
                                $input = $("#car_rental-booking-form").find("input[name=" + field.id + "]");
                            } else if (field.type === "textarea") {
                                $input = $("#car_rental-booking-form").find("textarea[name=" + field.id + "]");
                            } else if (field.type === "checkbox") {
                                $input = $("#car_rental-booking-form").find("input[name=" + field.id + "]");
                            } else if (field.type === "select") {
                                $input = $("#car_rental-booking-form").find("select[name=" + field.id + "]");
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

                bookyourtravel_car_rentals.bindResetButton();
                bookyourtravel_car_rentals.bindNextButton();
                bookyourtravel_car_rentals.bindCancelButton();

                if (window.enableExtraItems) {
                    bookyourtravel_extra_items.bindExtraItemsQuantitySelect();
                    bookyourtravel_extra_items.buildExtraItemsTable();
                }

                $(".booking_form_controls_holder").hide();

                bookyourtravel_car_rentals.bindLocationsSelect();
            }

            if ($("[data-car-rental-id]").length > 0) {
                bookyourtravel_car_rentals.populateCarRentalPrices();
            }

            if ($("[data-location-id]").length > 0 && $("[data-min-price-type='car_rental']").length > 0) {
                bookyourtravel_scripts.populateLocationPrices("car_rental");
            }
        },
        initBookingRequestObject: function () {
            if (!window.bookingRequest || window.bookingRequest === undefined || window.bookingRequest.length === 0) {
                window.bookingRequest = {};
            }
            window.bookingRequest.extraItems = {};
            window.bookingRequest.people = 1;
            window.bookingRequest.units = 1;
            window.bookingRequest.extraItemsTotalPrice = 0;
            window.bookingRequest.totalCarRentalOnlyPrice = 0;
            window.bookingRequest.totalPrice = 0;
            window.bookingRequest.totalDays = 1;
            window.bookingRequest.selectedDateFrom = null;
            window.bookingRequest.selectedDateTo = null;
        },
        initBookingFormControls: function () {
            $("#selected_date_from").val("");
            $("#selected_date_to").val("");
            $(".extra_item_quantity").val("0");
            $("#start_date_span").html("");
            $("#start_date").val("");
            $("#end_date_span").html("");
            $("#end_date").val("");
            $(".dates_row").hide();
            $(".price_row").hide();
            $(".booking-commands").hide();
            $("table.booking_price_breakdown tbody").html("");

            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCarRentalOnlyPrice));
            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));
            $(".confirm_total_price_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $("table.extra_items_price_breakdown tbody").html("");

        },
        populateCarRentalPrices: function () {
            if ($("[data-car-rental-id]").length > 0) {
                var carRentalItems = $("[data-car-rental-id]");
                $.each(carRentalItems, function () {
                    if (!$(this).hasClass('skip-ajax-call')) {
                        var carRentalId = parseInt($(this).data("car-rental-id"));
                        var price = 0;

                        if ($("[data-car-rental-id='" + carRentalId + "'] .price .amount").length > 0) {
                            $("[data-car-rental-id='" + carRentalId + "'] .price .amount").html("");
                            $("[data-car-rental-id='" + carRentalId + "'] .price .curr").html("");

                            var dataObj = {
                                "action": "car_rental_load_min_price_ajax_request",
                                "start_date": window.requestedDateFrom,
                                "end_date": window.requestedDateTo,
                                "car_rental_id": carRentalId,
                                "nonce": BYTAjax.nonce
                            };

                            $.ajaxQueue({
                                url: BYTAjax.slimajaxurl,
                                data: dataObj,
                                success: function (data) {
                                    if (data !== undefined && data !== '') {
                                        price = JSON.parse(data);
                                        $("[data-car-rental-id='" + carRentalId + "'] .item_price").show();
                                        $("[data-car-rental-id='" + carRentalId + "'] .price .curr").html(window.currencySymbol);
                                        $("[data-car-rental-id='" + carRentalId + "'] .price .amount").html(bookyourtravel_scripts.formatPriceOnly(price));
                                    } else {
                                        $("[data-car-rental-id='" + carRentalId + "'] .item_price").hide();
                                    }
                                },
                                error: function (errorThrown) {
                                    console.log(errorThrown);
                                }
                            },
                            'carrentals');
                        }
                    }
                });
            }
        },
        checkPreselectedStartDateAndPopulateAccordingly: function () {
            if (window.bookingRequest.requestedDateFrom) {
                var dateFrom = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.requestedDateFrom));
                var dateToCheck = (dateFrom.getFullYear() + "-" + ("0" + (dateFrom.getMonth() + 1)).slice(-2) + "-" + ("0" + dateFrom.getDate()).slice(-2));

                var found = $.inArray(dateToCheck, window.carRentalAvailableStartDates);

                if (found > -1) {
                    var timeFrom = Date.UTC(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
                    bookyourtravel_car_rentals.bindCarRentalDatePicker();
                    bookyourtravel_car_rentals.selectDateFrom(timeFrom, window.bookingRequest.requestedDateFrom, true, true);
                }
            }

            $("#booking-form-calendar .loading").parent().hide();
            $(".booking_form_controls_holder").show();
            bookyourtravel_car_rentals.bindCarRentalDatePicker();
        },
        checkPreselectedEndDateAndPopulateAccordingly: function () {
            if (window.bookingRequest.requestedDateTo) {
                var dateTo = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.requestedDateTo));
                var dateToCheck = (dateTo.getFullYear() + "-" + ("0" + (dateTo.getMonth() + 1)).slice(-2) + "-" + ("0" + dateTo.getDate()).slice(-2));

                var found = $.inArray(dateToCheck, window.carRentalAvailableEndDates);

                if (found > -1) {
                    var totalDays = bookyourtravel_scripts.calculateDifferenceInDays(bookyourtravel_car_rentals.getSelectedDateFrom(), dateTo);

                    if (totalDays < window.carRentalMinBookingDays) {
                        // missed allowed minimum days stay
                    } else if (window.carRentalMaxBookingDays > 0 && totalDays > window.carRentalMaxBookingDays) {
                        // missed allow maximum days stay
                    } else {
                        var timeTo = Date.UTC(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate());
                        bookyourtravel_car_rentals.selectDateTo(timeTo, window.bookingRequest.requestedDateTo);
                    }
                }
            }

            bookyourtravel_car_rentals.refreshDatePicker();

            $("#booking-form-calendar .loading").parent().hide();
            $(".booking_form_controls_holder").show();
        },
        bindLocationsSelect: function () {
            $(".book-car_rental-location-from, .book-car_rental-location-to").off("change");
            $(".book-car_rental-location-from, .book-car_rental-location-to").on("change", function (ignore) {
                bookyourtravel_car_rentals.locationSelectUpdate();
            });

            if (window.bookingRequest && window.bookingRequest.requestedLocationFrom) {
              $("#book-car_rental-location-from").val(window.bookingRequest.requestedLocationFrom);
              bookyourtravel_car_rentals.locationSelectUpdate();
            }

            if (window.bookingRequest && window.bookingRequest.requestedLocationTo) {
              $("#book-car_rental-location-to").val(window.bookingRequest.requestedLocationTo);
              bookyourtravel_car_rentals.locationSelectUpdate();
            }
        },
        locationSelectUpdate: function() {

          $.uniform.update();

          window.carRentalPickUp = $(".book-car_rental-location-from option:selected").text();
          window.carRentalPickUpId = parseInt($(".book-car_rental-location-from option:selected").val());
          window.carRentalDropOff = $(".book-car_rental-location-to option:selected").text();
          window.carRentalDropOffId = parseInt($(".book-car_rental-location-to option:selected").val());

          if (window.carRentalPickUpId > 0 && window.carRentalDropOffId > 0) {
              bookyourtravel_car_rentals.resetTheForm(true);
              $("#booking-form-calendar .loading").parent().show();
              $(".booking_form_controls_holder").hide();

              bookyourtravel_car_rentals.populateAvailableStartDates(bookyourtravel_car_rentals.checkPreselectedStartDateAndPopulateAccordingly, true, true);
          } else {
              bookyourtravel_car_rentals.resetTheForm(false);
              $(".booking_form_controls_holder").hide();
          }
        },
        bindNextButton: function () {

            $(".book-car_rental-proceed").unbind("click");
            $(".book-car_rental-proceed").on("click", function (event) {

                if (!window.carRentalIsReservationOnly && window.useWoocommerceForCheckout) {

                    bookyourtravel_car_rentals.addProductToCart();

                } else {

                    $("#booking-form-calendar .loading").parent().show();

                    bookyourtravel_car_rentals.showCarRentalBookingForm();

                    $("#booking-form-calendar .loading").parent().hide();
                }

                event.preventDefault();
            });
        },
        resetTheForm: function (doScroll) {

            if (doScroll) {
                $("html, body").animate({
                    scrollTop: $("#booking-form-calendar").offset().top
                }, 500);
            }

            $(".booking_form_datepicker").hide();

            if (window.bookingRequest.selectedTimeFrom && window.bookingRequest.selectedTimeFrom > 0) {
                delete window.bookingRequest;
            }

            bookyourtravel_car_rentals.initBookingRequestObject();
            bookyourtravel_car_rentals.initBookingFormControls();

            bookyourtravel_car_rentals.refreshDatePicker();
        },
        bindResetButton: function () {

            $(".book-car_rental-reset").unbind("click");
            $(".book-car_rental-reset").on("click", function (event) {
                event.preventDefault();
                bookyourtravel_car_rentals.resetTheForm(true);
            });
        },
        bindCancelButton: function () {
            $("#cancel-car_rental-booking, .close-btn").unbind("click");
            $("#cancel-car_rental-booking, .close-btn").on("click", function (event) {
                $(".modal").hide();
                bookyourtravel_car_rentals.hideCarRentalBookingForm();
                bookyourtravel_car_rentals.showCarRentalScreen();
                bookyourtravel_car_rentals.resetTheForm();
                $("#car_rental-booking-form .error-summary").hide();
                $("#car_rental-booking-form label.error").hide();
                $("#car_rental-booking-form input.error").removeClass("error");
                $("#car_rental-booking-form input, #car_rental-booking-form textarea").val("");

                event.preventDefault();
            });
        },
        showCarRentalScreen: function () {
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
        showCarRentalBookingForm: function () {

            $("body").addClass("modal-open");

            $(".booking_form_pick_up_p").html(window.carRentalPickUp);
            $(".booking_form_drop_off_p").html(window.carRentalDropOff);
            $(".booking_form_car_name_p").html(window.carRentalTitle);
            $(".booking_form_car_type_p").html(window.carRentalCarType);
            $(".booking_form_date_from_p").html(window.bookingRequest.selectedDateFrom);
            $(".booking_form_date_to_p").html(window.bookingRequest.selectedDateTo);
            $(".booking_form_reservation_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCarRentalOnlyPrice));
            $(".booking_form_extra_items_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".booking_form_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

            $(".section-" + window.postType + "-content").hide();

            $(".car_rental-booking-section").show();

            if (!window.carRentalIsReservationOnly && window.useWoocommerceForCheckout) {
                $("html, body").animate({
                    scrollTop: $("#booking-form-calendar").offset().top
                }, 500);
            }
        },
        hideCarRentalBookingForm: function () {
            $("body").removeClass("modal-open");
            $(".car_rental-booking-section").hide();
        },
        showCarRentalConfirmationForm: function () {
            $(".car_rental-confirmation-section").show();
        },
        bindCarRentalDatePicker: function () {
            if (window.minCarRentalDate instanceof Date) {
                var firstDayOfMonth = new Date(window.minCarRentalDate.getFullYear(), window.minCarRentalDate.getMonth(), 1);
                window.minCarRentalDate = firstDayOfMonth;
            }

            if ($(".booking_form_datepicker") !== undefined) {
                $(".booking_form_datepicker").datepicker("destroy");
                $(".booking_form_datepicker").datepicker({
                    dateFormat: window.datepickerDateFormat,
                    numberOfMonths: [window.calendarMonthRows, window.calendarMonthCols],
                    minDate: window.minCarRentalDate,
                    onSelect: function (dateText, inst) {
                        var selectedTime = Date.UTC(inst.currentYear, inst.currentMonth, inst.currentDay);
                        var selectedDate = bookyourtravel_scripts.convertLocalToUTC(new Date(selectedTime));
                        var selectedDateFrom = bookyourtravel_car_rentals.getSelectedDateFrom();
                        var selectedDateTo = bookyourtravel_car_rentals.getSelectedDateTo();
                        var dateTest = true;

                        if (!selectedDateFrom || selectedDateTo || (selectedDate < selectedDateFrom) || (selectedDateFrom.toString() === selectedDate.toString())) {
                            bookyourtravel_car_rentals.selectDateFrom(selectedTime, dateText);
                        } else {

                            var dateFrom = selectedDateFrom;
                            dateFrom.setDate(dateFrom.getDate() + 1);
                            var d = dateFrom;
                            var dateToCheck = "";
                            var datesArray = window.carRentalAvailableEndDates;
                            for (d = dateFrom; d <= selectedDate; d.setDate(d.getDate() + 1)) {
                                dateToCheck = (d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2));
                                if ($.inArray(dateToCheck, datesArray) === -1) {
                                    dateTest = false;
                                    break;
                                }
                            }

                            if (!dateTest) {
                                bookyourtravel_car_rentals.selectDateFrom(selectedTime, dateText);
                            } else {
                                var totalDays = bookyourtravel_scripts.calculateDifferenceInDays(bookyourtravel_car_rentals.getSelectedDateFrom(), selectedDate);
 
                                $("div.error.step1-error").hide();

                                if (totalDays < window.carRentalMinBookingDays) {
                                    $("div.error.step1-error div p").html(window.minBookingDaysError);
                                    $("div.error.step1-error").show();
                                } else if (window.carRentalMaxBookingDays > 0 && totalDays > window.carRentalMaxBookingDays) {
                                    $("div.error.step1-error div p").html(window.maxBookingDaysError);
                                    $("div.error.step1-error").show();
                                } else {
                                    $("div.error.step1-error div p").html("");
                                    $("div.error.step1-error").hide();
                                    bookyourtravel_car_rentals.selectDateTo(selectedTime, dateText);
                                }
                            }
                        }
                    },
                    onChangeMonthYear: function (year, month, ignore) {

                        window.currentMonth = month;
                        window.currentYear = year;
                        window.currentDay = 1;

                        var selectedDateFrom = bookyourtravel_car_rentals.getSelectedDateFrom();

                        bookyourtravel_car_rentals.populateAvailableStartDates(bookyourtravel_car_rentals.refreshDatePicker);

                        if (selectedDateFrom) {
                            bookyourtravel_car_rentals.populateAvailableEndDates(bookyourtravel_car_rentals.refreshDatePicker);
                        }
                    },
                    beforeShowDay: function (d) {

                        // var dUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
                        var tUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()).valueOf();
                        var today = new Date();
                        var todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
                        var selectedTimeFrom = bookyourtravel_car_rentals.getSelectedTimeFrom();
                        var selectedTimeTo = bookyourtravel_car_rentals.getSelectedTimeTo();
                        var startOfSegment = false;
                        var endOfSegment = false;
                        var dayBefore = new Date(d);
                        dayBefore.setDate(d.getDate() - 1);
                        var dayAfter = new Date(d);
                        dayAfter.setDate(d.getDate() + 1);

                        var dayBeforeTextForCompare = dayBefore.getFullYear() + "-" + ("0" + (dayBefore.getMonth() + 1)).slice(-2) + "-" + ("0" + dayBefore.getDate()).slice(-2);
                        var dayAfterTextForCompare = dayAfter.getFullYear() + "-" + ("0" + (dayAfter.getMonth() + 1)).slice(-2) + "-" + ("0" + dayAfter.getDate()).slice(-2);
                        var dateTextForCompare = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

                        // if current date is available
                        if ($.inArray(dateTextForCompare, window.carRentalAvailableStartDates) > -1) {
                            if ($.inArray(dayBeforeTextForCompare, window.carRentalAvailableStartDates) === -1) {
                                // and the date before it was not available
                                startOfSegment = true;
                            }
                        } else {
                            if ($.inArray(dayBeforeTextForCompare, window.carRentalAvailableStartDates) > -1) {
                                // and date after is available
                                endOfSegment = true;
                            }
                        }

                        if (!selectedTimeFrom) {

                            if (window.carRentalAvailableStartDates) {

                                dateTextForCompare = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

                                if ($.inArray(dateTextForCompare, window.carRentalAvailableStartDates) === -1) {
                                    if (endOfSegment) {
                                        return [false, "dp-highlight dp-highlight-end-date"];
                                    } else {
                                        return [false, "ui-datepicker-unselectable ui-state-disabled"];
                                    }
                                } else if (todayUtc.valueOf() < tUtc && $.inArray(dateTextForCompare, window.carRentalAvailableStartDates) > -1) {
                                    if (startOfSegment) {
                                        return [true, "dp-highlight dp-highlight-start-date"];
                                    } else {
                                        return [true, "dp-highlight"];
                                    }
                                } else {
                                    return [false, ""];
                                }
                            }
                        } else if (!selectedTimeTo) {
                            endOfSegment = false;

                            if (window.carRentalAvailableEndDates) {

                                if ($.inArray(dayAfterTextForCompare, window.carRentalAvailableEndDates) === -1) {
                                    // and date after is not available
                                    endOfSegment = true;
                                }

                                dateTextForCompare = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

                                if (selectedTimeFrom && tUtc === selectedTimeFrom) {
                                    return [false, "dp-highlight dp-highlight-selected dp-highlight-start-date"];
                                } else if ($.inArray(dateTextForCompare, window.carRentalAvailableEndDates) === -1) {
                                    return [false, "ui-datepicker-unselectable ui-state-disabled"];
                                } else if (todayUtc.valueOf() < tUtc && $.inArray(dateTextForCompare, window.carRentalAvailableEndDates) > -1) {
                                    if (startOfSegment) {
                                        return [true, "dp-highlight dp-highlight-start-date"];
                                    } else if (endOfSegment) {
                                        return [true, "dp-highlight dp-highlight-end-date"];
                                    } else {
                                        return [true, "dp-highlight"];
                                    }
                                } else {
                                    return [false, ""];
                                }
                            }
                        } else if (selectedTimeFrom && selectedTimeTo) {

                            if (tUtc === selectedTimeFrom) {
                                return [false, "dp-highlight dp-highlight-selected dp-highlight-start-date"];
                            } else if (tUtc === selectedTimeTo) {
                                return [false, "dp-highlight dp-highlight-selected dp-highlight-end-date"];
                            } else if (selectedTimeFrom && ((tUtc === selectedTimeFrom) || (selectedTimeTo && tUtc >= selectedTimeFrom && tUtc <= selectedTimeTo))) {
                                return [false, "dp-highlight dp-highlight-selected"];
                            } else {
                                return [false, ""];
                            }
                        } else {
                            return [true, (
                                (selectedTimeFrom && ((tUtc === selectedTimeFrom) || (selectedTimeTo && tUtc >= selectedTimeFrom && tUtc <= selectedTimeTo)))
                                ? "dp-highlight"
                                : ""
                            )];
                        }

                        return [false, ""];
                    }
                });
            }

        },
        processBooking: function () {

            if (window.bookingRequest !== undefined) {

                $(".booking_form_controls_holder, .booking-commands .book-car_rental-proceed").hide();
                $("#booking-form-calendar .loading").parent().show();

                var selectedDateFrom = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.selectedTimeFrom));
                var selectedDateTo = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.selectedTimeTo));
                var dateFrom = selectedDateFrom.getFullYear() + "-" + (selectedDateFrom.getMonth() + 1) + "-" + selectedDateFrom.getDate();
                var dateTo = selectedDateTo.getFullYear() + "-" + (selectedDateTo.getMonth() + 1) + "-" + selectedDateTo.getDate();

                var dataObj = {
                    "action": "car_rental_process_booking_ajax_request",
                    "user_id": window.currentUserId,
                    "car_rental_id": window.carRentalId,
                    "car_rental_pick_up_id": window.carRentalPickUpId,
                    "car_rental_drop_off_id": window.carRentalDropOffId,
                    "extra_items": window.bookingRequest.extraItems,
                    "people": window.bookingRequest.people,
                    "date_from": dateFrom,
                    "date_to": dateTo,
                    "nonce": BYTAjax.nonce
                };

                $.each(window.bookingFormFields, function (ignore, field) {
                    if (field.hide !== "1") {
                        dataObj[field.id] = $("#" + field.id).val();
                        $(".confirm_" + field.id + "_p").html($("#" + field.id).val());
                    }
                });

                $(".confirm_pick_up_p").html(window.carRentalPickUp);
                $(".confirm_drop_off_p").html(window.carRentalDropOff);
                $(".confirm_car_rental_name_p").html(window.carRentalTitle);
                $(".confirm_car_rental_type_p").html(window.carRentalCarType);
                $(".confirm_date_from_p").html(window.bookingRequest.selectedDateFrom);
                $(".confirm_date_to_p").html(window.bookingRequest.selectedDateTo);
                if ($(".confirm_reservation_total_p").length > 0) {
                    $(".confirm_reservation_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCarRentalOnlyPrice));
                }
                if ($(".confirm_extra_items_total_p").length > 0) {
                    $(".confirm_extra_items_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
                }
                $(".confirm_total_price_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

                bookyourtravel_car_rentals.hideCarRentalBookingForm();
                bookyourtravel_car_rentals.showCarRentalConfirmationForm();

                $.ajax({
                    url: BYTAjax.ajaxurl,
                    data: dataObj,
                    success: function (ignore) {

                        // This outputs the result of the ajax request
                        $("div.error div p").html("");
                        $("div.error").hide();

                        $(".booking_form_controls_holder, .booking-commands .book-car_rental-proceed").show();
                        $("#booking-form-calendar .loading").parent().hide();
                    },
                    error: function (errorThrown) {
                        console.log(errorThrown);
                    }
                });
            }
        },
        buildRatesTable: function () {

            var selectedTimeFrom = bookyourtravel_car_rentals.getSelectedTimeFrom();
            var selectedTimeTo = bookyourtravel_car_rentals.getSelectedTimeTo();

            $(".price_row").show();
            // $.uniform.update(".extra_item_quantity");

            $("table.booking_price_breakdown tbody").html("");

            if (selectedTimeFrom && selectedTimeTo) {

                $("#booking-form-calendar .loading").parent().show();

                window.bookingRequest.totalPrice = 0;
                window.bookingRequest.totalCarRentalOnlyPrice = 0;

                var runningTotals = {
                    index: 0,
                    totalPrice: 0,
                    totalCarRentalOnlyPrice: 0
                };

                $(".reservation_total").html(bookyourtravel_scripts.getSmallLoaderHtml());
                $(".total_price").html(bookyourtravel_scripts.getSmallLoaderHtml());
                $(".extra_items_total").html(bookyourtravel_scripts.getSmallLoaderHtml());

                var selectedTempDate = null;
                while (selectedTimeFrom < selectedTimeTo) {
                    bookyourtravel_car_rentals.buildRateRow(selectedTimeFrom, runningTotals);
                    selectedTempDate = new Date(selectedTimeFrom);
                    selectedTempDate.setDate(selectedTempDate.getDate() + 1);
                    selectedTimeFrom = selectedTempDate.valueOf();
                }
            }
        },
        buildRateRow: function (fromTime, runningTotals) {

            var dateFrom = bookyourtravel_scripts.convertLocalToUTC(new Date(fromTime));
            var theDate = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
            var tableRow = "";
            var pricePerDay = 0;

            var dataObj = {
                "action": "car_rental_get_day_price_ajax_request",
                "car_rental_id": window.carRentalId,
                "car_rental_pick_up_id": window.carRentalPickUpId,
                "the_date": theDate,
                "nonce": BYTAjax.nonce
            };

            $.ajax({
                url: BYTAjax.slimajaxurl,
                data: dataObj,
                success: function (data) {
                    if (data !== undefined && data !== '') {
                        var price_data = JSON.parse(data);

                        if (price_data && price_data.price_per_day) {

                            pricePerDay = parseFloat(price_data.price_per_day);

                            // This outputs the result of the ajax request
                            runningTotals.index += 1;

                            tableRow += "<tr>";
                            tableRow += "<td>" + $.datepicker.formatDate(window.datepickerDateFormat, dateFrom) + "</td>";

                            runningTotals.totalPrice += pricePerDay;
                            runningTotals.totalCarRentalOnlyPrice += pricePerDay;

                            tableRow += "<td>" + bookyourtravel_scripts.formatPrice(pricePerDay) + "</td>";

                            tableRow += "</tr>";

                            $("table.booking_price_breakdown tbody").append(tableRow);

                            if (runningTotals.index === window.bookingRequest.totalDays) {

                                window.bookingRequest.totalPrice = runningTotals.totalPrice;
                                window.bookingRequest.totalCarRentalOnlyPrice = runningTotals.totalCarRentalOnlyPrice;

                                bookyourtravel_extra_items.recalculateExtraItemTotals(window.bookingRequest.totalCarRentalOnlyPrice);

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

                                $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalCarRentalOnlyPrice));
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

                                $(".booking-commands .book-car_rental-proceed").show();

                                bookyourtravel_car_rentals.bindNextButton();
                                bookyourtravel_car_rentals.bindCancelButton();

                                $("html, body").animate({
                                // scrollTop: $(".summary").offset().top
                                scrollTop: $(".calendar").offset().top
                                }, 500);

                                $("#booking-form-calendar .loading").parent().hide();
                            }
                        }
                    }
                },
                error: function (errorThrown) {
                    console.log(errorThrown);
                }
            });
        },
        addProductToCart: function () {

            $(".booking_form_controls_holder, .booking-commands .book-car_rental-proceed").hide();
            $("#booking-form-calendar .loading").parent().show();

            $("html, body").animate({
                scrollTop: $("#booking-form-calendar").offset().top - 100
            }, 500);

            var selectedDateFrom = bookyourtravel_car_rentals.getSelectedDateFrom();
            var selectedDateTo = bookyourtravel_car_rentals.getSelectedDateTo();
            var dateFrom = selectedDateFrom.getFullYear() + "-" + (selectedDateFrom.getMonth() + 1) + "-" + selectedDateFrom.getDate();
            var dateTo = selectedDateTo.getFullYear() + "-" + (selectedDateTo.getMonth() + 1) + "-" + selectedDateTo.getDate();

            window.bookingRequest.people = 1;

            var dataObj = {
                "action": "car_rental_booking_add_to_cart_ajax_request",
                "user_id": window.currentUserId,
                "car_rental_id": window.carRentalId,
                "car_rental_pick_up_id": window.carRentalPickUpId,
                "car_rental_drop_off_id": window.carRentalDropOffId,
                "extra_items": window.bookingRequest.extraItems,
                "date_from": dateFrom,
                "date_to": dateTo,
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
        selectDateFrom: function (time, dateFrom, skipLoaderStart, skipLoaderEnd) {

            bookyourtravel_car_rentals.initBookingRequestObject();

            window.bookingRequest.selectedTimeFrom = time;
            window.bookingRequest.selectedDateFrom = dateFrom;

            $("#selected_date_from").val(time);
            $("#selected_date_to").val(null);
            $(".date_from_text").html(dateFrom);
            $(".date_to_text").html(window.defaultDateToText);

            $(".booking-commands").show();
            $(".booking-commands .book-car_rental-reset").show();
            $(".booking-commands .book-car_rental-proceed").hide();

            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(0));
            $(".total_price").html(bookyourtravel_scripts.formatPrice(0));
            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(0));

            $(".dates_row").show();
            $(".price_row").hide();
            $(".deposits_row").hide();

            bookyourtravel_car_rentals.populateAvailableEndDates(bookyourtravel_car_rentals.checkPreselectedEndDateAndPopulateAccordingly, skipLoaderStart, skipLoaderEnd);
        },
        selectDateTo: function (time, dateTo) {
            $("div.error.step1_error div p").html("");
            $("div.error.step1_error").hide();
            $(".price_breakdown").show();
            $("table.booking_price_breakdown tbody").html("");

            window.bookingRequest.selectedTimeTo = time;
            window.bookingRequest.selectedDateTo = dateTo;
            $(".date_to_text").html(dateTo);
            $("#selected_date_to").val(time);

            var selectedDateFrom = bookyourtravel_car_rentals.getSelectedDateFrom();
            var selectedDateTo = bookyourtravel_car_rentals.getSelectedDateTo();

            var totalDays = bookyourtravel_scripts.calculateDifferenceInDays(selectedDateFrom, selectedDateTo);
            window.bookingRequest.totalDays = totalDays;

            bookyourtravel_extra_items.bindRequiredExtraItems();
            bookyourtravel_car_rentals.buildRatesTable();
        },
        populateAvailableStartDates: function (callDelegate, skipLoaderStart, skipLoaderEnd) {

            if (!skipLoaderStart) {
                $("#booking-form-calendar .loading").parent().show();
                $(".booking_form_controls_holder").hide();
            }

            var dataObj = {
                "action": "car_rental_available_start_dates_ajax_request",
                "car_rental_id": window.carRentalId,
                "car_rental_pick_up_id": window.carRentalPickUpId,
                "month": window.currentMonth,
                "year": window.currentYear,
                "month_range": window.calendarMonthRows * window.calendarMonthCols,
                "nonce": BYTAjax.nonce
            };

            $.ajax({
                url: BYTAjax.slimajaxurl,
                data: dataObj,
                success: function (data) {
                    if (data !== undefined && data !== '') {
                        delete window.carRentalAvailableStartDates;
                        window.carRentalAvailableStartDates = JSON.parse(data);

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
        populateAvailableEndDates: function (callDelegate, skipLoaderStart, skipLoaderEnd) {

            if (!skipLoaderStart) {
                $(".booking_form_controls_holder").hide();
                $("#booking-form-calendar .loading").parent().show();
            }

            var startDate = bookyourtravel_car_rentals.getSelectedDateFrom();

            if (window.minCarRentalDate > 0 && window.minCarRentalDate > startDate) {
                startDate = window.minCarRentalDate;
            }             

            var dataObj = {
                "action": "car_rental_available_end_dates_ajax_request",
                "car_rental_id": window.carRentalId,
                "car_rental_pick_up_id": window.carRentalPickUpId,
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
                        delete window.carRentalAvailableEndDates;
                        window.carRentalAvailableEndDates = JSON.parse(data);

                        if (callDelegate !== undefined) {
                            callDelegate();
                        }

                        if (!skipLoaderEnd) {
                            $("#booking-form-calendar .loading").parent().hide();
                            $(".booking_form_controls_holder").show();
                        }
                    }
                },
                error: function (errorThrown) {
                    console.log(errorThrown);
                }
            });
        },
        getSelectedDateFrom: function () {
            if ($("#selected_date_from").val()) {
                return bookyourtravel_scripts.convertLocalToUTC(new Date(parseInt($("#selected_date_from").val())));
            }
            return null;
        },
        getSelectedDateTo: function () {
            if ($("#selected_date_to").val()) {
                return bookyourtravel_scripts.convertLocalToUTC(new Date(parseInt($("#selected_date_to").val())));
            }
            return null;
        },
        getSelectedTimeFrom: function () {
            if ($("#selected_date_from").val()) {
                return parseInt($("#selected_date_from").val());
            }
            return null;
        },
        getSelectedTimeTo: function () {
            if ($("#selected_date_to").val()) {
                return parseInt($("#selected_date_to").val());
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
