import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { toast } from "react-toastify";

export const useHabits = (user) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get fresh token every time a request is made
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch("http://localhost:5000/api/habits/my-habits", {
        headers: getAuthHeader()
      });
      const data = await response.json();
      
      if (response.ok) {
        // ONLY set habits that are not archived
        const activeOnly = data.filter(h => h.is_archived === false);
        setHabits(activeOnly);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (title, description, target, category, isEveryday, unit) => {
    try {
      const response = await fetch("http://localhost:5000/api/habits/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader()
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
      
      if (response.ok) {
        toast.success("Habit added successfully!");
        fetchHabits(); // This triggers the re-sync
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Failed to add habit");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while adding habit");
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
        headers: getAuthHeader()
      });
      fetchHabits(); 
    } catch (err) {
      fetchHabits();
    }
  };

  const decrementProgress = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/habits/decrement/${id}`, {
        method: "PATCH",
        headers: getAuthHeader()
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
          ...getAuthHeader()
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
      if (response.ok) {
        toast.success("Habit updated!");
        fetchHabits();
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteHabit = async (id) => {
    // 1. It removes it from the screen first
    const previousHabits = [...habits];
    setHabits(prev => prev.filter(h => h.id !== id));
  
    try {
      const response = await fetch(`http://localhost:5000/api/habits/${id}`, {
        method: "DELETE", // This is what hits your backend delete route
        headers: getAuthHeader()
      });
      
      if (!response.ok) throw new Error(); // If the backend fails (Error 23503), this runs
      toast.info("Habit deleted");
    } catch (err) {
      // 2. This puts the habit back on the screen and shows the error
      setHabits(previousHabits); 
      toast.error("Could not delete habit");
    }
  };

  return { habits, loading, addHabit, incrementProgress, deleteHabit, updateHabit, decrementProgress, refreshHabits: fetchHabits };
};