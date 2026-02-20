import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Categories with Icons for a better UI
const CATEGORIES = [
  { name: "Fitness", icon: "💪" },
  { name: "Hydration", icon: "💧" },
  { name: "Sleep", icon: "🌙" },
  { name: "Meditation", icon: "🧘" },
  { name: "Nutrition", icon: "🥗" },
  { name: "Study", icon: "📚" },
];

const AddHabitModal = ({ isOpen, onClose, onAdd, onUpdate, editingHabit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState(1);
  const [category, setCategory] = useState("Fitness");
  const [status, setStatus] = useState("idle"); // 'idle' | 'saving' | 'success'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setDescription(editingHabit.description);
      setTarget(editingHabit.target || 1);
      setCategory(editingHabit.category || "Fitness");
    } else {
      setTitle("");
      setDescription("");
      setTarget(1);
      setCategory("Fitness");
    }
    setStatus("idle");
  }, [editingHabit, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("saving");

    // Artificial delay to show the "Saving..." loader
    setTimeout(() => {
      if (editingHabit) {
        onUpdate(editingHabit.id, title, description, target, category);
      } else {
        onAdd(title, description, target, category);
      }
      setStatus("success");

      // Brief delay to show "Saved!" success state before closing
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      {/* CSS to hide number input arrows */}
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1e1b4b] border border-white/10 w-full max-w-md rounded-[2.5rem] p-6 md:p-10 shadow-2xl text-white relative"
      >
        <h2 className="text-2xl font-black mb-6 text-center tracking-tight">
          {editingHabit ? "Edit Habit" : "New Habit"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Habit Name */}
          <div>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] ml-1">Habit Name</label>
            <input
              type="text"
              placeholder="e.g. Morning Yoga"
              disabled={status !== "idle"}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500 mt-2 transition-all placeholder:text-white/20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Custom Beautiful Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] ml-1">Category</label>
            <div
              onClick={() => status === "idle" && setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 cursor-pointer flex justify-between items-center transition-all hover:bg-white/10 ${
                isDropdownOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""
              } ${status !== "idle" ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span>{CATEGORIES.find((c) => c.name === category)?.icon}</span>
                <span>{category}</span>
              </div>
              <motion.svg
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                className="w-5 h-5 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 5 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-[210] w-full mt-1 bg-[#2d2a6e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                >
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.name}
                      className="p-4 hover:bg-indigo-600 cursor-pointer transition-colors text-sm font-medium border-b border-white/5 last:border-none flex items-center gap-3"
                      onClick={() => {
                        setCategory(cat.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] ml-1">Daily Goal (Count)</label>
            <input
              type="number"
              min="1"
              disabled={status !== "idle"}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none mt-2 focus:border-indigo-500 transition-all"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] ml-1">Notes</label>
            <textarea
              disabled={status !== "idle"}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 h-24 resize-none outline-none mt-2 focus:border-indigo-500 transition-all placeholder:text-white/20"
              placeholder="Any specific goals today?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={status !== "idle"}
              className="flex-1 py-4 rounded-2xl bg-white/5 font-black text-xs uppercase hover:bg-white/10 transition-colors disabled:opacity-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status !== "idle"}
              className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center min-h-[56px] ${
                status === "success" ? "bg-green-500 shadow-green-500/20" : "bg-indigo-600 shadow-xl shadow-indigo-600/30 hover:bg-indigo-500"
              }`}
            >
              <AnimatePresence mode="wait">
                {status === "saving" ? (
                  <motion.div key="saving" className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Saving...</span>
                  </motion.div>
                ) : status === "success" ? (
                  <motion.div key="success" initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Saved!</span>
                  </motion.div>
                ) : (
                  <motion.span key="idle">{editingHabit ? "Update Habit" : "Create Habit"}</motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddHabitModal;