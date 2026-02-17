import { motion } from "framer-motion";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";


const HabitCard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl 
shadow-xl hover:shadow-2xl 
hover:-translate-y-2 transition duration-300"
 >

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                    Drink Water
                </h2>

                <span className="text-sm text-green-400">
                    7 Day Streak 🔥
                </span>
            </div>

            <p className="text-gray-400 mt-3">
                8 glasses daily
            </p>
            <div className="w-16 h-16 mt-4">
  <CircularProgressbar value={70} text={`70%`} />
</div>

            <button className="mt-6 w-full bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded-lg font-medium">
                Mark Complete
            </button>
        </motion.div>
    );
};

export default HabitCard;
