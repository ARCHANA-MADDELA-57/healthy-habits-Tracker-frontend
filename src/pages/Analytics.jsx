import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
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
import { AuthContext } from "../context/AuthContext";
import MobileNav from "../components/MobileNav";
import WeeklySummary from "../components/WeeklySummary";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [habits, setHabits] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/analytics/stats?t=${Date.now()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Error ${response.status}`);

      setHabits(data.habits || []);
      setHistory(data.history || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Calculations
  const wellnessScore = useMemo(() => {
    if (habits.length === 0) return 0;
    const totalProgress = habits.reduce((acc, h) => acc + (Math.min(h.current / h.target, 1)), 0);
    return Math.round((totalProgress / habits.length) * 100);
  }, [habits]);

  const sortedPerformance = useMemo(() => 
    [...habits].sort((a, b) => (b.current / b.target) - (a.current / a.target))
  , [habits]);

  const bestHabit = sortedPerformance[0];
  const worstHabit = sortedPerformance[sortedPerformance.length - 1];
  const categories = [...new Set(habits.map(h => h.category))];

  if (loading) return <div className="h-screen bg-[#0f172a] flex items-center justify-center text-white italic animate-pulse">GENERATING ANALYTICS...</div>;

  return (
    <div className="w-full text-white p-4 md:p-8 space-y-8 bg-[#0f172a] min-h-screen">
      <MobileNav />
      
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Performance</h1>
          <p className="text-indigo-400 font-medium">Visualizing data for {user?.fullName}</p>
        </div>
        <div className="flex gap-4 items-center">
           <button onClick={fetchAnalyticsData} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xl">🔄</button>
           <div className="bg-white/5 border border-white/10 p-4 px-8 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Wellness Score</p>
              <h2 className={`text-3xl font-black ${wellnessScore > 70 ? 'text-green-400' : 'text-orange-400'}`}>{wellnessScore}%</h2>
           </div>
        </div>
      </header>

      {/* 2. TOP ROW: BAR CHART & DOUGHNUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span> Target vs Achieved
          </h2>
          <div className="h-[350px]">
            {habits.length > 0 ? (
              <Bar 
                data={{
                  labels: habits.map(h => h.title),
                  datasets: [
                    { label: "Achieved", data: habits.map(h => h.current), backgroundColor: "#6366f1", borderRadius: 8, barPercentage: 0.6 },
                    { label: "Target", data: habits.map(h => h.target), backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, barPercentage: 0.6 }
                  ]
                }} 
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: "rgba(255,255,255,0.05)" } } } }}
              />
            ) : <p className="text-center mt-20 text-gray-500 italic">No habit data available.</p>}
          </div>
        </div>

        {/* RE-ADDED: DOUGHNUT CHART */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm flex flex-col items-center">
          <h2 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">Category Distribution</h2>
          <div className="h-[250px] w-full">
            <Doughnut 
              data={{
                labels: categories,
                datasets: [{
                  data: categories.map(cat => habits.filter(h => h.category === cat).length),
                  backgroundColor: ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981"],
                  borderWidth: 0,
                  cutout: '80%'
                }]
              }}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20, font: { size: 11 } } } } }}
            />
          </div>
        </div>
      </div>

      {/* 3. MIDDLE ROW: PERFORMANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between">
            <div>
              <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1 italic">MVP Habit</p>
              <h4 className="text-3xl font-black uppercase italic tracking-tighter">{bestHabit?.title || "N/A"}</h4>
              <p className="text-gray-500 text-sm mt-1">{bestHabit?.streak || 0} Day Streak 🔥</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-green-400 italic">
                {bestHabit ? Math.round((bestHabit.current / bestHabit.target) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between">
            <div>
              <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1 italic">Underperformer</p>
              <h4 className="text-3xl font-black uppercase italic tracking-tighter">{worstHabit?.title || "N/A"}</h4>
              <p className="text-gray-500 text-sm mt-1">Goal: {worstHabit?.target || 0} units</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-red-400 italic">
                {worstHabit ? Math.round((worstHabit.current / worstHabit.target) * 100) : 0}%
              </div>
            </div>
          </div>
      </div>

      {/* 4. BOTTOM ROW: HEATMAP SECTION */}
      <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem]">
        <h2 className="text-xl font-bold mb-10 flex items-center gap-4">
          <div className="w-2 h-8 bg-indigo-500 rounded-full"></div> Activity History
        </h2>
        <WeeklySummary history={history} userEmail={user?.email} />
      </div>
    </div>
  );
};

export default Analytics;