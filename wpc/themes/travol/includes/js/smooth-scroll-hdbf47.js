/* -------------------------------------------------------

[ Custom settings ]

01. ScrollIt
02. Navbar scrolling background
03. Close navbar-collapse when a  clicked
04. Sections background image from data background 
05. Animations
06. YouTubePopUp
07. CountUp Numbers
08. Testimonials owlCarousel
09. Tours 1 owlCarousel
10. Tours 2 owlCarousel
11. Tours 3 owlCarousel
12. Destination 1 owlCarousel
13. Tour Page owlCarousel
14. Blog owlCarousel
15. Team owlCarousel
16. Clients owlCarousel
17. Accordion Box (for Faqs)
18. MagnificPopup Gallery
19. Smooth Scrolling
20. Scroll back to top
21. Select2
22. Datapicker
23. Slider owlCarousel - (Inner Page Slider)
24. Slider owlCarousel (Homepage Slider)
25. Preloader
26. Contact Form

------------------------------------------------------- */
jQuery(function () {
    "use strict";
    var wind = jQuery(window);
    
    // Smooth Scrolling
    jQuery('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]').not('[href="#0"]').not(".comment-reply-link").not("#cancel-comment-reply-link").click(function (event) {
        // On-page links
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            // Figure out element to scroll to
            var target = jQuery(this.hash);
            target = target.length ? target : jQuery('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                jQuery('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000, function () {
                    // Callback after animation
                    // Must change focus!
                    var jQuerytarget = jQuery(target);
                    jQuerytarget.focus();
                    if (jQuerytarget.is(":focus")) { // Checking if the target was focused
                        return false;
                    } else {
                        jQuerytarget.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                        jQuerytarget.focus(); // Set focus again
                    };
                });
            }
        }
    });
     
});

