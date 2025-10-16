(function($) {
    var destinationgridCarousel = function ($scope, $) {

	  jQuery('.tours-grid-carousel-alt .owl-carousel').owlCarousel({
        loop: true,
        margin: 30,
		rtl:jQuery(".tours-grid-carousel-alt .owl-carousel").data("rtl"),
        mouseDrag: true,
        autoplay: jQuery(".tours-grid-carousel-alt .owl-carousel").data("car-autoplay"),
		smartSpeed: jQuery(".tours-grid-carousel-alt .owl-carousel").data("car-speed"),
		dots: jQuery(".tours-grid-carousel-alt .owl-carousel").data("dots"),
        autoplayHoverPause: true,
        nav: jQuery(".tours-grid-carousel-alt .owl-carousel").data("nav"),
        navText: ["<span class='lnr ti-angle-left'></span>","<span class='lnr ti-angle-right'></span>"],
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
            },
            600: {
                items: 2
            },
            1000: {
                items: 2
            }
        }
    });


    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/travol-destination-list.default', destinationgridCarousel);
    });

   
})(jQuery);