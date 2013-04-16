(function() {
	"use strict";
	
	
	var FoursquareResourcesPath = '/components/angularjs-foursquare';
	
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
		
		function FoursquareEndpoint(method, endpoint_url, resultKey, defaultParams, headers) {
			var 
				isArray = typeof resultKey === 'string' && resultKey[0] === '*', 
				endpointParams = (endpoint_url.match(/:[^\/]*\b/g) || []).map(function(key) {
					return key.substr(1);
				});
			
			if(isArray) {
				resultKey = resultKey.substr(1);
			}
			
			var endpoint = function(inputParams, data, callback) {
				if(typeof inputParams === 'function') {
					callback = inputParams;
					inputParams = undefined;
				}
				
				if(typeof data === 'function') {
					callback = data;
					data = undefined;
				}
				
				var 
					url = endpoint_url, 
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
						url: FoursquareAPI + url, 
						params: params, 
						method: method, 
						data: data, 
						headers: angular.extend({
							'X-Requested-With': undefined
						}, headers || {}), 
						transformResponse: function(response_data) {
							if(typeof response_data === 'string') {
								response_data = JSON.parse(response_data);
							}
							if(200 >= response_data.meta.code && response_data.meta.code < 300) {
								angular.copy(
									resultKey === undefined ? response_data.response : response_data.response[resultKey], 
									resource
								);
								return resource;
							}
							
							response_data.meta.retry = function() {
								return endpoint(inputParams, data);
							}
							
							delete response_data.meta.code;
							return response_data.meta;
						}
					});
				
				q.then(callback);
				
				return resource;
			};
			
			return endpoint;
		}
		
		function notImplemented() {
			var deferred = $q.defer();
			deferred.reject('not implemented');
			return deferred.promise;
		}
		
		var api = function(e) { return {
			users: e(                  FoursquareEndpoint('get',  'users/:user_id',                     'user',       {user_id: 'self'}), {
				leaderboard:           FoursquareEndpoint('get',  'users/leaderboard',                  'leaderboard'), 
				requests:              FoursquareEndpoint('get',  'users/requests',                     '*requests'), 
				search:                FoursquareEndpoint('get',  'users/search'), 
				badges:                FoursquareEndpoint('get',  'users/:user_id/badges',              '',           {user_id: 'self'}), 
				checkins:              FoursquareEndpoint('get',  'users/:user_id/checkins',            'checkins',   {user_id: 'self'}), 
				friends:               FoursquareEndpoint('get',  'users/:user_id/friends',             'friends',    {user_id: 'self'}), 
				lists:                 FoursquareEndpoint('get',  'users/:user_id/lists',               'lists',      {user_id: 'self'}), 
				mayorships:            FoursquareEndpoint('get',  'users/:user_id/mayorships',          'mayorships', {user_id: 'self'}), 
				photos:                FoursquareEndpoint('get',  'users/:user_id/photos',              'photos',     {user_id: 'self'}), 
				tips:                  FoursquareEndpoint('get',  'users/:user_id/tips',                'tips',       {user_id: 'self'}), 
				todos:                 FoursquareEndpoint('get',  'users/:user_id/todos',               'todos',      {user_id: 'self'}), 
				venuehistory:          FoursquareEndpoint('get',  'users/:user_id/venuehistory',        'venues',     {user_id: 'self'}), 
				approve:               FoursquareEndpoint('post', 'users/:user_id/approve',             'user'), 
				deny:                  FoursquareEndpoint('post', 'users/:user_id/deny',                'user'), 
				request:               FoursquareEndpoint('post', 'users/:user_id/request',             'user'), 
				setpings:              FoursquareEndpoint('post', 'users/:user_id/setpings',            'user'), 
				unfriend:              FoursquareEndpoint('post', 'users/:user_id/unfriend',            'user'), 
				update:                notImplemented}), 
			venues: e(                 FoursquareEndpoint('get',  'venues/:venueId',                    'venue'), {
				add:                   FoursquareEndpoint('post', 'venues/add',                         'venue'), 
				categories:            FoursquareEndpoint('get',  'venues/categories',                  '*categories'), 
				explore:               FoursquareEndpoint('get',  'venues/explore'), 
				managed:               FoursquareEndpoint('get',  'venues/managed',                     '*venues'), 
				search:                FoursquareEndpoint('get',  'venues/search'), 
				suggestcompletion:     FoursquareEndpoint('get',  'venues/suggestcompletion',           '*minivenues'), 
				timeseries:            FoursquareEndpoint('get',  'venues/timeseries',                  '*timeseries'), 
				trending:              FoursquareEndpoint('get',  'venues/trending',                    '*venues'), 
				events:                FoursquareEndpoint('get',  'venues/:venueId/events',             'events'), 
				herenow:               FoursquareEndpoint('get',  'venues/:venueId/herenow',            'hereNow'), 
				hours:                 FoursquareEndpoint('get',  'venues/:venueId/hours'), 
				likes:                 FoursquareEndpoint('get',  'venues/:venueId/likes',              'likes'), 
				links:                 FoursquareEndpoint('get',  'venues/:venueId/links',              'links'), 
				listed:                FoursquareEndpoint('get',  'venues/:venueId/listed',             'lists'), 
				menu:                  FoursquareEndpoint('get',  'venues/:venueId/menu',               'menus'), 
				nextvenues:            FoursquareEndpoint('get',  'venues/:venueId/nextvenues',         'nextVenues'), 
				photos:                FoursquareEndpoint('get',  'venues/:venueId/photos',             'photos'), 
				similar:               FoursquareEndpoint('get',  'venues/:venueId/similar',            'similar'), 
				stats:                 FoursquareEndpoint('get',  'venues/:venueId/stats',              'stats'), 
				tips:                  FoursquareEndpoint('get',  'venues/:venueId/tips',               'tips'), 
				dislike:               FoursquareEndpoint('post', 'venues/:venueId/dislike'), 
				edit:                  FoursquareEndpoint('post', 'venues/:venueId/edit'), 
				flag:                  FoursquareEndpoint('post', 'venues/:venueId/flag'), 
				like:                  FoursquareEndpoint('post', 'venues/:venueId/like',               'likes'), 
				proposeedit:           FoursquareEndpoint('post', 'venues/:venueId/proposeedit'), 
				setrole:               FoursquareEndpoint('post', 'venues/:venueId/setrole')}), 
			venuegroup: e(             FoursquareEndpoint('get',  'venuegroups/:group_id',              'venuegroup'), {
				add:                   FoursquareEndpoint('post', 'venuegroups/:group_id/add',          'venuegroup'), 
				delete:                FoursquareEndpoint('post', 'venuegroups/:group_id/delete'), 
				list:                  FoursquareEndpoint('get',  'venuegroups/list',                   'venuegroup'), 
				timeseries:            FoursquareEndpoint('post', 'venuegroups/:group_id/timeseries',   'timeseries'), 
				addvenue:              FoursquareEndpoint('post', 'venuegroups/:group_id/addvenue'), 
				campaigns:             FoursquareEndpoint('get',  'venuegroups/:group_id/campaigns',    'campaigns'), 
				edit:                  FoursquareEndpoint('post', 'venuegroups/:group_id/edit'), 
				removevenue:           FoursquareEndpoint('post', 'venuegroups/:group_id/removevenue'), 
				update:                FoursquareEndpoint('post', 'venuegroups/:group_id/update',       'venuegroup')}), 
			checkins: e(               FoursquareEndpoint('get',  'checkins/:checkin_id',               'checkin'), {
				add:                   FoursquareEndpoint('post', 'checkins/add'), 
				recent:                FoursquareEndpoint('get',  'checkins/recent',                    '*recent'), 
				likes:                 FoursquareEndpoint('get',  'checkins/:checkin_id/likes',         'likes'), 
				addcomment:            FoursquareEndpoint('post', 'checkins/:checkin_id/addcomment',    'comment'), 
				addpost:               FoursquareEndpoint('post', 'checkins/:checkin_id/addpost',       'post'), 
				deletecomment:         FoursquareEndpoint('post', 'checkins/:checkin_id/deletecomment', 'checkin'), 
				like:                  FoursquareEndpoint('post', 'checkins/:checkin_id/like',          'likes'), 
				reply:                 FoursquareEndpoint('post', 'checkins/:checkin_id/reply',         'reply')}), 
			tips: e(                   FoursquareEndpoint('get',  'tips/:tip_id',                       'tip'), {
				add:                   FoursquareEndpoint('post', 'tips/add',                           'tip'), 
				search:                FoursquareEndpoint('get',  'tips/search',                        '*tips'), 
				likes:                 FoursquareEndpoint('get',  'tips/:tip_id/likes',                 'likes'), 
				listed:                FoursquareEndpoint('get',  'tips/:tip_id/listed',                'lists'), 
				saves:                 FoursquareEndpoint('get',  'tips/:tip_id/saves',                 'saves'), 
				flag:                  FoursquareEndpoint('post', 'tips/:tip_id/flag'), 
				like:                  FoursquareEndpoint('post', 'tips/:tip_id/like',                  'likes'), 
				unmark:                FoursquareEndpoint('post', 'tips/:tip_id/unmark',                'tip')}), 
			lists: e(                  FoursquareEndpoint('get',  'lists/:list_id',                     'list'), {
				add:                   FoursquareEndpoint('post', 'lists/add',                          'list'), 
				followers:             FoursquareEndpoint('get',  'lists/:list_id/followers',           'followers'), 
				saves:                 FoursquareEndpoint('get',  'lists/:list_id/saves',               'saves'), 
				suggestphoto:          FoursquareEndpoint('get',  'lists/:list_id/suggestphoto',        'photos'), 
				suggesttip:            FoursquareEndpoint('get',  'lists/:list_id/suggesttip',          'tips'), 
				suggestvenues:         FoursquareEndpoint('get',  'lists/:list_id/suggestvenues',       'suggestedVenues'), 
				additem:               FoursquareEndpoint('post', 'lists/:list_id/additem'), 
				deleteitem:            FoursquareEndpoint('post', 'lists/:list_id/deleteitem'), 
				follow:                FoursquareEndpoint('post', 'lists/:list_id/follow',              'list'), 
				moveitem:              FoursquareEndpoint('post', 'lists/:list_id/moveitem',            'list'), 
				share:                 FoursquareEndpoint('post', 'lists/:list_id/share'), 
				unfollow:              FoursquareEndpoint('post', 'lists/:list_id/unfollow',            'list'), 
				update:                FoursquareEndpoint('post', 'lists/:list_id/update',              'list'), 
				updateitem:            FoursquareEndpoint('post', 'lists/:list_id/updateitem')}), 
			updates: e(                FoursquareEndpoint('get',  'updates/:update_id',                 'notification'), {
				notifications:         FoursquareEndpoint('get',  'updates/notifications',              'notifications'), 
				marknotificationsread: FoursquareEndpoint('get',  'updates/marknotificationsread',      'notifications')}), 
			photos: e(                 FoursquareEndpoint('get',  'photos/:photo_id',                   'photo'), {
				add:                   FoursquareEndpoint('post', 'photos/add',                         'photo', {}, {'content-type': 'image/jpeg'})}), 
			settings: e(               FoursquareEndpoint('get',  'settings/:setting_id',               'value'), {
				all:                   FoursquareEndpoint('get',  'settings/all',                       'settings'), 
				set:                   FoursquareEndpoint('post', 'settings/:setting_id/set',           'settings')}), 
			specials: e(               FoursquareEndpoint('get',  'specials/:special_id',               'special'), {
				add:                   FoursquareEndpoint('post', 'specials/add',                       'special'), 
				list:                  FoursquareEndpoint('get',  'specials/list',                      'specials'), 
				search:                FoursquareEndpoint('get',  'specials/search',                    '*specials'), 
				configuration:         FoursquareEndpoint('post', 'specials/:special_id/configuration', 'special'), 
				flag:                  FoursquareEndpoint('post', 'specials/:special_id/flag'), 
				retire:                FoursquareEndpoint('post', 'specials/:special_id/retire')}), 
			campaigns: e(              FoursquareEndpoint('get',  'campaigns/:campaign_id',             'campaigns'), {
				add:                   FoursquareEndpoint('post', 'campaigns/add',                      'campaign'), 
				list:                  FoursquareEndpoint('get',  'campaigns/list',                     'matches'), 
				timeseries:            FoursquareEndpoint('get',  'campaigns/:campaign_id/timeseries',  '*timeseries'), 
				delete:                FoursquareEndpoint('post', 'campaigns/:campaign_id/delete'), 
				end:                   FoursquareEndpoint('post', 'campaigns/:campaign_id/end'), 
				start:                 FoursquareEndpoint('post', 'campaigns/:campaign_id/start')}), 
			events: e(                 FoursquareEndpoint('get',  'events/:event_id',                   'event'), {
				categories:            FoursquareEndpoint('get',  'events/categories',                  '*categories'), 
				search:                FoursquareEndpoint('get',  'events/search',                      '*event'), 
				add:                   FoursquareEndpoint('post', 'events/add',                         'event')}), 
			pages: e(                  FoursquareEndpoint('get',  'pages/:user_id',                     'user'), {
				add:                   FoursquareEndpoint('post', 'pages/add'), 
				managing:              FoursquareEndpoint('get',  'pages/managing',                     '*managing'), 
				search:                FoursquareEndpoint('get',  'pages/search',                       '*results'), 
				timeseries:            FoursquareEndpoint('get',  'pages/:page_id/timeseries',          '*timeseries'), 
				venues:                FoursquareEndpoint('get',  'pages/:page_id/venues',              'venues'), 
				like:                  FoursquareEndpoint('post', 'pages/:page_id/like',                'user')}), 
			pageupdate: e(             FoursquareEndpoint('get',  'pageupdates/:update_id',             'pageUpdate'), {
					add:                   FoursquareEndpoint('post', 'pageupdates/add',                    'pageUpdate'), 
					list:                  FoursquareEndpoint('get',  'pageupdates/list',                   'pageUpdates'), 
					delete:                FoursquareEndpoint('post', 'pageupdates/:update_id/delete'), 
					like:                  FoursquareEndpoint('post', 'pageupdates/:update_id/like')})
		};} (angular.extend);
		
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
		
		this.config = function FoursquareProviderConfig(config) {
			for(var key in config) {
				FoursquareConfig[key] = config[key] || FoursquareConfig[key];
			}
			
			var oauth_token = location.hash.split('#access_token=')[1];
			if(oauth_token !== undefined && typeof FoursquareConfig.saveOAuthToken === 'function') {
				FoursquareConfig.saveOAuthToken(oauth_token);
				window.close();
			}
		};
		
		this.setPath = function FoursquareProviderSetPath(path) {
			FoursquareResourcesPath = path;
		}
		
		this.$get = function FoursquareProviderFactory($q, $http, $rootScope) {
			return new FoursquareService(
				$q, $http, 
				$rootScope, 
				FoursquareConfig.clientId, FoursquareConfig.clientSecret, 
				FoursquareConfig.redirectURI, 
				FoursquareConfig.saveOAuthToken, FoursquareConfig.getOAuthToken
			);
		};
	}

	angular.module('FoursquareService', [], function($provide) {
		$provide.provider('Foursquare', FoursquareProvider);
	}).directive('fsqLogin', function foursquareLoginDirective($parse, Foursquare) {
		return {
			restrict: 'E', 
			template: '<form><input type="image" src="' + FoursquareResourcesPath + '/connect-{{color}}.png" alt="connect to Foursquare"></input></form>', 
			replace: true, 
			scope: {
				onLogin: '&fsqOnLogin', 
				color: '@fsqColor', 
				step: '@fsqStep', 
				display: '@fsqDisplay'
			}, 
			link: function foursquareLoginLinking(scope, element, attrs) {
				scope.fsq = Foursquare;
				
				var onLogin = $parse(scope.onLogin);
				
				element.bind('submit', function() {
					Foursquare.login(onLogin, scope.step, scope.display);
				});
			}
		}
	}).directive('fsqPhoto', function foursquarePhotoDirective() {
		return {
			restrict: 'A', 
			link: function foursquarePhotoLinking(scope, element, attrs) {
				scope.$watch(attrs.fsqPhoto, function(photo) {
					if(photo !== undefined) {
						var size = attrs.fsqPhotoSize || 'original';
						var url  = photo.prefix + size + photo.suffix;
						var attr = attrs.fsqPhotoAttr || element[0].nodeName === 'IMG' ? 'src' : 'href';
						
						element.attr(attr, url);
					}
				})
			}
		}
	});
}) ();