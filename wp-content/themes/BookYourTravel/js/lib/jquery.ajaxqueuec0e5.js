/*
 * Based on jQuery.ajaxQueue - Named queues for ajax requests (c) 2016 Kristian Kraljic, 2012 Corey Frang
 * Dual licensed under the MIT and GPL licenses.
 */

(function(jQuery) {
	var mAjaxQueues = {}; // map for all ajaxQueues we are going to create
	jQuery.ajaxQueue = function(oOptions, sQueueName) {
	
		// Force options to be an object, use default queue if no queue i given
		oOptions = oOptions||{};
		sQueueName = sQueueName||'default';
		
		// jQuery on an empty object, we are going to use this as our queue
		var oAjaxQueue = mAjaxQueues[sQueueName]||(mAjaxQueues[sQueueName]=jQuery({}));
		
		var oXHR, oDeferred = jQuery.Deferred(), oPromise = oDeferred.promise();
		function fnRequest(oNext) { (oXHR=jQuery.ajax(oOptions))
			.done(oDeferred.resolve).fail(oDeferred.reject).then(oNext,oNext); }
		oAjaxQueue.queue(fnRequest);
		
		// Add the abort method to the promise
		oPromise.abort = function(sStatusText) {
			if(oXHR) return oXHR.abort(sStatusText);
			
			// if there wasn't already a jqXHR we need to remove from queue
			var aQueue = oAjaxQueue.queue(), iIndex = jQuery.inArray(fnRequest, aQueue);
			if(iIndex>-1) aQueue.splice(index, 1);
			
			oDeferred.rejectWith(oOptions.context||oOptions, [oPromise,sStatusText,'']);
			return oPromise;
		};

		return oPromise;
	};
})(jQuery);