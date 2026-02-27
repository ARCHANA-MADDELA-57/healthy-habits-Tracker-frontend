import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Hash } from "lucide-react";

const Login = () => {
  // Authentication & View States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState("login"); // 'login' | 'forgot' | 'reset'

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- API Handlers ---

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.warn("Please enter credentials");
    setStatus("loading");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        setStatus("success");
        toast.success(`Welcome back, ${data.user.fullName}!`);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setStatus("idle");
        toast.error(data.error || "Invalid credentials");
      }
    } catch (err) {
      setStatus("idle");
      toast.error("Server connection error");
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (res.ok) {
        toast.success("Check your email for the 6-digit code!");
        setView("reset");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send reset code");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setStatus("idle");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (resetCode.length !== 8)
      return toast.error("Please enter a valid 8-digit code");

    setStatus("loading");
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: resetCode, newPassword }),
      });
      if (res.ok) {
        toast.success("Password updated! You can now login.");
        setView("login");
        setResetCode("");
        setNewPassword("");
      } else {
        const data = await res.json();
        toast.error(
          data.error || "Invalid code or password requirements not met"
        );
      }
    } catch (err) {
      toast.error("Error updating password");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-[400px] border border-white/10"
      >
        <AnimatePresence mode="wait">
          {/* LOGIN VIEW */}
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">
                Welcome Back
              </h2>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div className="relative group">
                  <Mail
                    className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 pl-10 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-inner"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition-colors"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3.5 pl-10 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className={`w-full p-4 rounded-xl font-bold text-lg shadow-lg transform active:scale-[0.98] transition-all mt-2 ${
                    status === "success"
                      ? "bg-green-500 shadow-green-500/20"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20"
                  }`}
                >
                  {status === "loading"
                    ? "Authenticating..."
                    : status === "success"
                    ? "Success!"
                    : "Login"}
                </button>

                {/* CENTERED FORGOT PASSWORD LINK */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-sm font-medium text-red-500 transition-all duration-200 hover:underline hover:underline-offset-2"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* 2. REQUEST RESET FORM */}
          {view === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={() => setView("login")}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4"
              >
                <ArrowLeft size={16} /> Back to Login
              </button>
              <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
              <p className="text-sm text-gray-400 mb-6">
                Enter your email and we'll send you a reset code.
              </p>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-indigo-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="w-full p-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  {status === "loading" ? "Sending Code..." : "Send Reset Code"}
                </button>
              </form>
            </motion.div>
          )}

          {/* 3. VERIFY CODE & NEW PASSWORD FORM */}
          {view === "reset" && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold mb-2">Create New Password</h2>
              <p className="text-sm text-gray-400 mb-6">
                Enter the 8-digit code sent to <b>{email}</b>
              </p>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    maxLength="8"
                    placeholder="8-Digit Code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-indigo-400 tracking-[0.5em] font-bold text-center"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-indigo-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="w-full p-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700"
                >
                  {status === "loading" ? "Updating..." : "Reset Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="w-full text-xs text-gray-400 hover:text-white"
                >
                  Didn't get a code? Resend
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {view === "login" && (
          <p className="text-sm text-center mt-6 text-gray-400">
            Don’t have an account?
            <Link to="/signup" className="text-indigo-400 ml-1 hover:underline">
              Signup
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
