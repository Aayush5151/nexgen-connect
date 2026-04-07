"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MagneticButton } from "@/components/shared/MagneticButton";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-navy-deep">
        {/* Background effects */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/[0.06] blur-[120px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container-narrow relative py-20 text-center md:py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-coral/10">
              <Compass className="h-10 w-10 text-coral" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-8 text-6xl font-extrabold text-white sm:text-8xl"
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-xl font-semibold text-ice-blue/60"
          >
            Looks like you took a wrong flight.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-2 text-base text-ice-blue/40"
          >
            This page doesn&apos;t exist. Let&apos;s get you back on track.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-10"
          >
            <MagneticButton
              href="/"
              className="btn-shimmer group gap-2 bg-gradient-to-r from-coral to-[#FF7B7F] px-8 py-4 text-[15px] text-white shadow-xl shadow-coral/25 hover:shadow-2xl hover:shadow-coral/30"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </MagneticButton>
          </motion.div>
        </div>
      </main>
    </>
  );
}
