import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, Legend, ArcElement 
} from "chart.js";
import { AuthContext } from "../context/AuthContext";
import MobileNav from "../components/MobileNav";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyAnalytics = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/analytics/daily`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to fetch daily data");
      
      const data = await response.json();
      setHabits(data.habits || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchDailyAnalytics(); }, [fetchDailyAnalytics]);

  // Combined performance logic to match your JSX variables
  const performance = useMemo(() => {
    if (!habits.length) return { best: null, worst: null };
    
    const sorted = [...habits].sort((a, b) => {
      const scoreA = (a.current / (a.target || 1));
      const scoreB = (b.current / (b.target || 1));
      return scoreB - scoreA; 
    });

    return {
      best: sorted[0],
      worst: sorted.length > 1 ? sorted[sorted.length - 1] : null
    };
  }, [habits]);

  const categoryChart = useMemo(() => {
    const cats = habits.reduce((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(cats),
      datasets: [{
        data: Object.values(cats),
        backgroundColor: ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981"],
        borderWidth: 0, cutout: '80%'
      }]
    };
  }, [habits]);

  if (loading) return <div className="h-screen bg-[#0f172a] flex items-center justify-center text-white font-black italic animate-pulse">SYNCING TODAY'S DATA...</div>;

  return (
    <div className="w-full text-white p-4 md:p-8 space-y-8 bg-[#0f172a] min-h-screen">
      <MobileNav />
      
      <header>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-indigo-500">Daily Snap</h1>
          <p className="text-gray-400 font-medium">Performance for {new Date().toLocaleDateString()}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl">
          <p className="text-green-400 text-[10px] font-black uppercase tracking-widest">Peak Performer Today</p>
          <h3 className="text-xl font-bold">{performance.best?.title || "No data"}</h3>
          <p className="text-2xl font-black text-green-400">
            {performance.best ? Math.round((performance.best.current / performance.best.target) * 100) : 0}%
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl">
          <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Needs Attention Today</p>
          <h3 className="text-xl font-bold">{performance.worst?.title || "N/A"}</h3>
          <p className="text-2xl font-black text-red-400">
              {performance.worst ? Math.round((performance.worst.current / performance.worst.target) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <h2 className="text-xl font-bold mb-6 italic">Today's Progress</h2>
          <div className="h-[300px]">
            <Bar 
              data={{
                labels: habits.map(h => h.title),
                datasets: [
                  { label: "Today", data: habits.map(h => h.current), backgroundColor: "#6366f1", borderRadius: 6 },
                  { label: "Goal", data: habits.map(h => h.target), backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 6 }
                ]
              }} 
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex flex-col items-center">
          <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Focus Distribution</h2>
          <div className="h-[200px] w-full">
            <Doughnut data={categoryChart} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;