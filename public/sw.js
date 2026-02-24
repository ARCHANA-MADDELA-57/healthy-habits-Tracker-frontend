// public/sw.js
self.addEventListener('push', function(event) {
    let data = { title: 'HealthyHabits', body: 'Time to track your progress!' };

    try {
        if (event.data) {
            // Attempt to parse JSON from the worker
            data = event.data.json();
        }
    } catch (e) {
        // Fallback for plain text tests
        data = { title: 'HealthyHabits Alert', body: event.data.text() };
    }

    const options = {
        body: data.body,
        icon: '/logo192.png', 
        badge: '/logo192.png',
        vibrate: [100, 50, 100],
        requireInteraction: true // This keeps the notification visible until clicked
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});