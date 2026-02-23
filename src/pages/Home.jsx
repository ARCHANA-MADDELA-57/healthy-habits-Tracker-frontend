import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">

            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>

            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 relative z-10">
                <h1 className="text-2xl font-bold">HealthyHabits</h1>

                <div className="flex gap-6">
                    <Link to="/login" className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg font-semibold hover:text-gray-300 transition">
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg font-semibold"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center text-center mt-24 px-6 relative z-10">

                <motion.h2
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-6xl font-bold leading-tight"
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
                    className="mt-6 max-w-2xl text-lg text-white"
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
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-lg font-semibold hover:scale-105 transition"
                    >
                        Start Free Today
                    </Link>
                </motion.div>
            </section>

            {/* Floating Habit Cards */}
            <section className="mt-32 flex flex-col md:flex-row items-center justify-center gap-10 relative z-10">


                {["💧 Drink Water", "🏃 Workout", "📖 Read Books"].map((habit, i) => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 3 + i }}
                        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 font-bold"
                    >
                        {habit}
                    </motion.div>
                ))}

            </section>

            {/* Stats Section */}
            <section className="mt-40 grid md:grid-cols-3 gap-10 px-10 text-center relative z-10">

                <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-lg border border-white/20">
                    <h3 className="text-5xl font-bold text-purple-400">
                        <Counter target={10000} />+
                    </h3>
                    <p className="mt-3 text-gray-400">Habits Completed</p>
                </div>

                <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-lg border border-white/20">
                    <h3 className="text-5xl font-bold text-indigo-400">
                        <Counter target={95} />%
                    </h3>
                    <p className="mt-3 text-gray-400">Consistency Rate</p>
                </div>

                <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-lg border border-white/20">
                    <h3 className="text-5xl font-bold text-pink-400">
                        <Counter target={500} />+
                    </h3>
                    <p className="mt-3 text-gray-400">Active Users</p>
                </div>

            </section>

            {/* Analytics Section */}

            <section className="mt-40 px-10 text-center">
                <h2 className="text-4xl font-bold mb-12">
                    Your Weekly Progress
                </h2>

                <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 max-w-4xl mx-auto">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <XAxis dataKey="day" stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="habits"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
            {/* Testimonals Section */}
            <section className="mt-40 px-10 text-center">
                <h2 className="text-4xl font-bold mb-16">
                    What Our Users Say
                </h2>

                <div className="grid md:grid-cols-3 gap-10">
                    {[
                        {
                            name: "Rahul",
                            text: "This app completely changed my morning routine!",
                        },
                        {
                            name: "Sneha",
                            text: "The streak feature keeps me consistent every day.",
                        },
                        {
                            name: "Amit",
                            text: "Best habit tracker I’ve used so far.",
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20"
                        >
                            <p className="text-gray-300 mb-4">“{item.text}”</p>
                            <h4 className="font-semibold text-purple-400">
                                — {item.name}
                            </h4>
                        </div>
                    ))}
                </div>
            </section>
            {/* FAQ Section */}
            <section className="mt-40 px-10 pb-24">
                <h2 className="text-4xl font-bold text-center mb-12">
                    Frequently Asked Questions
                </h2>

                <div className="max-w-3xl mx-auto space-y-6">
                    {[
                        {
                            q: "Is this free to use?",
                            a: "Yes! You can start with the free plan anytime.",
                        },
                        {
                            q: "Does it work on mobile?",
                            a: "Yes, fully responsive design works on all devices.",
                        },
                    ].map((item, i) => (
                        <details
                            key={i}
                            className="bg-white/10 p-6 rounded-xl border border-white/20"
                        >
                            <summary className="cursor-pointer font-semibold">
                                {item.q}
                            </summary>
                            <p className="mt-3 text-gray-300">{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>
            {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
          
          <div>
            <h2 className="text-xl font-bold text-white mb-3">
              HealthyHabits
            </h2>
            <p className="text-sm text-gray-400">
              Build better habits. Stay consistent.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Contact
            </h3>
            <p className="text-sm text-gray-400">
              support@healthyhabits.com
            </p>
            <p className="text-sm text-gray-400 mt-2">
              © {new Date().getFullYear()} HealthyHabits
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
          Made with ❤️ for better living
        </div>
      </footer>

        </div>
    );
};

export default Home;
