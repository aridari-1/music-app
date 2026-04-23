"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageProvider";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/SplashScreen";

export default function LandingClient() {
  const { t } = useLanguage();

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 🔥 SPLASH SCREEN FIRST
  if (showSplash) return <SplashScreen />;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* 🌌 BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />

      {/* 🔮 FLOATING BLOBS */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full"
      />
      <motion.div
        animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full"
      />

      {/* ✨ PARTICLES */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -200 }}
            transition={{
              duration: 6 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="absolute w-[2px] h-[2px] bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: 0,
            }}
          />
        ))}
      </div>

      {/* 🎧 HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 sm:px-6">

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent leading-tight"
        >
          {t.discover}
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg text-white/60 max-w-md sm:max-w-xl"
        >
          {t.support}
        </motion.p>

        {/* 🎵 AUDIO WAVE */}
        <div className="flex items-end gap-[3px] mt-10 h-12">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] bg-gradient-to-t from-purple-500 to-blue-400 rounded-full"
              animate={{ height: [10, 60, 20, 70, 15] }}
              transition={{
                duration: 1.2 + i * 0.04,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* 🚀 CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="relative mt-10 px-8 sm:px-10 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-sm sm:text-base font-medium overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/10 blur-xl opacity-0 hover:opacity-100 transition" />
              {t.start}
            </motion.button>
          </Link>
        </motion.div>

      </section>

      {/* 🎯 FEATURES */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {[
          {
            title: t.discover,
            desc: t.trendingSub,
          },
          {
            title: t.support,
            desc: t.newSub,
          },
          {
            title: t.owned,
            desc: t.yourSongs,
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition"
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

        <Link href="/auth/signup">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-base sm:text-lg font-medium shadow-lg"
          >
            {t.start}
          </motion.button>
        </Link>

      </section>

    </main>
  );
}