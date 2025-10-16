/*jslint long:true */ /*jslint browser: true*/ /*global jQuery*/ /*jslint this:true */

(function ($) {

    "use strict";

    var header_ribbon;

    $(document).ready(function () {
        header_ribbon.init();
    });

    header_ribbon = {

        init: function () {
            if ($(".ribbon .profile-nav .fn-opener").length > 0) {
                $(".ribbon .profile-nav li").hide();
                $(".ribbon .profile-nav .fn-opener").show();
            }

            $(".ribbon li a").on('click', header_ribbon.handleRibbonClick);
            $(".ribbon li.login_lightbox a").on('click', header_ribbon.toggleLoginLightbox);
            $(".ribbon li.register_lightbox a").on('click', header_ribbon.toggleRegisterLightbox);
            $("#login_lightbox a.toggle_lightbox").on('click', header_ribbon.toggleLoginLightbox);
            $("#register_lightbox a.toggle_lightbox").on('click', header_ribbon.toggleRegisterLightbox);
        },
        handleRibbonClick: function (e) {
            if ($(this).parent().hasClass("fn-opener")) {
                if ($(this).parent().parent().hasClass("open")) {
                    $(this).parent().parent().removeClass("open");
                } else {
                    $(".ribbon .profile-nav").removeClass("open");
                    $(this).parent().parent().addClass("open");
                }

                $(".ribbon .profile-nav li").hide();
                $(".ribbon .profile-nav.open li").show();

                $(".ribbon .profile-nav li.fn-opener").show();

                e.preventDefault();
            }
        },
        toggleLoginLightbox: function (e) {
            if ($("#register_lightbox").is(":visible")) {
                $("#register_lightbox").hide();
            }
            $("#login_lightbox").toggle(500);
            e.preventDefault();
        },
        toggleRegisterLightbox: function (e) {
            if ($("#login_lightbox").is(":visible")) {
                $("#login_lightbox").hide();
            }
            $("#register_lightbox").toggle(500);
            e.preventDefault();
        }
    };

}(jQuery));