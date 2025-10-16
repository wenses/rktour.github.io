/*jslint browser: true*/ /*jslint for:true*/ /*global bookyourtravel_scripts*/
/*global bookyourtravel_extra_items*/ /*global jQuery*/ /*jslint this:true*/
/*global window*/ /*global BYTAjax*/ /*global console*/ /*jslint long:true*/

(function ($) {

    "use strict";

    var bookyourtravel_accommodations;

    $(document).ready(function () {
        bookyourtravel_accommodations.init();
    });

    bookyourtravel_accommodations = {
        init: function () {
            if ($(".booking_form_controls_holder").length > 0) {
                if (window.accommodationDisabledRoomTypes) {
                    bookyourtravel_accommodations.initBookingRequestObject();
                    bookyourtravel_accommodations.initBookingFormControls();
                    bookyourtravel_accommodations.prepareBookingScreen();
                } else {
                    $(".more-information").slideUp();
                    $(".more-info-accommodation").on('click', function (e) {
                        var moreInformationDiv = $(this).closest("li").find(".more-information");
                        var txt = (
                            moreInformationDiv.is(":visible")
                            ? window.moreInfoText
                            : window.lessInfoText
                        );
                        $(this).text(txt);
                        moreInformationDiv.stop(true, true).slideToggle("slow");
                        e.preventDefault();
                    });

                    $("a[rel^='prettyPhoto']").prettyPhoto({animation_speed: "normal", theme: "light_square"});

                    $(".book-accommodation-select-dates").unbind("click");
                    $(".book-accommodation-select-dates").on("click", function (e) {

                        $("#booking-form-calendar .loading").parent().show();

                        var roomTypeId = $(this).attr("id").replace("book-accommodation-", "");
                        window.roomTypeId = roomTypeId;
                        window.bookingRequest.roomTypeId = roomTypeId;
                        window.bookingRequest.roomTypeTitle = $("li#room_type_" + roomTypeId + " .room_type h3").html();

                        if (window.bookingRequest !== undefined) {
                            bookyourtravel_accommodations.destroyAccommodationDatePicker();
                        }

                        bookyourtravel_accommodations.resetTheForm(true);

                        $(".book-accommodation-select-dates").show(); // show select buttons
                        $(this).hide(); // hide this (current) one

                        $(".accommodation_calendar").appendTo($("#room_type_" + window.bookingRequest.roomTypeId + " .booking_form_controls"));

                        $("#room_type_" + window.bookingRequest.roomTypeId + " .booking_form_controls").show();
                        $(".accommodation_calendar").show();

                        bookyourtravel_accommodations.prepareBookingScreen();

                        $("html, body").animate({
                            scrollTop: $("#booking-form-calendar").offset().top - 100
                        }, 500);                        

                        e.preventDefault();
                    });
                }
            }

            if ($("[data-accommodation-id]").length > 0) {
                bookyourtravel_accommodations.populateAccommodationPrices();
            }

            if ($("[data-location-id]").length > 0 && $("[data-min-price-type='accommodation']").length > 0) {
                bookyourtravel_scripts.populateLocationPrices("accommodation");
            }
        },
        populateAccommodationPrices: function () {
            if ($("[data-accommodation-id]").length > 0) {
                var accommodationItems = $("[data-accommodation-id]");

                $.each(accommodationItems, function () {
                    if (!$(this).hasClass('skip-ajax-call')) {
                        var accommodationId = parseInt($(this).data("accommodation-id"));
                        var price = 0;

                        if ($("[data-accommodation-id='" + accommodationId + "'] .price .amount").length > 0) {
                            $("[data-accommodation-id='" + accommodationId + "'] .price .amount").html("");
                            $("[data-accommodation-id='" + accommodationId + "'] .price .curr").html("");

                            var dataObj = {
                                "action": "accommodation_load_min_price_ajax_request",
                                "start_date": window.requestedDateFrom,
                                "end_date": window.requestedDateTo,
                                "accommodation_id": accommodationId,
                                "nonce": BYTAjax.nonce
                            };

                            $.ajaxQueue({
                                url: BYTAjax.slimajaxurl,
                                data: dataObj,
                                success: function (data) {
                                    if (data !== undefined && data !== '') {
                                        price = JSON.parse(data);
                                        $("[data-accommodation-id='" + accommodationId + "'] .item_price").show();
                                        $("[data-accommodation-id='" + accommodationId + "'] .price .curr").html(window.currencySymbol);
                                        $("[data-accommodation-id='" + accommodationId + "'] .price .amount").html(bookyourtravel_scripts.formatPriceOnly(price));
                                    } else {
                                        $("[data-accommodation-id='" + accommodationId + "'] .item_price").hide();
                                    }
                                },
                                error: function (errorThrown) {
                                    console.log(errorThrown);
                                }
                            },
                            'accommodations');
                        }
                    }
                });
            }
        },
        prepareBookingScreen: function () {
            $("table.booking_price_breakdown thead").html("");
            $("table.booking_price_breakdown tfoot").html("");

            var exceptionNoteStr = (
                window.accommodationCountChildrenStayFree > 0
                ? " *"
                : ""
            );

            var colCount = 2;

            var headerRow = "";
            headerRow += "<tr class='rates_head_row'>";
            headerRow += "<th>" + window.dateLabel + "</th>";

            if (window.accommodationIsPricePerPerson) {
                if (window.bookingRequest.maxChildren > 0) {
                    headerRow += "<th>" + window.pricePerAdultLabel + "</th>";
                    headerRow += "<th>" + window.pricePerChildLabel + exceptionNoteStr + "</th>";
                    colCount = 4;
                } else {
                    headerRow += "<th>" + window.pricePerPersonLabel + "</th>";
                    colCount = 3;
                }
            }

            if (!window.accommodationDisabledRoomTypes) {
                colCount += 2;
                headerRow += "<th>" + window.numberOfRoomsLabel + "</th>";

                if (window.accommodationRentType === 2) {
                    headerRow += "<th>" + window.pricePerMonthPerRoomLabel + "</th>";
                } else if (window.accommodationRentType === 1) {
                    headerRow += "<th>" + window.pricePerWeekPerRoomLabel + "</th>";
                } else {
                    headerRow += "<th>" + window.pricePerDayPerRoomLabel + "</th>";
                }
            }

            if (window.accommodationRentType === 2) {
                headerRow += "<th>" + window.pricePerMonthLabel + "</th>";
            } else if (window.accommodationRentType === 1) {
                headerRow += "<th>" + window.pricePerWeekLabel + "</th>";
            } else {
                headerRow += "<th>" + window.pricePerDayLabel + "</th>";
            }
            headerRow += "</tr>";

            $("table.booking_price_breakdown thead").append(headerRow);

            var footerRow = "";
            footerRow += "<tr>";

            if (window.accommodationCountChildrenStayFree > 0 && window.accommodationMaxChildCount > 0) {
                footerRow += "<th colspan='" + (colCount - 1) + "'>" + window.priceTotalChildrenStayFreeLabel + "</th>";
            } else {
                footerRow += "<th colspan='" + (colCount - 1) + "'>" + window.priceTotalLabel + "</th>";
            }

            footerRow += "<td class='reservation_total'>" + bookyourtravel_scripts.formatPrice(0) + "</td>";
            footerRow += "</tr>";

            $("table.booking_price_breakdown tfoot").append(footerRow);

            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));
            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalAccommodationOnlyPrice));

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

            if (window.accommodationCountChildrenStayFree > 0 && window.bookingRequest.maxChildren > 0) {
                $(".adult_count_div").show();
                $(".children_count_div").show();
                $(".people_count_div").hide();
            } else {
                $(".adult_count_div").hide();
                $(".children_count_div").hide();
                $(".people_count_div").show();
            }

            if (window.accommodationDisabledRoomTypes) {
                $(".room_count_div").hide();
                $(".per_room_text").hide();
            } else {
                $(".room_count_div").show();
                $(".per_room_text").show();
            }            

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

            bookyourtravel_accommodations.bindResetButton();
            bookyourtravel_accommodations.bindNextButton();
            bookyourtravel_accommodations.bindCancelButton();

            if (window.enableExtraItems) {
                bookyourtravel_extra_items.bindExtraItemsQuantitySelect();
                bookyourtravel_extra_items.buildExtraItemsTable();
            }

            $("#booking-form-calendar .loading").parent().show();
            $(".booking_form_controls_holder").hide();

            bookyourtravel_accommodations.populateAvailableStartDates(bookyourtravel_accommodations.checkPreselectedStartDateAndPopulateAccordingly, true, true);
        },
        checkPreselectedStartDateAndPopulateAccordingly: function () {

            if (window.bookingRequest.requestedDateFrom) {
                var dateFrom = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.requestedDateFrom));
                var dateToCheck = (dateFrom.getFullYear() + "-" + ("0" + (dateFrom.getMonth() + 1)).slice(-2) + "-" + ("0" + dateFrom.getDate()).slice(-2));

                var found = $.inArray(dateToCheck, window.accommodationAvailableStartDates);
                if (found > -1) {
                    var timeFrom = Date.UTC(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());

                    var dayOfWeek = dateFrom.getDay();

                    if (window.accommodationRentType === 2 && dayOfWeek > 1) {
                        // monthly rentals allow only selecting 1st day of month as start date
                    } else if (window.accommodationRentType !== 2 && dayOfWeek > -1 && dayOfWeek !== (window.accommodationCheckinWeekday) && window.accommodationCheckinWeekday > -1) {
                        // check in weekday wrong
                    } else {
                        bookyourtravel_accommodations.selectDateFrom(timeFrom, window.bookingRequest.requestedDateFrom, true, true);
                    }
                }
            }

            $("#booking-form-calendar .loading").parent().hide();
            $(".booking_form_controls_holder").show();

            if ($(".booking_form_datepicker") !== undefined && $(".booking_form_datepicker").hasClass("hasDatepicker")) {
                bookyourtravel_accommodations.refreshDatePicker();
            } else {
                bookyourtravel_accommodations.bindAccommodationDatePicker();
            }
        },
        checkPreselectedEndDateAndPopulateAccordingly: function () {
            if (window.bookingRequest.requestedDateTo) {
                var dateTo = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.requestedDateTo));
                var dateToCheck = (dateTo.getFullYear() + "-" + ("0" + (dateTo.getMonth() + 1)).slice(-2) + "-" + ("0" + dateTo.getDate()).slice(-2));

                var found = $.inArray(dateToCheck, window.accommodationAvailableEndDates);
                if (found > -1) {
                    var timeTo = Date.UTC(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate());

                    var totalDays = bookyourtravel_scripts.calculateDifferenceInDays(bookyourtravel_accommodations.getSelectedDateFrom(), dateTo);
                    var lastDayOfMonth = bookyourtravel_scripts.daysInMonth(dateTo.getMonth() + 1, dateTo.getFullYear());

                    var dayOfWeek = dateTo.getDay();
                    $("div.error.step1-error").hide();

                    if (window.accommodationRentType === 2 && dateTo.getDate() !== lastDayOfMonth) {
                        // monthly rentals allow only selecting last day of month as end date
                    } else if (window.accommodationRentType === 1 && totalDays % 7 > 0) {
                        // weekly rentals only allow 7 day rentals
                    } else if (totalDays < window.accommodationMinDaysStay) {
                        // missed allowed minimum days stay
                    } else if (window.accommodationMaxDaysStay > 0 && totalDays > window.accommodationMaxDaysStay) {
                        // missed allow maximum days stay
                    } else if (window.accommodationRentType !== 2 && dayOfWeek > -1 && dayOfWeek !== (window.accommodationCheckoutWeekday) && window.accommodationCheckoutWeekday > -1) {
                        // wrong checkout weekday
                    } else {
                        bookyourtravel_accommodations.selectDateTo(timeTo, window.bookingRequest.requestedDateTo);
                    }
                }
            }

            bookyourtravel_accommodations.refreshDatePicker();

            $("#booking-form-calendar .loading").parent().hide();
            $(".booking_form_controls_holder").show();

        },

        bindRoomCountSelect: function() {

          if ($("#booking_form_rooms").length > 0) {
            var i = 1;
            if ($("#booking_form_rooms option").length === 0) {
                for (i = 1; i <= window.bookingRequest.maxRooms; i += 1) {
                    var opt = $("<option>").val(i).text(i);
                    if (window.bookingRequest.units == i) {
                        opt.attr("selected", "selected");
                    }
                    opt.appendTo("#booking_form_rooms");
                }
                $("#booking_form_rooms").uniform();
            } else {
                $("#booking_form_rooms option").remove();
                for (i = 1; i <= window.bookingRequest.maxRooms; i += 1) {
                    var opt = $("<option>").val(i).text(i);
                    if (window.bookingRequest.units == i) {
                        opt.attr("selected", "selected");
                    }
                    opt.appendTo("#booking_form_rooms");
                }
                $.uniform.update("#booking_form_rooms");
            }

            $("#booking_form_rooms").off("change");
            $("#booking_form_rooms").on("change", function (ignore) {
                if (parseInt($(this).val()) !== window.bookingRequest.units) {
                    window.bookingRequest.units = parseInt($(this).val());
                    $("span.rooms_text").html(window.bookingRequest.units);
                    $.uniform.update("#booking_form_rooms");
                    bookyourtravel_accommodations.buildRatesTable();
                }
            });

            $(".booking_form_room_count_p").html(window.bookingRequest.units);
            if (!window.accommodationDisabledRoomTypes) {
                $(".div_booking_form_room_count").show();
            } else {
                $(".div_booking_form_room_count").hide();
            }
          }
        },

        initBookingRequestObject: function () {

            if (!window.bookingRequest || window.bookingRequest === undefined || window.bookingRequest.length === 0) {
                window.bookingRequest = {};
            }

            window.bookingRequest.extraItems = {};
            window.bookingRequest.adults = 1;
            window.bookingRequest.children = 0;
            window.bookingRequest.people = 1;
            window.bookingRequest.units = 1;
            if (window.requestedRooms > 0) {
                window.bookingRequest.units = window.requestedRooms;
            }
            window.bookingRequest.maxRooms = 1;
            window.bookingRequest.extraItemsTotalPrice = 0;
            window.bookingRequest.totalAccommodationOnlyPrice = 0;
            window.bookingRequest.totalPrice = 0;
            window.bookingRequest.totalDays = 0;
            window.bookingRequest.totalIntervals = 0;
            window.bookingRequest.selectedDateFrom = null;
            window.bookingRequest.selectedDateTo = null;

            window.bookingRequest.maxAdults = 0;
            window.bookingRequest.maxChildren = 0;
            window.bookingRequest.minAdults = 0;
            window.bookingRequest.minChildren = 0;

            if (window.bookingRequest.roomTypeId > 0) {
                window.bookingRequest.maxAdults = parseInt($("li#room_type_" + window.bookingRequest.roomTypeId + " .room-information .max_adult_count").val());
                window.bookingRequest.maxChildren = parseInt($("li#room_type_" + window.bookingRequest.roomTypeId + " .room-information .max_child_count").val());
                if ($("li#room_type_" + window.bookingRequest.roomTypeId + " .room-information .min_adult_count").length > 0) {
                    window.bookingRequest.minAdults = parseInt($("li#room_type_" + window.bookingRequest.roomTypeId + " .room-information .min_adult_count").val());
                }
                if ($("li#room_type_" + window.bookingRequest.roomTypeId + " .room-information .min_child_count").length > 0) {
                    window.bookingRequest.minChildren = parseInt($("li#room_type_" + window.bookingRequest.roomTypeId + " .room-information .min_child_count").val());
                }
            } else {
                window.bookingRequest.maxAdults = parseInt(window.accommodationMaxAdultCount);
                window.bookingRequest.maxChildren = parseInt(window.accommodationMaxChildCount);
                window.bookingRequest.minAdults = parseInt(window.accommodationMinAdultCount);
                window.bookingRequest.minChildren = parseInt(window.accommodationMinChildCount);
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

            var exceptionNoteStr = (
                window.accommodationCountChildrenStayFree > 0
                ? " *"
                : ""
            );

            if ($("#booking_form_adults option").length === 0) {
                var i = 1;
                for (i = window.bookingRequest.minAdults; i <= window.bookingRequest.maxAdults; i += 1) {
                    $("<option>").val(i).text(i).appendTo("#booking_form_adults");
                }
            }

            if (window.bookingRequest.minAdults > 0) {
                window.bookingRequest.adults = parseInt(window.bookingRequest.minAdults);

                bookyourtravel_accommodations.determineBillablePeople();

                $("span.rooms_text").html(window.bookingRequest.units);
                $("span.adults_text").html(window.bookingRequest.adults);
                $("span.people_text").html((window.bookingRequest.children + window.bookingRequest.people) + exceptionNoteStr);
            }

            if (window.bookingRequest.maxChildren > 0) {

                if ($("#booking_form_children option").length === 0) {
                    var j = 1;
                    for (j = window.bookingRequest.minChildren; j <= window.bookingRequest.maxChildren; j += 1) {
                        $("<option>").val(j).text(j).appendTo("#booking_form_children");
                    }
                }

                if (window.bookingRequest.minChildren > 0) {
                    window.bookingRequest.children = parseInt(window.bookingRequest.minChildren);
                    $("span.children_text").html(window.bookingRequest.children + exceptionNoteStr);
                    $("span.people_text").html((window.bookingRequest.children + window.bookingRequest.adults) + exceptionNoteStr);
                }

                $("#booking_form_children").on("change", function (ignore) {
                    if (parseInt($(this).val()) !== window.bookingRequest.children) {
                        window.bookingRequest.children = parseInt($(this).val());
                        window.bookingRequest.adults = 1;
                        if ($("#booking_form_adults") && $("#booking_form_adults").val()) {
                            window.bookingRequest.adults = parseInt($("#booking_form_adults").val());
                        }

                        bookyourtravel_accommodations.determineBillablePeople();

                        $("span.children_text").html(window.bookingRequest.children + exceptionNoteStr);
                        $("span.people_text").html((window.bookingRequest.children + window.bookingRequest.adults) + exceptionNoteStr);

                        bookyourtravel_accommodations.buildRatesTable();
                    }
                });

            } else {
                window.bookingRequest.children = 0;
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

                    bookyourtravel_accommodations.determineBillablePeople();

                    $("span.adults_text").html(window.bookingRequest.adults);
                    $("span.people_text").html((window.bookingRequest.children + window.bookingRequest.adults) + exceptionNoteStr);

                    bookyourtravel_accommodations.buildRatesTable();
                }
            });

            $("#selected_date_from").val("");
            $("#selected_date_to").val("");
            $(".extra_item_quantity").val("0");
            $("#start_date_span").html("");
            $("#start_date").val("");
            $("#end_date_span").html("");
            $("#end_date").val("");
            $(".dates_row").hide();
            $(".deposits_row").hide();
            $(".price_row").hide();
            $(".booking-commands").hide();
            $("table.booking_price_breakdown tbody").html("");

            $("#booking_form_children").val(window.bookingRequest.children);
            $("#booking_form_adults").val(window.bookingRequest.adults);

            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalAccommodationOnlyPrice));
            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));
            $(".confirm_total_price_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));
            $("table.extra_items_price_breakdown tbody").html("");

            bookyourtravel_accommodations.determineBillablePeople();
        },
        determineBillablePeople: function () {
            var billable_children = window.bookingRequest.children;
            if (window.accommodationCountChildrenStayFree && window.bookingRequest.children > 0) {
                billable_children = window.bookingRequest.children - window.accommodationCountChildrenStayFree;
                billable_children = (
                    billable_children > 0
                    ? billable_children
                    : 0
                );
            }
            window.bookingRequest.people = billable_children + window.bookingRequest.adults;
        },
        bindNextButton: function () {

            $(".book-accommodation-proceed").unbind("click");
            $(".book-accommodation-proceed").on("click", function (event) {

                if (!window.accommodationIsReservationOnly && window.useWoocommerceForCheckout) {
                    bookyourtravel_accommodations.addProductToCart();
                } else {
                    $("#booking-form-calendar .loading").parent().show();

                    bookyourtravel_accommodations.showAccommodationBookingForm();

                    $("#booking-form-calendar .loading").parent().hide();
                }

                event.preventDefault();
            });
        },
        resetTheForm: function (skipAnimate) {

            if (!skipAnimate) {
                $("html, body").animate({
                    scrollTop: $("#booking-form-calendar").offset().top
                }, 500);
            }

            $(".booking_form_datepicker").hide();

            if (window.bookingRequest.length > 0) {
                delete window.bookingRequest;
            }

            $("#booking_form_adults option").remove();
            $("#booking_form_children option").remove();

            bookyourtravel_accommodations.initBookingRequestObject();
            bookyourtravel_accommodations.initBookingFormControls();

            $.uniform.update("#booking_form_children");
            $.uniform.update("#booking_form_adults");

            bookyourtravel_accommodations.refreshDatePicker();
        },
        bindResetButton: function () {

            $(".book-accommodation-reset").unbind("click");
            $(".book-accommodation-reset").on("click", function (event) {
                event.preventDefault();
                bookyourtravel_accommodations.resetTheForm();
            });
        },
        bindCancelButton: function () {
            $("#cancel-accommodation-booking, .close-btn").unbind("click");
            $("#cancel-accommodation-booking, .close-btn").on("click", function (event) {
                $(".modal").hide();
                bookyourtravel_accommodations.hideAccommodationBookingForm();
                bookyourtravel_accommodations.showAccommodationScreen();
                bookyourtravel_accommodations.resetTheForm();
                $("#accommodation-booking-form .error-summary").hide();
                $("#accommodation-booking-form label.error").hide();
                $("#accommodation-booking-form input.error").removeClass("error");
                $("#accommodation-booking-form input, #accommodation-booking-form textarea").val("");

                event.preventDefault();
            });
        },
        showAccommodationScreen: function () {
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
        showAccommodationBookingForm: function () {

            $("body").addClass("modal-open");

            $(".booking_form_accommodation_name_p").html(window.accommodationTitle);

            if (window.bookingRequest.roomTypeId > 0) {
                $(".booking_form_room_type_p").html(window.bookingRequest.roomTypeTitle);
                $(".booking_form_count_p").html(window.bookingRequest.units);
                $(".booking_form_accommodation_name_div").addClass("one-half");
                $(".booking_form_room_type_div").addClass("one-half");
                $(".booking_form_room_type_div").show();
                $(".booking_form_room_count_div").show();
            } else {
                $(".booking_form_accommodation_name_div").addClass("full-width");
                $(".booking_form_room_type_div").hide();
                $(".booking_form_room_type_div").removeClass("one-half");
                $(".booking_form_room_count_div").hide();
            }

            var adults = (
                (window.bookingRequest.adults !== null && window.bookingRequest.adults !== undefined)
                ? window.bookingRequest.adults
                : "0"
            );
            var children = (
                (window.bookingRequest.children !== null && window.bookingRequest.children !== undefined)
                ? window.bookingRequest.children
                : "0"
            );
            $(".booking_form_adults_p").html(adults);
            $(".booking_form_children_p").html(children);

            if (window.bookingRequest.maxChildren <= 0) {
                $(".booking_form_people_p").html(adults);
                $(".confirm_people_p").html(adults);
                $(".confirm_adults_div, .confirm_children_div, .booking_form_adults_div, .booking_form_children_div").hide();
                $(".confirm_people_div, .booking_form_people_div").show();
            }

            $(".booking_form_date_from_p").html(window.bookingRequest.selectedDateFrom);
            $(".booking_form_date_to_p").html(window.bookingRequest.selectedDateTo);
            $(".booking_form_reservation_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalAccommodationOnlyPrice));
            $(".booking_form_extra_items_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
            $(".booking_form_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

            $(".section-" + window.postType + "-content").hide();

            $(".accommodation-booking-section").show();

            if (window.accommodationIsReservationOnly || !window.useWoocommerceForCheckout) {

                $("#accommodation-booking-form").validate({
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

                            $("#accommodation-booking-form div.error-summary div p").html(message);
                            $("#accommodation-booking-form div.error-summary").show();
                        } else {
                            $("#accommodation-booking-form div.error-summary").hide();
                            $(".error").hide();
                        }

                        $(".booking-section").animate({
                            scrollTop: $("#accommodation-booking-form div.error-summary").offset().top - 100
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
                        bookyourtravel_accommodations.processBooking();
                    }
                });

                if ($("#accommodation-booking-form input[name='agree_gdpr']").length > 0) {
                  $("#accommodation-booking-form input[name='agree_gdpr']").rules("add", {
                      required: true,
                      messages: {
                          required: window.gdprError
                      }
                  });
                }

                $("#submit-accommodation-booking").on('click', function (e) {
                    e.preventDefault();
                    if ($("#accommodation-booking-form").valid()) {
                        $("#accommodation-booking-form").submit();
                    }
                });

                $.each(window.bookingFormFields, function (ignore, field) {

                    if (field.hide !== "1" && field.id !== null && field.id.length > 0) {
                        var $input = null;
                        if (field.type === "text" || field.type === "email") {
                            $input = $("#accommodation-booking-form").find("input[name=" + field.id + "]");
                        } else if (field.type === "textarea") {
                            $input = $("#accommodation-booking-form").find("textarea[name=" + field.id + "]");
                        } else if (field.type === "checkbox") {
                            $input = $("#accommodation-booking-form").find("input[name=" + field.id + "]");
                        } else if (field.type === "select") {
                            $input = $("#accommodation-booking-form").find("select[name=" + field.id + "]");
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

            if (!window.accommodationIsReservationOnly && window.useWoocommerceForCheckout) {
                $("html, body").animate({
                    scrollTop: $("#booking-form-calendar").offset().top
                }, 500);
            }
        },
        hideAccommodationBookingForm: function () {
            $("body").removeClass("modal-open");
            $(".accommodation-booking-section").hide();
        },
        showAccommodationConfirmationForm: function () {
            $(".accommodation-confirmation-section").show();
        },
        destroyAccommodationDatePicker: function () {
            if ($(".booking_form_datepicker") !== undefined) {
                $(".booking_form_datepicker").datepicker("destroy");
            }
        },
        bindAccommodationDatePicker: function () {
            if (window.minAccommodationDate instanceof Date) {
                var firstDayOfMonth = new Date(window.minAccommodationDate.getFullYear(), window.minAccommodationDate.getMonth(), 1);
                window.minAccommodationDate = firstDayOfMonth;
            }

            if ($(".booking_form_datepicker") !== undefined) {
                $(".booking_form_datepicker").datepicker({
                    dateFormat: window.datepickerDateFormat,
                    numberOfMonths: [window.calendarMonthRows, window.calendarMonthCols],
                    minDate: window.minAccommodationDate,
                    onSelect: function (dateText, inst) {
                        var selectedTime = Date.UTC(inst.currentYear, inst.currentMonth, inst.currentDay);
                        var selectedDate = bookyourtravel_scripts.convertLocalToUTC(new Date(selectedTime));
                        var selectedDateFrom = bookyourtravel_accommodations.getSelectedDateFrom();
                        var selectedDateTo = bookyourtravel_accommodations.getSelectedDateTo();
                        var dateTest = true;
                        var dayOfWeek = selectedDate.getDay();

                        if (!selectedDateFrom || selectedDateTo || (selectedDate < selectedDateFrom) || (selectedDateFrom.toString() === selectedDate.toString())) {
                            $("div.error.step1-error").hide();
                            if (window.accommodationRentType === 2 && selectedDate.getDate() > 1) {
                                // monthly rentals allow only selecting 1st day of month as start date
                                $("div.error.step1-error div p").html(window.checkinMonthlyFirstDayError);
                                $("div.error.step1-error").show();
                                $("html, body").animate({
                                    scrollTop: $("div.error.step1-error").offset().top - 100
                                }, 500);
                            } else if (window.accommodationRentType !== 2 && dayOfWeek > -1 && dayOfWeek !== (window.accommodationCheckinWeekday) && window.accommodationCheckinWeekday > -1) {

                                $("div.error.step1-error div p").html(window.checkinWeekDayError);
                                $("div.error.step1-error").show();
                                $("html, body").animate({
                                    scrollTop: $("div.error.step1-error").offset().top - 100
                                }, 500);

                            } else {
                                bookyourtravel_accommodations.selectDateFrom(selectedTime, dateText);
                            }
                        } else {

                            var dateFrom = selectedDateFrom;
                            dateFrom.setDate(dateFrom.getDate() + 1);
                            var d = dateFrom;
                            var dateToCheck = "";
                            var datesArray = window.accommodationAvailableEndDates;
                            for (d = dateFrom; d <= selectedDate; d.setDate(d.getDate() + 1)) {
                                dateToCheck = (d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2));
                                if ($.inArray(dateToCheck, datesArray) === -1) {
                                    dateTest = false;
                                    break;
                                }
                            }

                            if (!dateTest) {
                                bookyourtravel_accommodations.selectDateFrom(selectedTime, dateText);
                            } else {

                                var totalDays = bookyourtravel_scripts.calculateDifferenceInDays(bookyourtravel_accommodations.getSelectedDateFrom(), selectedDate);
                                var lastDayOfMonth = bookyourtravel_scripts.daysInMonth(selectedDate.getMonth() + 1, selectedDate.getFullYear());

                                $("div.error.step1-error").hide();

                                if (window.accommodationRentType === 2 && selectedDate.getDate() !== lastDayOfMonth) {
                                    // monthly rentals allow only selecting 1st day of month as start date
                                    $("div.error.step1-error div p").html(window.checkoutMonthlyLastDayError);
                                    $("div.error.step1-error").show();
                                } else if (window.accommodationRentType === 1 && totalDays % 7 > 0) {
                                    $("div.error.step1-error div p").html(window.checkoutWeeklyDayError);
                                    $("div.error.step1-error").show();
                                } else if (totalDays < window.accommodationMinDaysStay) {
                                    $("div.error.step1-error div p").html(window.minDaysStayError);
                                    $("div.error.step1-error").show();
                                } else if (window.accommodationMaxDaysStay > 0 && totalDays > window.accommodationMaxDaysStay) {
                                    $("div.error.step1-error div p").html(window.maxDaysStayError);
                                    $("div.error.step1-error").show();
                                } else if (window.accommodationRentType !== 2 && dayOfWeek > -1 && dayOfWeek !== (window.accommodationCheckoutWeekday) && window.accommodationCheckoutWeekday > -1) {
                                    $("div.error.step1-error div p").html(window.checkoutWeekDayError);
                                    $("div.error.step1-error").show();
                                } else {
                                    $("div.error.step1-error div p").html("");
                                    $("div.error.step1-error").hide();

                                    bookyourtravel_accommodations.selectDateTo(selectedTime, dateText);
                                }
                            }
                        }
                    },
                    onChangeMonthYear: function (year, month, ignore) {

                        window.currentMonth = month;
                        window.currentYear = year;
                        window.currentDay = 1;

                        var selectedDateFrom = bookyourtravel_accommodations.getSelectedDateFrom();

                        bookyourtravel_accommodations.populateAvailableStartDates(bookyourtravel_accommodations.checkPreselectedStartDateAndPopulateAccordingly);

                        if (selectedDateFrom) {
                            bookyourtravel_accommodations.populateAvailableEndDates(bookyourtravel_accommodations.checkPreselectedEndDateAndPopulateAccordingly);
                        }
                    },
                    beforeShowDay: function (d) {

                        // var dUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
                        var tUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()).valueOf();
                        var today = new Date();
                        var todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
                        var selectedTimeFrom = bookyourtravel_accommodations.getSelectedTimeFrom();
                        var selectedTimeTo = bookyourtravel_accommodations.getSelectedTimeTo();
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
                        if ($.inArray(dateTextForCompare, window.accommodationAvailableStartDates) > -1) {
                            if ($.inArray(dayBeforeTextForCompare, window.accommodationAvailableStartDates) === -1) {
                                // and the date before it was not available
                                startOfSegment = true;
                            }
                        } else {
                            if ($.inArray(dayBeforeTextForCompare, window.accommodationAvailableStartDates) > -1) {
                                // and the date before it was available
                                endOfSegment = true;
                            }
                        }

                        if (!selectedTimeFrom) {

                            if (window.accommodationAvailableStartDates) {

                                dateTextForCompare = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

                                if ($.inArray(dateTextForCompare, window.accommodationAvailableStartDates) === -1) {
                                    if (endOfSegment) {
                                        return [false, "dp-highlight dp-highlight-end-date"];
                                    } else {
                                        return [false, "ui-datepicker-unselectable ui-state-disabled"];
                                    }
                                }
                                if (todayUtc.valueOf() <= tUtc && $.inArray(dateTextForCompare, window.accommodationAvailableStartDates) > -1) {
                                    if (startOfSegment) {
                                        return [true, "dp-highlight dp-highlight-start-date"];
                                    } else {
                                        return [true, "dp-highlight"];
                                    }
                                }
                            }
                        } else if (!selectedTimeTo) {
                            endOfSegment = false;

                            if (window.accommodationAvailableEndDates) {

                                if ($.inArray(dayAfterTextForCompare, window.accommodationAvailableEndDates) === -1) {
                                    // and date after is not available
                                    endOfSegment = true;
                                }

                                dateTextForCompare = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

                                if (selectedTimeFrom && tUtc === selectedTimeFrom) {
                                    return [false, "dp-highlight dp-highlight-selected dp-highlight-start-date"];
                                } else if ($.inArray(dateTextForCompare, window.accommodationAvailableEndDates) === -1) {
                                    return [false, "ui-datepicker-unselectable ui-state-disabled"];
                                } else if (todayUtc.valueOf() < tUtc && $.inArray(dateTextForCompare, window.accommodationAvailableEndDates) > -1) {
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
                $(".booking_form_controls_holder, .booking-commands .book-accommodation-proceed").hide();
                $("#booking-form-calendar .loading").parent().show();

                var selectedDateFrom = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.selectedTimeFrom));
                var selectedDateTo = bookyourtravel_scripts.convertLocalToUTC(new Date(window.bookingRequest.selectedTimeTo));
                var dateFrom = selectedDateFrom.getFullYear() + "-" + (selectedDateFrom.getMonth() + 1) + "-" + selectedDateFrom.getDate();
                var dateTo = selectedDateTo.getFullYear() + "-" + (selectedDateTo.getMonth() + 1) + "-" + selectedDateTo.getDate();

                var dataObj = {
                    "action": "accommodation_process_booking_ajax_request",
                    "user_id": window.currentUserId,
                    "accommodation_id": window.accommodationId,
                    "room_type_id": window.roomTypeId,
                    "extra_items": window.bookingRequest.extraItems,
                    "adults": window.bookingRequest.adults,
                    "children": window.bookingRequest.children,
                    "room_count": window.bookingRequest.units,
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

                $(".confirm_accommodation_name_p").html(window.accommodationTitle);
                if (window.bookingRequest.roomTypeId > 0) {
                    $(".confirm_room_type_p").html(window.bookingRequest.roomTypeTitle);
                    $(".confirm_room_count_p").html(window.bookingRequest.units);
                    $(".confirm_accommodation_name_div").addClass("one-half");
                    $(".confirm_room_type_div").show();
                    $(".confirm_room_count_div").show();
                } else {
                    $(".confirm_accommodation_name_div").addClass("full-width");
                    $(".confirm_room_type_div").hide();
                    $(".confirm_room_count_div").hide();
                }

                $(".confirm_adults_p").html(window.bookingRequest.adults);
                $(".confirm_children_p").html(window.bookingRequest.children);
                $(".confirm_date_from_p").html(window.bookingRequest.selectedDateFrom);
                $(".confirm_date_to_p").html(window.bookingRequest.selectedDateTo);
                if ($(".confirm_reservation_total_p").length > 0) {
                    $(".confirm_reservation_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalAccommodationOnlyPrice));
                }
                if ($(".confirm_extra_items_total_p").length > 0) {
                    $(".confirm_extra_items_total_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.extraItemsTotalPrice));
                }
                $(".confirm_total_price_p").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

                bookyourtravel_accommodations.hideAccommodationBookingForm();
                bookyourtravel_accommodations.showAccommodationConfirmationForm();

                $.ajax({
                    url: BYTAjax.ajaxurl,
                    data: dataObj,
                    success: function (ignore) {

                        // This outputs the result of the ajax request
                        $("div.error div p").html("");
                        $("div.error").hide();

                        $(".booking_form_controls_holder, .booking-commands .book-accommodation-proceed").show();
                        $("#booking-form-calendar .loading").parent().hide();
                    },
                    error: function (errorThrown) {
                        console.log(errorThrown);
                    }
                });
            }
        },
        buildRatesTable: function () {
            var selectedTimeFrom = bookyourtravel_accommodations.getSelectedTimeFrom();
            var selectedTimeTo = bookyourtravel_accommodations.getSelectedTimeTo();
            var nextFromDate = null;

            $(".price_row").show();

            $.uniform.update(".extra_item_quantity");

            $("table.booking_price_breakdown tbody").html("");

            if (selectedTimeFrom && selectedTimeTo) {

                $(".reservation_total").html(bookyourtravel_scripts.getSmallLoaderHtml());
                $(".total_price").html(bookyourtravel_scripts.getSmallLoaderHtml());
                $(".extra_items_total").html(bookyourtravel_scripts.getSmallLoaderHtml());

                window.bookingRequest.totalPrice = 0;
                window.bookingRequest.totalAccommodationOnlyPrice = 0;
                var runningTotals = {
                    index: 0,
                    totalPrice: 0,
                    totalAccommodationOnlyPrice: 0
                };

                var tempSelectedDate = null;
                while (selectedTimeFrom < selectedTimeTo) {
                    if (window.accommodationRentType === 1) {
                        // weekly
                        bookyourtravel_accommodations.buildRateRow(selectedTimeFrom, runningTotals);
                        tempSelectedDate = new Date(selectedTimeFrom);
                        tempSelectedDate.setDate(tempSelectedDate.getDate() + 7);
                        selectedTimeFrom = tempSelectedDate.valueOf();
                    } else if (window.accommodationRentType === 2) {
                        // monthly
                        nextFromDate = bookyourtravel_scripts.firstDayInNextMonth(selectedTimeFrom);
                        bookyourtravel_accommodations.buildRateRow(selectedTimeFrom, runningTotals);
                        selectedTimeFrom = nextFromDate.valueOf();
                    } else {
                        // daily
                        bookyourtravel_accommodations.buildRateRow(selectedTimeFrom, runningTotals);
                        tempSelectedDate = new Date(selectedTimeFrom);
                        tempSelectedDate.setDate(tempSelectedDate.getDate() + 1);
                        selectedTimeFrom = tempSelectedDate.valueOf();
                    }
                }
            }
        },
        buildRateRow: function (fromTime, runningTotals) {
            var dateFrom = bookyourtravel_scripts.convertLocalToUTC(new Date(fromTime));
            var theDate = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
            var billable_children = window.bookingRequest.children;
            var adults = window.bookingRequest.adults;
            var tableRow = "";

            var dataObj = {
                "action": "accommodation_get_day_price_ajax_request",
                "accommodation_id": window.accommodationId,
                "room_type_id": window.roomTypeId,
                "the_date": theDate,
                "nonce": BYTAjax.nonce
            };

            $.ajax({
                url: BYTAjax.slimajaxurl,
                data: dataObj,
                success: function (data) {
                    if (data !== undefined && data !== '') {
                        var pricePerPeriod = 0;
                        var childPricePerPeriod = 0;
                        var totalPricePerPeriod = 0;
                        var price_data = JSON.parse(data);

                        if (price_data && price_data.regular_price) {

                            var availableRooms = parseInt(price_data.running_available_total) - parseInt(price_data.booked_rooms);
                            if (runningTotals.index === 0) {
                                window.bookingRequest.maxRooms = availableRooms;
                            } else if (window.bookingRequest.maxRooms > availableRooms) {
                                window.bookingRequest.maxRooms = availableRooms;
                            }

                            runningTotals.index += 1;

                            tableRow += "<tr class='date" + dateFrom.getTime() + "'>";
                            tableRow += "<td>" + $.datepicker.formatDate(window.datepickerDateFormat, dateFrom) + "</td>";

                            if (price_data.is_weekend && price_data.weekend_price && price_data.weekend_price > 0) {
                                pricePerPeriod = parseFloat(price_data.weekend_price);
                            } else {
                                pricePerPeriod = parseFloat(price_data.regular_price);
                            }

                            if (window.accommodationIsPricePerPerson) {
                                if (price_data.is_weekend && price_data.weekend_price_child && price_data.weekend_price_child > 0) {
                                    childPricePerPeriod = parseFloat(price_data.weekend_price_child);
                                } else if (price_data.regular_price_child && price_data.regular_price_child > 0) {
                                    childPricePerPeriod = parseFloat(price_data.regular_price_child);
                                }
                                tableRow += "<td>" + bookyourtravel_scripts.formatPrice(pricePerPeriod) + "</td>";
                                if (window.bookingRequest.maxChildren > 0) {
                                    tableRow += "<td>" + bookyourtravel_scripts.formatPrice(childPricePerPeriod) + "</td>";
                                }
                            }

                            if (!window.accommodationDisabledRoomTypes) {
                                tableRow += "<td>" + window.bookingRequest.units + "</td>";
                            }

                            if (window.accommodationIsPricePerPerson) {
                                billable_children = window.bookingRequest.children - window.accommodationCountChildrenStayFree;
                                billable_children = (
                                    billable_children > 0
                                    ? billable_children
                                    : 0
                                );
                                totalPricePerPeriod = (pricePerPeriod * adults) + (childPricePerPeriod * billable_children);
                            } else {
                                totalPricePerPeriod = pricePerPeriod;
                            }

                            tableRow += "<td>" + bookyourtravel_scripts.formatPrice(totalPricePerPeriod) + "</td>";

                            totalPricePerPeriod = totalPricePerPeriod * window.bookingRequest.units;

                            if (!window.accommodationDisabledRoomTypes) {
                                tableRow += "<td>" + bookyourtravel_scripts.formatPrice(totalPricePerPeriod) + "</td>";
                            }

                            runningTotals.totalPrice += totalPricePerPeriod;
                            runningTotals.totalAccommodationOnlyPrice += totalPricePerPeriod;

                            tableRow += "</tr>";

                            $("table.booking_price_breakdown tbody tr.date" + dateFrom.getTime()).remove();
                            $("table.booking_price_breakdown tbody").append(tableRow);

                            if (runningTotals.index === window.bookingRequest.totalIntervals) {

                                bookyourtravel_accommodations.bindRoomCountSelect();

                                window.bookingRequest.totalPrice = runningTotals.totalPrice;
                                window.bookingRequest.totalAccommodationOnlyPrice = runningTotals.totalAccommodationOnlyPrice;

                                bookyourtravel_extra_items.recalculateExtraItemTotals(window.bookingRequest.totalAccommodationOnlyPrice);

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

                                $(".reservation_total").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalAccommodationOnlyPrice));
                                $(".total_price").html(bookyourtravel_scripts.formatPrice(window.bookingRequest.totalPrice));

                                bookyourtravel_accommodations.bindNextButton();
                                bookyourtravel_accommodations.bindCancelButton();

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

                                $("html, body").animate({
                                scrollTop: $(".price_row").first().offset().top
                                }, 500);

                                $(".booking-commands .book-accommodation-proceed").show();
                            }
                        }
                    }
                }
            });
        },
        addProductToCart: function () {

            $(".booking_form_controls_holder, .booking-commands .book-accommodation-proceed").hide();
            $("#booking-form-calendar .loading").parent().show();

            $("html, body").animate({
                scrollTop: $("#booking-form-calendar").offset().top - 100
            }, 500);

            var selectedDateFrom = bookyourtravel_accommodations.getSelectedDateFrom();
            var selectedDateTo = bookyourtravel_accommodations.getSelectedDateTo();
            var dateFrom = selectedDateFrom.getFullYear() + "-" + (selectedDateFrom.getMonth() + 1) + "-" + selectedDateFrom.getDate();
            var dateTo = selectedDateTo.getFullYear() + "-" + (selectedDateTo.getMonth() + 1) + "-" + selectedDateTo.getDate();

            var dataObj = {
                "action": "accommodation_booking_add_to_cart_ajax_request",
                "user_id": window.currentUserId,
                "accommodation_id": window.accommodationId,
                "room_type_id": window.roomTypeId,
                "adults": window.bookingRequest.adults,
                "children": window.bookingRequest.children,
                "room_count": window.bookingRequest.units,
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

            $("#selected_date_from").val(time);
            $("#selected_date_to").val(null);
            $(".date_from_text").html(dateFrom);
            $(".date_to_text").html(window.defaultDateToText);

            window.bookingRequest.selectedTimeFrom = time;
            window.bookingRequest.selectedDateFrom = dateFrom;

            $(".booking-commands").show();
            $(".booking-commands .book-accommodation-reset").show();
            $(".booking-commands .book-accommodation-proceed").hide();

            $(".reservation_total").html(bookyourtravel_scripts.formatPrice(0));
            $(".total_price").html(bookyourtravel_scripts.formatPrice(0));
            $(".extra_items_total").html(bookyourtravel_scripts.formatPrice(0));

            $(".dates_row").show();
            $(".price_row").hide();

            bookyourtravel_accommodations.populateAvailableEndDates(bookyourtravel_accommodations.checkPreselectedEndDateAndPopulateAccordingly, skipLoaderStart, skipLoaderEnd);
        },
        selectDateTo: function (time, dateTo) {
            $("div.error.step1-error div p").html("");
            $("div.error.step1-error").hide();
            $(".price_breakdown").show();
            $("table.booking_price_breakdown tbody").html("");

            window.bookingRequest.selectedTimeTo = time;
            window.bookingRequest.selectedDateTo = dateTo;
            $(".date_to_text").html(dateTo);
            $("#selected_date_to").val(time);

            var selectedDateFrom = bookyourtravel_accommodations.getSelectedDateFrom();
            var selectedDateTo = bookyourtravel_accommodations.getSelectedDateTo();

            bookyourtravel_accommodations.calculateDifferenceInIntervals(selectedDateFrom, selectedDateTo);

            bookyourtravel_extra_items.bindRequiredExtraItems();
            bookyourtravel_accommodations.buildRatesTable();
        },
        calculateDifferenceInIntervals: function (dateFrom, dateTo) {
            window.bookingRequest.totalDays = bookyourtravel_scripts.calculateDifferenceInDays(dateFrom, dateTo);

            if (window.accommodationRentType === 2) {
                window.bookingRequest.totalIntervals = bookyourtravel_scripts.calculateDifferenceInMonths(dateFrom, dateTo) + 1;
            } else if (window.accommodationRentType === 1) {
                window.bookingRequest.totalIntervals = bookyourtravel_scripts.calculateDifferenceInWeeks(dateFrom, dateTo);
            } else {
                window.bookingRequest.totalIntervals = bookyourtravel_scripts.calculateDifferenceInDays(dateFrom, dateTo);
            }
        },
        populateAvailableStartDates: function (callDelegate, skipLoaderStart, skipLoaderEnd) {

            if (!skipLoaderStart) {
                $("#booking-form-calendar .loading").parent().show();
                $(".booking_form_controls_holder").hide();
            }

            window.accommodationAvailableStartDates = [];

            var dataObj = {
                "action": "accommodation_available_start_dates_ajax_request",
                "accommodation_id": window.accommodationId,
                "room_type_id": window.roomTypeId,
                "rooms": window.bookingRequest.units,
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
                        window.accommodationAvailableStartDates = JSON.parse(data);

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
            window.accommodationAvailableEndDates = [];

            var startDate = bookyourtravel_accommodations.getSelectedDateFrom();
            if (window.minAccommodationDate > 0 && window.minAccommodationDate > startDate) {
                startDate = window.minAccommodationDate;
            }            

            var dataObj = {
                "action": "accommodation_available_end_dates_ajax_request",
                "accommodation_id": window.accommodationId,
                "room_type_id": window.roomTypeId,
                "rooms": window.bookingRequest.units,
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
                        window.bookingRequest.maxRooms = 1;
                        var availableEndDateData = JSON.parse(data);
                        window.accommodationAvailableEndDates = [];
                        var i = 0;
                        var entry = null;
                        for (i = 0; i < availableEndDateData.length; i += 1) {
                            entry = availableEndDateData[i];
                            window.accommodationAvailableEndDates.push(entry.date);
                        }

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
