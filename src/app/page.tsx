import type { Metadata } from "next";
import BlueprintBackground from "@/components/BlueprintBackground";
import Hero from "@/components/Hero";
import SchemaForge from "@/components/SchemaForge";
import GlitchCodeRain from "@/components/GlitchCodeRain";
import { Zap, ShieldCheck, ClipboardPaste, Braces } from "lucide-react";

export const metadata: Metadata = {
  title: "Schema Forge — Generador de JSON-LD SEO",
  description:
    "Generador interactivo de JSON-LD Schema Markup. Completá un formulario y obtené código listo para Google Rich Results: Organization, Product, Recipe, LocalBusiness y FAQ.",
};

const FEATURES = [
  {
    icon: Zap,
    title: "Renderizado en vivo",
    text: "Cada tecla actualiza el JSON-LD al instante. Sin esperas, sin recargas.",
  },
  {
    icon: ShieldCheck,
    title: "Validación inteligente",
    text: "Los campos que Google exige se marcan en ámbar hasta que el schema esté completo.",
  },
  {
    icon: ClipboardPaste,
    title: "Un clic y listo",
    text: "Copiá el bloque <script> completo y pegalo en el head de tu sitio. Producción.",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BlueprintBackground />
      <Hero />
      <SchemaForge />

      {/* Features */}
      <section id="features" className="relative z-10 px-4 pb-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-3xl p-6">
              <div className="neu-pressed mb-4 flex h-11 w-11 items-center justify-center rounded-xl">
                <f.icon size={19} className="text-cyan-300" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer con glitch de código */}
      <footer className="relative z-10 mt-auto overflow-hidden border-t border-white/5 px-4 pb-16 pt-24">
        <GlitchCodeRain />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="neu-pressed mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Braces size={20} className="text-cyan-300" />
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Tu sitio merece rich results
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            JSON-LD correcto = más CTR en Google. Generá el tuyo en segundos.
          </p>
          <a
            href="#forge"
            className="neu-btn neu-btn-active mt-6 inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm font-semibold"
          >
            <Braces size={15} />
            Volver al generador
          </a>
          <p className="mt-10 text-[11px] uppercase tracking-[0.25em] text-slate-600">
            Schema Forge · Estructura para producción
          </p>
        </div>
      </footer>
    </div>
  );
}
