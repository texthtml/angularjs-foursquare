# AngularJS-Foursquare #

[AngularJS-Foursquare][homepage] provides easy access to [Foursquare APIs][foursquare-api]. You can use it to build Web Application using Foursquare resources (users, checkins, venues, etc.).

## Getting started ##

### Installation ###

#### with bower ####

> bower install angularjs-foursquare

### with git ###

from your project public directory root : 

> git clone git://texthtml.net/webapp/lib/angularjs/foursquare components/angularjs-foursquare

or : 

> git submodule add git://texthtml.net/webapp/lib/angularjs/foursquare components/angularjs-foursquare

### Configuration ###

#### Loading the javascript ####

    <script type="text/javascript" src="components/angularjs-foursquare/angularjs-foursquare.js"></script>

You need to adjust the path if you install AngularJS-Foursquare somewhere else.

#### configuring the FoursquareService ####

    angular.module('MyApp', [thFoursquareService'])
    	.config(function FoursquareAppRun(thFoursquareProvider) {
    		thFoursquareProvider.config({
    			clientId: 'YOUR_CLIENT_ID', 
    			clientSecret: 'YOUR_CLIENT_SECRET', 
    			redirectURI: 'YOUR_REGISTERED_REDIRECT_URI'
    		});
    		
    		// uncomment and adjust if you install AngularJS-Foursquare somewhere else.
    		// thFoursquareProvider.setPath('components/angularjs-foursquare'); 
    	});

YOUR_REGISTERED_REDIRECT_URI should also be a page where the FoursquareService is configured.


## Usage ##

### The Foursquare object ###

Inject *thFoursquare* Service

    function FoursquareCtrl($scope, $timeout, thFoursquare) {
    	$scope.photos = thFoursquare.api.users.photos();
    }

### Foursquare directives ###

#### fsq:login ####

    <th:fsq-login ng:show="!thFsq.logged" th:fsq-display="touch" th:fsq-color="black"></th:fsq-login>

#### fsq:photo ####

    <ul>
      <li ng:repeat="photo in checkin.photos.items">
        <a th:fsq-photo="photo" rel="lightbox[checkin]" title="{{ photo.user.firstName }}"><img th:fsq-photo="photo" th:fsq-photo-size="cap48"/></a>
      </li>
    </ul>

## Documentation ##

This is a work in progress. There is no other documentation than the source code and your browser console yet. 
Some day it will be there : [AngularJS-Foursquare Wiki][wiki].

## Bugs ##

There are [bugs][bugs] (even if they are not listed). But I'd like to get rid of them. If you want to help, you can [report one][report-bug].

## Suggestions & Contributions ##

The easiest way to get started here is to send me en email at <mathieu@rochette.cc>.


[homepage]: https://texthtml.net/trac/projects/webapp-lib-angularjs-foursquare
[foursquare-api]: https://developer.foursquare.com/overview/
[bugs]: https://texthtml.net/trac/projects/webapp-lib-angularjs-foursquare/issues
[report-bug]: https://texthtml.net/trac/projects/webapp-lib-angularjs-foursquare/issues/new
[wiki]: https://texthtml.net/trac/projects/webapp-lib-angularjs-foursquare/wiki