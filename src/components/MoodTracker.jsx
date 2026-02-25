import React from "react";
import { motion } from "framer-motion";

const moods = [
  { emoji: "💀", label: "Burnt", color: "text-red-500", value: 1 },
  { emoji: "🥱", label: "Low", color: "text-orange-400", value: 2 },
  { emoji: "😐", label: "Neutral", color: "text-gray-400", value: 3 },
  { emoji: "⚡", label: "Focused", color: "text-indigo-400", value: 4 },
  { emoji: "🔥", label: "Elite", color: "text-pink-500", value: 5 },
];

const MoodTracker = ({ currentMood, onSelect }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-8">
      <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 italic mb-4">
        System Sentiment
      </h2>
      <div className="flex justify-between gap-2">
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(mood)}
            className={`flex-1 flex flex-col items-center p-3 rounded-xl transition-all ${
              currentMood?.label === mood.label 
              ? "bg-white/10 border border-white/20 shadow-lg shadow-indigo-500/10" 
              : "hover:bg-white/5 border border-transparent"
            }`}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${mood.color}`}>
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;