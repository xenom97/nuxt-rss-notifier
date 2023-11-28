// static/service-worker.js

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        // Add the paths to your static assets (e.g., CSS, JS, images) here
        '/',
        '/index.html',
        // '/your-other-static-assets',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification when clicked

  const payload = event.notification?.data;
  let link = payload?.link;

  if (event.action === 'upwork') {
    link = 'https://www.upwork.com'
  } else if (event.action === 'rss-notifier') {
    link = 'https://rss-notifier.vercel.app'
  }

  event.waitUntil(
    clients.openWindow(link) // Open the link from the payload in a new tab
  );
});