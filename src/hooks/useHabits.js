import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { toast } from "react-toastify";

export const useHabits = (user) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token"); 

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch("http://localhost:5000/api/habits/my-habits", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setHabits(data);
      }
    } catch (err) {
      console.error("Failed to fetch habits:", err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (title, description, target, category, isEveryday, unit) => {
    try {
      const response = await fetch("http://localhost:5000/api/habits/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title, 
          description, 
          target: Number(target), 
          category, 
          is_everyday: isEveryday, 
          unit 
        })
      });
      if (response.ok) fetchHabits(); 
    } catch (err) {
      console.error(err);
    }
  };

  const incrementProgress = async (id) => {
    // Optimistic UI update
    setHabits(prev => prev.map(h => {
      if (h.id === id && h.current < h.target) {
        const newCount = h.current + 1;
        if (newCount === h.target) confetti({ particleCount: 150, spread: 70 });
        return { ...h, current: newCount, completed_today: newCount >= h.target };
      }
      return h;
    }));

    try {
      await fetch(`http://localhost:5000/api/habits/increment/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchHabits(); // Re-sync to get correct streak/completed status from DB
    } catch (err) {
      fetchHabits();
    }
  };

  const decrementProgress = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/habits/decrement/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) fetchHabits();
    } catch (err) {
      toast.error("Failed to decrement");
    }
  };

  const updateHabit = async (id, title, description, target, category, isEveryday, unit) => {
    try {
      const response = await fetch(`http://localhost:5000/api/habits/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title, 
          description, 
          target: Number(target), 
          category, 
          is_everyday: isEveryday, 
          unit 
        })
      });
      if (response.ok) fetchHabits();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteHabit = async (id) => {
    const response = await fetch(`http://localhost:5000/api/habits/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) fetchHabits();
  };

  return { habits, loading, addHabit, incrementProgress, deleteHabit, updateHabit, decrementProgress };
};