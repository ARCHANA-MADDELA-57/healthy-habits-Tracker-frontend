import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, Legend, ArcElement 
} from "chart.js";
import { AuthContext } from "../context/AuthContext";
import MobileNav from "../components/MobileNav";
import WeeklySummary from "../components/WeeklySummary";
import { calculateWeightedScore } from "./Dashboard"; // Importing the weighted logic

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [habits, setHabits] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ month: "All", year: new Date().getFullYear().toString() });

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/analytics/stats?month=${filters.month}&year=${filters.year}`, 
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      const data = await response.json();
      setHabits(data.habits || []);
      setHistory(data.history || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => { fetchAnalyticsData(); }, [fetchAnalyticsData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // RESTORED: Performance Sorting
  const sortedPerformance = useMemo(() => 
    [...habits].sort((a, b) => (b.current / b.target) - (a.current / a.target))
  , [habits]);

  const bestHabit = sortedPerformance[0];
  const worstHabit = sortedPerformance[sortedPerformance.length - 1];

  // UPDATED: Using the same weighted score as Dashboard
  const wellnessScore = useMemo(() => calculateWeightedScore(habits), [habits]);

  if (loading) return <div className="h-screen bg-[#0f172a] flex items-center justify-center text-white font-black italic animate-pulse">GENERATING ANALYTICS...</div>;

  return (
    <div className="w-full text-white p-4 md:p-8 space-y-8 bg-[#0f172a] min-h-screen">
      <MobileNav />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Performance</h1>
          <p className="text-indigo-400 font-medium tracking-wide">Detailed Analysis for {user?.fullName}</p>
        </div>
        <div className="flex gap-4 items-center">
           <button onClick={fetchAnalyticsData} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xl">🔄</button>
           <div className="bg-white/5 border border-white/10 p-4 px-8 rounded-3xl backdrop-blur-md shadow-lg">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Weighted Wellness</p>
              <h2 className={`text-3xl font-black ${wellnessScore > 70 ? 'text-green-400' : 'text-orange-400'}`}>{wellnessScore}%</h2>
           </div>
        </div>
      </header>

      {/* RESTORED: Best & Worst Performance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1">Peak Performer</p>
            <h3 className="text-xl font-bold">{bestHabit ? bestHabit.title : "N/A"}</h3>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-black text-2xl">{bestHabit ? Math.round((bestHabit.current / bestHabit.target) * 100) : 0}%</p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">Needs Attention</p>
            <h3 className="text-xl font-bold">{worstHabit ? worstHabit.title : "N/A"}</h3>
          </div>
          <div className="text-right">
            <p className="text-red-400 font-black text-2xl">{worstHabit ? Math.round((worstHabit.current / worstHabit.target) * 100) : 0}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-8">Target vs Achieved</h2>
          <div className="h-[350px]">
            <Bar 
              data={{
                labels: habits.map(h => h.title),
                datasets: [
                  { label: "Achieved", data: habits.map(h => h.current), backgroundColor: "#6366f1", borderRadius: 8 },
                  { label: "Target", data: habits.map(h => h.target), backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8 }
                ]
              }} 
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center">
          <h2 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest text-center">Focus Area Distribution</h2>
          <div className="h-[250px] w-full">
            <Doughnut 
              data={{
                labels: [...new Set(habits.map(h => h.category))],
                datasets: [{
                  data: [...new Set(habits.map(h => h.category))].map(cat => habits.filter(h => h.category === cat).length),
                  backgroundColor: ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981"],
                  borderWidth: 0,
                  cutout: '80%'
                }]
              }}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-black mb-10 tracking-widest uppercase italic flex items-center gap-4">
            <div className="w-2 h-8 bg-indigo-500 rounded-full"></div> Activity History
        </h2>
        <WeeklySummary 
          history={history} 
          onFilterChange={handleFilterChange} 
          selectedMonth={filters.month}
          selectedYear={filters.year}
        />
      </div>
    </div>
  );
};

export default Analytics;