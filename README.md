# AngularJS-Foursquare #

AngularJS-Foursquare provides easy access to [Foursquare APIs][1]

## Getting started ##

### Installation ###

#### with bower ####

> bower install angularjs-foursquare

### with git ###

from your project public directory root

> git clone git://texthtml.net/webapp/lib/angularjs/foursquare components/angularjs-foursquare

or

> git submodule add git://texthtml.net/webapp/lib/angularjs/foursquare components/angularjs-foursquare

### Configuration ###

#### Loading the javascript ####

    <script type="text/javascript" src="components/angularjs-foursquare/angularjs-foursquare.js"></script>

You need to adjust the path if you install AngularJS-Foursquare somewhere else.

#### configuring the FoursquareService ####

    angular.module('MyApp', [FoursquareService'])
    	.config(function FoursquareAppRun(FoursquareProvider) {
    		FoursquareProvider.config({
    			clientId: 'YOUR_CLIENT_ID', 
    			clientSecret: 'YOUR_CLIENT_SECRET', 
    			redirectURI: 'YOUR_REGISTERED_REDIRECT_URI'
    		});
    		
    		// uncomment and adjust if you install AngularJS-Foursquare somewhere else.
    		// FoursquareProvider.setPath('components/angularjs-foursquare'); 
    	});

YOUR_REGISTERED_REDIRECT_URI should also be a page where the FoursquareService is configured


### Usage ##

#### The Foursquare object ####

Inject the *Foursquare* Service

    function FoursquareCtrl($scope, $timeout, Foursquare) {
    	$scope.photos = Foursquare.api.users.photos();
    }

#### Foursqure directives ####

    <fsq:login ng:show="!fsq.logged" fsq:display="touch" fsq:color="black"></fsq:login>
  
[1]: https://developer.foursquare.com/overview/
