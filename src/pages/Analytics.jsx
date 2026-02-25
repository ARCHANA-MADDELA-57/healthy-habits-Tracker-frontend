import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler 
} from "chart.js";
import { AuthContext } from "../context/AuthContext";
import MobileNav from "../components/MobileNav";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Analytics = () => {
  const { user } = useContext(AuthContext);
  
  // States - Hooks must be at the very top
  const [habits, setHabits] = useState([]);
  const [historyTrend, setHistoryTrend] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllAnalytics = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch(`http://localhost:5000/api/analytics/daily`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/analytics/history-trend`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/analytics/monthly-trend`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dailyData = await dailyRes.json();
      const weeklyData = await weeklyRes.json();
      const monthlyData = await monthlyRes.json();

      setHabits(dailyData.habits || []);
      setHistoryTrend(weeklyData || []);
      setMonthlyTrend(monthlyData || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAllAnalytics(); }, [fetchAllAnalytics]);

  // Calculations
  const performance = useMemo(() => {
    if (!habits.length) return { best: null, worst: null };
    const sorted = [...habits].sort((a, b) => (b.current / b.target) - (a.current / a.target));
    return { best: sorted[0], worst: sorted.length > 1 ? sorted[sorted.length - 1] : null };
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

  if (loading) return (
    <div className="h-screen bg-[#0f172a] flex items-center justify-center text-white font-black italic animate-pulse">
      SYNCING ANALYTICS...
    </div>
  );

  return (
    <div className="w-full text-white p-4 md:p-8 space-y-8 bg-[#0f172a] min-h-screen pb-24">
      <MobileNav />
      <header>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-indigo-500">Daily Snap</h1>
          <p className="text-gray-400 font-medium">Performance for {new Date().toLocaleDateString()}</p>
      </header>

      {/* Stats Overview */}
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
        {/* Today Bar Chart */}
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

        {/* Category Distribution */}
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex flex-col items-center">
          <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest text-center">Focus</h2>
          <div className="h-[200px] w-full">
            <Doughnut data={categoryChart} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="lg:col-span-3 bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <h2 className="text-xl font-bold mb-6 italic">Weekly Trend (%)</h2>
          <div className="h-[250px]">
            <Line 
              data={{
                labels: historyTrend.map(d => d.date),
                datasets: [{
                  label: "Consistency",
                  data: historyTrend.map(d => d.percentage),
                  borderColor: "#6366f1",
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  fill: true, tension: 0.4
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }}
            />
          </div>
        </div>

        {/* Monthly Trend - Styled Differently */}
        <div className="lg:col-span-3 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl mt-8">
  <div className="flex justify-between items-center mb-8">
    <div>
      <h2 className="text-2xl font-black italic uppercase tracking-widest text-pink-500">
        Monthly Pulse
      </h2>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-tighter">
        30-Day Completion Volume
      </p>
    </div>
    <div className="bg-pink-500/10 px-4 py-1 rounded-full border border-pink-500/20">
      <span className="text-pink-500 text-[10px] font-black uppercase">
        Live Performance
      </span>
    </div>
  </div>
  
  <div className="h-[300px]">
    <Line 
      data={{
        labels: monthlyTrend.map(d => d.dateLabel),
        datasets: [{
          label: "Volume %",
          data: monthlyTrend.map(d => d.percentage),
          borderColor: "#ec4899", // Cyber Pink
          borderWidth: 4,
          backgroundColor: "rgba(236, 72, 153, 0.1)",
          fill: true,
          stepped: true, // Distinct staircase look
          pointBackgroundColor: "#ec4899",
          pointBorderColor: "#0f172a",
          pointBorderWidth: 2,
          pointRadius: monthlyTrend.length > 20 ? 0 : 5, // Hide points if crowded
        }]
      }}
      options={{ 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
          y: { 
            min: 0, 
            max: 100,
            grid: { color: "rgba(255,255,255,0.03)" },
            ticks: { color: "#4b5563", font: { weight: 'bold' } }
          },
          x: {
            grid: { display: false },
            ticks: { color: "#4b5563", font: { weight: 'bold' }, maxRotation: 45, minRotation: 45 }
          }
        }
      }} 
    />
  </div>
</div>
      </div>
    </div>
  );
};

export default Analytics;