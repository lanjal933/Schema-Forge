"use client";

import { motion } from "framer-motion";
import { ArrowDown, Braces, MousePointerClick, SearchCheck } from "lucide-react";

export default function Hero() {
  return (
    <header className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="glass mb-8 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-200"
      >
        <Braces size={13} />
        JSON-LD · Schema.org · Rich Results
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl"
      >
        Generá{" "}
        <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
          Schema Markup
        </span>{" "}
        que Google ama
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="mt-6 max-w-2xl text-lg text-slate-400"
      >
        Completá un formulario visual y obtené al instante el JSON-LD perfecto
        para Organization, Product, Recipe, LocalBusiness y FAQ. Validado,
        copiado, publicado.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <a
          href="#forge"
          className="neu-btn neu-btn-active flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold"
        >
          <MousePointerClick size={16} />
          Empezar a generar
        </a>
        <a
          href="#features"
          className="neu-btn flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-medium text-slate-300"
        >
          <SearchCheck size={16} />
          Ver características
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-slate-500"
      >
        <span className="text-[11px] uppercase tracking-[0.25em]">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </header>
  );
}
