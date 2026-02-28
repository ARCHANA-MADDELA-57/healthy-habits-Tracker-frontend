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
  
  // NEW STATES FOR PREVIEW SHARING
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImage, setShareImage] = useState(null);

  const downloadPDFReport = async () => {
    const element = reportRef.current;
    if (!element) return;
  
    // 1. Save original styles to restore them later
    const originalWidth = element.style.width;
    const originalMaxHeight = element.style.maxHeight;
  
    try {
      // 2. Force a "Desktop" width for the capture (e.g., 1200px)
      // This ensures the grid layouts (lg:grid-cols-3) trigger correctly
      element.style.width = "1200px";
      element.style.maxHeight = "none"; 
  
      const canvas = await html2canvas(element, {
        backgroundColor: "#16113a",
        scale: 2, // Keeps it high resolution
        useCORS: true, // Helps with loading external images/fonts
        windowWidth: 1200, // Forces the viewport width for the canvas
      });
  
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate ratio to fit the width of the PDF
      const imgProps = pdf.getImageProperties(imgData);
      const renderHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
      // 3. Add to PDF (centered and with a small margin)
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, renderHeight);
      
      pdf.save(
        `Habit-Analytics-${user?.fullName || "User"}-${new Date().toLocaleDateString()}.pdf`
      );
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      // 4. IMPORTANT: Restore the original mobile styles
      element.style.width = originalWidth;
      element.style.maxHeight = originalMaxHeight;
    }
  };

  // UPDATED SHARE MILESTONE LOGIC WITH PREVIEW
  const shareMilestone = async () => {
    const milestoneElement = document.getElementById("milestone-card");
    if (!milestoneElement) return;
  
    const canvas = await html2canvas(milestoneElement, { backgroundColor: "#1c1a4e", scale: 2 });
    const image = canvas.toDataURL("image/png");
    
    setShareImage(image); // Set the image for the modal preview
    setShowShareModal(true); // Open the modal

    // Auto-download for the user
    const link = document.createElement("a");
    link.download = `Milestone-${performance.best?.title || "Achievement"}.png`;
    link.href = image;
    link.click();
  };

  const fetchAllAnalytics = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch(`https://healthy-habits-tracker-backend.onrender.com/api/analytics/daily`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://healthy-habits-tracker-backend.onrender.com/api/analytics/history-trend`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://healthy-habits-tracker-backend.onrender.com/api/analytics/monthly-trend`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      const dailyData = await dailyRes.json();
      const weeklyData = await weeklyRes.json();
      const monthlyData = await monthlyRes.json();
  
      // DEBUG: Look at your console to see what 'weeklyData' actually is
      console.log("Weekly Data Received:", weeklyData);
  
      setHabits(dailyData.habits || []);
      
      // FIX: If weeklyData is an object, we need the array inside it
      // Check if your backend sends { trend: [...] } or just [...]
      const trendArray = Array.isArray(weeklyData) ? weeklyData : (weeklyData.trend || []);
      setHistoryTrend(trendArray);
  
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
      (a, b) => b.current / b.target - a.current / a.target
    );
    return {
      best: sorted[0],
      bestPercent: sorted[0] ? Math.round((sorted[0].current / sorted[0].target) * 100) : 0,
      worst: sorted.length > 1 ? sorted[sorted.length - 1] : null,
      worstPercent: sorted[sorted.length - 1] ? Math.round((sorted[sorted.length - 1].current / sorted[sorted.length - 1].target) * 100) : 0,
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
    <div className="w-full text-white p-4 md:p-8 bg-[#16113a] min-h-screen pb-24 font-sans overflow-x-hidden relative">
      <MobileNav />

      {/* --- RESPONSIVE PREVIEW & SHARE MODAL --- */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1c1a4e] border border-white/10 p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-pink-500">Share Milestone</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-white transition-colors text-xs font-bold">✕ CLOSE</button>
            </div>

            {/* IMAGE PREVIEW AREA */}
            <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg mb-6 bg-black/20">
              {shareImage && <img src={shareImage} alt="Milestone Preview" className="w-full h-auto block" />}
            </div>

            <p className="text-center text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-6">Image downloaded! Post your win to:</p>
            
            <div className="grid grid-cols-4 gap-2 mb-2">
              <button onClick={() => window.open(`https://wa.me/?text=I hit ${performance.bestPercent}%25 on ${performance.best?.title}!`, '_blank')} className="flex flex-col items-center gap-2 p-2 md:p-3 bg-white/5 rounded-2xl hover:bg-green-500/20 transition-all border border-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center text-sm md:text-lg font-bold">WP</div>
                <span className="text-[7px] md:text-[8px] font-black uppercase">WhatsApp</span>
              </button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Crushing goals! ${performance.bestPercent}%25 success on ${performance.best?.title}!`, '_blank')} className="flex flex-col items-center gap-2 p-2 md:p-3 bg-white/5 rounded-2xl hover:bg-blue-400/20 transition-all border border-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center text-sm md:text-lg font-bold border border-white/20">X</div>
                <span className="text-[7px] md:text-[8px] font-black uppercase">Twitter</span>
              </button>
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://healthyhabits.com`, '_blank')} className="flex flex-col items-center gap-2 p-2 md:p-3 bg-white/5 rounded-2xl hover:bg-blue-600/20 transition-all border border-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm md:text-xl font-bold">f</div>
                <span className="text-[7px] md:text-[8px] font-black uppercase">Facebook</span>
              </button>
              <button onClick={() => window.open(`https://www.instagram.com/`, '_blank')} className="flex flex-col items-center gap-2 p-2 md:p-3 bg-white/5 rounded-2xl hover:bg-pink-500/20 transition-all border border-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xs md:text-lg font-bold">IG</div>
                <span className="text-[7px] md:text-[8px] font-black uppercase">Instagram</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSIVE HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-blue-500 leading-tight">
            Performance Snap
          </h1>
          <p className="text-gray-400 font-bold italic mt-1 uppercase text-[10px] tracking-widest">
            Detailed Analysis for {user?.fullName || "User"}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={shareMilestone}
            className="flex-1 md:flex-none bg-pink-600 hover:bg-pink-500 text-white px-4 py-3 rounded-xl font-black transition-all shadow-lg active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest border border-white/10 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 106.632-3.316m0 0a3 3 0 100 6.632" />
            </svg>
            Share Snap
          </button>
          <button
            onClick={downloadPDFReport}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-black transition-all shadow-lg active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest border border-white/10"
          >
            Export Report
          </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8 p-1 md:p-2">
        {/* --- BRANDING SECTION --- */}
        <div className="border-l-4 border-pink-500 pl-4 md:pl-6 py-2 mb-8">
          <span className="text-pink-500 font-black uppercase text-[10px] tracking-widest">
            Profile: {user?.fullName || "User"}
          </span>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
            Habit Mastery Report
          </h2>
        </div>

        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-[#1c1a4e] p-5 md:p-6 rounded-[1.5rem] border border-white/5 shadow-xl relative group">
            <p className="text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Peak Performer</p>
            <h3 className="text-xl md:text-2xl font-bold">{performance.best?.title || "No data"}</h3>
            <p className="text-3xl md:text-4xl font-black text-green-400 mt-2">{performance.bestPercent}%</p>
          </div>

          <div className="bg-[#1c1a4e] p-5 md:p-6 rounded-[1.5rem] border border-white/5 shadow-xl">
            <p className="text-pink-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Needs Attention</p>
            <h3 className="text-xl md:text-2xl font-bold">{performance.worst?.title || "N/A"}</h3>
            <p className="text-3xl md:text-4xl font-black text-pink-500 mt-2">{performance.worstPercent}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* BAR CHART */}
          <div className="lg:col-span-2 bg-[#1c1a4e]/60 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-2xl">
            <h2 className="text-lg md:text-xl font-black italic mb-6 md:mb-8 uppercase tracking-tighter text-indigo-400">Daily Completion Volume</h2>
            <div className="h-[200px] md:h-[250px]">
              <Bar
                data={{
                  labels: habits.map((h) => h.title),
                  datasets: [
                    { label: "Today", data: habits.map((h) => h.current), backgroundColor: "#5046e5", borderRadius: 8 },
                    { label: "Goal", data: habits.map((h) => h.target), backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8 },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          </div>

          {/* DOUGHNUT CHART */}
          <div className="bg-[#1c1a4e]/60 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 flex flex-col items-center shadow-2xl">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 md:mb-10">Focus Points</h2>
             <div className="h-[180px] md:h-[200px] w-full">
               <Doughnut
                 data={{
                   labels: habits.map((h) => h.category),
                   datasets: [{
                     data: habits.length > 0 ? habits.map(() => 1) : [1],
                     backgroundColor: ["#5046e5", "#ec4899", "#3b82f6", "#10b981"],
                     borderWidth: 0, cutout: "80%",
                   }],
                 }}
                 options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
               />
             </div>
          </div>

          {/* WEEKLY TREND CHART */}
          <div className="lg:col-span-3 bg-[#1c1a4e]/60 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
            <h2 className="text-lg md:text-xl font-black italic mb-6 uppercase tracking-tighter text-indigo-400">7-Day Momentum</h2>
            <div className="h-[180px] md:h-[200px]">
              <Line
                data={{
                  labels: historyTrend.map((d) => d.date),
                  datasets: [{
                    label: "Consistency %",
                    data: historyTrend.map((d) => d.percentage),
                    borderColor: "#5046e5", backgroundColor: "rgba(80, 70, 229, 0.1)",
                    fill: true, tension: 0.4, pointRadius: 4,
                  }],
                }}
                options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }}
              />
            </div>
          </div>

          {/* MONTHLY PULSE CHART */}
          <div className="lg:col-span-3 bg-[#1c1a4e]/60 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 w-full gap-4">
              <div className="flex flex-col">
                <h2 className="text-xl md:text-2xl font-black italic uppercase text-pink-500 tracking-tighter leading-none">Monthly Pulse</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">30-Day Completion Volume</p>
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-pink-500/40 uppercase tracking-widest mb-1">Avg Success</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs font-bold">▲</span>
                    <span className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter">{monthlyAvg}%</span>
                  </div>
                </div>
                <span className="bg-pink-500/10 text-pink-500 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[10px] md:text-[11px] font-black border border-pink-500/30 uppercase tracking-[0.1em]">
                  {new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date())}
                </span>
              </div>
            </div>
            <div className="h-[220px] md:h-[280px] w-full mt-4">
              <Line
                data={{
                  labels: monthlyTrend.map((d) => d.dateLabel),
                  datasets: [{
                    label: "Volume",
                    data: monthlyTrend.map((d) => d.percentage),
                    borderColor: "#ec4899", borderWidth: 4, pointRadius: 4,
                    fill: true, backgroundColor: "rgba(236, 72, 153, 0.08)", tension: 0.4,
                  }],
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- HIDDEN MILESTONE CARD FOR SNAPSHOT GENERATION --- */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
          <div
            id="milestone-card"
            className="p-10 bg-[#1c1a4e] border-4 border-pink-500 rounded-[3rem] w-[500px] flex flex-col items-center text-center shadow-2xl"
          >
            <div className="flex justify-between items-center w-full mb-8">
              <span className="text-pink-500 font-black text-xs tracking-[0.3em] uppercase">
                Milestone Reached
              </span>
              <span className="text-white font-black italic tracking-tighter">HEALTHY HABITS</span>
            </div>
            <h2 className="text-gray-400 font-bold italic uppercase text-sm tracking-widest mb-2">
              Best Performing Habit
            </h2>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-6">
              {performance.best?.title}
            </h1>
            
            <div className="flex items-center justify-center bg-white/5 rounded-[2.5rem] py-8 px-12 border border-white/10 mb-8 w-full">
              <div className="flex items-baseline gap-4"> 
                <span className="text-8xl font-black text-green-400 leading-none tracking-tighter">
                  {performance.bestPercent}%
                </span>
                <div className="flex flex-col items-start text-left">
                  <p className="text-white font-black text-2xl leading-none italic uppercase">Success</p>
                  <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">Consistency Rate</p>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm font-medium italic border-t border-white/10 pt-6 w-full">
              Officially Tracked Achievement for <span className="text-white font-bold">{user?.fullName || "Akhil"}</span>
            </p>
          </div>
      </div>
    </div>
  );
};

export default Analytics;