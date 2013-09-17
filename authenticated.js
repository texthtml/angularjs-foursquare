(function() {
	'use strict';
	
	localStorage.setItem('foursquare_oauth_token',  location.hash.split('#access_token=')[1]);
	window.close();
}) ();