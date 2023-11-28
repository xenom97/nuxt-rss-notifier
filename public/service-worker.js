self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification when clicked

  const payload = event.notification?.data;
  let link = 'https://rss-notifier.vercel.app'
  
  if (event.action === 'custom' && payload?.link) {
    link = payload?.link;
  }

  event.waitUntil(
    clients.openWindow(link) // Open the link from the payload in a new tab
  );
});