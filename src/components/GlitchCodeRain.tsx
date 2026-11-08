"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useMotionValueEvent,
} from "framer-motion";

const GLYPHS = "01{}[]<>/:;=+*#_§@%&$?";

const BASE_LINES = [
  '{',
  '  "@context": "https://schema.org",',
  '  "@type": "Product",',
  '  "name": "Runner X1",',
  '  "offers": {',
  '    "@type": "Offer",',
  '    "price": "129.99",',
  '    "priceCurrency": "USD",',
  '    "availability": "InStock"',
  '  },',
  '  "aggregateRating": {',
  '    "@type": "AggregateRating",',
  '    "ratingValue": "4.8"',
  '  }',
  '}',
];

function scrambleLine(line: string, intensity: number) {
  return line
    .split("")
    .map((ch) => {
      if (ch === " " || ch === '"') return ch;
      if (Math.random() < intensity) return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      return ch;
    })
    .join("");
}

/**
 * Glitch de datos: las líneas de JSON-LD destellan y se "tipean"
 * al azar cuando la velocidad del scroll del usuario aumenta.
 */
export default function GlitchCodeRain() {
  const ref = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState(BASE_LINES);
  const [glitching, setGlitching] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cool = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const intensity = useTransform(velocity, [0, 2500], [0, 0.5], { clamp: true });
  const sectionOpacity = useTransform(
    useScroll({ target: ref, offset: ["start end", "end start"] }).scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0, 1, 1, 0],
  );

  useMotionValueEvent(intensity, "change", (v) => {
    if (v > 0.08) {
      setGlitching(true);
      if (cool.current) clearTimeout(cool.current);
      cool.current = setTimeout(() => setGlitching(false), 350);
      if (!timer.current) {
        timer.current = setInterval(() => {
          setLines(BASE_LINES.map((l) => scrambleLine(l, 0.35 + Math.random() * 0.3)));
        }, 70);
      }
    }
  });

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (cool.current) clearTimeout(cool.current);
    };
  }, []);

  // Al dejar de scrollear, restaurar líneas originales
  useEffect(() => {
    if (!glitching) {
      const t = setTimeout(() => setLines(BASE_LINES), 400);
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      return () => clearTimeout(t);
    }
  }, [glitching]);

  return (
    <motion.div ref={ref} style={{ opacity: sectionOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <pre
        className={`font-mono text-[11px] leading-5 text-cyan-400/25 transition-all duration-300 sm:text-xs ${
          glitching ? "glitch-active translate-x-[1px]" : ""
        }`}
      >
        {lines.map((l, i) => (
          <div key={i} className={glitching && i % 3 === 0 ? "text-cyan-300/50" : ""}>
            {l}
          </div>
        ))}
      </pre>
    </motion.div>
  );
}
