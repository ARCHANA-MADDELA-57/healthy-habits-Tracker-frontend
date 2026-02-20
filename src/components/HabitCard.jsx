import React from "react";
import { motion } from "framer-motion";

const HabitCard = ({ habit, onIncrement, onDecrement, onEdit, onDelete }) => {
  const progress = (habit.current / habit.target) * 100;
  const isCompleted = habit.current >= habit.target;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group bg-white/5 backdrop-blur-md border ${
        isCompleted
          ? "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          : "border-white/10"
      } p-6 rounded-[2.5rem] hover:bg-white/10 transition-all duration-300`}
    >
      {/* STREAK BADGE - Top Left */}
      {habit.streak > 0 && (
        <div className="absolute -top-3 -left-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
          <span>🔥</span> {habit.streak} DAY STREAK
        </div>
      )}

      {/* COMPLETION BADGE - Top Right */}
      {isCompleted && (
        <div className="absolute -top-3 -right-2 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-10">
          GOAL MET ✅
        </div>
      )}

      <div className="flex justify-between items-start mb-6 mt-2">
        <div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
            {habit.category}
          </p>
          <h3 className="text-xl font-bold text-white leading-tight">
            {habit.title}
          </h3>
        </div>

        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span
              className={`text-2xl font-black ${
                isCompleted ? "text-green-400" : "text-white"
              }`}
            >
              {habit.current}
            </span>
            <span className="text-gray-500 text-sm">/ {habit.target}</span>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            {habit.unit || "units"}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          className={`h-full ${
            isCompleted
              ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              : "bg-indigo-500"
          } transition-all`}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onIncrement(habit.id)}
          disabled={isCompleted} // 👈 Disable the button if goal is met
          className={`flex-[2] py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isCompleted
              ? "bg-green-500/20 text-green-500 cursor-not-allowed border border-green-500/30"
              : "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 active:scale-95"
          }`}
        >
          {isCompleted ? "Goal Achieved!" : `+ Add ${habit.unit || "unit"}`}
        </button>

        <button
          onClick={() => onDecrement(habit.id)}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95"
        >
          -
        </button>

        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => onEdit(habit)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-all text-red-500"
          >
            🗑️
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
