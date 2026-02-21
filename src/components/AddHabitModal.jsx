import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const CATEGORIES = [
  { name: "Fitness", icon: "💪", defaultUnit: "mins" },
  { name: "Hydration", icon: "💧", defaultUnit: "liters" },
  { name: "Sleep", icon: "🌙", defaultUnit: "hrs" },
  { name: "Meditation", icon: "🧘", defaultUnit: "mins" },
  { name: "Nutrition", icon: "🥗", defaultUnit: "servings" },
  { name: "Study", icon: "📚", defaultUnit: "hrs" },
  { name: "Other", icon: "👤", defaultUnit: "units" }, // Added Other
];

const UNIT_OPTIONS = ["mins", "hrs", "liters", "glasses", "pages", "steps", "servings", "km", "miles", "units"];

const AddHabitModal = ({ isOpen, onClose, onAdd, onUpdate, editingHabit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState(1);
  const [category, setCategory] = useState("Fitness");
  const [unit, setUnit] = useState("mins");
  const [isEveryday, setIsEveryday] = useState(false);
  const [status, setStatus] = useState("idle");

  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);

  const catRef = useRef(null);
  const unitRef = useRef(null);

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
        setTitle(""); setDescription(""); setTarget(1);
        setCategory("Fitness"); setUnit("mins"); setIsEveryday(false);
      }
      setStatus("idle");
    }
  }, [editingHabit, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catRef.current && !catRef.current.contains(event.target)) setIsCatOpen(false);
      if (unitRef.current && !unitRef.current.contains(event.target)) setIsUnitOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (cat) => {
    setCategory(cat.name);
    if (!editingHabit) setUnit(cat.defaultUnit);
    setIsCatOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warn("Please give your habit a name!");
      return;
    }

    setStatus("saving");
    setTimeout(() => {
      if (editingHabit) {
        onUpdate(editingHabit.id, title, description, target, category, isEveryday, unit);
        toast.success("Habit updated successfully!");
      } else {
        onAdd(title, description, target, category, isEveryday, unit);
        toast.success(`${title} added to your routine!`);
      }
      setStatus("success");
      setTimeout(() => onClose(), 800);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-[#1e1b4b] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <h2 className="text-2xl font-black mb-6 text-center">{editingHabit ? "Edit Habit" : "New Habit"}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Habit Name</label>
            <input 
              type="text" 
              placeholder="e.g. Early Morning Yoga" // Placeholder added
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 outline-none focus:border-indigo-500 placeholder:text-white/20" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-[1]">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Daily Goal</label>
              <input 
                type="number" min="1" 
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 outline-none focus:border-indigo-500" 
                value={target} 
                onChange={(e) => setTarget(e.target.value)} 
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                required 
              />
            </div>

            <div className="flex-[1] relative" ref={unitRef}>
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Unit</label>
              <div onClick={() => setIsUnitOpen(!isUnitOpen)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 cursor-pointer flex justify-between items-center transition-colors hover:bg-white/10">
                <span className="truncate">{unit}</span>
                <span className={`text-[10px] transition-transform ${isUnitOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
              <AnimatePresence>
                {isUnitOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-[220] w-full mt-1 bg-[#2d2a6e] border border-white/10 rounded-2xl overflow-y-auto max-h-[160px] shadow-2xl no-scrollbar">
                    {UNIT_OPTIONS.map(u => (
                      <div key={u} className="p-4 hover:bg-indigo-600 cursor-pointer text-sm" onClick={() => { setUnit(u); setIsUnitOpen(false); }}>{u}</div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative" ref={catRef}>
            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Category</label>
            <div onClick={() => setIsCatOpen(!isCatOpen)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 mt-2 cursor-pointer flex justify-between items-center transition-colors hover:bg-white/10">
              <span>{CATEGORIES.find(c => c.name === category)?.icon} {category}</span>
              <span className={`text-[10px] transition-transform ${isCatOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>
            <AnimatePresence>
              {isCatOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-[210] w-full mt-1 bg-[#2d2a6e] border border-white/10 rounded-2xl overflow-y-auto max-h-[200px] shadow-2xl no-scrollbar">
                  {CATEGORIES.map(cat => (
                    <div key={cat.name} className="p-4 hover:bg-indigo-600 cursor-pointer flex items-center gap-3" onClick={() => handleCategorySelect(cat)}>
                      <span className="text-xl">{cat.icon}</span> <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsEveryday(!isEveryday)}>
            <input type="checkbox" checked={isEveryday} readOnly className="w-5 h-5 accent-indigo-500 rounded" />
            <label className="text-sm text-gray-300 cursor-pointer">Repeat this goal every day</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl bg-white/5 font-black text-xs uppercase hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={status !== "idle"} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center transition-all ${status === "success" ? "bg-green-500" : "bg-indigo-600 shadow-xl shadow-indigo-600/30 hover:bg-indigo-500"}`}>
              <AnimatePresence mode="wait">
                {status === "saving" ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </motion.div>
                ) : status === "success" ? (
                  <motion.span key="success" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>Success!</motion.span>
                ) : (
                  <motion.span key="idle">{editingHabit ? "Update" : "Create"}</motion.span>
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