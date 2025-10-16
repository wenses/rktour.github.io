(function($) {
    var gridIsog = function ($scope, $) {

   if (jQuery(".loadmore-wrapper-gallery").length) {
  // init Isotope
  var jQueryloadmorexen =jQuery('.container-after-gallery');
  var jQuerycontainer = jQuery('.loadmore-wrapper-gallery').isotope({
    itemSelector: ".isotope-item",
	layoutMode: "packery",
	transitionDuration: "0.7s",
	percentPosition: true
  });
  jQuerycontainer.imagesLoaded(function () {
     jQuerycontainer.isotope("layout");
  });
}

  //****************************
  // Isotope Load more button
  //****************************
  var itemcount = jQuery('.loadmore-wrapper-gallery').data('load-item');
  var buttontext = jQuery('.loadmore-wrapper-gallery').data('button-text');
  var initShow = itemcount; //number of items loaded on init & onclick load more button
  var counter = initShow; //counter for load more button
  var iso = jQuerycontainer.data('isotope'); // get Isotope instance

  loadMore(initShow); //execute function onload

  function loadMore(toShow) {
    jQuerycontainer.find(".hidden").removeClass("hidden");

    var hiddenElems = iso.filteredItems.slice(toShow, iso.filteredItems.length).map(function(item) {
      return item.element;
    });
    jQuery(hiddenElems).addClass('hidden');
    jQuerycontainer.isotope('layout');

    //when no more to load, hide show more button
    if (hiddenElems.length == 0) {
      jQuery(".iso-load-more-wrap-gallery").hide();
      //jQuery(".full-width-section").addClass('xen-bottom-padding-120');
    } 
	else {
      jQuery(".iso-load-more-wrap-gallery").show();
    };

  }

if (iso.filteredItems.length < initShow) {

}
else if (iso.filteredItems.length == initShow) {

}

else {

//append load more button
  jQueryloadmorexen.after('<div class="travol-more-wrapper-new text-center mt-15  iso-load-more-wrap-gallery" ><button class="butn-dark mt-15 iso-load-button"  id="load-more-gallery"><a> <span>'+ buttontext +'</span> </a></button></div>');
}
  //when load more button clicked
  jQuery("#load-more-gallery").click(function() {
    if (jQuery('#filters').data('clicked')) {
      //when filter button clicked, set initial value for counter
      counter = initShow;
      jQuery('#filters').data('clicked', false);
    } else {
      counter = counter;
    };

    counter = counter + initShow;

    loadMore(counter);
  });


    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/travol-image-gallery.default', gridIsog);
    });

   
})(jQuery);