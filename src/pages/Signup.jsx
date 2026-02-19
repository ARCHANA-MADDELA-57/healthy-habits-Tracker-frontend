import { useState } from "react"; // 1. Added useState
import { Link, useNavigate } from "react-router-dom"; // 2. Added useNavigate
import { motion } from "framer-motion";

const Signup = () => {
  // 3. Define state for the inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const navigate = useNavigate(); // 4. Initialize navigate

  const handleSignup = (e) => {
    e.preventDefault();
  
    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password,
    };
  
    // 1. Get the current list of users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
  
    // 2. Check if the email is already taken
    if (existingUsers.some((u) => u.email === email)) {
      alert("This email is already registered!");
      return;
    }
  
    // 3. Add the new user to the array
    existingUsers.push(newUser);
  
    // 4. Save the updated array back to "allUsers"
    localStorage.setItem("allUsers", JSON.stringify(existingUsers));
  
    alert("Signup successful! Please login.");
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-[400px]"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

        {/* 5. Connect inputs to state using value and onChange */}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-white/20 outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-white/20 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 rounded-lg bg-white/20 outline-none"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg font-semibold transition"
        >
          Signup
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?
          <Link to="/login" className="text-indigo-400 ml-1">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;