import React, { useState, useEffect } from "react";

const AddHabitModal = ({ isOpen, onClose, onAdd, onUpdate, editingHabit }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [target, setTarget] = useState(1); // New state for the goal

    useEffect(() => {
        if (editingHabit) {
            setTitle(editingHabit.title);
            setDescription(editingHabit.description);
            setTarget(editingHabit.target || 1);
        } else {
            setTitle("");
            setDescription("");
            setTarget(1);
        }
    }, [editingHabit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (editingHabit) {
            onUpdate(editingHabit.id, title, description, parseInt(target));
        } else {
            onAdd(title, description, parseInt(target));
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white">
                    {editingHabit ? "Edit Habit" : "Create New Habit"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1 ml-1">Habit Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Drink Water"
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-white transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1 ml-1">Daily Goal (Units)</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="e.g. 8"
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-white transition-all"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1 ml-1">Description</label>
                        <textarea
                            placeholder="Why are you doing this?"
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-white transition-all h-24 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            {editingHabit ? "Update" : "Add Habit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHabitModal;