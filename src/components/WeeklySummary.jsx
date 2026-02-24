import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORIES = [
  { name: "Fitness", icon: "💪" }, { name: "Hydration", icon: "💧" },
  { name: "Sleep", icon: "🌙" }, { name: "Meditation", icon: "🧘" },
  { name: "Nutrition", icon: "🥗" }, { name: "Study", icon: "📚" },
  { name: "Other", icon: "👤" },
];

const WeeklySummary = ({ history, userEmail }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowExportMenu(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableYears = useMemo(() => {
    const years = [...new Set(history.map(day => new Date(day.date).getFullYear().toString()))];
    return years.length > 0 ? years.sort((a,b) => b-a) : [new Date().getFullYear().toString()];
  }, [history]);

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const filteredHistory = useMemo(() => {
    return history.filter((day) => {
      const d = new Date(day.date);
      const mMatch = selectedMonth === "All" || months[d.getMonth()] === selectedMonth;
      const yMatch = d.getFullYear().toString() === selectedYear;
      return mMatch && yMatch;
    });
  }, [history, selectedMonth, selectedYear]);

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const currentLogs = filteredHistory.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const exportData = (format) => {
    const fileName = `Habit_Report_${selectedMonth}_${selectedYear}`;
    if (format === "pdf") {
      const doc = new jsPDF();
      doc.text("Habit Tracking Report", 14, 20);
      autoTable(doc, {
        head: [["Date", ...CATEGORIES.map(c => c.name), "Progress"]],
        body: filteredHistory.map(day => [
          new Date(day.date).toLocaleDateString(),
          ...CATEGORIES.map(cat => (day.logs?.find(l => l.category === cat.name)?.completed ? "Yes" : "No")),
          `${day.progress}%`
        ]),
        startY: 30
      });
      doc.save(`${fileName}.pdf`);
    }
    // ... CSV and JSON logic remain identical to previous ...
    toast.success(`${format.toUpperCase()} Generated!`);
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm relative z-50">
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-[#1e1b4b] text-white text-sm rounded-xl px-4 py-2">
            <option value="All">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-[#1e1b4b] text-white text-sm rounded-xl px-4 py-2">
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-indigo-600 p-2 px-4 rounded-xl text-xs font-bold">📥 Export</button>
          
          <AnimatePresence>
            {showExportMenu && (
              <motion.div ref={menuRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full mt-2 bg-[#2e2a75] border border-white/20 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                {['pdf', 'csv', 'json'].map(fmt => (
                  <button key={fmt} onClick={() => exportData(fmt)} className="w-full text-left px-5 py-3 hover:bg-white/10 text-xs font-bold uppercase">{fmt}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-2 disabled:opacity-20">◀</button>
          <span className="text-sm font-bold">{currentPage + 1} / {totalPages || 1}</span>
          <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-2 disabled:opacity-20">▶</button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1e1b4b]/40 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="p-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Date</th>
                {CATEGORIES.map(cat => <th key={cat.name} className="p-6 text-center text-[9px] font-bold text-gray-400 uppercase">{cat.icon} {cat.name}</th>)}
                <th className="p-6 text-center text-[10px] font-black text-indigo-300 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentLogs.map((day) => (
                <tr key={day.id} className="hover:bg-white/[0.03]">
                  <td className="p-6 font-bold">{new Date(day.date).toDateString()}</td>
                  {CATEGORIES.map(cat => (
                    <td key={cat.name} className="p-6 text-center">
                      {/* Note: Adjust 'day.logs' to match your Supabase schema keys */}
                      {day.logs?.find(l => l.category === cat.name)?.completed ? "✅" : "❌"}
                    </td>
                  ))}
                  <td className="p-6 text-center"><span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">{day.progress}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;