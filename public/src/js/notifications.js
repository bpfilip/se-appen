const publicVapidKey = 'BACTSjh36oaVaueVqF2J5oprJs2EkzeZkjsYz45lJ4mJzma5OLJ2bgFRwUdjyzB5xJo9ORqCOGAErxiZ--Tiw78';
function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
if ('serviceWorker' in navigator) {

	run().catch(error => console.error(error));
}

async function run() {
	const registration = await navigator.serviceWorker.
		register('/sw.js', { scope: '/' });
		
	const subscription = await registration.pushManager.
		subscribe({
			userVisibleOnly: true,
			// The `urlBase64ToUint8Array()` function is the same as in
			// https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
			applicationServerKey: urlB64ToUint8Array(publicVapidKey)
		});
		
	await fetch('/subscribe', {
		method: 'POST',
		body: JSON.stringify(subscription),
		headers: {
			'content-type': 'application/json'
		}
	});
}