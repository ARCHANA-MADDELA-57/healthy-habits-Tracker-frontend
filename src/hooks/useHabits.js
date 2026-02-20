import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export const useHabits = (userKey) => {
  const [habits, setHabits] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- SINGLE SOURCE OF TRUTH RESET LOGIC ---
  useEffect(() => {
    if (!userKey) return;

    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem(`${userKey}_lastVisit`);
    const storedHabits = JSON.parse(localStorage.getItem(userKey)) || [];
    const historyKey = `${userKey}_history`;

    if (lastVisit && lastVisit !== today) {
      // 1. Archive to history
      const currentHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
      const yesterdayRecord = {
        date: lastVisit,
        habits: storedHabits.map((h) => ({
          title: h.title,
          category: h.category,
          completed: Number(h.current) >= Number(h.target), 
          score: `${h.current}/${h.target}`,
        })),
      };

      if (!currentHistory.find(item => item.date === lastVisit)) {
        const updatedHistory = [yesterdayRecord, ...currentHistory].slice(0, 7);
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      }

      // 2. NEW DAY RESET + STREAK BREAK LOGIC
      // We only keep 'Everyday' habits and we check if they failed yesterday
      const newDayHabits = storedHabits
        .filter((h) => h.isEveryday === true)
        .map((h) => {
          const finishedYesterday = h.current >= h.target;
          return { 
            ...h, 
            current: 0, 
            completedToday: false,
            // IF they didn't finish yesterday, streak drops to 0.
            // IF they did finish, we KEEP the streak number they earned.
            streak: finishedYesterday ? h.streak : 0 
          };
        });

      localStorage.setItem(userKey, JSON.stringify(newDayHabits));
      localStorage.setItem(`${userKey}_lastVisit`, today);
      setHabits(newDayHabits);
    } else {
      setHabits(storedHabits);
      if (!lastVisit) localStorage.setItem(`${userKey}_lastVisit`, today);
    }
    
    setIsDataLoaded(true);
  }, [userKey]);

  // Save changes whenever habits state changes
  useEffect(() => {
    if (isDataLoaded && userKey) {
      localStorage.setItem(userKey, JSON.stringify(habits));
    }
  }, [habits, userKey, isDataLoaded]);

  // --- HANDLERS ---
  const addHabit = (title, description, target, category, isEveryday, unit) => {
    const newHabit = {
      id: Date.now(),
      title,
      description,
      target: parseInt(target) || 1,
      unit: unit || "units",
      category: category || "General",
      current: 0,
      streak: 0,
      completedToday: false,
      isEveryday: !!isEveryday,
    };
    setHabits((prev) => [...prev, newHabit]);
  };
  
  const updateHabit = (id, title, description, target, category, isEveryday, unit) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, title, description, target: parseInt(target), category, isEveryday: !!isEveryday, unit: unit || h.unit }
          : h
      )
    );
  };

  const incrementProgress = (id) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          // 1. Check if the goal is already met
          if (h.current >= h.target) {
            alert(`You've already achieved today's goal for "${h.title}"! 🎉`);
            return h; // Return unchanged
          }
  
          const nextCount = h.current + 1;
          const reachedGoalJustNow = nextCount === h.target;
  
          if (reachedGoalJustNow) {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#6366f1', '#ec4899', '#22c55e']
            });
          }
  
          return {
            ...h,
            current: nextCount,
            streak: reachedGoalJustNow && !h.completedToday ? h.streak + 1 : h.streak,
            completedToday: nextCount >= h.target,
          };
        }
        return h;
      })
    );
  };
  
  const decrementProgress = (id) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id && h.current > 0) {
          const nextCount = h.current - 1;
          
          // Logic: Were they completed BEFORE this click, and are they now BELOW target?
          const wasCompleted = h.current >= h.target;
          const isNowIncomplete = nextCount < h.target;
  
          return {
            ...h,
            current: nextCount,
            // If they fall below the goal, remove the streak point earned today
            streak: (wasCompleted && isNowIncomplete) ? Math.max(0, h.streak - 1) : h.streak,
            completedToday: nextCount >= h.target,
          };
        }
        return h;
      })
    );
  };

  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return { 
    habits, 
    setHabits,
    addHabit, 
    updateHabit, 
    incrementProgress, 
    decrementProgress, 
    deleteHabit 
  };
};