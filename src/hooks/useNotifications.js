import { useEffect } from 'react';

export const useNotifications = (neglectedHabit) => {
  useEffect(() => {
    const isEnabled = localStorage.getItem("notificationsEnabled") === "true";
    if (isEnabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const isEnabled = localStorage.getItem("notificationsEnabled") === "true";

    if (neglectedHabit && isEnabled && Notification.permission === "granted") {
      const lastReminded = localStorage.getItem(`reminded_${neglectedHabit.id}`);
      const now = Date.now();

      // --- UPDATED WAIT TIME ---
      // We changed 7200000 (2 hours) to 1800000 (30 minutes)
      const waitTime = 1800000; 

      if (!lastReminded || now - lastReminded > waitTime) {
        new Notification("HealthyHabits Alert! 🚨", {
          body: `Your "${neglectedHabit.title}" is still under 30%. Don't let your streak break!`,
          icon: "/icon.png" 
        });
        
        localStorage.setItem(`reminded_${neglectedHabit.id}`, now.toString());
      }
    }
  }, [neglectedHabit]);
};