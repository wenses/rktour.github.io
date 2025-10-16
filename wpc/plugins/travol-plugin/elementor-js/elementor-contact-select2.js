(function($) {
    var formContact = function ($scope, $) {
		
		
		// Select2
		jQuery('.wpcf7-form-control-wrap select').select2({
			minimumResultsForSearch: Infinity,
		});
		jQuery("form select").each(function(i){
			jQuery(this).addClass('select');
		})		

    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/travol-form.default', formContact);
    });

   
})(jQuery);