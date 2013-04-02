# AngularJS-Foursquare #

AngularJS-Foursquare provides easy access to [Foursquare APIs][1]

## Getting started ##

### Installation ###

#### with bower ####

> bower install angularjs-foursquare

### Configuration ###

#### Loading the javascript ####

    <script type="text/javascript" src="components/angularjs-foursquare/angularjs-foursquare.js"></script>

#### configuring the FoursquareService ####

    angular.module('MyApp', [FoursquareService'])
    	.config(function FoursquareAppRun(FoursquareProvider) {
    		FoursquareProvider.config({
    			clientId: 'YOUR_CLIENT_ID', 
    			clientSecret: 'YOUR_CLIENT_SECRET', 
    			redirectURI: 'YOUR_REGISTERED_REDIRECT_URI'
    		});
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
