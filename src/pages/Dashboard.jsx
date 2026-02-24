import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from "../context/AuthContext";

import Sidebar from "../components/Sidebar";
import AddHabitModal from "../components/AddHabitModal";
import MobileNav from "../components/MobileNav";
import Header from "../components/Header";
import HabitCard from "../components/HabitCard";
import WellnessCard from "../components/WellnessCard";

import { useHabits } from "../hooks/useHabits";
import { useNotifications } from "../hooks/useNotifications";
import { healthService, fetchRealGoogleFitData } from "../services/healthService";

// WEIGHTED LOGIC (Updated Weights)
export const calculateWeightedScore = (habitList) => {
  if (!habitList || habitList.length === 0) return 0;
  const weights = { 
    Sleep: 2.5, Nutrition: 2.0, Fitness: 1.8, Meditation: 1.8, 
    Hydration: 1.5, Study: 1.0, Other: 0.8 
  };
  let totalWeightedProgress = 0;
  let totalPossibleWeight = 0;
  habitList.forEach(h => {
    const weight = weights[h.category] || 1.0;
    const progress = Math.min(Number(h.current || 0) / Number(h.target || 1), 1);
    totalWeightedProgress += (progress * weight);
    totalPossibleWeight += weight;
  });
  return Math.round((totalWeightedProgress / totalPossibleWeight) * 100);
};

const WellnessAlert = ({ score }) => {
  if (score >= 60 || score === 0) return null;
  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
      className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-4"
    >
      <div className="bg-red-500 p-2 rounded-lg animate-pulse">⚠️</div>
      <div>
        <h4 className="text-red-400 font-black text-xs uppercase tracking-widest">Wellness Alert</h4>
        <p className="text-sm text-gray-200">Your score is dropping ({score}%). Complete high-impact habits like Sleep or Nutrition.</p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const { habits, addHabit, updateHabit, incrementProgress, decrementProgress, deleteHabit } = useHabits(user);

  const [quote] = useState({ text: "Consistency is the DNA of mastery.", author: "Robin Sharma" });
  const [editingHabit, setEditingHabit] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [syncData, setSyncData] = useState(healthService.fetchData());
  const [isSyncing, setIsSyncing] = useState(false);

  const wellnessScore = useMemo(() => calculateWeightedScore(habits), [habits]);
  const perfectedToday = useMemo(() => habits.filter((h) => h.completed_today === true).length, [habits]);
  const bestStreak = useMemo(() => habits.length > 0 ? Math.max(...habits.map((h) => Number(h.streak) || 0)) : 0, [habits]);
  const neglectedHabit = useMemo(() => habits.find((h) => (Number(h.current) / Number(h.target)) < 0.3), [habits]);

  useNotifications(neglectedHabit);

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSyncing(true);
      try {
        const realData = await fetchRealGoogleFitData(tokenResponse.access_token);
        const updated = healthService.syncData(realData);
        setSyncData(updated);
      } catch (error) { console.error(error); } finally { setIsSyncing(false); }
    },
    scope: 'https://www.googleapis.com/auth/fitness.activity.read',
  });

  if (loading) return <div className="h-screen bg-[#1a164d] flex items-center justify-center text-white">Loading Dashboard...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a164d] via-[#2e1065] to-black text-white overflow-hidden">
      <MobileNav />
      <div className="hidden md:block w-64 h-full shrink-0"><Sidebar /></div>
      
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <Header userName={user?.fullName || "User"} neglectedHabit={neglectedHabit} quote={quote} />

        <WellnessAlert score={wellnessScore} />

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
              <motion.div animate={{ width: `${wellnessScore}%` }} className={`h-full ${wellnessScore < 40 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-pink-500"}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Active Habits" value={habits.length} color="text-white" />
          <StatCard label="Perfect Today" value={perfectedToday} color="text-green-400" />
          <StatCard label="Max Streak" value={`${bestStreak}d`} color="text-orange-400" />
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center relative group">
            <button onClick={() => loginGoogle()} className="absolute top-2 right-2 text-indigo-400 hover:text-white transition-colors">
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            </button>
            <p className="text-indigo-400 text-[9px] font-bold uppercase mb-1">Synced Steps</p>
            <h3 className="text-2xl font-black">{syncData.steps.toLocaleString()}</h3>
          </div>
          <StatCard label="Sleep Hrs" value={`${syncData.sleepHours}h`} color="text-pink-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onIncrement={incrementProgress} onDecrement={decrementProgress} onEdit={(h) => { setEditingHabit(h); setIsOpen(true); }} onDelete={deleteHabit} />
          ))}
        </div>
      </main>

      <button onClick={() => { setEditingHabit(null); setIsOpen(true); }} className="fixed bottom-6 right-6 bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl z-50 hover:bg-indigo-500 transition-transform active:scale-90">+</button>
      <AddHabitModal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingHabit(null); }} onAdd={addHabit} onUpdate={updateHabit} editingHabit={editingHabit} />
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
    <p className={`text-gray-400 text-[9px] font-bold uppercase mb-1`}>{label}</p>
    <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
  </div>
);

export default Dashboard;