import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Trophy, Flame, Star, Activity } from "lucide-react";
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

// --- LOGIC UTILITIES ---

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

// AUTO-MOOD CALCULATION ENGINE
const calculateSystemSentiment = (score, streak, habits) => {
  const completionRate = habits.length > 0 
    ? habits.filter(h => h.completed_today).length / habits.length 
    : 0;

  if (score > 85 && streak >= 7) return { label: "ELITE", emoji: "🔥", color: "text-pink-500", desc: "Neuro-efficiency at maximum." };
  if (score > 70 || completionRate > 0.8) return { label: "FOCUSED", emoji: "⚡", color: "text-indigo-400", desc: "System stable. High output." };
  if (score > 40) return { label: "NEUTRAL", emoji: "😐", color: "text-gray-400", desc: "Maintenance mode active." };
  if (score > 0) return { label: "LOW", emoji: "🥱", color: "text-orange-400", desc: "Cognitive resources depleted." };
  return { label: "BURNT", emoji: "💀", color: "text-red-500", desc: "System failure imminent." };
};

// --- SUB-COMPONENTS ---

const SystemSentimentCard = ({ sentiment }) => (
  <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 h-full flex flex-col justify-between relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${sentiment.color.replace('text', 'bg')}`} />
    <div>
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic mb-1">System Sentiment</h2>
      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Auto-Diagnostic Active</p>
    </div>
    <div className="flex items-center gap-4 my-2">
      <motion.span key={sentiment.label} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl">
        {sentiment.emoji}
      </motion.span>
      <div>
        <h3 className={`text-2xl font-black italic leading-none ${sentiment.color}`}>{sentiment.label}</h3>
        <p className="text-[11px] text-gray-400 italic mt-1">{sentiment.desc}</p>
      </div>
    </div>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const threshold = sentiment.label === "ELITE" ? 5 : sentiment.label === "FOCUSED" ? 4 : sentiment.label === "NEUTRAL" ? 3 : 1;
        return (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= threshold ? sentiment.color.replace('text', 'bg') : 'bg-white/10'}`} />
        );
      })}
    </div>
  </div>
);

const StreakMilestone = ({ streak }) => {
  const milestone = useMemo(() => {
    if (streak >= 30) return { icon: <Trophy className="text-yellow-400" />, label: "GOD MODE: 30+ DAYS", color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-500" };
    if (streak >= 7) return { icon: <Flame className="text-orange-400" />, label: "WEEKLY WARRIOR: 7+ DAYS", color: "border-orange-500/50 bg-orange-500/10 text-orange-500" };
    return null;
  }, [streak]);
  if (!milestone) return null;
  return (
    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${milestone.color}`}>
      <div className="p-2 bg-black/20 rounded-lg">{milestone.icon}</div>
      <div>
        <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">{milestone.label}</h4>
        <p className="text-xs opacity-80 italic">Your momentum is statistically unstoppable right now.</p>
      </div>
    </motion.div>
  );
};

const WellnessAlert = ({ score }) => {
  if (score >= 60 || score === 0) return null;
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-4">
      <div className="bg-red-500 p-2 rounded-lg animate-pulse">⚠️</div>
      <div>
        <h4 className="text-red-400 font-black text-xs uppercase tracking-widest">Wellness Alert</h4>
        <p className="text-sm text-gray-200">Your score is dropping ({score}%). Complete high-impact habits like Sleep or Nutrition.</p>
      </div>
    </motion.div>
  );
};

// --- MAIN DASHBOARD ---

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

  // Derived Sentiment
  const systemSentiment = useMemo(() => 
    calculateSystemSentiment(wellnessScore, bestStreak, habits), 
    [wellnessScore, bestStreak, habits]
  );

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

  if (loading) return <div className="h-screen bg-[#1a164d] flex items-center justify-center text-white font-black italic">CALIBRATING SYSTEM...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a164d] via-[#2e1065] to-black text-white overflow-hidden">
      <MobileNav />
      <div className="hidden md:block w-64 h-full shrink-0"><Sidebar /></div>
      
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <Header userName={user?.fullName || "User"} neglectedHabit={neglectedHabit} quote={quote} />

        <StreakMilestone streak={bestStreak} />
        <WellnessAlert score={wellnessScore} />

        {/* TOP METRICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
          <div className="h-full">
            <WellnessCard score={wellnessScore} />
          </div>

          <div className="h-full">
            <SystemSentimentCard sentiment={systemSentiment} />
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Daily Momentum</h2>
                <p className="text-3xl font-black italic">{wellnessScore}%</p>
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{perfectedToday} / {habits.length} Optimized</p>
            </div>
            <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${wellnessScore}%` }} className={`h-full ${wellnessScore < 40 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"}`} />
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Active Habits" value={habits.length} color="text-white" />
          <StatCard label="Perfect Today" value={perfectedToday} color="text-green-400" />
          <StatCard label="Max Streak" value={`${bestStreak}d`} color="text-orange-400" />
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center relative group">
            <button onClick={() => loginGoogle()} className="absolute top-2 right-2 text-indigo-400 hover:text-white transition-colors">
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            </button>
            <p className="text-indigo-400 text-[9px] font-bold uppercase mb-1">Synced Steps</p>
            <h3 className="text-2xl font-black italic">{syncData.steps.toLocaleString()}</h3>
          </div>
          <StatCard label="Sleep Hrs" value={`${syncData.sleepHours}h`} color="text-pink-400" />
        </div>

        {/* HABIT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {habits.length > 0 ? (
            habits.map((habit) => (
              <div key={habit.id} className="transition-all duration-500">
                <HabitCard 
                  habit={habit} 
                  onIncrement={incrementProgress} 
                  onDecrement={decrementProgress} 
                  onEdit={(h) => { setEditingHabit(h); setIsOpen(true); }} 
                  onDelete={deleteHabit} 
                />
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🚀</span>
              </motion.div>
              <h3 className="text-2xl font-black italic text-white mb-2">Systems Offline</h3>
              <p className="text-gray-400 text-sm mb-8 max-w-xs text-center px-4">No active habits detected. Calibrate your first habit to begin.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditingHabit(null); setIsOpen(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/20 transition-all">
                + Initialize Habit
              </motion.button>
            </div>
          )}
        </div>
      </main>

      {/* FAB AND MODAL */}
      <button onClick={() => { setEditingHabit(null); setIsOpen(true); }} className="fixed bottom-6 right-6 bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl z-50 hover:bg-indigo-500 transition-transform active:scale-90 shadow-indigo-500/20">+</button>
      <AddHabitModal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingHabit(null); }} onAdd={addHabit} onUpdate={updateHabit} editingHabit={editingHabit} />
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
    <p className={`text-gray-400 text-[9px] font-bold uppercase mb-1`}>{label}</p>
    <h3 className={`text-2xl font-black italic ${color}`}>{value}</h3>
  </div>
);

export default Dashboard;