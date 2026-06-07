"use client";

import Link from "next/link";
import { Compass, ShoppingBag, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[70vh] px-4 py-20 text-center relative overflow-hidden bg-radial from-indigo-950/10 via-background to-background">
      {/* Background radial shadows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="flex flex-col items-center max-w-lg w-full gap-8 relative z-10">
        {/* Animated Compass Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="p-4 bg-primary/10 text-primary rounded-full mb-2"
        >
          <Compass className="w-12 h-12 stroke-[1.5]" />
        </motion.div>

        {/* Big 404 code */}
        <div className="flex flex-col gap-2">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl font-black tracking-widest text-primary drop-shadow-[0_0_20px_rgba(99,102,241,0.2)] font-mono"
          >
            404
          </motion.h1>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Lost in Space
          </h2>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          The page you are trying to visit has been moved, renamed, or possibly never existed. Let&apos;s guide you back to familiar tracks.
        </p>

        {/* CTA links */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/95 gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-secondary transition-colors gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
