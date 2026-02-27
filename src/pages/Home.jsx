import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Droplets, Dumbbell, BookOpen } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { day: "Mon", habits: 2 },
    { day: "Tue", habits: 4 },
    { day: "Wed", habits: 3 },
    { day: "Thu", habits: 6 },
    { day: "Fri", habits: 5 },
    { day: "Sat", habits: 7 },
    { day: "Sun", habits: 4 },
];

const Counter = ({ target }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const increment = target / (duration / 16);

        const counter = setInterval(() => {
            start += increment;
            if (start >= target) {
                clearInterval(counter);
                setCount(target);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(counter);
    }, [target]);

    return <span>{count}</span>;
};

const Home = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>

            {/* FIXED NAVBAR */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto flex justify-between items-center p-5 px-6">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        HealthyHabits
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/login" className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition">Login</Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Hamburger Button (Mobile) */}
                    <button 
                        className="md:hidden p-2 text-white focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-black/95 border-b border-white/10"
                        >
                            <div className="flex flex-col items-center gap-6 py-8">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="px-10 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full font-semibold">Login</Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsOpen(false)}
                                    className="px-10 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full font-semibold"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section - Added pt-40 for spacing below fixed nav */}
            <section className="flex flex-col items-center text-center pt-40 md:pt-48 px-6 relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-bold leading-tight"
                >
                    Track Habits.
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        Build Discipline.
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 max-w-2xl text-lg text-gray-300"
                >
                    Smart analytics, streak tracking, and powerful insights to help
                    you become the best version of yourself.
                </motion.p>

                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10"
                >
                    <Link
                        to="/signup"
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-lg font-semibold hover:scale-105 transition inline-block"
                    >
                        Start Free Today
                    </Link>
                </motion.div>
            </section>

            {/* Floating Habit Cards */}
            <section className="mt-32 flex flex-wrap items-center justify-center gap-6 px-6 relative z-10">
                {[
                    { text: "Drink Water", icon: <Droplets className="text-blue-400" /> },
                    { text: "Workout", icon: <Dumbbell className="text-red-400" /> },
                    { text: "Read Books", icon: <BookOpen className="text-green-400" /> }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 3 + i }}
                        className="flex items-center gap-3 bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-lg border border-white/20 font-bold"
                    >
                        {item.icon} {item.text}
                    </motion.div>
                ))}
            </section>

            {/* Stats Section */}
            <section className="mt-40 grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 px-6 md:px-10 text-center relative z-10 max-w-7xl mx-auto">
                <div className="bg-white/5 p-10 rounded-2xl backdrop-blur-lg border border-white/10">
                    <h3 className="text-5xl font-bold text-purple-400">
                        <Counter target={10000} />+
                    </h3>
                    <p className="mt-3 text-gray-400">Habits Completed</p>
                </div>

                <div className="bg-white/5 p-10 rounded-2xl backdrop-blur-lg border border-white/10">
                    <h3 className="text-5xl font-bold text-indigo-400">
                        <Counter target={95} />%
                    </h3>
                    <p className="mt-3 text-gray-400">Consistency Rate</p>
                </div>

                <div className="bg-white/5 p-10 rounded-2xl backdrop-blur-lg border border-white/10 sm:col-span-2 md:col-span-1">
                    <h3 className="text-5xl font-bold text-pink-400">
                        <Counter target={500} />+
                    </h3>
                    <p className="mt-3 text-gray-400">Active Users</p>
                </div>
            </section>

            {/* Analytics Section */}
            <section className="mt-40 px-6 text-center">
                <h2 className="text-4xl font-bold mb-12">Your Weekly Progress</h2>
                <div className="bg-white/5 backdrop-blur-xl p-6 md:p-10 rounded-3xl border border-white/10 max-w-4xl mx-auto">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <XAxis dataKey="day" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                            <Line
                                type="monotone"
                                dataKey="habits"
                                stroke="#8b5cf6"
                                strokeWidth={4}
                                dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Testimonials */}
            <section className="mt-40 px-6 text-center max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold mb-16">What Our Users Say</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: "Rahul", text: "This app completely changed my morning routine!" },
                        { name: "Sneha", text: "The streak feature keeps me consistent every day." },
                        { name: "Amit", text: "Best habit tracker I’ve used so far." },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
                            <p className="text-gray-400 italic mb-4">“{item.text}”</p>
                            <h4 className="font-semibold text-purple-400">— {item.name}</h4>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="mt-40 px-6 pb-24 max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        { q: "Is this free to use?", a: "Yes! You can start with the free plan anytime." },
                        { q: "Does it work on mobile?", a: "Yes, fully responsive design works on all devices." },
                    ].map((item, i) => (
                        <details key={i} className="group bg-white/5 p-6 rounded-xl border border-white/10 cursor-pointer">
                            <summary className="font-semibold list-none flex justify-between items-center">
                                {item.q}
                                <span className="group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-3 text-gray-400 leading-relaxed">{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-950 text-gray-400 pt-16 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-12">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">HealthyHabits</h2>
                        <p className="text-sm">Build better habits. Stay consistent. Tracking made beautiful.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-purple-400 transition">Home</Link></li>
                            <li><Link to="/login" className="hover:text-purple-400 transition">Login</Link></li>
                            <li><Link to="/signup" className="hover:text-purple-400 transition">Register</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                        <p className="text-sm">support@healthyhabits.com</p>
                        <p className="text-sm mt-4">© {new Date().getFullYear()} HealthyHabits</p>
                    </div>
                </div>
                <div className="border-t border-white/5 text-center py-6 text-xs text-gray-600">
                    Made with ❤️ for better living
                </div>
            </footer>
        </div>
    );
};

export default Home;