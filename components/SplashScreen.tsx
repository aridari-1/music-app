"use client";

import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      className="fixed inset-0 z-[999] bg-black flex items-center justify-center"
    >
      <motion.img
        src="/logo.png"
        alt="Naluma logo"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        className="w-20 h-20"
      />

      {/* glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1 }}
        className="absolute w-40 h-40 bg-purple-500/30 blur-3xl rounded-full"
      />
    </motion.div>
  );
}