"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingClient() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* 🌌 ANIMATED BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black animate-pulse" />

      {/* 🔮 GLOW ORBS */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full animate-pulse" />

      {/* ✨ FLOATING PARTICLES */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* 🎧 HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 sm:px-6">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent leading-tight"
        >
          Experience Music Differently
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg text-white/60 max-w-md sm:max-w-xl"
        >
          Discover, support artists, and own your music experience.
        </motion.p>

        {/* 🎵 WAVEFORM */}
        <div className="flex items-end gap-1 mt-8 h-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] bg-gradient-to-t from-purple-500 to-blue-400 rounded-full"
              animate={{
                height: [10, 40, 15, 50, 20],
              }}
              transition={{
                duration: 1 + i * 0.05,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* 🚀 BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Link href="/home">
            <button className="mt-8 px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 hover:scale-105 active:scale-95 transition text-sm sm:text-base">
              Enter the Experience
            </button>
          </Link>
        </motion.div>

      </section>

      {/* 🎯 FEATURES */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {[
          { title: "Discover", desc: "Explore trending music" },
          { title: "Support", desc: "Directly support artists" },
          { title: "Own", desc: "Access what you buy" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            className="p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition"
          >
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">
              {item.title}
            </h3>
            <p className="text-white/60 text-sm sm:text-base">
              {item.desc}
            </p>
          </motion.div>
        ))}

      </section>

      {/* 🚀 FINAL CTA */}
      <section className="relative z-10 py-16 sm:py-20 flex flex-col items-center text-center px-4">

        <Link href="/home">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-base sm:text-lg"
          >
            Start Now
          </motion.button>
        </Link>

      </section>

    </main>
  );
}