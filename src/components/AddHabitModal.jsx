import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { name: "Fitness", icon: "💪", defaultUnit: "mins" },
  { name: "Hydration", icon: "💧", defaultUnit: "liters" },
  { name: "Sleep", icon: "🌙", defaultUnit: "hrs" },
  { name: "Meditation", icon: "🧘", defaultUnit: "mins" },
  { name: "Nutrition", icon: "🥗", defaultUnit: "servings" },
  { name: "Study", icon: "📚", defaultUnit: "hrs" },
];

const UNIT_OPTIONS = ["mins", "hrs", "liters", "glasses", "pages", "steps", "servings", "km", "miles"];

const AddHabitModal = ({ isOpen, onClose, onAdd, onUpdate, editingHabit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState(1);
  const [category, setCategory] = useState("Fitness");
  const [unit, setUnit] = useState("mins");
  const [isEveryday, setIsEveryday] = useState(false);
  const [status, setStatus] = useState("idle");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingHabit) {
        setTitle(editingHabit.title || "");
        setDescription(editingHabit.description || "");
        setTarget(editingHabit.target || 1);
        setCategory(editingHabit.category || "Fitness");
        setUnit(editingHabit.unit || "mins");
        setIsEveryday(editingHabit.isEveryday || false);
      } else {
        setTitle("");
        setDescription("");
        setTarget(1);
        setCategory("Fitness");
        setUnit("mins");
        setIsEveryday(false);
      }
      setStatus("idle");
    }
  }, [editingHabit, isOpen]);

  const handleCategorySelect = (cat) => {
    setCategory(cat.name);
    if (!editingHabit) setUnit(cat.defaultUnit);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("saving");
    setTimeout(() => {
      if (editingHabit) {
        onUpdate(editingHabit.id, title, description, target, category, isEveryday, unit);
      } else {
        onAdd(title, description, target, category, isEveryday, unit);
      }
      setStatus("success");
      setTimeout(() => onClose(), 800);
    }, 1500); // Increased time slightly to see the nice loader
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      {/* 1. CSS to hide number arrows */}
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1e1b4b] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl text-white">
        <h2 className="text-2xl font-black mb-6 text-center">{editingHabit ? "Edit Habit" : "New Habit"}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Habit Name</label>
            <input type="text" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 outline-none focus:border-indigo-500" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="flex gap-4">
            <div className="flex-[1]">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Daily Goal</label>
              <input 
                type="number" 
                min="1" 
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 outline-none focus:border-indigo-500" 
                value={target} 
                onChange={(e) => setTarget(e.target.value)} 
                required 
              />
            </div>
            <div className="flex-[1]">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Unit</label>
              <select className="w-full p-4 rounded-2xl bg-[#2d2a6e] border border-white/10 mt-2 outline-none focus:border-indigo-500 cursor-pointer" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Category</label>
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 cursor-pointer flex justify-between items-center">
              <span>{CATEGORIES.find(c => c.name === category)?.icon} {category}</span>
              <span className="text-indigo-400">▼</span>
            </div>
            {isDropdownOpen && (
              <div className="absolute z-[210] w-full mt-1 bg-[#2d2a6e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {CATEGORIES.map(cat => (
                  <div key={cat.name} className="p-4 hover:bg-indigo-600 cursor-pointer flex items-center gap-3" onClick={() => handleCategorySelect(cat)}>
                    <span>{cat.icon}</span> <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl cursor-pointer" onClick={() => setIsEveryday(!isEveryday)}>
            <input type="checkbox" checked={isEveryday} readOnly className="w-5 h-5 accent-indigo-500" />
            <label className="text-sm text-gray-300">Repeat this goal every day</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl bg-white/5 font-black text-xs uppercase hover:bg-white/10 transition-colors">Cancel</button>
            
            {/* 2. Updated Submit Button with Loader */}
            <button 
              type="submit" 
              disabled={status !== "idle"} 
              className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center transition-all ${
                status === "success" ? "bg-green-500" : "bg-indigo-600 shadow-xl shadow-indigo-600/30 hover:bg-indigo-500"
              }`}
            >
              <AnimatePresence mode="wait">
                {status === "saving" ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </motion.div>
                ) : status === "success" ? (
                  <motion.span key="success" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    Success!
                  </motion.span>
                ) : (
                  <motion.span key="idle">
                    {editingHabit ? "Update Habit" : "Create Habit"}
                  </motion.span>
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