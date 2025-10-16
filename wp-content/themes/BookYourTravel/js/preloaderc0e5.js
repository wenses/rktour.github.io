(function ($) {
	var hidePreloaderInterval = null;

	function hidePreloader() {
		var pageSpinner = document.querySelector('.page-spinner');
		if (pageSpinner !== null) {
			pageSpinner.style.display = 'none';
			clearInterval(hidePreloaderInterval);			
		}
	}

    hidePreloaderInterval = setInterval(hidePreloader, 500);
}(jQuery));