(function ($) {
	'use strict';
	
	// ==========================================================
	// Detect mobile device and add class "is-mobile" to </body>
	// ==========================================================

	// Detect mobile device (Do not remove!!!)
	var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Nokia|Opera Mini/i.test(navigator.userAgent) ? true : false;

	// Add class "is-mobile" to </body>
	if(isMobile) {
		jQuery("body").addClass("is-mobile");
		//jQuery(".duru-menu .menu-item-has-children > a").removeAttr('href');
	}
	
})(jQuery); 