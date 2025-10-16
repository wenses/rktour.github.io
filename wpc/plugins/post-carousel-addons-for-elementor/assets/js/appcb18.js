'use strict';
(function ($) {
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/post-carousel-addons.default', function ($scope, $) {
            let CarouselFrame = $scope.find('.eshuzu_post_carousel_frame');
            let carouselConfig = {
                /*Slide show count*/
                slide_count: parseInt(CarouselFrame.attr('data-slide_count')),
                slide_count_tablet: parseInt(CarouselFrame.attr('data-slide_count_tablet')),
                slide_count_mobile: parseInt(CarouselFrame.attr('data-slide_count_mobile')),

                /*Slide scroll count*/
                slide_scroll: parseInt(CarouselFrame.attr('data-slide_scroll')),
                slide_scroll_tablet: parseInt(CarouselFrame.attr('data-slide_scroll_tablet')),
                slide_scroll_mobile: parseInt(CarouselFrame.attr('data-slide_scroll_mobile')),

                /*Slider Arrow*/
                slide_arrow_show: Boolean(CarouselFrame.attr('data-arrow_show')),
                next_arrow: $scope.find('.next_arrow'),
                previous_arrow: $scope.find('.previous_arrow'),

                /*Slide Dots*/
                slide_dots_show: Boolean(CarouselFrame.attr('data-dots_show')),

                /*Slide Other Configuration*/
                slide_center_mode: Boolean(CarouselFrame.attr('data-center_mode')),
                autoplay_slide: Boolean(CarouselFrame.attr('data-autoplay')),
                autoplay_speed: parseInt(CarouselFrame.attr('data-autoplaySpeed')),
                infinite: Boolean(CarouselFrame.attr('data-infinite')),

            };
            CarouselFrame.slick({
                infinite: carouselConfig.infinite,
                autoplay: carouselConfig.autoplay_slide,
                autoplaySpeed: carouselConfig.autoplay_speed,
                slidesToShow: carouselConfig.slide_count,
                slidesToScroll: carouselConfig.slide_scroll,
                arrows: carouselConfig.slide_arrow_show,
                nextArrow: carouselConfig.next_arrow,
                prevArrow: carouselConfig.previous_arrow,
                dots: carouselConfig.slide_dots_show,
                responsive: [
                    {
                        breakpoint: 1025,
                        settings: {
                            slidesToShow: carouselConfig.slide_count_tablet,
                            slidesToScroll: carouselConfig.slide_scroll_tablet,
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: carouselConfig.slide_count_mobile,
                            slidesToScroll: carouselConfig.slide_scroll_mobile
                        }
                    },
                ]
            });

        });
    });
})(jQuery);