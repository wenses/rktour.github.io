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
    
    // ScrollIt
    jQuery.scrollIt({
        upKey: 38, // key code to navigate to the next section
        downKey: 40, // key code to navigate to the previous section
        easing: 'swing', // the easing function for animation
        scrollTime: 600, // how long (in ms) the animation takes
        activeClass: 'active', // class given to the active nav element
        onPageChange: null, // function(pageIndex) that is called when page is changed
        topOffset: -70 // offste (in px) for fixed top navigation
    });
    
    // Sticky on scroll
	function stickyNav() {
		var scrollTop = jQuery(window).scrollTop(),
			noSticky = jQuery('.no-sticky'),
			viewportSm = jQuery('.viewport-sm'),
			viewportLg = jQuery('.viewport-lg'),
			viewportLgBody = viewportLg.parent('body'),
			viewportLgNosticky = jQuery('.viewport-lg.no-sticky'),
			viewportLgNostickyBody = viewportLgNosticky.parent('body'),
			viewportLgLogo = viewportLg.find('.logo img'),
			viewportLgNostickyLogo = viewportLgNosticky.find('.logo img'),
			headerTransparentLg = jQuery('.viewport-lg.header-transparent'),
			headerTransparentLgNosticky = jQuery('.viewport-lg.header-transparent.no-sticky'),
			headerTransparentLgBody = headerTransparentLg.parent('body'),
			headerOpacityLg = jQuery('.viewport-lg.header-opacity'),
			headerOpacityLgNosticky = jQuery('.viewport-lg.header-opacity.no-sticky'),
			headerOpacityLgBody = headerOpacityLg.parent('body');

		if (scrollTop > duruHeaderHeight) {
			duruHeader.addClass('sticky');
			viewportLgLogo.attr('src', stickyLogoSrc);
			viewportLgNostickyLogo.attr('src', logoSrc);
			headerTransparentLg.removeClass('header-transparent-on');
			headerTransparentLgNosticky.addClass('header-transparent-on');
			viewportLgBody.css("margin-top", duruHeaderHeight);
			viewportLg.css("margin-top", -duruHeaderHeight);
		} else {
			duruHeader.removeClass('sticky');
			viewportLgLogo.attr('src', logoSrc);
			headerTransparentLg.addClass('header-transparent-on');
			viewportLgBody.add(viewportLg).css("margin-top", "0");
		}
		noSticky.removeClass('sticky');
		viewportSm.removeClass('sticky');
		headerTransparentLg.add(headerTransparentLgBody).add(headerOpacityLg).add(headerOpacityLgBody).add(viewportLgNostickyBody).add(viewportLgNosticky).css("margin-top", "0");
	}

	//  Menu overlay transition
	function overlayMenuTransition() {
		var overlayMenuFirst = jQuery('.duru-menu-overlay > ul > li:first-child'),
			overlayMenuList = jQuery('.duru-menu-overlay > ul > li');
		overlayMenuFirst.attr('data-delay', '0');
		overlayMenuList.each(function(){
			var jQuerythis = jQuery(this),
				overlayMenuNext = jQuerythis.next('li'),
				menuDataDelay = jQuerythis.attr('data-delay'),
				menuDataDelayNext = parseInt(menuDataDelay) + parseInt('100');
			overlayMenuNext.attr('data-delay', menuDataDelayNext);
			jQuerythis.delay(menuDataDelay).queue(function(next) {
				jQuery(this).addClass("menuSlideIn");
				next();
			});
		});
	}

	// Navigation menu
	if (jQuery('.duru-header').length) {
		var duruHeader = jQuery('.duru-header'),
			duruHeaderHeight = duruHeader.height(),
			logo = duruHeader.find('.logo'),
			logoImg = logo.find('img'),
			logoSrc = logoImg.attr('src'),
			logoClone = logo.clone(),
			mobileLogoSrc = logo.data('mobile-logo'),
			mobileLogoSrcAlt = logo.data('mobile-logo-alt'),
			stickyLogoSrc = logo.data('sticky-logo'),
			burgerMenu = duruHeader.find('.burger-menu'),
			duruMenuListWrapper = jQuery('.duru-menu > ul'),
			duruMenuListDropdown = jQuery('.duru-menu ul li:has(ul)'),
			headerShadow = jQuery('.duru-header.header-shadow'),
			headerTransparent = jQuery('.duru-header.header-transparent'),
			headerOpacity = jQuery('.duru-header.header-opacity'),
			megaMenuFullwidthContainer = jQuery('.mega-menu-fullwidth .mega-menu-container');

		/* ========== Mega menu fullwidth wrap container ========== */
		megaMenuFullwidthContainer.each(function(){
			jQuery(this).children().wrapAll('<div class="mega-menu-fullwidth-container"></div>');
		});

		/* ========== Window resize ========== */
		jQuery(window).on("resize", function() {
			var megaMenuContainer = jQuery('.mega-menu-fullwidth-container');
			if (jQuery(window).width() < 1200) {
				logoImg.attr('src', mobileLogoSrcAlt);
				duruHeader.removeClass('viewport-lg');
				duruHeader.addClass('viewport-sm');
				headerTransparent.removeClass('header-transparent-on');
				megaMenuContainer.removeClass('container');
			} else {
				logoImg.attr('src', logoSrc);
				duruHeader.removeClass('viewport-sm');
				duruHeader.addClass('viewport-lg');
				headerTransparent.addClass('header-transparent-on');
				megaMenuContainer.addClass('container');
			}
			stickyNav();
		}).resize();

		/* ========== Dropdown Menu Toggle ========== */
		burgerMenu.on("click", function(){
			jQuery(this).toggleClass('menu-open');
			duruMenuListWrapper.slideToggle(300);
		});
		duruMenuListDropdown.each(function(){
			jQuery(this).append( '<span class="dropdown-plus"></span>' );
			jQuery(this).addClass('dropdown_menu');
		});
		jQuery('.dropdown-plus').on("click", function(){
			jQuery(this).prev('ul').slideToggle(300);
			jQuery(this).toggleClass('dropdown-open');
		});
		jQuery('.dropdown_menu a').append('<span></span>');

		/* ========== header shadow ========== */
		headerShadow.append('<div class="header-shadow-wrapper"></div>');

		/* ========== Sticky on scroll ========== */
		jQuery(window).on("scroll", function() {
			stickyNav();
		}).scroll();
	}

	//  Overlay navigation menu
	if (jQuery('.duru-header-overlay').length) {

		var duruHeaderOverlay = jQuery('.duru-header-overlay'),
			duruMenuOverlay = jQuery('.duru-menu-overlay'),
			burgerMenuOverlay = duruHeaderOverlay.find('.burger-menu'),
			lineMenuOverlay = duruHeaderOverlay.find('.line-menu'),
			menuOverlayLogo = duruHeaderOverlay.find('.logo'),
			overlayLogoClone = menuOverlayLogo.clone(),
			menuWrapperLogoSrc = menuOverlayLogo.data('overlay-logo'),
			menuOverlayListDropdown = jQuery('.duru-menu-overlay > ul > li:has(ul)'),
			menuOverlayLink = jQuery('.duru-menu-overlay > ul > li > a'),
			menuSlide = jQuery('.duru-header-overlay.menu-slide'),
			menuSlideSubmenuLink = menuSlide.find('.duru-menu-overlay > ul ul a'),
			menuSlideSubmenuDropdown = menuSlide.find('.duru-menu-overlay > ul > li > ul li:has(ul)'),
			menuSocialMedia = duruMenuOverlay.next('.menu-social-media'),
			submenuVerticalListItem = jQuery('.submenu-vertical > ul > li > ul li:has(ul)'),
			submenuVerticalLink = jQuery('.submenu-vertical > ul > li > ul a');

		lineMenuOverlay.wrapAll('<span></span>');
		menuOverlayLink.wrap('<div class="menu-overlay-link"></div>');
		submenuVerticalLink.wrap('<div class="menu-overlay-link"></div>');
		menuSlideSubmenuLink.wrap('<div class="menu-overlay-link"></div>');

		/* ========== Submenu Toggle ========== */
		menuOverlayListDropdown.each(function(){
			var menuOverlayDropdownLink = jQuery(this).children('.menu-overlay-link');
			menuOverlayDropdownLink.prepend( '<span class="overlay-dropdown-plus"></span>' );
			jQuery(this).addClass('overlay_dropdown_menu');
		});

		submenuVerticalListItem.each(function(){
			var submenuVerticalDropdownLink = jQuery(this).children('.menu-overlay-link');
			submenuVerticalDropdownLink.prepend( '<span class="overlay-dropdown-plus"></span>' );
			jQuery(this).addClass('overlay_dropdown_menu');
		});

		menuSlideSubmenuDropdown.each(function(){
			var submenuVerticalDropdownLink = jQuery(this).children('.menu-overlay-link');
			submenuVerticalDropdownLink.prepend( '<span class="overlay-dropdown-plus"></span>' );
			jQuery(this).addClass('overlay_dropdown_menu');
		});

		jQuery('.overlay_dropdown_menu > ul').addClass('overlay-submenu-close');
		
		jQuery('.overlay-dropdown-plus').on("click", function(){
			var jQuerythisParent = jQuery(this).parent('.menu-overlay-link');
			jQuerythisParent.next('ul').slideToggle(300).toggleClass('overlay-submenu-close');
			jQuery(this).toggleClass('overlay-dropdown-open');
		});

		duruMenuOverlay.add(menuSocialMedia).wrapAll('<div class="nav-menu-wrapper"></div>');

		var overlayNavMenuWrapper = jQuery('.nav-menu-wrapper');

		overlayNavMenuWrapper.prepend(overlayLogoClone);
		overlayNavMenuWrapper.find('.logo img').attr('src', menuWrapperLogoSrc);

		var menuOverlayHover = jQuery('.duru-menu-overlay > ul > .overlay_dropdown_menu > ul');

		menuOverlayHover.each(function(){
			jQuery(this).on("mouseenter", function () {
				jQuery(this).parents("li").addClass("overlay-menu-hover");
			});
			jQuery(this).on("mouseleave", function () {
				jQuery(this).parents("li").removeClass("overlay-menu-hover");
			});
		});

		/* ========== Menu overlay open ========== */
		burgerMenuOverlay.on("click", function(){

			var overlayMenuList = jQuery('.duru-menu-overlay > ul > li');

			jQuery(this).toggleClass('menu-open');
			overlayNavMenuWrapper.toggleClass('overlay-menu-open');
			overlayMenuList.removeClass("menuSlideIn");
			
			if (jQuery(this).hasClass("menu-open")) {
				overlayMenuTransition();
				overlayMenuList.removeClass("menuSlideOut").addClass("menuFade");
			}

			if (!jQuery(this).hasClass("menu-open")) {
				overlayMenuList.addClass("menuSlideOut").removeClass("menuFade");
			}

		});

		/* ========== Menu slide settings ========== */
		var menuSlideNavWrapper = menuSlide.find('.nav-menu-wrapper'),
			menuSlideNavLogo = menuSlideNavWrapper.find('.logo');

		if (duruHeaderOverlay.hasClass('menu-slide')){
			duruHeaderOverlay.removeClass('overlay-center-menu');
		}

		menuSlideNavLogo.remove();
		menuSlideNavWrapper.after('<div class="slidemenu-bg-overlay"></div>');

		jQuery('.slidemenu-bg-overlay').on("click", function(){
			menuSlideNavWrapper.removeClass('overlay-menu-open');
			burgerMenuOverlay.removeClass('menu-open');
		});

	}
    
    // Sections background image from data background
    var pageSection = jQuery(".bg-img, section");
    pageSection.each(function (indx) {
        if (jQuery(this).attr("data-background")) {
            jQuery(this).css("background-image", "url(" + jQuery(this).data("background") + ")");
        }
		if (jQuery(this).attr("data-padding")){
            jQuery(this).css("padding", "" + jQuery(this).data("padding") + "");
        }
    });

    
    // Animations
    var contentWayPoint = function () {
        var i = 0;
        jQuery('.animate-box').waypoint(function (direction) {
            if (direction === 'down' && !jQuery(this.element).hasClass('animated')) {
                i++;
                jQuery(this.element).addClass('item-animate');
                setTimeout(function () {
                    jQuery('body .animate-box.item-animate').each(function (k) {
                        var el = jQuery(this);
                        setTimeout(function () {
                            var effect = el.data('animate-effect');
                            if (effect === 'fadeIn') {
                                el.addClass('fadeIn animated');
                            } else if (effect === 'fadeInLeft') {
                                el.addClass('fadeInLeft animated');
                            } else if (effect === 'fadeInRight') {
                                el.addClass('fadeInRight animated');
                            } else {
                                el.addClass('fadeInUp animated');
                            }
                            el.removeClass('item-animate');
                        }, k * 200, 'easeInOutExpo');
                    });
                }, 100);
            }
        }, {
            offset: '85%'
        });
    };
    jQuery(function () {
        contentWayPoint();
    });
    
    
    // YouTubePopUp
    jQuery("a.vid").YouTubePopUp();
    
     // CountUp Numbers
    jQuery('.numbers .count').countUp({
        delay: 10,
        time: 1500
    });
    
    
    // MagnificPopup Gallery
    jQuery('.gallery').magnificPopup({
        delegate: '.popimg',
        type: 'image',
        gallery: {
            enabled: true
        }
    });
    jQuery(".img-zoom").magnificPopup({
        type: "image",
        closeOnContentClick: !0,
        mainClass: "mfp-fade",
        gallery: {
            enabled: !0,
            navigateByImgClick: !0,
            preload: [0, 1]
        }
    })
    jQuery('.magnific-youtube, .magnific-vimeo, .magnific-custom').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 300,
        preloader: false,
        fixedContentPos: false
    });
    
    // Select2
    jQuery('.select2').select2({
        minimumResultsForSearch: Infinity,
    });
    
});




