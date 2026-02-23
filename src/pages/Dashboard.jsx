import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from "../context/AuthContext"; // Import the Context

// Components
import Sidebar from "../components/Sidebar";
import AddHabitModal from "../components/AddHabitModal";
import MobileNav from "../components/MobileNav";
import Header from "../components/Header";
import HabitCard from "../components/HabitCard";
import WellnessCard from "../components/WellnessCard";

// Hooks & Services
import { useHabits } from "../hooks/useHabits";
import { useNotifications } from "../hooks/useNotifications";
import { healthService, fetchRealGoogleFitData } from "../services/healthService";

const Dashboard = () => {
  // 1. Hook into your new Auth Logic
  const { user, loading } = useContext(AuthContext);

  // 2. Derived data from the real user object
  const userName = user?.fullName || "User";
  const userKey = user ? `habits_${user.email}` : null;

  // 3. Habits Logic (Currently still using your local hook)
  const { 
    habits, 
    addHabit, 
    updateHabit, 
    incrementProgress, 
    decrementProgress, 
    deleteHabit 
  } = useHabits(userKey);

  const [quote, setQuote] = useState({ text: "Loading inspiration...", author: "" });
  const [editingHabit, setEditingHabit] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [syncData, setSyncData] = useState(healthService.fetchData());
  const [isSyncing, setIsSyncing] = useState(false);

  // Google Fit Sync Logic
  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSyncing(true);
      try {
        const realData = await fetchRealGoogleFitData(tokenResponse.access_token);
        const updated = healthService.syncData(realData);
        setSyncData(updated);
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    scope: 'https://www.googleapis.com/auth/fitness.activity.read',
  });

  // Momentum Logic
  const wellnessScore = useMemo(() => {
    if (habits.length === 0) return 0;
    const totalProgress = habits.reduce((acc, h) => acc + Math.min(h.current / h.target, 1), 0);
    return Math.round((totalProgress / habits.length) * 100);
  }, [habits]);

  const neglectedHabit = useMemo(() => habits.find((h) => h.current / h.target < 0.3), [habits]);
  useNotifications(neglectedHabit);

  const perfectedToday = habits.filter((h) => h.completedToday).length;
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

  useEffect(() => {
    const localQuotes = [
      { text: "Consistency is the DNA of mastery.", author: "Robin Sharma" },
      { text: "Small habits lead to big changes.", author: "James Clear" },
    ];
    setQuote(localQuotes[Math.floor(Math.random() * localQuotes.length)]);
    setSyncData(healthService.fetchData());
  }, []);

  // 4. Handle Loading State (Prevents the "Please Login" flash)
  if (loading) {
    return (
      <div className="h-screen bg-[#1a164d] flex items-center justify-center text-white">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // 5. Handle Unauthorized Access
  if (!user) {
    return (
      <div className="h-screen bg-[#1a164d] flex items-center justify-center text-white p-6 text-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
          <p className="text-indigo-200/60 mb-6">Please log in to access your dashboard.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-xl font-bold transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a164d] via-[#2e1065] to-black text-white overflow-hidden">
      <MobileNav />
      <div className="hidden md:block w-64 h-full shrink-0"><Sidebar /></div>
      
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <Header 
          userName={userName} 
          neglectedHabit={neglectedHabit} 
          quote={quote} 
        />

        {/* Momentum Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
          <div className="flex-1"><WellnessCard score={wellnessScore} /></div>
          <div className="flex-[2] bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">Daily Momentum</h2>
                <p className="text-2xl font-black">{wellnessScore}%</p>
              </div>
              <p className="text-gray-400 text-xs font-bold">{perfectedToday} / {habits.length} Done</p>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${wellnessScore}%` }} 
                className={`h-full transition-all duration-1000 ${wellnessScore < 40 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-pink-500"}`} 
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">Active Habits</p>
            <h3 className="text-2xl font-black">{habits.length}</h3>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-green-400 text-[9px] font-bold uppercase mb-1">Perfect Today</p>
            <h3 className="text-2xl font-black text-green-400">{perfectedToday}</h3>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-orange-400 text-[9px] font-bold uppercase mb-1">Max Streak</p>
            <h3 className="text-2xl font-black text-orange-400">{bestStreak}d</h3>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center relative group">
            <button onClick={() => loginGoogle()} disabled={isSyncing} className="absolute top-2 right-2 text-indigo-400 hover:text-white transition-colors disabled:opacity-30">
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            </button>
            <p className="text-indigo-400 text-[9px] font-bold uppercase mb-1">Synced Steps</p>
            <h3 className="text-2xl font-black">{syncData.steps.toLocaleString()}</h3>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-pink-400 text-[9px] font-bold uppercase mb-1">Sleep Hrs</p>
            <h3 className="text-2xl font-black text-pink-400">{syncData.sleepHours}h</h3>
          </div>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {habits.map((habit) => (
            <div key={habit.id} id={`habit-${habit.id}`} className="transition-all duration-500 scroll-mt-20">
              <HabitCard 
                habit={habit} 
                onIncrement={incrementProgress} 
                onDecrement={decrementProgress} 
                onEdit={(h) => { setEditingHabit(h); setIsOpen(true); }} 
                onDelete={deleteHabit} 
              />
            </div>
          ))}
        </div>
      </main>

      {/* Add Habit Button */}
      <button 
        onClick={() => { setEditingHabit(null); setIsOpen(true); }} 
        className="fixed bottom-6 right-6 bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl z-50 hover:bg-indigo-500 transition-transform active:scale-90"
      >
        +
      </button>

      <AddHabitModal 
        isOpen={isOpen} 
        onClose={() => { setIsOpen(false); setEditingHabit(null); }} 
        onAdd={addHabit} 
        onUpdate={updateHabit} 
        editingHabit={editingHabit} 
      />
    </div>
  );
};

export default Dashboard;