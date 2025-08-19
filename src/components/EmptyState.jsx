import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-8 text-center border border-dashed ${
        isDark
          ? "border-white/15 bg-white/5 text-white}"
          : "border-slate-300 bg-white text-slate-500"
      }`}
    >
      <div className="text-5xl mb-3">🗒️</div>
      <div className="text-lg font-medium">No tasks yet</div>
      <div className="opacity-70">Add your first task to get started!</div>
    </motion.div>
  );
}
