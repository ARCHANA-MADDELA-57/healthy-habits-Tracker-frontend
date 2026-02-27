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
  const registerPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const keyResponse = await fetch("https://healthy-habits-tracker-backend.onrender.com/api/auth/vapid-public-key");
        const { publicKey } = await keyResponse.json();
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }

      const res = await fetch("https://healthy-habits-tracker-backend.onrender.com/api/auth/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ subscription })
      });

      if (res.ok) {
        localStorage.setItem("subscriptionSynced", "true");
      }
    } catch (error) {
      console.error("Sync failed", error);
    }
  };

  useEffect(() => {
    const isEnabled = localStorage.getItem("notificationsEnabled") === "true";
    if (isEnabled && user) {
      registerPushSubscription();
    }
  }, [user]);

  // Essential return to prevent Settings.jsx crash
  return { registerPushSubscription }; 
};