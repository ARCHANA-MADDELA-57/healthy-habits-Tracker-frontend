import React from "react";
import { motion } from "framer-motion";

const CATEGORY_ICONS = {
  Fitness: "💪",
  Hydration: "💧",
  Sleep: "🌙",
  Meditation: "🧘",
  Nutrition: "🥗",
  Study: "📚",
  General: "✨",
};

const HabitCard = ({ habit, onIncrement, onDecrement, onEdit, onDelete }) => {
  const perc = Math.round((habit.current / habit.target) * 100);
  const icon = CATEGORY_ICONS[habit.category] || CATEGORY_ICONS.General;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className={`p-6 rounded-[2rem] border transition-all shadow-xl ${
        habit.completedToday
          ? "bg-indigo-500/10 border-indigo-500/50 shadow-indigo-500/5"
          : "bg-white/5 border-white/10"
      }`}
    >
      <div className="flex justify-between mb-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase tracking-wider">
              {habit.category}
            </span>
          </div>
          <h3
            className={`text-lg font-bold truncate mt-1 ${
              habit.completedToday ? "line-through text-indigo-400/50" : "text-white"
            }`}
          >
            {habit.title}
          </h3>
        </div>
        <div className="text-right">
            <span className="text-orange-400 font-bold text-xs bg-orange-400/10 px-2 py-1 rounded-lg">
                🔥 {habit.streak}
            </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 bg-black/40 h-1.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${perc}%` }}
            className={`h-full ${habit.completedToday ? "bg-green-500" : "bg-indigo-500"}`}
          />
        </div>
        <span className="text-[10px] font-bold text-gray-400 w-8">
          {perc}%
        </span>
      </div>

      {/* Main Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onDecrement(habit.id)}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-colors"
        >
          -
        </button>
        <button
          onClick={() => onIncrement(habit.id)}
          disabled={habit.completedToday}
          className={`flex-1 h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
            habit.completedToday
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 text-white"
          }`}
        >
          {habit.completedToday ? "Done ✓" : "+ Progress"}
        </button>
      </div>

      {/* Secondary Actions (Edit/Delete) */}
      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 md:opacity-30 hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(habit)}
          className="flex-1 py-1.5 text-[9px] font-black uppercase border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="flex-1 py-1.5 text-[9px] font-black uppercase border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default HabitCard;