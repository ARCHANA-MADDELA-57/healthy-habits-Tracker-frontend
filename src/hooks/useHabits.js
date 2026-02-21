import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export const useHabits = (userKey) => {
  const [habits, setHabits] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (!userKey) return;
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem(`${userKey}_lastVisit`);
    const storedHabits = JSON.parse(localStorage.getItem(userKey)) || [];
    const historyKey = `${userKey}_history`;

    if (lastVisit && lastVisit !== today) {
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
        const updatedHistory = [yesterdayRecord, ...currentHistory].slice(0, 30); // Store up to 30 days
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      }

      const newDayHabits = storedHabits
        .filter((h) => h.isEveryday === true)
        .map((h) => ({ 
            ...h, 
            current: 0, 
            completedToday: false,
            streak: h.current >= h.target ? h.streak : 0 
        }));

      localStorage.setItem(userKey, JSON.stringify(newDayHabits));
      localStorage.setItem(`${userKey}_lastVisit`, today);
      setHabits(newDayHabits);
    } else {
      setHabits(storedHabits);
      if (!lastVisit) localStorage.setItem(`${userKey}_lastVisit`, today);
    }
    setIsDataLoaded(true);
  }, [userKey]);

  useEffect(() => {
    if (isDataLoaded && userKey) {
      localStorage.setItem(userKey, JSON.stringify(habits));
    }
  }, [habits, userKey, isDataLoaded]);

  const addHabit = (title, description, target, category, isEveryday, unit) => {
    const newHabit = {
      id: Date.now(),
      title,
      description,
      target: parseInt(target) || 1,
      unit: unit || "units",
      category: category || "Other",
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
          if (h.current >= h.target) return h;
          const nextCount = h.current + 1;
          const reachedGoal = nextCount === h.target;
          if (reachedGoal) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#ec4899', '#22c55e'] });
          }
          return {
            ...h,
            current: nextCount,
            streak: reachedGoal && !h.completedToday ? h.streak + 1 : h.streak,
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
          const wasCompleted = h.current >= h.target;
          const isNowIncomplete = nextCount < h.target;
          return {
            ...h,
            current: nextCount,
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

  return { habits, addHabit, updateHabit, incrementProgress, decrementProgress, deleteHabit };
};