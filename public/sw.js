self.addEventListener('push', function(event) {
    if (event.data) {
      const payload = event.data.json();
      
      // This is the magic part that actually pops the window
      const promiseChain = self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: '/logo192.png', // Ensure this file exists in your public folder
        badge: '/logo192.png',
        vibrate: [100, 50, 100],
      });
  
      event.waitUntil(promiseChain);
    }
  });