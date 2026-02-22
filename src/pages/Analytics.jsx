import React, { useState, useEffect, useMemo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import MobileNav from "../components/MobileNav";
import WeeklySummary from "../components/WeeklySummary";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [habits, setHabits] = useState([]);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (storedUser) {
      setUserName(storedUser.fullName || "User");
      setUserEmail(storedUser.email);
      const userKey = `habits_${storedUser.email}`;
      const historyKey = `${userKey}_history`;
      setHabits(JSON.parse(localStorage.getItem(userKey)) || []);
      setHistory(JSON.parse(localStorage.getItem(historyKey)) || []);
    }
  }, []);

  // --- ANALYTICS LOGIC ---

  // 1. Calculate Wellness Score (0-100)
  const wellnessScore = useMemo(() => {
    if (habits.length === 0) return 0;
    const totalProgress = habits.reduce((acc, h) => acc + (Math.min(h.current / h.target, 1)), 0);
    return Math.round((totalProgress / habits.length) * 100);
  }, [habits]);

  // 2. Identify Neglected Areas
  const neglectedAreas = useMemo(() => {
    return habits
      .filter(h => (h.current / h.target) < 0.5)
      .map(h => ({ title: h.title, category: h.category, rate: Math.round((h.current / h.target) * 100) }));
  }, [habits]);

  // 3. Best & Worst Performing
  const sortedHabits = [...habits].sort((a, b) => (b.current / b.target) - (a.current / a.target));
  const bestHabit = sortedHabits[0];
  const worstHabit = sortedHabits[sortedHabits.length - 1];

  // --- CHART CONFIGS ---
  const chartColors = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  return (
    <div className="w-full text-white p-4 md:p-8 space-y-8 bg-[#0f172a] min-h-screen">
      <MobileNav />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Performance Analytics</h1>
          <p className="text-indigo-400 font-medium">Comprehensive habit analysis for {userName}.</p>
        </div>

        {/* WELLNESS SCORE DISPLAY with Animation */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group"
        >
          <div className={`absolute inset-0 blur-2xl opacity-20 rounded-full animate-pulse ${wellnessScore < 50 ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <div className="relative bg-white/5 border border-white/10 p-4 px-8 rounded-3xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wellness Score</p>
              <h2 className={`text-3xl font-black ${wellnessScore < 50 ? 'text-red-400' : 'text-green-400'}`}>
                {wellnessScore}%
              </h2>
            </div>
            {/* Conditional Warning Icon */}
            {wellnessScore < 50 && (
              <motion.div 
                animate={{ y: [0, -5, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl"
              >⚠️</motion.div>
            )}
          </div>
        </motion.div>
      </header>

      {/* 2. NEGLECT ALERTS (Visual Feedback) */}
      <AnimatePresence>
        {neglectedAreas.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {neglectedAreas.slice(0, 4).map((area, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                <span className="text-xl">🚨</span>
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase">Neglect: {area.category}</p>
                  <p className="text-sm text-white/80">{area.title} is at {area.rate}%</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Performance Matrix</h2>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded">WEEKLY</span>
              <span className="px-2 py-1 bg-white/5 text-gray-500 rounded">MONTHLY</span>
            </div>
          </div>
          <div className="h-[350px]">
            {habits.length > 0 ? (
              <Bar 
                data={{
                  labels: habits.map(h => h.title),
                  datasets: [
                    { label: "Current", data: habits.map(h => h.current), backgroundColor: "#6366f1", borderRadius: 12 },
                    { label: "Target", data: habits.map(h => h.target), backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 }
                  ]
                }} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: { y: { grid: { display: false }, ticks: { color: '#4b5563' } }, x: { grid: { display: false }, ticks: { color: '#4b5563' } } },
                  plugins: { legend: { display: false } }
                }} 
              />
            ) : <p className="text-center mt-20 text-gray-500">No data available.</p>}
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[2.5rem] shadow-xl">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Highest Streak</p>
            <h3 className="text-5xl font-black mt-2">{bestHabit?.streak || 0}</h3>
            <p className="text-white/80 text-sm mt-1">Days with {bestHabit?.title || 'No Habits'}</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem]">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-tighter">Category Distribution</h3>
            <div className="h-[180px]">
              <Doughnut 
                data={{
                  labels: [...new Set(habits.map(h => h.category))],
                  datasets: [{ 
                    data: [...new Set(habits.map(h => h.category))].map(cat => habits.filter(h => h.category === cat).length),
                    backgroundColor: chartColors,
                    borderWidth: 0,
                    cutout: '75%'
                  }]
                }}
                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } } } }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-xs text-green-400 font-bold">OPTIMAL_PERFORMANCE</p>
              <h4 className="text-xl font-bold">{bestHabit?.title || "N/A"}</h4>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{bestHabit ? Math.round((bestHabit.current/bestHabit.target)*100) : 0}%</p>
            </div>
         </div>
         <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-400 font-bold">RECOVERY_NEEDED</p>
              <h4 className="text-xl font-bold">{worstHabit?.title || "N/A"}</h4>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{worstHabit ? Math.round((worstHabit.current/worstHabit.target)*100) : 0}%</p>
            </div>
         </div>
      </div>

      <WeeklySummary userEmail={userEmail} />
    </div>
  );
};

export default Analytics;