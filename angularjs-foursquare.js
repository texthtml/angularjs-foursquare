(function() {
	"use strict";
	
	function FoursquareService($q, $http, $rootScope, clientId, clientSecret, clientRedirectURI, clientSaveOAuthToken, clientGetOAuthToken) {
		var
			FoursquareAPI = 'https://api.foursquare.com/v2/', 
			FoursquareClientRedirectURI = clientRedirectURI, 
			FoursquareClientSaveOAuthToken = clientSaveOAuthToken, 
			FoursquareClientGetOAuthToken = clientGetOAuthToken, 
			FoursquareDefaultParams = {
				v: 20130317
			}, 
			FoursquareClientParams = {
				client_id: clientId, 
				client_secret: clientSecret
			};
		
		function FoursquareEndpoint(endpoint, defaultParams, method, resultKey, headers) {
			var 
				isArray = typeof resultKey === 'string' && resultKey[0] === '*', 
				endpointParams = (endpoint.match(/:[^\/]*\b/g) || []).map(function(key) {
				return key.substr(1);
			});
				
				if(isArray) {
					resultKey = resultKey.substr(1);
				}
			
			return function(inputParams, data) {
				var 
					url = endpoint, 
					first = true, 
					params = angular.extend(
						{}, 
						defaultParams || {}, 
						FoursquareDefaultParams, 
						inputParams || {}, 
						FoursquareClientParams
					);
				
				for(var i = 0; i < endpointParams.length; i++) {
					var key = endpointParams[i];
					if(params[key] !== undefined) {
						url = url.replace(':'+key, escape(params[key]));
						delete params[key];
					}
				}
				
				var 
					resource = isArray ? [] : {}, 
					q = $http({
						url : FoursquareAPI + url, 
						params: params, 
						method: method, 
						data: data, 
						headers: angular.extend({
							'X-Requested-With': undefined
						}, headers || {}), 
						transformResponse: function(data) {
							if(typeof data === 'string') {
								data = JSON.parse(data);
							}
							if(200 <= data.meta.code && data.meta.code < 300) {
								angular.copy(
									resultKey === undefined ? data.response : data.response[resultKey], 
									resource
								);
								
								return resource;
							}
							
							delete data.meta.code;
							return data.meta;
						}
					});
				
				resource.then = q.then.bind(q);
				resource.then = function() {
					return q.then.apply(q, arguments);
				}
				
				return resource;
			}
			return (function(resource) {
				return function() {
					args = [].slice.call(arguments);
					args[0] = angular.extend(
						params || {}, 
						FoursquareDefaultParams, 
						args[0], FoursquareClientParams
					);
					for(var paramName in args[0]) {
						if(args[0][paramName] === undefined) {
							delete args[0][paramName];
						}
					}
					return resource[method].apply(resource, args);
				};
			}) ($resource(FoursquareAPI + endpoint));
		}
		
		function notImplemented() {
			var deferred = $q.defer();
			deferred.reject('not implemented');
			return deferred.promise;
		}
		
		var api = {};
		
		
		api.users              = FoursquareEndpoint('users/:user_id',                           {user_id: 'self'}, 'get',  'user');
		
		api.users.leaderboard  = FoursquareEndpoint('users/leaderboard',                        {},                'get',  'leaderboard');
		api.users.requests     = FoursquareEndpoint('users/requests',                           {},                'get',  '*requests');
		api.users.search       = FoursquareEndpoint('users/search',                             {},                'get');
		
		api.users.badges       = FoursquareEndpoint('users/:user_id/badges',                    {user_id: 'self'}, 'get');
		api.users.checkins     = FoursquareEndpoint('users/:user_id/checkins',                  {user_id: 'self'}, 'get',  'checkins');
		api.users.friends      = FoursquareEndpoint('users/:user_id/friends',                   {user_id: 'self'}, 'get',  'friends');
		api.users.lists        = FoursquareEndpoint('users/:user_id/lists',                     {user_id: 'self'}, 'get',  'lists');
		api.users.mayorships   = FoursquareEndpoint('users/:user_id/mayorships',                {user_id: 'self'}, 'get',  'mayorships');
		api.users.photos       = FoursquareEndpoint('users/:user_id/photos',                    {user_id: 'self'}, 'get',  'photos');
		api.users.tips         = FoursquareEndpoint('users/:user_id/tips',                      {user_id: 'self'}, 'get',  'tips');
		api.users.todos        = FoursquareEndpoint('users/:user_id/todos',                     {user_id: 'self'}, 'get',  'todos');
		api.users.venuehistory = FoursquareEndpoint('users/:user_id/venuehistory',              {user_id: 'self'}, 'get',  'venues');
		
		api.users.approve      = FoursquareEndpoint('users/:user_id/approve',                   {},                'post', 'user');
		api.users.deny         = FoursquareEndpoint('users/:user_id/deny',                      {},                'post', 'user');
		api.users.request      = FoursquareEndpoint('users/:user_id/request',                   {},                'post', 'user');
		api.users.setpings     = FoursquareEndpoint('users/:user_id/setpings',                  {},                'post', 'user');
		api.users.unfriend     = FoursquareEndpoint('users/:user_id/unfriend',                  {},                'post', 'user');
		api.users.update       = notImplemented;
		
		
		api.venues                   = FoursquareEndpoint('venues/:venueId',                    {},                'get',  'venue');
		
		api.venues.add               = FoursquareEndpoint('venues/add',                         {},                'post', 'venue');
		api.venues.categories        = FoursquareEndpoint('venues/categories',                  {},                'get',  '*categories');
		api.venues.explore           = FoursquareEndpoint('venues/explore',                     {},                'get');
		api.venues.managed           = FoursquareEndpoint('venues/managed',                     {},                'get',  '*venues');
		api.venues.search            = FoursquareEndpoint('venues/search',                      {},                'get',  '*venues');
		api.venues.suggestcompletion = FoursquareEndpoint('venues/suggestcompletion',           {},                'get',  '*minivenues');
		api.venues.timeseries        = FoursquareEndpoint('venues/timeseries',                  {},                'get',  '*timeseries');
		api.venues.trending          = FoursquareEndpoint('venues/trending',                    {},                'get',  '*venues');
		
		api.venues.events            = FoursquareEndpoint('venues/:venueId/events',             {},                'get',  'events');
		api.venues.herenow           = FoursquareEndpoint('venues/:venueId/herenow',            {},                'get',  'hereNow');
		api.venues.hours             = FoursquareEndpoint('venues/:venueId/hours',              {},                'get');
		api.venues.likes             = FoursquareEndpoint('venues/:venueId/likes',              {},                'get',  'likes');
		api.venues.links             = FoursquareEndpoint('venues/:venueId/links',              {},                'get',  'links');
		api.venues.listed            = FoursquareEndpoint('venues/:venueId/listed',             {},                'get',  'lists');
		api.venues.menu              = FoursquareEndpoint('venues/:venueId/menu',               {},                'get',  'menus');
		api.venues.nextvenues        = FoursquareEndpoint('venues/:venueId/nextvenues',         {},                'get',  'nextVenues');
		api.venues.photos            = FoursquareEndpoint('venues/:venueId/photos',             {},                'get',  'photos');
		api.venues.similar           = FoursquareEndpoint('venues/:venueId/similar',            {},                'get',  'similar');
		api.venues.stats             = FoursquareEndpoint('venues/:venueId/stats',              {},                'get',  'stats');
		api.venues.tips              = FoursquareEndpoint('venues/:venueId/tips',               {},                'get',  'tips');
		
		api.venues.dislike           = FoursquareEndpoint('venues/:venueId/dislike',            {},                'post');
		api.venues.edit              = FoursquareEndpoint('venues/:venueId/edit',               {},                'post');
		api.venues.flag              = FoursquareEndpoint('venues/:venueId/flag',               {},                'post');
		api.venues.like              = FoursquareEndpoint('venues/:venueId/like',               {},                'post', 'likes');
		api.venues.proposeedit       = FoursquareEndpoint('venues/:venueId/proposeedit',        {},                'post');
		api.venues.setrole           = FoursquareEndpoint('venues/:venueId/setrole',            {},                'post');
		
		
		api.venuegroup               = FoursquareEndpoint('venuegroups/:group_id',              {},                'get',  'venuegroup');
		
		api.venuegroup.add           = FoursquareEndpoint('venuegroups/:group_id/add',          {},                'post', 'venuegroup');
		api.venuegroup.delete        = FoursquareEndpoint('venuegroups/:group_id/delete',       {},                'post');
		api.venuegroup.list          = FoursquareEndpoint('venuegroups/list',                   {},                'get',  'venuegroup');
		
		api.venuegroup.timeseries    = FoursquareEndpoint('venuegroups/:group_id/timeseries',   {},                'post', 'timeseries');
		
		api.venuegroup.addvenue      = FoursquareEndpoint('venuegroups/:group_id/addvenue',     {},                'post');
		api.venuegroup.campaigns     = FoursquareEndpoint('venuegroups/:group_id/campaigns',    {},                'get',  'campaigns');
		api.venuegroup.edit          = FoursquareEndpoint('venuegroups/:group_id/edit',         {},                'post');
		api.venuegroup.removevenue   = FoursquareEndpoint('venuegroups/:group_id/removevenue',  {},                'post');
		api.venuegroup.update        = FoursquareEndpoint('venuegroups/:group_id/update',       {},                'post', 'venuegroup');
		
		
		api.checkins                 = FoursquareEndpoint('checkins/:checkin_id',               {},                'get',  'checkin');
		
		api.checkins.add             = FoursquareEndpoint('checkins/add',                       {},                'post');
		api.checkins.recent          = FoursquareEndpoint('checkins/recent',                    {},                'get',  '*recent');
		
		api.checkins.likes           = FoursquareEndpoint('checkins/:checkin_id/likes',         {},                'get',  'likes');
		
		api.checkins.addcomment      = FoursquareEndpoint('checkins/:checkin_id/addcomment',    {},                'post', 'comment');
		api.checkins.addpost         = FoursquareEndpoint('checkins/:checkin_id/addpost',       {},                'post', 'post');
		api.checkins.deletecomment   = FoursquareEndpoint('checkins/:checkin_id/deletecomment', {},                'post', 'checkin');
		api.checkins.like            = FoursquareEndpoint('checkins/:checkin_id/like',          {},                'post', 'likes');
		api.checkins.reply           = FoursquareEndpoint('checkins/:checkin_id/reply',         {},                'post', 'reply');
		
		
		api.tips                     = FoursquareEndpoint('tips/:tip_id',                       {},                'get',  'tip');
		
		api.tips.add                 = FoursquareEndpoint('tips/add',                           {},                'post', 'tip');
		api.tips.search              = FoursquareEndpoint('tips/search',                        {},                'get',  '*tips');
		
		api.tips.likes               = FoursquareEndpoint('tips/:tip_id/likes',                 {},                'get',  'likes');
		api.tips.listed              = FoursquareEndpoint('tips/:tip_id/listed',                {},                'get',  'lists');
		api.tips.saves               = FoursquareEndpoint('tips/:tip_id/saves',                 {},                'get',  'saves');
		
		api.tips.flag                = FoursquareEndpoint('tips/:tip_id/flag',                  {},                'post');
		api.tips.like                = FoursquareEndpoint('tips/:tip_id/like',                  {},                'post', 'likes');
		api.tips.unmark              = FoursquareEndpoint('tips/:tip_id/unmark',                {},                'post', 'tip');
		
		api.lists                    = FoursquareEndpoint('lists/:list_id',                     {},                'get',  'list');
		
		api.lists.add                = FoursquareEndpoint('lists/add',                          {},                'post', 'list');
		
		api.lists.followers          = FoursquareEndpoint('lists/:list_id/followers',           {},                'get', 'followers');
		api.lists.saves              = FoursquareEndpoint('lists/:list_id/saves',               {},                'get', 'saves');
		api.lists.suggestphoto       = FoursquareEndpoint('lists/:list_id/suggestphoto',        {},                'get', 'photos');
		api.lists.suggesttip         = FoursquareEndpoint('lists/:list_id/suggesttip',          {},                'get', 'tips');
		api.lists.suggestvenues      = FoursquareEndpoint('lists/:list_id/suggestvenues',       {},                'get', 'suggestedVenues');
		
		api.lists.additem            = FoursquareEndpoint('lists/:list_id/additem',             {},                'post');
		api.lists.deleteitem         = FoursquareEndpoint('lists/:list_id/deleteitem',          {},                'post');
		api.lists.follow             = FoursquareEndpoint('lists/:list_id/follow',              {},                'post', 'list');
		api.lists.moveitem           = FoursquareEndpoint('lists/:list_id/moveitem',            {},                'post', 'list');
		api.lists.share              = FoursquareEndpoint('lists/:list_id/share',               {},                'post');
		api.lists.unfollow           = FoursquareEndpoint('lists/:list_id/unfollow',            {},                'post', 'list');
		api.lists.update             = FoursquareEndpoint('lists/:list_id/update',              {},                'post', 'list');
		api.lists.updateitem         = FoursquareEndpoint('lists/:list_id/updateitem',          {},                'post');
		
		
		api.updates                  = FoursquareEndpoint('updates/:update_id',                 {},                'get',  'notification');
		
		api.updates.notifications    = FoursquareEndpoint('updates/notifications',              {},                'get',  'notifications');
		
		api.updates.markasread       = FoursquareEndpoint('updates/marknotificationsread',      {},                'get',  'notifications');
		
		
		api.photos                   = FoursquareEndpoint('photos/:photo_id',                   {},                'get',  'photo');
		
		api.photos.add               = FoursquareEndpoint('photos/add',                         {},                'post', 'photo', {'content-type': 'image/jpeg'});
		
		
		api.settings                 = FoursquareEndpoint('settings/:setting_id',               {},                'get',  'value');
		
		api.settings.all             = FoursquareEndpoint('settings/all',                       {},                'get',  'settings');
		
		api.settings.set             = FoursquareEndpoint('settings/:setting_id/set',           {},                'post', 'message');
		
		
		api.specials                 = FoursquareEndpoint('specials/:special_id',               {},                'get',  'special');
		
		api.specials.add             = FoursquareEndpoint('specials/add',                       {},                'post', 'special');
		api.specials.list            = FoursquareEndpoint('specials/list',                      {},                'get',  'specials');
		api.specials.search          = FoursquareEndpoint('specials/search',                    {},                'get',  '*specials');
		
		api.specials.configuration   = FoursquareEndpoint('specials/:special_id/configuration', {},                'post', 'special');
		
		api.specials.flag            = FoursquareEndpoint('specials/:special_id/flag',          {},                'post');
		api.specials.retire          = FoursquareEndpoint('specials/:special_id/retire',        {},                'post');
		
		
		api.campaigns                = FoursquareEndpoint('campaigns/:campaign_id',             {},                'get',  'campaigns');
		
		api.campaigns.add            = FoursquareEndpoint('campaigns/add',                      {},                'post', 'campaign');
		api.campaigns.list           = FoursquareEndpoint('campaigns/list',                     {},                'get',  'matches');
		
		
		api.campaigns.timeseries     = FoursquareEndpoint('campaigns/:campaign_id/timeseries',  {},                'get',  '*timeseries');
		
		api.campaigns.delete         = FoursquareEndpoint('campaigns/:campaign_id/delete',      {},                'post');
		api.campaigns.end            = FoursquareEndpoint('campaigns/:campaign_id/end',         {},                'post');
		api.campaigns.start          = FoursquareEndpoint('campaigns/:campaign_id/start',       {},                'post');
		
		
		api.events                   = FoursquareEndpoint('events/:event_id',                   {},                'get',  'event');
		
		api.events.categories        = FoursquareEndpoint('events/categories',                  {},                'get',  '*categories');
		api.events.search            = FoursquareEndpoint('events/search',                      {},                'get',  '*event');
		
		api.events.add               = FoursquareEndpoint('events/add',                         {},                'post', 'event');
		
		
		api.pages                    = FoursquareEndpoint('pages/:user_id',                     {},                'get',  'user');
		
		api.pages.add                = FoursquareEndpoint('pages/add',                          {},                'post');
		api.pages.managing           = FoursquareEndpoint('pages/managing',                     {},                'get',  '*managing');
		api.pages.search             = FoursquareEndpoint('pages/search',                       {},                'get',  '*results');
		
		api.pages.timeseries         = FoursquareEndpoint('pages/:page_id/timeseries',          {},                'get',  '*timeseries');
		api.pages.venues             = FoursquareEndpoint('pages/:page_id/venues',              {},                'get',  'venues');
		
		api.pages.like               = FoursquareEndpoint('pages/:page_id/like',                {},                'post', 'user');
		
		
		api.pageupdate               = FoursquareEndpoint('pageupdates/:update_id',             {},                'get',  'pageUpdate');
		
		api.pageupdate.add           = FoursquareEndpoint('pageupdates/add',                    {},                'post', 'pageUpdate');
		api.pageupdate.list          = FoursquareEndpoint('pageupdates/list',                   {},                'get',  'pageUpdates');
		
		api.pageupdate.delete        = FoursquareEndpoint('pageupdates/:update_id/delete',      {},                'post');
		api.pageupdate.like          = FoursquareEndpoint('pageupdates/:update_id/like',        {},                'post');
		
		
		var Foursquare = {
			defaultParameters: function FoursquareDefaultParameters(params) {
				FoursquareDefaultParams = angular.extend(FoursquareDefaultParams, params);
				Foursquare.logged = FoursquareDefaultParams.oauth_token !== undefined;
				
				return FoursquareDefaultParams;
			}, 
			setOAuthToken: function FoursquareSetOAuthToken(oauth_token) {
				Foursquare.defaultParameters({oauth_token: oauth_token});
			}, 
			setLocale: function FoursquareSetLocale(locale) {
				Foursquare.defaultParameters({locale: locale});
				$rootScope.apply();
			}, 
			authURI: function FoursquareAuthURI(display, response_type) {
				return 'https://foursquare.com/oauth2/authenticate' + 
					'?client_id=' + FoursquareClientParams.client_id + 
					'&display=' + (display || '') + 
					'&response_type=' + (response_type || 'token') + 
					'&redirect_uri=' + encodeURI(FoursquareClientRedirectURI);
			}, 
			login: function FoursquareLogin(callback, step, display, response_type) {
				var interval = window.setInterval(function() {
					if(this.closed) {
						window.clearInterval(interval);
						Foursquare.setOAuthToken(FoursquareClientGetOAuthToken());
						
						callback && callback(Foursquare.logged);
						
						$rootScope.$apply();
					}
				}.bind(window.open(Foursquare.authURI(display, response_type))), step || 500);
			}, 
			logout: function FoursquareLogout() {
				Foursquare.setOAuthToken(undefined);
				FoursquareClientSaveOAuthToken(undefined);
			}, 
			api: api
		};
		
		Foursquare.setOAuthToken(FoursquareClientGetOAuthToken());
		
		return Foursquare;
	};

	function FoursquareProvider() {
		
		var FoursquareConfig = {
			clientId: undefined, 
			clientSecret: undefined, 
			redirectURI: undefined, 
			saveOAuthToken: function SaveOAuthToken(OAuthToken) {
				if(OAuthToken === undefined) {
					localStorage.removeItem('foursquare_oauth_token');
				}
				else {
					localStorage.foursquare_oauth_token = OAuthToken;
				}
			}, 
			getOAuthToken: function GetOAuthToken() {
				return localStorage.foursquare_oauth_token;
			}
		};
		
		this.config = function(config) {
			for(var key in config) {
				FoursquareConfig[key] = config[key] || FoursquareConfig[key];
			}
			
			var oauth_token = location.hash.split('#access_token=')[1];
			if(oauth_token !== undefined && typeof FoursquareConfig.saveOAuthToken === 'function') {
				FoursquareConfig.saveOAuthToken(oauth_token);
				window.close();
			}
		};
		
		this.$get = function($q, $http, $rootScope) {
			return new FoursquareService(
				$q, $http, 
				$rootScope, 
				FoursquareConfig.clientId, FoursquareConfig.clientSecret, 
				FoursquareConfig.redirectURI, 
				FoursquareConfig.saveOAuthToken, FoursquareConfig.getOAuthToken
			);
		};
	}

	angular.module('FoursquareService', ['ngResource'], function($provide) {
		$provide.provider('Foursquare', FoursquareProvider);
	}).directive('fsq:image', function foursquareImageFactory() {
		return {
			restrict: 'E', 
			link: function() {
				console.log('eee');
			}
		}
	});
}) ();