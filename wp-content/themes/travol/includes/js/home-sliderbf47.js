/* -------------------------------------------------------
[ Custom settings ]
------------------------------------------------------- */
jQuery(function () {
    "use strict";
    // Slider  
jQuery(document).ready(function () {
    var owl = jQuery('.header .owl-carousel');
    
    // Slider owlCarousel - (Inner Page Slider)
    jQuery('.slider.tl-page-slideshow .owl-carousel').owlCarousel({
        items: 1,
		rtl:jQuery(".slider.tl-page-slideshow .owl-carousel").data("rtl"),
        loop: true,
        dots: true,
        margin: 0,
        autoplay: true,
		smartSpeed:500,
        autoplayTimeout: 5000,
		nav: false,
        navText: ['<i class="ti-angle-left" aria-hidden="true"></i>', '<i class="ti-angle-right" aria-hidden="true"></i>'],
        responsiveClass: true,
        responsive: {
            0: {
                dots: true
            },
            600: {
                dots: true
            },
            1000: {
                dots: true
            }
        }
    });
    
    // Slider owlCarousel (Homepage Slider)
    jQuery('.tl-page-slider.slider-fade .owl-carousel').owlCarousel({
        items: 1,
        loop: true,
		rtl:jQuery(".tl-page-slider.slider-fade .owl-carousel").data("rtl"),
        dots: true,
        margin: 0,
        autoplay: true,
        autoplayTimeout: 5000,
        animateOut: 'fadeOut',
        nav: false,
        navText: ['<i class="ti-angle-left" aria-hidden="true"></i>', '<i class="ti-angle-right" aria-hidden="true"></i>'],
        responsiveClass: true,
        responsive: {
            0: {
                dots: false
            },
            600: {
                dots: false
            },
            1000: {
                dots: true
            }
        }
    });
    owl.on('changed.owl.carousel', function (event) {
        var item = event.item.index - 2; // Position of the current item
        jQuery('span').removeClass('animated fadeInUp');
        jQuery('.tl-header-banner-sub-title').removeClass('animated fadeInUp');
        jQuery('.tl-header-banner-title').removeClass('animated fadeInUp');
        jQuery('p').removeClass('animated fadeInUp');
        jQuery('.butn-light').removeClass('animated fadeInUp');
        jQuery('.butn-dark').removeClass('animated fadeInUp');
        jQuery('.owl-item').not('.cloned').eq(item).find('span').addClass('animated fadeInUp');
        jQuery('.owl-item').not('.cloned').eq(item).find('.tl-header-banner-sub-title').addClass('animated fadeInUp');
        jQuery('.owl-item').not('.cloned').eq(item).find('.tl-header-banner-title').addClass('animated fadeInUp');
        jQuery('.owl-item').not('.cloned').eq(item).find('p').addClass('animated fadeInUp');
        jQuery('.owl-item').not('.cloned').eq(item).find('.butn-light').addClass('animated fadeInUp');
        jQuery('.owl-item').not('.cloned').eq(item).find('.butn-dark').addClass('animated fadeInUp');
    });
});
     
});
