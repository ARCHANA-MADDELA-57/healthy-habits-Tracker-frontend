import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORIES = [
  { name: "Fitness", icon: "💪" }, { name: "Hydration", icon: "💧" },
  { name: "Sleep", icon: "🌙" }, { name: "Meditation", icon: "🧘" },
  { name: "Nutrition", icon: "🥗" }, { name: "Study", icon: "📚" },
  { name: "Other", icon: "👤" },
];

const WeeklySummary = ({ history, onFilterChange, selectedMonth, selectedYear }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Group logs by date for the table rows
  const dayWiseData = useMemo(() => {
    const grouped = history.reduce((acc, log) => {
      const dateKey = new Date(log.date).toDateString();
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, logs: [] };
      acc[dateKey].logs.push(log);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [history]);

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.ceil(dayWiseData.length / ITEMS_PER_PAGE);
  const currentLogs = dayWiseData.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const exportPDF = () => {
    if (dayWiseData.length === 0) {
      toast.error("No data to download for the selected period!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Habit Report: ${selectedMonth} ${selectedYear}`, 14, 15);
    
    autoTable(doc, {
      startY: 25,
      head: [["Date", ...CATEGORIES.map(c => c.name), "Daily Score"]],
      body: dayWiseData.map(day => [
        day.date,
        ...CATEGORIES.map(cat => day.logs.some(l => l.category === cat.name && l.status === 'completed') ? "Yes" : "No"),
        `${Math.round(day.logs.reduce((s,l) => s+l.progress, 0) / day.logs.length)}%`
      ]),
      headStyles: { fillColor: [79, 70, 229] }
    });
    doc.save(`Habit_Report_${selectedMonth}_${selectedYear}.pdf`);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedYear} onChange={(e) => onFilterChange('year', e.target.value)} className="bg-[#1e1b4b] text-white text-xs rounded-xl px-4 py-2 border border-white/10">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select value={selectedMonth} onChange={(e) => onFilterChange('month', e.target.value)} className="bg-[#1e1b4b] text-white text-xs rounded-xl px-4 py-2 border border-white/10">
            <option value="All">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <button onClick={exportPDF} className="bg-indigo-600 hover:bg-indigo-500 p-2 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
            📥 Export PDF
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="disabled:opacity-20 text-indigo-400 uppercase">Prev</button>
          <span className="bg-white/10 px-3 py-1 rounded-lg">{currentPage + 1} / {totalPages || 1}</span>
          <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="disabled:opacity-20 text-indigo-400 uppercase">Next</button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1e1b4b]/40 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="p-6 text-[10px] font-black text-indigo-300 uppercase">Date</th>
                {CATEGORIES.map(cat => <th key={cat.name} className="p-6 text-center text-[9px] font-bold text-gray-400 uppercase">{cat.icon} {cat.name}</th>)}
                <th className="p-6 text-center text-[10px] font-black text-indigo-300 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dayWiseData.length > 0 ? currentLogs.map((day, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-6 font-bold text-[11px] whitespace-nowrap uppercase text-gray-300">{day.date}</td>
                  {CATEGORIES.map(cat => (
                    <td key={cat.name} className="p-6 text-center text-xl">
                      {day.logs.some(l => l.category === cat.name && l.status === 'completed') ? "✅" : "❌"}
                    </td>
                  ))}
                  <td className="p-6 text-center">
                    <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black">
                        {Math.round(day.logs.reduce((s,l) => s+l.progress, 0) / day.logs.length)}%
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={CATEGORIES.length + 2} className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                    No activity recorded for {selectedMonth} {selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;