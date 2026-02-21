import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import the function directly
import "react-toastify/dist/ReactToastify.css";

const CATEGORIES = [
  { name: "Fitness", icon: "💪" },
  { name: "Hydration", icon: "💧" },
  { name: "Sleep", icon: "🌙" },
  { name: "Meditation", icon: "🧘" },
  { name: "Nutrition", icon: "🥗" },
  { name: "Study", icon: "📚" },
  { name: "Other", icon: "👤" },
];

const WeeklySummary = ({ userEmail }) => {
  const userKey = `habits_${userEmail}`;
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const history = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(`${userKey}_history`)) || [];
      return Array.isArray(raw)
        ? raw.sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];
    } catch (e) {
      return [];
    }
  }, [userKey]);

  const availableYears = useMemo(() => {
    const years = [
      ...new Set(
        history.map((day) => {
          const parts = day.date?.trim().split(" ") || [];
          return parts[parts.length - 1];
        })
      ),
    ]
      .filter(Boolean)
      .sort((a, b) => b - a);
    return years.length > 0 ? years : [new Date().getFullYear().toString()];
  }, [history]);

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const filteredHistory = useMemo(() => {
    return history.filter((dayRecord) => {
      const dateStr = dayRecord.date || "";
      const monthMatch =
        selectedMonth === "All" || dateStr.includes(selectedMonth);
      const yearMatch = dateStr.endsWith(selectedYear);
      return monthMatch && yearMatch;
    });
  }, [history, selectedMonth, selectedYear]);

  const exportData = (format) => {
    if (!filteredHistory || filteredHistory.length === 0) {
      toast.error("No data available to export!", { theme: "dark" });
      return;
    }

    const fileName = `Habit_Report_${selectedMonth}_${selectedYear}`;

    try {
      if (format === "pdf") {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Habit Tracking Report", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Email: ${
            userEmail || "N/A"
          } | Exported: ${new Date().toLocaleDateString()}`,
          14,
          30
        );

        const tableColumn = [
          "Date",
          ...CATEGORIES.map((c) => c.name),
          "Progress",
        ];
        const tableRows = filteredHistory.map((day) => {
          const habits = day.habits || [];
          const done = habits.filter((h) => h.completed).length;
          const pct =
            habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;

          const catCols = CATEGORIES.map((cat) => {
            const inCat = habits.filter(
              (h) => h.category?.toLowerCase() === cat.name.toLowerCase()
            );
            if (inCat.length === 0) return "-";
            return inCat.every((h) => h.completed) ? "Yes" : "No";
          });

          return [
            day.date?.split(" ").slice(0, 3).join(" ") || "N/A",
            ...catCols,
            `${pct}%`,
          ];
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 35,
          theme: "striped",
          headStyles: { fillColor: [99, 102, 241], fontSize: 8 },
          styles: { fontSize: 7, cellPadding: 2 },
        });

        doc.save(`${fileName}.pdf`);
      } else if (format === "csv") {
        const headers = [
          "Date",
          ...CATEGORIES.map((c) => c.name),
          "Progress %",
        ];
        const rows = filteredHistory.map((day) => {
          const habits = day.habits || [];
          const catData = CATEGORIES.map((cat) => {
            const inCat = habits.filter(
              (h) => h.category?.toLowerCase() === cat.name.toLowerCase()
            );
            return inCat.length === 0
              ? "N/A"
              : inCat.every((h) => h.completed)
              ? "Done"
              : "Missed";
          });
          const done = habits.filter((h) => h.completed).length;
          const pct =
            habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;
          return [day.date, ...catData, `${pct}%`].join(",");
        });
        const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], {
          type: "text/csv",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.csv`;
        link.click();
      } else if (format === "json") {
        const blob = new Blob([JSON.stringify(filteredHistory, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.json`;
        link.click();
      }

      setShowExportMenu(false);
      toast.success(`${format.toUpperCase()} Ready!`, {
        theme: "dark",
        icon: "📥",
      });
    } catch (err) {
      console.error("Export Error:", err);
      toast.error("Export failed. Check console for details.");
    }
  };

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const currentLogs = filteredHistory.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm relative z-[100]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-indigo-400 ml-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(0);
              }}
              className="bg-[#1e1b4b] text-white text-sm border border-white/10 rounded-xl px-4 py-2 outline-none"
            >
              <option value="All">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-indigo-400 ml-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(0);
              }}
              className="bg-[#1e1b4b] text-white text-sm border border-white/10 rounded-xl px-4 py-2 outline-none"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="relative mt-5 ml-2 overflow-visible" ref={menuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-2"
            >
              📥 Export Data
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 top-full mt-2 w-48 bg-[#2e2a75] border border-white/20 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
                >
                  <button
                    onClick={() => exportData("pdf")}
                    className="w-full text-left px-5 py-4 text-white text-xs font-bold hover:bg-white/10 border-b border-white/5"
                  >
                    📕 PDF Document
                  </button>
                  <button
                    onClick={() => exportData("csv")}
                    className="w-full text-left px-5 py-4 text-white text-xs font-bold hover:bg-white/10 border-b border-white/5"
                  >
                    📄 CSV Spreadsheet
                  </button>
                  <button
                    onClick={() => exportData("json")}
                    className="w-full text-left px-5 py-4 text-white text-xs font-bold hover:bg-white/10"
                  >
                    📦 JSON Raw Data
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="p-3 text-white disabled:opacity-20 hover:bg-white/10 rounded-full"
          >
            ◀
          </button>
          <div className="text-center min-w-[80px]">
            <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
              Page
            </div>
            <div className="text-lg font-bold text-white">
              {totalPages === 0 ? 0 : currentPage + 1} / {totalPages}
            </div>
          </div>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="p-3 text-white disabled:opacity-20 hover:bg-white/10 rounded-full"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1e1b4b]/40 backdrop-blur-xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="p-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest border-b border-white/10">
                  Date
                </th>
                {CATEGORIES.map((cat) => (
                  <th
                    key={cat.name}
                    className="p-6 text-center border-b border-white/10"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl mb-1">{cat.icon}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {cat.name}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-6 text-center text-[10px] font-black text-indigo-300 uppercase border-b border-white/10">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentLogs.map((dayRecord) => {
                const total = dayRecord.habits?.length || 0;
                const doneCount =
                  dayRecord.habits?.filter((h) => h.completed).length || 0;
                const dailyPercent =
                  total > 0 ? Math.round((doneCount / total) * 100) : 0;
                return (
                  <tr
                    key={dayRecord.date}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="p-6 whitespace-nowrap">
                      <div className="text-white font-bold text-base">
                        {dayRecord.date?.split(" ").slice(0, 3).join(" ") ||
                          "N/A"}
                      </div>
                    </td>
                    {CATEGORIES.map((cat) => {
                      const habitsInCat = (dayRecord.habits || []).filter(
                        (h) =>
                          h.category?.trim().toLowerCase() ===
                          cat.name.toLowerCase()
                      );
                      if (habitsInCat.length === 0)
                        return (
                          <td
                            key={cat.name}
                            className="p-6 text-center opacity-20"
                          >
                            -
                          </td>
                        );
                      return (
                        <td key={cat.name} className="p-6 text-center">
                          {habitsInCat.every((h) => h.completed) ? "✅" : "❌"}
                        </td>
                      );
                    })}
                    <td className="p-6 text-center">
                      <div className="flex justify-center items-center relative">
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            className="text-white/5"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray={113}
                            strokeDashoffset={113 - (113 * dailyPercent) / 100}
                            strokeLinecap="round"
                            className="text-indigo-500"
                          />
                        </svg>
                        <span className="absolute text-[8px] font-black text-white">
                          {dailyPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
