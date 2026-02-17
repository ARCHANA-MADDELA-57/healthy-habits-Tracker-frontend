import { motion } from "framer-motion";

const StatsCard = ({ title, value }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/10 p-10 rounded-2xl backdrop-blur-lg border border-white/20"
        >


            <h3 className="text-gray-300 text-sm">{title}</h3>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </motion.div>
    );
};

export default StatsCard;
