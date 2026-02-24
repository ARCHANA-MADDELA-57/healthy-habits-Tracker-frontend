import { useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useNotifications = (user) => {
  useEffect(() => {
    const isEnabled = localStorage.getItem("notificationsEnabled") === "true";
    if (isEnabled && user && "serviceWorker" in navigator) {
      registerPushSubscription(user.id);
    }
  }, [user]);

  const registerPushSubscription = async (userId) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // --- NEW: FETCH PUBLIC KEY FROM BACKEND ---
        const keyResponse = await fetch("http://localhost:5000/api/auth/vapid-public-key");
        const { publicKey } = await keyResponse.json();

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }

      // Send subscription to backend to save in DB
      await fetch("http://localhost:5000/api/auth/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ subscription })
      });

      console.log("Push Notification Subscription successful");
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    }
  };
};