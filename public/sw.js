var CACHE_NAME = 'static';
var urlsToCache = [
	'/',
	'/private/',
	'/private/admin/admin.css',
	'/private/admin/admin.html',
	'/private/admin/admin.js',
	'/private/index.html',
	'/private/settings.html',
	'/private/src/css/index.css',
	'/private/src/css/menu.css',
	'/private/src/css/settings.css',
	'/private/src/images/add.svg',
	'/private/src/images/checkmark.png',
	'/private/src/images/logo-225x225.png',
	'/private/src/images/skole.png',
	'/private/src/images/x.png',
	'/private/src/js/dots.js',
	'/private/src/js/index.js',
	'/private/src/js/menu.js',
	'/private/src/js/p5.min.js',
	'/private/src/js/settings.js',
	'/favicon.ico',
	'/index.html',
	'/manifest.json',
	'/socket.io/socket.io.js',
	'/src/css/index.css',
	'/src/css/menu.css',
	'/src/images/logo-192x192.png',
	'/src/images/logo-225x225.png',
	'/src/images/logo-512x512.png',
	'/src/images/logo-800x800.png',
	'/src/js/index.js',
	'/src/js/notifications.js',
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
		fetch(event.request).catch(function () {
			return caches.match(event.request);
		})
	);
});

self.addEventListener('push', ev => {
	const data = ev.data.json();
	console.log(data)

	if (data.action == "Notification") {
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: '/src/images/logo-225x225.png',
			data
		});
		return;
	}
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
			if (client.url == '/private/' && 'focus' in client) {
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