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
  const [habits, setHabits] = useState([]); // Active habits for today
  const [history, setHistory] = useState([]); // Filtered history logs
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
      
      // Habits: Current state of active habits
      // History: Filtered logs from DB based on selected Month/Year
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

  // --- CHART DATA: CURRENT DAY ACTIVE HABITS ---
  const activeHabitChartData = useMemo(() => ({
    labels: habits.map(h => h.title),
    datasets: [
      {
        label: "Achieved Today",
        data: habits.map(h => h.current),
        backgroundColor: "#6366f1",
        borderRadius: 10,
        barPercentage: 0.5,
      },
      {
        label: "Daily Target",
        data: habits.map(h => h.target),
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 10,
        barPercentage: 0.5,
      }
    ]
  }), [habits]);

  // Wellness Score based on Today's active habits
  const dailyWellnessScore = useMemo(() => {
    if (habits.length === 0) return 0;
    const totalProgress = habits.reduce((acc, h) => acc + (Math.min(h.current / h.target, 1)), 0);
    return Math.round((totalProgress / habits.length) * 100);
  }, [habits]);

  return (
    <div className="w-full text-white p-4 md:p-8 space-y-8 bg-[#0f172a] min-h-screen">
      <MobileNav />
      
      {/* HEADER WITH TODAY'S SCORE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Performance</h1>
          <p className="text-indigo-400 font-medium tracking-wide">Real-time Daily Analysis for {user?.fullName}</p>
        </div>
        <div className="flex gap-4 items-center">
           <button onClick={fetchAnalyticsData} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xl">🔄</button>
           <div className="bg-white/5 border border-white/10 p-4 px-8 rounded-3xl backdrop-blur-md shadow-lg border-l-4 border-l-indigo-500">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Today's Progress</p>
              <h2 className={`text-3xl font-black ${dailyWellnessScore > 70 ? 'text-green-400' : 'text-orange-400'}`}>{dailyWellnessScore}%</h2>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART: TODAY'S ACTIVE HABITS ONLY */}
        <div className="lg:col-span-2 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Active Habits Summary
            </h2>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-bold uppercase">Today</span>
          </div>
          <div className="h-[350px]">
            {habits.length > 0 ? (
              <Bar 
                data={activeHabitChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500 italic">No active habits found for today.</div>
            )}
          </div>
        </div>

        {/* CATEGORY DOUGHNUT: BASED ON ACTIVE HABITS */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center">
          <h2 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">Category Balance</h2>
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
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } } }}
            />
          </div>
        </div>
      </div>

      {/* WEEKLY SUMMARY: THE HISTORICAL ARCHIVE WITH FILTERS */}
      <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black tracking-widest uppercase italic flex items-center gap-4">
                <div className="w-2 h-8 bg-indigo-500 rounded-full"></div> 
                History Archive
            </h2>
        </div>
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