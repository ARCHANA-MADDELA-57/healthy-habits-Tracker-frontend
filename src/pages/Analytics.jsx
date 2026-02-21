import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import MobileNav from "../components/MobileNav";
import WeeklySummary from "../components/WeeklySummary"; // 👈 IMPORT YOUR FILE HERE

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [habits, setHabits] = useState([]);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState(""); // 👈 Store email for the summary

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (storedUser) {
      setUserName(storedUser.fullName || storedUser.name || "User");
      setUserEmail(storedUser.email); // 👈 Set email
      
      const userKey = `habits_${storedUser.email}`;
      const savedHabits = JSON.parse(localStorage.getItem(userKey)) || [];
      setHabits(savedHabits);
    }
  }, []);

  // --- CHART CALCULATIONS (Your existing logic) ---
  const weeklyLabels = habits.map((h) => h.title);
  const currentData = habits.map((h) => h.current || 0);
  const targetData = habits.map((h) => h.target || 0);

  const categories = habits.length > 0
    ? [...new Set(habits.map((h) => h.category || "General"))]
    : ["General"];

  const categoryCounts = categories.map(
    (cat) => habits.filter((h) => (h.category || "General") === cat).length
  );

  const chartColors = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  const weeklySummaryConfig = {
    labels: weeklyLabels,
    datasets: [
      { label: "Achieved", data: currentData, backgroundColor: "rgba(99, 102, 241, 0.8)", borderRadius: 8 },
      { label: "Target", data: targetData, backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 8 },
    ],
  };

  const categoryConfig = {
    labels: categories,
    datasets: [{ data: categoryCounts, backgroundColor: chartColors.slice(0, categories.length), borderWidth: 0 }],
  };

  

  return (
    <div className="w-full text-white p-4 md:p-8 space-y-12">
      <MobileNav />
      
      {/* 1. HEADER */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight italic">ANALYTICS_BOARD</h1>
          <p className="text-indigo-300 opacity-80 mt-1">Consistency report for {userName}.</p>
        </div>
      </header>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
          <h2 className="text-xl font-semibold mb-6">Live Progress Overview</h2>
          <div className="h-[300px]">
            {habits.length > 0 ? <Bar data={weeklySummaryConfig} options={{ responsive: true, maintainAspectRatio: false }} /> : <p className="text-center mt-20 text-gray-500">No active habits to chart.</p>}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
          <h2 className="text-xl font-semibold mb-6 text-center">Focus Areas</h2>
          <div className="h-[250px] flex justify-center items-center">
            {habits.length > 0 ? <Doughnut data={categoryConfig} options={{ responsive: true, maintainAspectRatio: false }} /> : <p>No data found.</p>}
          </div>
        </div>
      </div>

      {/* 3. INSIGHTS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600/20 p-6 rounded-3xl border border-indigo-500/20 text-center">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Active Habits</p>
          <h3 className="text-4xl font-black mt-2">{habits.length}</h3>
        </div>
        <div className="bg-purple-600/20 p-6 rounded-3xl border border-purple-500/20 text-center">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Avg. Success</p>
          <h3 className="text-4xl font-black mt-2">
            {habits.length > 0 ? Math.round((habits.reduce((acc, h) => acc + h.current / h.target, 0) / habits.length) * 100) : 0}%
          </h3>
        </div>
        <div className="bg-orange-600/20 p-6 rounded-3xl border border-orange-500/20 text-center">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Top Streak</p>
          <h3 className="text-4xl font-black mt-2">{habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0}</h3>
        </div>
      </div>

      <hr className="border-white/5 my-12" />

      {/* 4. WEEKLY SUMMARY (The Component you created!) */}
      <section className="mt-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Archived_Logs</h2>
          <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase">History of your past 7 days</p>
        </div>
        
        {/* We pass the userEmail state into your component */}
        {userEmail && <WeeklySummary userEmail={userEmail} />}
      </section>
    </div>
  );
};

export default Analytics;