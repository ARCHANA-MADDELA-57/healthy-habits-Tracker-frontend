import React, { useState, useEffect } from "react";

const CATEGORIES = ["Fitness", "Hydration", "Sleep", "Meditation", "Nutrition", "Study"];

const AddHabitModal = ({ isOpen, onClose, onAdd, onUpdate, editingHabit }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [target, setTarget] = useState(1);
    const [category, setCategory] = useState("Fitness");

    useEffect(() => {
        if (editingHabit) {
            setTitle(editingHabit.title);
            setDescription(editingHabit.description);
            setTarget(editingHabit.target || 1);
            setCategory(editingHabit.category || "Fitness");
        } else {
            setTitle(""); setDescription(""); setTarget(1); setCategory("Fitness");
        }
    }, [editingHabit, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#1e1b4b] border border-white/10 w-full max-w-md rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl text-white my-auto">
                <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-center tracking-tight">
                    {editingHabit ? "Edit Habit" : "New Habit"}
                </h2>
                
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingHabit) onUpdate(editingHabit.id, title, description, target, category);
                    else onAdd(title, description, target, category);
                    onClose();
                }} className="space-y-4 md:space-y-5">
                    
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Habit Name</label>
                        <input type="text" placeholder="e.g. Yoga" className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500 mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                        <select className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 outline-none mt-1 cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}>
                            {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#1e1b4b] text-white">{cat}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Daily Goal</label>
                        <input type="number" min="1" className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 outline-none mt-1" value={target} onChange={(e) => setTarget(e.target.value)} required />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes</label>
                        <textarea className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 h-20 md:h-24 resize-none outline-none mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button type="button" onClick={onClose} className="order-2 sm:order-1 flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 font-black text-xs uppercase hover:bg-white/10 transition-colors">Cancel</button>
                        <button type="submit" className="order-1 sm:order-2 flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-indigo-600 font-black text-xs uppercase shadow-xl shadow-indigo-600/30">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHabitModal;