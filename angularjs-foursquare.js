define(function(require) {
	'use strict';
	
	
	var angular = angular || require('bower_components/angular/angular');
	var foursquareResourcesPath = '/bower_components/angularjs-foursquare';
	
	var FoursquareService = function($q, $http, $rootScope, clientId, clientSecret, clientRedirectURI, clientSaveOAuthToken, clientGetOAuthToken, locale) {
		var
			foursquareAPI = 'https://api.foursquare.com/v2/', 
			foursquareClientRedirectURI = clientRedirectURI, 
			foursquareClientSaveOAuthToken = clientSaveOAuthToken, 
			foursquareClientGetOAuthToken = clientGetOAuthToken, 
			foursquareDefaultParams = {
				v: 20130317, 
				locale: locale
			}, 
			foursquareClientParams = {
				client_id: clientId, 
				client_secret: clientSecret
			};
		
		function foursquareEndpoint(method, endpoint_url, resultKey, defaultParams) {
			var 
				isArray = typeof resultKey === 'string' && resultKey[0] === '*', 
				endpointParams = (endpoint_url.match(/:[^\/]*\b/g) || []).map(function(key) {
					return key.substr(1);
				});
			
			if(isArray) {
				resultKey = resultKey.substr(1);
			}
			
			var endpoint = function(inputParams, data, success, failure) {
				if(typeof inputParams === 'function') {
					failure     = data;
					success     = inputParams;
					data        = undefined;
					inputParams = undefined;
				}
				
				if(typeof data === 'function') {
					failure = success;
					success = data;
					data    = undefined;
				}
				
				var 
					url    = endpoint_url, 
					params = angular.extend(
						{}, 
						defaultParams || {}, 
						foursquareDefaultParams, 
						inputParams || {}, 
						foursquareDefaultParams.oauth_token === null ? foursquareClientParams : {}
					);
				
				for(var i = 0; i < endpointParams.length; i++) {
					var key = endpointParams[i];
					if(params[key] !== undefined) {
						url = url.replace(':'+key, escape(params[key]));
						delete params[key];
					}
				}
				
				if(method.toUpperCase() === 'POST') {
					data = data || new FormData();
					for(var name in params) {
						if(
							params[name] !== undefined && 
							params[name] !== null && 
							params[name] !== false && 
							!Number.isNaN(params[name])
						) {
							data.append(name, params[name]);
						}
					}
				}
				
				var 
					resource = isArray ? [] : {}, 
					post = method.toUpperCase() === 'POST', 
					http_request = {
						url: foursquareAPI + url, 
						params: post ? undefined : params, 
						method: method, 
						data: data, 
						headers: angular.extend({
							'X-Requested-With': undefined
						}, method.toUpperCase() === 'POST' ? {'Content-Type': false} : {}), 
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
							};
							
							delete response_data.meta.code;
							return response_data.meta;
						}
					}, 
					q = $http(http_request);
				
				q.then(success, failure);
				
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
			users: e(                  foursquareEndpoint('get',  'users/:user_id',                     'user',       {user_id: 'self'}), {
				leaderboard:           foursquareEndpoint('get',  'users/leaderboard',                  'leaderboard'), 
				requests:              foursquareEndpoint('get',  'users/requests',                     '*requests'), 
				search:                foursquareEndpoint('get',  'users/search'), 
				badges:                foursquareEndpoint('get',  'users/:user_id/badges',              '',           {user_id: 'self'}), 
				checkins:              foursquareEndpoint('get',  'users/:user_id/checkins',            'checkins',   {user_id: 'self'}), 
				friends:               foursquareEndpoint('get',  'users/:user_id/friends',             'friends',    {user_id: 'self'}), 
				lists:                 foursquareEndpoint('get',  'users/:user_id/lists',               'lists',      {user_id: 'self'}), 
				mayorships:            foursquareEndpoint('get',  'users/:user_id/mayorships',          'mayorships', {user_id: 'self'}), 
				photos:                foursquareEndpoint('get',  'users/:user_id/photos',              'photos',     {user_id: 'self'}), 
				tips:                  foursquareEndpoint('get',  'users/:user_id/tips',                'tips',       {user_id: 'self'}), 
				todos:                 foursquareEndpoint('get',  'users/:user_id/todos',               'todos',      {user_id: 'self'}), 
				venuehistory:          foursquareEndpoint('get',  'users/:user_id/venuehistory',        'venues',     {user_id: 'self'}), 
				approve:               foursquareEndpoint('post', 'users/:user_id/approve',             'user'), 
				deny:                  foursquareEndpoint('post', 'users/:user_id/deny',                'user'), 
				request:               foursquareEndpoint('post', 'users/:user_id/request',             'user'), 
				setpings:              foursquareEndpoint('post', 'users/:user_id/setpings',            'user'), 
				unfriend:              foursquareEndpoint('post', 'users/:user_id/unfriend',            'user'), 
				update:                notImplemented}), 
			venues: e(                 foursquareEndpoint('get',  'venues/:venueId',                    'venue'), {
				add:                   foursquareEndpoint('post', 'venues/add',                         'venue'), 
				categories:            foursquareEndpoint('get',  'venues/categories',                  '*categories'), 
				explore:               foursquareEndpoint('get',  'venues/explore'), 
				managed:               foursquareEndpoint('get',  'venues/managed',                     '*venues'), 
				search:                foursquareEndpoint('get',  'venues/search'), 
				suggestcompletion:     foursquareEndpoint('get',  'venues/suggestcompletion',           '*minivenues'), 
				timeseries:            foursquareEndpoint('get',  'venues/timeseries',                  '*timeseries'), 
				trending:              foursquareEndpoint('get',  'venues/trending',                    '*venues'), 
				events:                foursquareEndpoint('get',  'venues/:venueId/events',             'events'), 
				herenow:               foursquareEndpoint('get',  'venues/:venueId/herenow',            'hereNow'), 
				hours:                 foursquareEndpoint('get',  'venues/:venueId/hours'), 
				likes:                 foursquareEndpoint('get',  'venues/:venueId/likes',              'likes'), 
				links:                 foursquareEndpoint('get',  'venues/:venueId/links',              'links'), 
				listed:                foursquareEndpoint('get',  'venues/:venueId/listed',             'lists'), 
				menu:                  foursquareEndpoint('get',  'venues/:venueId/menu',               'menus'), 
				nextvenues:            foursquareEndpoint('get',  'venues/:venueId/nextvenues',         'nextVenues'), 
				photos:                foursquareEndpoint('get',  'venues/:venueId/photos',             'photos'), 
				similar:               foursquareEndpoint('get',  'venues/:venueId/similar',            'similar'), 
				stats:                 foursquareEndpoint('get',  'venues/:venueId/stats',              'stats'), 
				tips:                  foursquareEndpoint('get',  'venues/:venueId/tips',               'tips'), 
				dislike:               foursquareEndpoint('post', 'venues/:venueId/dislike'), 
				edit:                  foursquareEndpoint('post', 'venues/:venueId/edit'), 
				flag:                  foursquareEndpoint('post', 'venues/:venueId/flag'), 
				like:                  foursquareEndpoint('post', 'venues/:venueId/like',               'likes'), 
				proposeedit:           foursquareEndpoint('post', 'venues/:venueId/proposeedit'), 
				setrole:               foursquareEndpoint('post', 'venues/:venueId/setrole')}), 
			venuegroup: e(             foursquareEndpoint('get',  'venuegroups/:group_id',              'venuegroup'), {
				add:                   foursquareEndpoint('post', 'venuegroups/:group_id/add',          'venuegroup'), 
				delete:                foursquareEndpoint('post', 'venuegroups/:group_id/delete'), 
				list:                  foursquareEndpoint('get',  'venuegroups/list',                   'venuegroup'), 
				timeseries:            foursquareEndpoint('post', 'venuegroups/:group_id/timeseries',   'timeseries'), 
				addvenue:              foursquareEndpoint('post', 'venuegroups/:group_id/addvenue'), 
				campaigns:             foursquareEndpoint('get',  'venuegroups/:group_id/campaigns',    'campaigns'), 
				edit:                  foursquareEndpoint('post', 'venuegroups/:group_id/edit'), 
				removevenue:           foursquareEndpoint('post', 'venuegroups/:group_id/removevenue'), 
				update:                foursquareEndpoint('post', 'venuegroups/:group_id/update',       'venuegroup')}), 
			checkins: e(               foursquareEndpoint('get',  'checkins/:checkin_id',               'checkin'), {
				add:                   foursquareEndpoint('post', 'checkins/add'), 
				recent:                foursquareEndpoint('get',  'checkins/recent',                    '*recent'), 
				likes:                 foursquareEndpoint('get',  'checkins/:checkin_id/likes',         'likes'), 
				addcomment:            foursquareEndpoint('post', 'checkins/:checkin_id/addcomment',    'comment'), 
				addpost:               foursquareEndpoint('post', 'checkins/:checkin_id/addpost',       'post'), 
				deletecomment:         foursquareEndpoint('post', 'checkins/:checkin_id/deletecomment', 'checkin'), 
				like:                  foursquareEndpoint('post', 'checkins/:checkin_id/like',          'likes'), 
				reply:                 foursquareEndpoint('post', 'checkins/:checkin_id/reply',         'reply')}), 
			tips: e(                   foursquareEndpoint('get',  'tips/:tip_id',                       'tip'), {
				add:                   foursquareEndpoint('post', 'tips/add',                           'tip'), 
				search:                foursquareEndpoint('get',  'tips/search',                        '*tips'), 
				likes:                 foursquareEndpoint('get',  'tips/:tip_id/likes',                 'likes'), 
				listed:                foursquareEndpoint('get',  'tips/:tip_id/listed',                'lists'), 
				saves:                 foursquareEndpoint('get',  'tips/:tip_id/saves',                 'saves'), 
				flag:                  foursquareEndpoint('post', 'tips/:tip_id/flag'), 
				like:                  foursquareEndpoint('post', 'tips/:tip_id/like',                  'likes'), 
				unmark:                foursquareEndpoint('post', 'tips/:tip_id/unmark',                'tip')}), 
			lists: e(                  foursquareEndpoint('get',  'lists/:list_id',                     'list'), {
				add:                   foursquareEndpoint('post', 'lists/add',                          'list'), 
				followers:             foursquareEndpoint('get',  'lists/:list_id/followers',           'followers'), 
				saves:                 foursquareEndpoint('get',  'lists/:list_id/saves',               'saves'), 
				suggestphoto:          foursquareEndpoint('get',  'lists/:list_id/suggestphoto',        'photos'), 
				suggesttip:            foursquareEndpoint('get',  'lists/:list_id/suggesttip',          'tips'), 
				suggestvenues:         foursquareEndpoint('get',  'lists/:list_id/suggestvenues',       'suggestedVenues'), 
				additem:               foursquareEndpoint('post', 'lists/:list_id/additem'), 
				deleteitem:            foursquareEndpoint('post', 'lists/:list_id/deleteitem'), 
				follow:                foursquareEndpoint('post', 'lists/:list_id/follow',              'list'), 
				moveitem:              foursquareEndpoint('post', 'lists/:list_id/moveitem',            'list'), 
				share:                 foursquareEndpoint('post', 'lists/:list_id/share'), 
				unfollow:              foursquareEndpoint('post', 'lists/:list_id/unfollow',            'list'), 
				update:                foursquareEndpoint('post', 'lists/:list_id/update',              'list'), 
				updateitem:            foursquareEndpoint('post', 'lists/:list_id/updateitem')}), 
			updates: e(                foursquareEndpoint('get',  'updates/:update_id',                 'notification'), {
				notifications:         foursquareEndpoint('get',  'updates/notifications',              'notifications'), 
				marknotificationsread: foursquareEndpoint('get',  'updates/marknotificationsread',      'notifications')}), 
			photos: e(                 foursquareEndpoint('get',  'photos/:photo_id',                   'photo'), {
				add:                   foursquareEndpoint('post', 'photos/add',                         'photo')}), 
			settings: e(               foursquareEndpoint('get',  'settings/:setting_id',               'value'), {
				all:                   foursquareEndpoint('get',  'settings/all',                       'settings'), 
				set:                   foursquareEndpoint('post', 'settings/:setting_id/set',           'settings')}), 
			specials: e(               foursquareEndpoint('get',  'specials/:special_id',               'special'), {
				add:                   foursquareEndpoint('post', 'specials/add',                       'special'), 
				list:                  foursquareEndpoint('get',  'specials/list',                      'specials'), 
				search:                foursquareEndpoint('get',  'specials/search',                    '*specials'), 
				configuration:         foursquareEndpoint('post', 'specials/:special_id/configuration', 'special'), 
				flag:                  foursquareEndpoint('post', 'specials/:special_id/flag'), 
				retire:                foursquareEndpoint('post', 'specials/:special_id/retire')}), 
			campaigns: e(              foursquareEndpoint('get',  'campaigns/:campaign_id',             'campaigns'), {
				add:                   foursquareEndpoint('post', 'campaigns/add',                      'campaign'), 
				list:                  foursquareEndpoint('get',  'campaigns/list',                     'matches'), 
				timeseries:            foursquareEndpoint('get',  'campaigns/:campaign_id/timeseries',  '*timeseries'), 
				delete:                foursquareEndpoint('post', 'campaigns/:campaign_id/delete'), 
				end:                   foursquareEndpoint('post', 'campaigns/:campaign_id/end'), 
				start:                 foursquareEndpoint('post', 'campaigns/:campaign_id/start')}), 
			events: e(                 foursquareEndpoint('get',  'events/:event_id',                   'event'), {
				categories:            foursquareEndpoint('get',  'events/categories',                  '*categories'), 
				search:                foursquareEndpoint('get',  'events/search',                      '*event'), 
				add:                   foursquareEndpoint('post', 'events/add',                         'event')}), 
			pages: e(                  foursquareEndpoint('get',  'pages/:user_id',                     'user'), {
				add:                   foursquareEndpoint('post', 'pages/add'), 
				managing:              foursquareEndpoint('get',  'pages/managing',                     '*managing'), 
				search:                foursquareEndpoint('get',  'pages/search',                       '*results'), 
				timeseries:            foursquareEndpoint('get',  'pages/:page_id/timeseries',          '*timeseries'), 
				venues:                foursquareEndpoint('get',  'pages/:page_id/venues',              'venues'), 
				like:                  foursquareEndpoint('post', 'pages/:page_id/like',                'user')}), 
			pageupdate: e(             foursquareEndpoint('get',  'pageupdates/:update_id',             'pageUpdate'), {
					add:                   foursquareEndpoint('post', 'pageupdates/add',                    'pageUpdate'), 
					list:                  foursquareEndpoint('get',  'pageupdates/list',                   'pageUpdates'), 
					delete:                foursquareEndpoint('post', 'pageupdates/:update_id/delete'), 
					like:                  foursquareEndpoint('post', 'pageupdates/:update_id/like')})
		};} (angular.extend);
		
		var foursquare = {
			defaultParameters: function foursquareDefaultParameters(params) {
				foursquareDefaultParams = angular.extend(foursquareDefaultParams, params);
				foursquare.logged = foursquareDefaultParams.oauth_token !== null;
				
				return foursquareDefaultParams;
			}, 
			setOAuthToken: function foursquareSetOAuthToken(oauth_token) {
				foursquare.defaultParameters({oauth_token: oauth_token});
			}, 
			setLocale: function foursquareSetLocale(locale) {
				foursquare.defaultParameters({locale: locale});
				$rootScope.$apply();
			}, 
			authenticateURI: function foursquareAuthenticateURI(display, response_type) {
				return 'https://foursquare.com/oauth2/authenticate' + 
					'?client_id=' + foursquareClientParams.client_id + 
					'&display=' + (display || '') + 
					'&response_type=' + (response_type || 'token') + 
					'&redirect_uri=' + encodeURI(foursquareClientRedirectURI);
			}, 
			authorizeURI: function foursquareAuthorizeURI(display, response_type) {
				return 'https://foursquare.com/oauth2/authorize' + 
					'?client_id=' + foursquareClientParams.client_id + 
					'&display=' + (display || '') + 
					'&response_type=' + (response_type || 'token') + 
					'&redirect_uri=' + encodeURI(foursquareClientRedirectURI);
			}, 
			login: function foursquareLogin(step, auth_type, display, response_type) {
				var deferred = $q.defer();
				
				if(auth_type !== 'authorize' && auth_type !== 'authenticate') {
					auth_type = 'authorize';
				}
				
				if(foursquare.logged === false) {
					var interval = window.setInterval(function() {
						if(this.closed) {
							window.clearInterval(interval);
							foursquare.setOAuthToken(foursquareClientGetOAuthToken());
							
							if(foursquare.logged) {
								deferred.resolve();
							}
							else {
								deferred.reject();
							}
							
							$rootScope.$apply();
						}
					}.bind(window.open(foursquare[auth_type+'URI'](display, response_type))), step || 500);
				}
				else {
					deferred.resolve();
				}
				
				return deferred.promise;
			}, 
			logout: function foursquareLogout() {
				foursquare.setOAuthToken(null);
				foursquareClientSaveOAuthToken(null);
			}, 
			api: api
		};
		
		foursquare.setOAuthToken(foursquareClientGetOAuthToken());
		
		return foursquare;
	};

	function FoursquareProvider() {
		
		var foursquareConfig = {
			clientId: undefined, 
			clientSecret: undefined, 
			redirectURI: undefined, 
			saveOAuthToken: function SaveOAuthToken(OAuthToken) {
				if(OAuthToken === null) {
					localStorage.removeItem('foursquare_oauth_token');
				}
				else {
					localStorage.setItem('foursquare_oauth_token', OAuthToken);
				}
			}, 
			getOAuthToken: function GetOAuthToken() {
				return localStorage.getItem('foursquare_oauth_token');
			}, 
			locale: 'en'
		};
		
		this.config = function foursquareProviderConfig(config) {
			for(var key in config) {
				foursquareConfig[key] = config[key] || foursquareConfig[key];
			}
			
			var oauth_token = location.hash.split('#access_token=')[1];
			if(oauth_token !== undefined && typeof foursquareConfig.saveOAuthToken === 'function') {
				foursquareConfig.saveOAuthToken(oauth_token);
				window.close();
			}
		};
		
		this.setPath = function foursquareProviderSetPath(path) {
			foursquareResourcesPath = path;
		};
		
		this.$get = ['$q', '$http', '$rootScope', function foursquareProviderFactory($q, $http, $rootScope) {
			return new FoursquareService(
				$q, $http, 
				$rootScope, 
				foursquareConfig.clientId, foursquareConfig.clientSecret, 
				foursquareConfig.redirectURI, 
				foursquareConfig.saveOAuthToken, foursquareConfig.getOAuthToken, 
				foursquareConfig.locale
			);
		}];
	}

	angular.module('thFoursquareService', [], ['$provide', function($provide) {
		$provide.provider('thFoursquare', FoursquareProvider);
	}]).directive('thFsqLogin', ['$parse', 'thFoursquare', function foursquareLoginDirective($parse, thFoursquare) {
		return {
			restrict: 'E', 
			template: '<form><input type="image" ng:src="' + foursquareResourcesPath + '/images/connect-{{color}}.png" alt="connect to foursquare"></input></form>', 
			replace: true, 
			scope: {
				onLogin: '&thFsqOnLogin', 
				color: '@thFsqColor', 
				step: '@thFsqStep', 
				display: '@thFsqDisplay'
			}, 
			link: function foursquareLoginLinking(scope, element, attrs) {
				scope.thFsq = thFoursquare;
				
				element.bind('submit', function() {
					thFoursquare.login(scope.step, scope.display).then(function() {
						$parse(scope.onLogin);
					});
				});
			}
		};
	}]).directive('thFsqPhoto', function foursquarePhotoDirective() {
		return {
			restrict: 'A', 
			link: function foursquarePhotoLinking(scope, element, attrs) {
				scope.$watch(attrs.thFsqPhoto, function(photo) {
					if(photo !== undefined) {
						var size = attrs.thFsqPhotoSize || 'original';
						var url  = photo.prefix + size + photo.suffix;
						var attr = attrs.thFsqPhotoAttr || element[0].nodeName === 'IMG' ? 'src' : 'href';
						
						element.attr(attr, url);
					}
				});
			}
		};
	});
});
