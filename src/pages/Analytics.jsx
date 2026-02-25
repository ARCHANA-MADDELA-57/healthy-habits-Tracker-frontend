import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
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
  Filler,
} from "chart.js";
import { AuthContext } from "../context/AuthContext";
import MobileNav from "../components/MobileNav";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const reportRef = useRef(null);

  const [habits, setHabits] = useState([]);
  const [historyTrend, setHistoryTrend] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [monthlyAvg, setMonthlyAvg] = useState(0);
  const [loading, setLoading] = useState(true);

  const downloadPDFReport = async () => {
    const element = reportRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, {
      backgroundColor: "#16113a",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 20, width, height);
    pdf.save(`Habit-Analytics-${user?.name || "User"}-${new Date().toLocaleDateString()}.pdf`);
  };

  const fetchAllAnalytics = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch(`http://localhost:5000/api/analytics/daily`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/analytics/history-trend`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/analytics/monthly-trend`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dailyData = await dailyRes.json();
      const weeklyData = await weeklyRes.json();
      const monthlyData = await monthlyRes.json();

      setHabits(dailyData.habits || []);
      setHistoryTrend(weeklyData || []);
      setMonthlyTrend(monthlyData.trend || []);
      setMonthlyAvg(monthlyData.average || 0);
    } catch (err) {
      console.error("Data Fetch Failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const performance = useMemo(() => {
    if (!habits.length) return { best: null, worst: null };
    const sorted = [...habits].sort(
      (a, b) => (b.current / b.target) - (a.current / a.target)
    );
    return {
      best: sorted[0],
      worst: sorted.length > 1 ? sorted[sorted.length - 1] : null,
    };
  }, [habits]);

  if (loading)
    return (
      <div className="h-screen bg-[#16113a] flex flex-col items-center justify-center text-indigo-400 font-bold italic">
        <div className="animate-pulse mb-4 tracking-[0.3em]">GENERATING SNAPSHOT...</div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );

  return (
    <div className="w-full text-white p-4 md:p-8 bg-[#16113a] min-h-screen pb-24 font-sans">
      <MobileNav />

      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-blue-500">
            Performance Snap
          </h1>
          <p className="text-gray-400 font-bold italic mt-1 uppercase text-[10px] tracking-widest">
            Detailed Analysis for {user?.fullName || "User"}
          </p>
        </div>
        <button
          onClick={downloadPDFReport}
          className="bg-indigo-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black transition-all shadow-lg active:scale-95 text-[10px] uppercase tracking-widest border border-white/10"
        >
          Export Report
        </button>
      </div>

      <div ref={reportRef} className="space-y-8 p-2">
        {/* PDF EXCLUSIVE LABEL (Personalization) */}
        <div className="border-l-4 border-pink-500 pl-6 py-2 mb-8">
            <span className="text-pink-500 font-black uppercase text-[10px] tracking-widest">Profile: {user?.fullName || "User"}</span>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Habit Mastery Report</h2>
        </div>

        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1c1a4e] p-6 rounded-[1.5rem] border border-white/5 shadow-xl">
            <p className="text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Peak Performer</p>
            <h3 className="text-2xl font-bold">{performance.best?.title || "No data"}</h3>
            <p className="text-4xl font-black text-green-400 mt-2">
              {performance.best ? Math.round((performance.best.current / performance.best.target) * 100) : 0}%
            </p>
          </div>

          <div className="bg-[#1c1a4e] p-6 rounded-[1.5rem] border border-white/5 shadow-xl">
            <p className="text-pink-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Needs Attention</p>
            <h3 className="text-2xl font-bold">{performance.worst?.title || "N/A"}</h3>
            <p className="text-4xl font-black text-pink-500 mt-2">
              {performance.worst ? Math.round((performance.worst.current / performance.worst.target) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BAR CHART */}
          <div className="lg:col-span-2 bg-[#1c1a4e]/60 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h2 className="text-xl font-black italic mb-8 uppercase tracking-tighter text-indigo-400">Daily Completion Volume</h2>
            <div className="h-[250px]">
              <Bar
                data={{
                  labels: habits.map((h) => h.title),
                  datasets: [
                    {
                      label: "Today",
                      data: habits.map((h) => h.current),
                      backgroundColor: "#5046e5",
                      borderRadius: 8,
                    },
                    {
                      label: "Goal",
                      data: habits.map((h) => h.target),
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                      y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b" } },
                      x: { grid: { display: false }, ticks: { color: "#64748b" } }
                  }
                }}
              />
            </div>
          </div>

          {/* DOUGHNUT */}
          <div className="bg-[#1c1a4e]/60 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center shadow-2xl">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10">Focus Points</h2>
            <div className="h-[200px] w-full">
              <Doughnut
                data={{
                  labels: habits.map((h) => h.category),
                  datasets: [{
                    data: habits.length > 0 ? habits.map(() => 1) : [1],
                    backgroundColor: ["#5046e5", "#ec4899", "#3b82f6", "#10b981"],
                    borderWidth: 0,
                    cutout: "80%",
                  }],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>

          {/* WEEKLY TREND */}
          <div className="lg:col-span-3 bg-[#1c1a4e]/60 p-8 rounded-[2rem] border border-white/5">
            <h2 className="text-xl font-black italic mb-6 uppercase tracking-tighter text-indigo-400">7-Day Momentum</h2>
            <div className="h-[200px]">
              <Line
                data={{
                  labels: historyTrend.map((d) => d.date),
                  datasets: [{
                    label: "Consistency %",
                    data: historyTrend.map((d) => d.percentage),
                    borderColor: "#5046e5",
                    backgroundColor: "rgba(80, 70, 229, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { 
                      y: { min: 0, max: 100, grid: { color: "rgba(255,255,255,0.05)" } },
                      x: { grid: { display: false } }
                  },
                }}
              />
            </div>
          </div>

          {/* MONTHLY PULSE - FIXED FULL WIDTH */}
          <div className="lg:col-span-3 bg-[#1c1a4e]/60 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start mb-8 w-full">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black italic uppercase text-pink-500 tracking-tighter leading-none">
                  Monthly Pulse
                </h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                  30-Day Completion Volume
                </p>
              </div>
              <div className="flex gap-6 items-center">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-pink-500/40 uppercase tracking-widest mb-1">Avg Success</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs font-bold">▲</span>
                    <span className="text-3xl font-black text-white leading-none tracking-tighter">{monthlyAvg}%</span>
                  </div>
                </div>
                <span className="bg-pink-500/10 text-pink-500 px-5 py-2.5 rounded-xl text-[11px] font-black border border-pink-500/30 uppercase tracking-[0.1em]">
                  {new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date())}
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full mt-4">
              <Line
                data={{
                  labels: monthlyTrend.map((d) => d.dateLabel),
                  datasets: [{
                    label: "Volume",
                    data: monthlyTrend.map((d) => d.percentage),
                    borderColor: "#ec4899",
                    borderWidth: 4,
                    pointRadius: 4,
                    pointBackgroundColor: "#ec4899",
                    pointBorderColor: "#1c1a4e",
                    pointBorderWidth: 2,
                    fill: true,
                    backgroundColor: "rgba(236, 72, 153, 0.08)",
                    tension: 0.4,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      min: 0,
                      max: 100,
                      grid: { color: "rgba(255,255,255,0.03)", drawBorder: false },
                      ticks: { color: "#94a3b8", font: { weight: "bold", size: 10 }, stepSize: 25 },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { 
                        color: "#64748b", 
                        font: { size: 9, weight: "bold" },
                        autoSkip: true,
                        maxTicksLimit: 12
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;