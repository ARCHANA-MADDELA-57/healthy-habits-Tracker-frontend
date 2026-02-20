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
          completed: h.current >= h.target,
          score: `${h.current}/${h.target}`,
        })),
      };

      // Only add to history if this specific date isn't already there
      if (!currentHistory.find(item => item.date === lastVisit)) {
        const updatedHistory = [yesterdayRecord, ...currentHistory].slice(0, 7);
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      }

      // 2. Filter: Only keep 'Everyday' habits
      const newDayHabits = storedHabits
        .filter((h) => h.isEveryday === true)
        .map((h) => ({ 
          ...h, 
          current: 0, 
          completedToday: false 
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

  // Save changes whenever habits state changes
  useEffect(() => {
    if (isDataLoaded && userKey) {
      localStorage.setItem(userKey, JSON.stringify(habits));
    }
  }, [habits, userKey, isDataLoaded]);

  // --- HANDLERS ---
  const addHabit = (title, description, target, category, isEveryday) => {
    const newHabit = {
      id: Date.now(),
      title,
      description,
      target: parseInt(target) || 1,
      category: category || "General",
      current: 0,
      streak: 0,
      completedToday: false,
      isEveryday: !!isEveryday, 
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id, title, description, target, category, isEveryday) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, title, description, target: parseInt(target), category, isEveryday: !!isEveryday }
          : h
      )
    );
  };

  const incrementProgress = (id) => {
    setHabits((prev) => prev.map((h) => {
      if (h.id === id) {
        const nextVal = Math.min((h.current || 0) + 1, h.target);
        const isDone = nextVal >= h.target;
        if (isDone && !h.completedToday) {
          confetti({ particleCount: 150, spread: 60, origin: { y: 0.7 } });
        }
        return { ...h, current: nextVal, streak: isDone && !h.completedToday ? h.streak + 1 : h.streak, completedToday: isDone };
      }
      return h;
    }));
  };

  const decrementProgress = (id) => {
    setHabits((prev) => prev.map((h) => 
      h.id === id ? { ...h, current: Math.max(0, (h.current || 0) - 1), completedToday: false } : h
    ));
  };

  const deleteHabit = (id) => {
    if (window.confirm("Delete this habit?")) {
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
    deleteHabit 
  };
};