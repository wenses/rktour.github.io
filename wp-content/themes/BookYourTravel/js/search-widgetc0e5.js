/*jslint browser: true*/ /*jslint long:true */ /*jslint for:true */ /*global jQuery*/ /*jslint this:true */ /*global window*/

(function ($) {

    "use strict";

    var search_widget;

    $(document).ready(function () {
        search_widget.init();
    });

    search_widget = {
        disableFilters: function () {
            $(".filter-group").hide();
            $(".filter-group input[type='radio']").prop("disabled", "disabled");
            $(".filter-group input[type='checkbox']").prop("disabled", "disabled");
            $(".filter-group input[type='text']").prop("disabled", "disabled");
            $(".filter-group input[type='hidden']").prop("disabled", "disabled");
            $(".filter-group select").prop("disabled", "disabled");
        },
        enableFilters: function (type) {
            $(".filter-group.filter-" + type).show();
            $(".filter-group.filter-" + type + " input[type='radio']").removeAttr("disabled");
            $(".filter-group.filter-" + type + " input[type='text']").removeAttr("disabled");
            $(".filter-group.filter-" + type + " input[type='checkbox']").removeAttr("disabled");
            $(".filter-group.filter-" + type + " input[type='hidden']").removeAttr("disabled");
            $(".filter-group.filter-" + type + " select").removeAttr("disabled");
        },
        toggleFilters: function () {
            var what = parseInt($(".filter-type-what input[type='radio']:checked").val());
            search_widget.disableFilters();
            search_widget.enableFilters("generic");
            search_widget.enableFilters("location");

            if (what === 1) {
                search_widget.enableFilters("accommodation");
            } else if (what === 2) {
                search_widget.enableFilters("car_rental");
            } else if (what === 3) {
                search_widget.enableFilters("cruise");
            } else if (what === 4) {
                search_widget.enableFilters("tour");
            }
        },
        init: function () {

            if ($(".filter-type-what input[type='radio']").is(":checked")) {
                search_widget.toggleFilters();
            }

            $(".filter-type-what input[type='radio']").on("change", function () {
                search_widget.toggleFilters();
            });

            $("select.filter-locations-by-type, select.filter-locations").on("change", function () {
                var locationId = $(this).val();
                var relatedInputId = $(this).data('relid');
                if (relatedInputId && $("input[id='" + relatedInputId + "']").length > 0) {
                    $("input[id='" + relatedInputId + "']").val(locationId);
                }
            });

            var filterClass = "";
            if (window.searchWidgetStarFilters) {
                Object.keys(window.searchWidgetStarFilters).forEach(function (filterName, ignore) {
                    filterClass = window.searchWidgetStarFilters[filterName].class;
                    $('.' + filterClass).each(function() {
                        $(this).raty({
                            scoreName: "stars",
                            score: window.searchWidgetStarFilters[filterName].value,
                            number: window.searchWidgetStarFilters[filterName].count
                        });
                    })
                });
            }
            var sliderClass = "";
            if (window.searchWidgetSliderFilters) {
                Object.keys(window.searchWidgetSliderFilters).forEach(function (sliderName, ignore) {
                    sliderClass = window.searchWidgetSliderFilters[sliderName].class;

                    $("." + sliderClass).each(function() {
                        $(this).slider({
                            range: "min",
                            value: window.searchWidgetSliderFilters[sliderName].value,
                            min: window.searchWidgetSliderFilters[sliderName].min,
                            max: window.searchWidgetSliderFilters[sliderName].max,
                            step: window.searchWidgetSliderFilters[sliderName].step
                        });
    
                        $(this).off("slidechange");
                        $(this).on("slidechange", function (ignore, ui) {
                            $("#" + window.searchWidgetSliderFilters[$(this).attr("name") + '_' + $(this).data("blockOrder")].class_input).val(ui.value);
                        });
                    })
                });
            }

            if (window.searchWidgetDatepickers) {
                Object.keys(window.searchWidgetDatepickers).forEach(function (datepickerName, ignore) {
                    var datePickerClass = window.searchWidgetDatepickers[datepickerName].class;

                    $('.' + datePickerClass).each(function () {
                        var datePickerInput = $(this);
                        var altFieldClass = datePickerInput.data("alt-field");
    
                        datePickerInput.datepicker({
                            dateFormat: window.datepickerDateFormat,
                            altFormat: window.datepickerAltFormat,
                            altField: "." + altFieldClass,
                            showOn: "button",
                            minDate: 0,
                            buttonImage: window.themePath + "/images/ico/calendar.png",
                            buttonImageOnly: true,
                            onClose: function (selectedDate) {
                              var d = $.datepicker.parseDate(window.datepickerDateFormat, selectedDate);
                              if (d !== null && typeof(d) !== 'undefined') {
                                var datepickerDiv = $(this).closest(".datepicker");
                                if (datepickerDiv.hasClass("datepicker_from")) {
                                  d = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1);
                                  var datepickerTo = $(this).closest(".widget-search").find(".datepicker_to .datepicker-wrap > input");
                                  datepickerTo.datepicker("option", "minDate", d);
                                } else if (datepickerDiv.hasClass("datepicker_to")) {
                                  var datepickerFrom = $(this).closest(".widget-search").find(".datepicker_from .datepicker-wrap > input");
                                  d = new Date(d.getFullYear(), d.getMonth(), d.getDate()-1);
                                  datepickerFrom.datepicker("option", "maxDate", d);
                                }
                              }
                            }
                        });
    
                        datePickerInput.off("focus");
                        datePickerInput.on("focus", function () {
                            $(this).datepicker("show");
                        });
    
                        var datePickerValue = window.searchWidgetDatepickers[datepickerName].value;
                        if (datePickerValue.length > 0) {
                            datePickerValue = bookyourtravel_scripts.convertLocalToUTC(new Date(datePickerValue));
                            datePickerInput.datepicker("setDate", datePickerValue);
    
                            var datepickerDiv = datePickerInput.closest(".datepicker");
                            if (datepickerDiv.hasClass("datepicker_from")) {
                              var d = new Date(datePickerValue.getFullYear(), datePickerValue.getMonth(), datePickerValue.getDate()+1);
                              var datepickerTo = datePickerInput.closest(".widget-search").find(".datepicker_to .datepicker-wrap > input");
                              datepickerTo.datepicker("option", "minDate", d);
                            } else if (datepickerDiv.hasClass("datepicker_to")) {
                              var d = new Date(datePickerValue.getFullYear(), datePickerValue.getMonth(), datePickerValue.getDate()-1);
                              var datepickerFrom = datePickerInput.closest(".widget-search").find(".datepicker_from .datepicker-wrap > input");
                              datepickerFrom.datepicker("option", "maxDate", d);
                            }
                        }
                    });

                });
            }
        }
    };

}(jQuery));
