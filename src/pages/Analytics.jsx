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

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (storedUser) {
      // Set name immediately
      setUserName(storedUser.fullName || storedUser.name || "User");
      
      const userKey = `habits_${storedUser.email}`;
      const savedHabits = JSON.parse(localStorage.getItem(userKey)) || [];
      setHabits(savedHabits);
    }
  }, []);

  // --- DATA CALCULATIONS ---

  // 1. Weekly Summary Data (Using 'title' instead of 'name')
  const weeklyLabels = habits.map((h) => h.title);
  const currentData = habits.map((h) => h.current || 0);
  const targetData = habits.map((h) => h.target || 0);

  // 1. Automatically find all unique categories used in your habits
  // 1. Get unique categories from your ACTUAL habits
  // This prevents the chart from being empty if you use custom names
  const categories =
    habits.length > 0
      ? [...new Set(habits.map((h) => h.category || "General"))]
      : ["General"];

  // 2. Count habits per category found
  const categoryCounts = categories.map(
    (cat) => habits.filter((h) => (h.category || "General") === cat).length
  );

  // 3. Dynamic color generator (so you don't run out of colors)
  const chartColors = [
    "#6366f1",
    "#a855f7",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#ef4444",
    "#06b6d4",
  ];
  // Check if we have "Misc" data not in our main list
  const accountedFor = categoryCounts.reduce((a, b) => a + b, 0);
  const hasData = habits.length > 0;

  // --- CHART CONFIGURATIONS ---

  const weeklySummaryConfig = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Achieved",
        data: currentData,
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderRadius: 8,
      },
      {
        label: "Target",
        data: targetData,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 8,
      },
    ],
  };

  const categoryConfig = {
    labels: categories,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: chartColors.slice(0, categories.length),
        borderWidth: 0,
        hoverOffset: 20,
      },
    ],
  };

  

  const handleDownload = () => {
    // Briefly remove any overflow restrictions so the whole page is captured
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "visible";
    
    window.print();
    
    document.body.style.overflow = originalOverflow;
  };

  return (
    <div className="w-full text-white animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-end">
  <div>
    <h1 className="text-4xl font-extrabold tracking-tight">Performance Analytics</h1>
    <p className="text-indigo-300 opacity-80 mt-1">Deep dive into your consistency, {userName}.</p>
  </div>
  
  <button 
    onClick={handleDownload}
    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
  >
    <span>📥</span> Download Report
  </button>
</header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Weekly Summary Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Habit Progress Overview</h2>
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full uppercase tracking-widest">
              Live Data
            </span>
          </div>
          <div className="h-[300px]">
            {habits.length > 0 ? (
              <Bar
                data={weeklySummaryConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(255,255,255,0.05)" },
                      ticks: { color: "#9ca3af" },
                    },
                    x: { ticks: { color: "#9ca3af" } },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 italic">
                Add habits in Dashboard to see breakdown
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl print:bg-indigo-950">
  <h2 className="text-xl font-semibold mb-6 text-center">Focus Areas</h2>
  <div className="h-[250px] flex justify-center items-center print:h-[400px]">
    {habits.length > 0 ? (
      <Doughnut 
      data={categoryConfig} 
      options={{
        responsive: true,
        maintainAspectRatio: false, // This is critical for the PDF render
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#9ca3af' } }
        }
      }} 
    />
    ) : (
      <p>No data found.</p>
    )}
  </div>
</div>

        {/* Quick Insights Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-600/20 to-transparent p-6 rounded-3xl border border-indigo-500/20">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Total Active Habits
            </p>
            <h3 className="text-4xl font-black mt-2">{habits.length}</h3>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-transparent p-6 rounded-3xl border border-purple-500/20">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Avg. Completion Rate
            </p>
            <h3 className="text-4xl font-black mt-2">
              {habits.length > 0
                ? Math.round(
                    (habits.reduce((acc, h) => acc + h.current / h.target, 0) /
                      habits.length) *
                      100
                  )
                : 0}
              %
            </h3>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-transparent p-6 rounded-3xl border border-orange-500/20">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Current Best Streak
            </p>
            <h3 className="text-4xl font-black mt-2">
              {habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
