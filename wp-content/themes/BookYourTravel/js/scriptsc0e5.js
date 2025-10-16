/*jslint browser: true*/ /*jslint long:true */ /*jslint for:true */ /*global jQuery*/
/*jslint this:true */ /*global window*/ /*global console*/ /*global BYTAjax*/

var bookyourtravel_scripts;

(function ($) {

    "use strict";

    $(document).ready(function () {
        bookyourtravel_scripts.init();
    });

    $(window).on('load', function () {
        bookyourtravel_scripts.load();
    });

    bookyourtravel_scripts = {

        init: function () {

            $(".grid-view").on('click', function (e) {
                var currentClass = $(".section-search-results article").attr("class");
                if (currentClass !== undefined && currentClass.length > 0) {
                    currentClass = currentClass.replace("last", "");
                    currentClass = currentClass.replace("full-width", window.itemClass);
                    $(".section-search-results article").attr("class", currentClass);
                    // bookyourtravel_scripts.resizeFluidItems();
                }
                $(".view-type li").removeClass("active");
                $(this).addClass("active");
                e.preventDefault();
            });

            $(".list-view").on('click', function (e) {
                var currentClass = $(".section-search-results article").attr("class");
                if (currentClass !== undefined && currentClass.length > 0) {
                    currentClass = currentClass.replace("last", "");
                    currentClass = currentClass.replace(window.itemClass, "full-width");
                    $(".section-search-results article").attr("class", currentClass);
                }
                $(".view-type li").removeClass("active");
                $(this).addClass("active");
                e.preventDefault();
            });

            // LIST AND GRID VIEW TOGGLE
            if (window.defaultResultsView === 0) {
                $(".view-type li.grid-view").trigger("click");
            } else {
                $(".view-type li.list-view").trigger("click");
            }

            if (jQuery.uniform !== undefined) {
                // jquery-uniform related
                $(".widget-search input[type=radio], .wpcf7 input[type=radio],.modal input[type=radio],.lb-wrap input[type=radio],form.static-content input[type=radio],.tab-content input[type=radio]").uniform();
                $(".widget-search input[type=checkbox], .wpcf7 input[type=checkbox],.modal input[type=checkbox],.lb-wrap input[type=checkbox],form.static-content input[type=checkbox],.tab-content input[type=checkbox]").uniform();
                $(".widget-search select, .wpcf7 select,.modal select,.lb-wrap select,form.static-content select,.tab-content select").uniform();
            }

            // "scroll to top" button
            $(".scroll-to-top").on('click', function () {
                $("body,html").animate({
                    scrollTop: 0
                }, 800);
                return false;
            });

            // SMOOTH ANCHOR SCROLLING
            var $root = $("body,html");

            $(".anchor a").on('click', function (e) {
                var href = $.attr(this, "href");
                if (href.startsWith("#") && $(href) !== undefined) {
                    href = href.substring(href.lastIndexOf("#") + 1);
                    var selector = "#" + href + ",." + href;
                    if ($(selector).length > 0) {

                        var heightOffset = $("header.header").height();
                        if ($("#wpadminbar").length > 0) {
                            heightOffset = heightOffset + $("#wpadminbar").height();
                        }

                        var scrollTo = $(selector).offset().top - heightOffset;

                        $root.animate({
                            scrollTop: scrollTo
                        }, 500, function () {
                            // window.location.hash = '#' + href;
                        });
                    }
                    e.preventDefault();
                }
            });

            $(".close-btn").on("click", function () {
                $(".modal").hide();
            });
        },
        load: function () {

        },
        redirectToCart: function () {
            window.top.location.href = window.wooCartPageUri;
        },
        calculateDifferenceInDays: function (date1, date2) {
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            return Math.floor(timeDiff / (1000 * 3600 * 24));
        },
        calculateDifferenceInWeeks: function (date1, date2) {
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            return Math.floor(timeDiff / ((1000 * 3600 * 24) * 7));
        },
        calculateDifferenceInMonths: function (date1, date2) {
            var months;
            months = (date2.getFullYear() - date1.getFullYear()) * 12;
            months -= date1.getMonth() + 1;
            months += date2.getMonth() + 1;
            return (
                months <= 0
                    ? 0
                    : months
            );
        },
        daysInMonth: function (month, year) {
            return new Date(year, month, 0).getDate();
        },
        convertLocalToUTC: function (date) {
            var userTimezoneOffset = date.getTimezoneOffset() * 60000;
            var d = new Date(date.getTime() + userTimezoneOffset);
            d.setHours(0, 0, 0, 0);
            return d;
        },
        formatPrice: function (price) {
            // coerce toFixed string back to number
            var fixed = price.toFixed(window.priceDecimalPlaces);
            var formattedPrice = (+fixed).toLocaleString(window.currentLocale.replace('_', '-'), {minimumFractionDigits: window.priceDecimalPlaces});

            if (window.currencySymbolShowAfter) {
                return formattedPrice + " " + window.currencySymbol;
            } else {
                return window.currencySymbol + " " + formattedPrice;
            }
        },
        formatPriceOnly: function (price) {
            var fixed = parseFloat(price).toFixed(window.priceDecimalPlaces);
            return (+fixed).toLocaleString(window.currentLocale.replace('_', '-'), {minimumFractionDigits: window.priceDecimalPlaces});
        },
        lastDayOfMonth: function (yourDate) {
            var d = new Date(yourDate);
            var nextMonthFirstDay = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            return new Date(nextMonthFirstDay - 1);
        },
        firstDayInNextMonth: function (yourDate) {
            var d = new Date(yourDate);
            if (d.getMonth() === 11) {
                return new Date(d.getFullYear() + 1, 0, 1);
            } else {
                return new Date(d.getFullYear(), d.getMonth() + 1, 1);
            }
        },
        getSmallLoaderHtml: function () {
            return "<div class='small-loading'><img src='" + window.themePath + "/css/images/ajax-loader.gif' alt='' /></div>";
        },
        populateLocationPrices: function (postType) {
            if ($("[data-location-id]").length > 0 && $("[data-min-price-type='" + postType + "']").length > 0) {
                var locationItems = $("[data-location-id]");
                $.each(locationItems, function () {
                    if ($(this).data("min-price-type") && $(this).data("min-price-type") === postType) {
                        var locationId = parseInt($(this).data("location-id"));

                        var price = 0;

                        if ($("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "'] .price .amount").length > 0) {
                            $("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "'] .price .amount").html("");
                            $("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "'] .price .curr").html("");

                            var dataObj = {
                                "action": "location_load_min_price_ajax_request",
                                "start_date": window.requestedDateFrom,
                                "end_date": window.requestedDateTo,
                                "post_type": postType,
                                "location_id": locationId,
                                "nonce": BYTAjax.nonce
                            };

                            $.ajaxQueue({
                                url: BYTAjax.slimajaxurl,
                                data: dataObj,
                                success: function (data) {
                                    if (data) {
                                        price = JSON.parse(data);
                                        if (price !== undefined && price !== '') {
                                            $("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "']").parent().show();
                                            $("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "']").show();
                                            $("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "'] .price .curr").html(window.currencySymbol);
                                            $("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "'] .price .amount").html(bookyourtravel_scripts.formatPriceOnly(price));
                                        } else {
                                            $("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "']").hide();
                                        }
                                    } else {
                                        $("[data-location-id='" + locationId + "'][data-min-price-type='" + postType + "']").hide();
                                    }                                        
                                },
                                error: function (errorThrown) {
                                    console.log(errorThrown);
                                }
                            },
                            'locations');
                        }
                    }
                });
            }
        }
    };
}(jQuery));

if (!String.prototype.format) {
    String.prototype.format = function () {
        "use strict";

        const args = Array.prototype.slice.call(arguments, 0);
        return this.replace(/\{(\d+)\}/g, function (match, number) {
            return (
                args[number] !== undefined
                    ? args[number]
                    : match
            );
        });
    };
}

Object.size = function (obj) {
    "use strict";

    var size = 0;
    var i = 0;
    var keys = Object.keys(obj);
    var key = "";
    for (i = 0; i < keys.length; i += 1) {
        key = keys[i];
        if (obj.hasOwnProperty(key)) {
            size += 1;
        }
    }
    return size;
};