jQuery("form select").each(function(i){
	jQuery(this).addClass('select2 select');
})
// Accordion Box (for Faqs)
    if (jQuery(".accordion-box-shop").length) {
        jQuery(".accordion-box-shop").on("click", ".acc-btn", function () {
            var outerBox = jQuery(this).parents(".accordion-box-shop");
            var target = jQuery(this).parents(".accordion");
            if (jQuery(this).next(".acc-content").is(":visible")) {
                //return false;
                jQuery(this).removeClass("active");
                jQuery(this).next(".acc-content").slideUp(300);
                jQuery(outerBox).children(".accordion").removeClass("active-block");
            } else {
                jQuery(outerBox).find(".accordion .acc-btn").removeClass("active");
                jQuery(this).addClass("active");
                jQuery(outerBox).children(".accordion").removeClass("active-block");
                jQuery(outerBox).find(".accordion").children(".acc-content").slideUp(300);
                target.addClass("active-block");
                jQuery(this).next(".acc-content").slideDown(300);
            }
        });
    }
	
	jQuery(document).on( 'click', 'span.plus-btn, span.minus-btn', function() {
  
         var qty = jQuery( this ).parent( '.input-counter' ).find( '.qty' );
         var val = parseFloat(qty.val());
         var max = parseFloat(qty.attr( 'max' ));
         var min = parseFloat(qty.attr( 'min' ));
         var step = parseFloat(qty.attr( 'step' ));
 
         if ( jQuery( this ).is( '.plus-btn' ) ) {
            if ( max && ( max <= val ) ) {
               qty.val( max ).change();
            } else {
               qty.val( val + step ).change();
            }
         } else {
            if ( min && ( min >= val ) ) {
               qty.val( min ).change();
            } else if ( val > 1 ) {
               qty.val( val - step ).change();
            }
         }
 
      });