import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export const useHabits = (userKey) => {
  const [habits, setHabits] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load Habits
  useEffect(() => {
    if (userKey) {
      const storedHabits = JSON.parse(localStorage.getItem(userKey)) || [];
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem(`${userKey}_lastVisit`);

      if (lastVisit !== today) {
        const resetHabits = storedHabits.map((h) => ({
          ...h,
          current: 0,
          completedToday: false,
        }));
        setHabits(resetHabits);
        localStorage.setItem(`${userKey}_lastVisit`, today);
      } else {
        setHabits(storedHabits);
      }
      setIsDataLoaded(true);
    }
  }, [userKey]);

  // Save Habits
  useEffect(() => {
    if (isDataLoaded && userKey) {
      localStorage.setItem(userKey, JSON.stringify(habits));
    }
  }, [habits, userKey, isDataLoaded]);

  // Logic Handlers
  const addHabit = (title, description, target, category) => {
    setHabits((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        description,
        target: parseInt(target) || 1,
        category: category || "General",
        current: 0,
        streak: 0,
        completedToday: false,
      },
    ]);
  };

  const updateHabit = (id, title, description, target, category) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, title, description, target: parseInt(target), category } : h
      )
    );
  };

  const incrementProgress = (id) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextVal = Math.min((h.current || 0) + 1, h.target);
          const isDone = nextVal >= h.target;
          if (isDone && !h.completedToday) {
            confetti({
              particleCount: 150,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#6366f1", "#a855f7", "#f59e0b"],
            });
          }
          return {
            ...h,
            current: nextVal,
            streak: isDone && !h.completedToday ? h.streak + 1 : h.streak,
            completedToday: isDone,
          };
        }
        return h;
      })
    );
  };

  const decrementProgress = (id) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, current: Math.max(0, (h.current || 0) - 1), completedToday: false }
          : h
      )
    );
  };

  const deleteHabit = (id) => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
    }
  };

  return {
    habits,
    setHabits,
    addHabit,
    updateHabit,
    incrementProgress,
    decrementProgress,
    deleteHabit,
  };
};