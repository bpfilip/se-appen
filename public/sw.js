var CACHE_NAME = 'static';
var urlsToCache = [
	'/',
	'/index.html',
	'/src/js/index.js',
	'/src/stylesheets/index.css',
	'/src/images/logo-225x225.png',
	'/manifest.json',
	'/sw.js'
];

self.addEventListener('install', function (event) {
	// Perform install steps
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(function (cache) {
				console.log('Opened cache');
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.match(event.request)
			.then(function (response) {
				
				// Cache hit - return response
				if (response) {
					return response;
				}
				return fetch(event.request);
			}
			)
	);
});

self.addEventListener('push', ev => {
	const data = ev.data.json();
	self.registration.showNotification(data.title, {
		body: data.body,
		icon: '/src/images/logo-225x225.png',
		data
	});
});

self.addEventListener('notificationclick', function (event) {
	event.notification.close();

	// This looks to see if the current is already open and
	// focuses if it is
	event.waitUntil(clients.matchAll({
		type: "window"
	}).then(function (clientList) {
		for (var i = 0; i < clientList.length; i++) {
			var client = clientList[i];
			if (client.url == '/' && 'focus' in client) {
				if (event.notification.data.site) {
					client.url = event.notification.data.site;
				}
				return client.focus()
			}
		}
		if (clients.openWindow)
			return clients.openWindow(event.notification.data.site ? event.notification.data.site : "/");
	}));
});