import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react"; // Added for the sync icon
import { useGoogleLogin } from '@react-oauth/google'; // Added for direct sync
import Sidebar from "../components/Sidebar";
import AddHabitModal from "../components/AddHabitModal";
import MobileNav from "../components/MobileNav";
import Header from "../components/Header";
import HabitCard from "../components/HabitCard";
import WellnessCard from "../components/WellnessCard";
import { useHabits } from "../hooks/useHabits";
import { useNotifications } from "../hooks/useNotifications";
import { healthService, fetchRealGoogleFitData } from "../services/healthService";

const Dashboard = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
  const userName = storedUser?.fullName || "User";
  const userKey = storedUser ? `habits_${storedUser.email}` : null;

  const { habits, addHabit, updateHabit, incrementProgress, decrementProgress, deleteHabit } = useHabits(userKey);

  const [quote, setQuote] = useState({ text: "Loading inspiration...", author: "" });
  const [editingHabit, setEditingHabit] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [syncData, setSyncData] = useState(healthService.fetchData());
  const [isSyncing, setIsSyncing] = useState(false);

  // Direct Sync Logic
  const login = useGoogleLogin({
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

  if (!isLoggedIn || !storedUser) return <div className="h-screen bg-[#1a164d] flex items-center justify-center text-white">Please Login.</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a164d] via-[#2e1065] to-black text-white overflow-hidden">
      <MobileNav />
      <div className="hidden md:block w-64 h-full shrink-0"><Sidebar /></div>
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <Header userName={userName} neglectedHabit={neglectedHabit} quote={quote} />

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
              <motion.div animate={{ width: `${wellnessScore}%` }} className={`h-full transition-all duration-1000 ${wellnessScore < 40 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-pink-500"}`} />
            </div>
          </div>
        </div>

        {/* Stats Grid with 5 Columns */}
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

          {/* Synced Steps with the new Sync Icon */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center relative group">
            <button 
              onClick={() => login()} 
              disabled={isSyncing}
              className="absolute top-2 right-2 text-indigo-400 hover:text-white transition-colors disabled:opacity-30"
            >
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onIncrement={incrementProgress} onDecrement={decrementProgress} onEdit={(h) => { setEditingHabit(h); setIsOpen(true); }} onDelete={deleteHabit} />
          ))}
        </div>
      </main>

      <button onClick={() => { setEditingHabit(null); setIsOpen(true); }} className="fixed bottom-6 right-6 bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl z-50 hover:bg-indigo-500">+</button>
      <AddHabitModal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingHabit(null); }} onAdd={addHabit} onUpdate={updateHabit} editingHabit={editingHabit} />
    </div>
  );
};

export default Dashboard;