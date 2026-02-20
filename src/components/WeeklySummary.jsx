import React from "react";
import { motion } from "framer-motion";

const CATEGORIES = [
  { name: "Fitness", icon: "💪" },
  { name: "Hydration", icon: "💧" },
  { name: "Sleep", icon: "🌙" },
  { name: "Meditation", icon: "🧘" },
  { name: "Nutrition", icon: "🥗" },
  { name: "Study", icon: "📚" },
];

const WeeklySummary = ({ userEmail }) => {
  const userKey = `habits_${userEmail}`;
  const history = JSON.parse(localStorage.getItem(`${userKey}_history`)) || [];

  if (history.length === 0) {
    return (
      <div className="p-12 text-center bg-white/5 rounded-[2.5rem] border border-white/10">
        <h3 className="text-xl font-bold text-white/50 italic tracking-tight">
          Your habit journey hasn't started yet.
        </h3>
      </div>
    );
  }

  const historyLogs = [...history].slice(0, 7);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-[#1e1b4b]/50 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-white/5">
              <th className="p-5 text-[10px] font-black text-indigo-300 uppercase tracking-widest border-b border-white/10">
                Date
              </th>
              {/* CLEAN HEADER: Just Icons and Names */}
              {CATEGORIES.map((cat) => (
                <th key={cat.name} className="p-5 text-center border-b border-white/10">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      {cat.name}
                    </span>
                  </div>
                </th>
              ))}
              <th className="p-5 text-center text-[10px] font-black text-indigo-300 uppercase border-b border-white/10">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {historyLogs.map((dayRecord, idx) => {
              const totalHabits = dayRecord.habits?.length || 0;
              const completedHabits = dayRecord.habits?.filter((h) => h.completed).length || 0;
              const dailyPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

              return (
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={dayRecord.date + idx}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-5 whitespace-nowrap">
                    <div className="text-white font-bold text-sm">
                      {dayRecord.date.split(" ").slice(0, 3).join(" ")}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">
                      {dayRecord.date.split(" ").slice(3)}
                    </div>
                  </td>

                  {/* LOGIC LIVES HERE: One cell per category */}
                  {CATEGORIES.map((cat) => {
                    const habitsInCat = dayRecord.habits.filter(
                      (h) => h.category?.trim().toLowerCase() === cat.name.toLowerCase()
                    );

                    if (habitsInCat.length === 0) {
                      return (
                        <td key={cat.name} className="p-5 text-center text-white font-bold opacity-30">
                          -
                        </td>
                      );
                    }

                    const isCatDone = habitsInCat.every((h) => h.completed);
                    return (
                      <td key={cat.name} className="p-5 text-center">
                        {isCatDone ? (
                          <span className="inline-block text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
                            ✅
                          </span>
                        ) : (
                          <span className="inline-block text-red-400 opacity-80">
                            ❌
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-5">
                    <div className="flex justify-center items-center relative">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                        <circle
                          cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent"
                          strokeDasharray={100}
                          strokeDashoffset={100 - dailyPercent}
                          className="text-indigo-500 transition-all duration-700 ease-out"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-black text-white">
                        {dailyPercent}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklySummary;