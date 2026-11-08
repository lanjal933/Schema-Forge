"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Blueprint Reveal: la grilla técnica se "expande" en 3D al hacer scroll,
 * como si el usuario entrara físicamente al código fuente.
 */
export default function BlueprintBackground() {
  const { scrollYProgress } = useScroll();

  const rotateX = useTransform(scrollYProgress, [0, 0.55], [0, 58]);
  const scale = useTransform(scrollYProgress, [0, 0.55], [1, 1.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.55], [0.55, 0.9, 0.12]);
  const y = useTransform(scrollYProgress, [0, 0.55], ["0%", "12%"]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Glow ambiental */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(8,47,73,0.55),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(76,29,149,0.25),transparent_55%)]" />

      {/* Plano de la grilla en perspectiva */}
      <div className="absolute inset-0" style={{ perspective: "900px" }}>
        <motion.div
          className="blueprint-grid absolute -inset-x-1/4 -inset-y-1/4"
          style={{ rotateX, scale, opacity, y }}
        />
      </div>

      {/* Viñeta para legibilidad */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(4,6,12,0.75)_100%)]" />
    </div>
  );
}
