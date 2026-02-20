import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isEveryday, setIsEveryday] = useState(false);
  const [status, setStatus] = useState("idle"); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Sync state when opening modal (Resets or Loads Editing Data)
  useEffect(() => {
    if (isOpen) {
      if (editingHabit) {
        setTitle(editingHabit.title || "");
        setDescription(editingHabit.description || "");
        setTarget(editingHabit.target || 1);
        setCategory(editingHabit.category || "Fitness");
        setIsEveryday(editingHabit.isEveryday || false);
      } else {
        // Reset to default for new habit
        setTitle("");
        setDescription("");
        setTarget(1);
        setCategory("Fitness");
        setIsEveryday(false);
      }
      setStatus("idle");
    }
  }, [editingHabit, isOpen]);

  // 2. Click outside logic for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. The Main Submit Logic
  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("saving");

    setTimeout(() => {
      // We pass isEveryday here so it saves correctly
      if (editingHabit) {
        onUpdate(editingHabit.id, title, description, target, category, isEveryday);
      } else {
        onAdd(title, description, target, category, isEveryday);
      }
      
      setStatus("success");
      setTimeout(() => {
        onClose();
      }, 800);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
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
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500 mt-2 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] ml-1">Category</label>
            <div
              onClick={() => status === "idle" && setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 cursor-pointer flex justify-between items-center hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <span>{CATEGORIES.find((c) => c.name === category)?.icon}</span>
                <span>{category}</span>
              </div>
              <motion.svg animate={{ rotate: isDropdownOpen ? 180 : 0 }} className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></motion.svg>
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 5 }} exit={{ opacity: 0, y: -10 }} className="absolute z-[210] w-full mt-1 bg-[#2d2a6e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.name} className="p-4 hover:bg-indigo-600 cursor-pointer transition-colors text-sm border-b border-white/5 last:border-none flex items-center gap-3" onClick={() => { setCategory(cat.name); setIsDropdownOpen(false); }}>
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

          {/* Everyday Checkbox */}
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => setIsEveryday(!isEveryday)}>
            <input
              type="checkbox"
              id="everyday"
              className="w-5 h-5 accent-indigo-500 cursor-pointer"
              checked={isEveryday}
              onChange={(e) => setIsEveryday(e.target.checked)}
            />
            <label htmlFor="everyday" className="text-sm text-gray-300 cursor-pointer select-none">
              Repeat this goal every day
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl bg-white/5 font-black text-xs uppercase hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button
  type="submit"
  disabled={status !== "idle"}
  className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center min-h-[56px] ${
    status === "success" ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30"
  }`}
>
  <AnimatePresence mode="wait">
    {status === "saving" ? (
      <motion.div key="saving" className="flex items-center gap-2">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
        <span>Saving...</span>
      </motion.div>
    ) : status === "success" ? (
      <motion.div key="success" initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
        <span>Saved!</span>
      </motion.div>
    ) : (
      /* FIX STARTS HERE */
      <motion.span key="idle">
        {editingHabit ? "Update Habit" : "Create Habit"}
      </motion.span>
      /* FIX ENDS HERE */
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