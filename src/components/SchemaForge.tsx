"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Building2,
  Package,
  ChefHat,
  Store,
  MessageCircleQuestion,
  Newspaper,
  CalendarDays,
  ListOrdered,
  ChevronsRight,
  Video,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Braces,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  SCHEMAS,
  getSchema,
  scriptTag,
  type PairField,
  type PairItem,
  type Values,
} from "@/lib/schemas";
import JsonView from "./JsonView";

const ICONS: Record<string, LucideIcon> = {
  organization: Building2,
  product: Package,
  recipe: ChefHat,
  localbusiness: Store,
  faqpage: MessageCircleQuestion,
  article: Newspaper,
  event: CalendarDays,
  howto: ListOrdered,
  breadcrumb: ChevronsRight,
  video: Video,
};

const inputCls =
  "neu-input w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500";

function ListEditor({
  value,
  onChange,
  placeholder,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const items = Array.isArray(value) ? (value as string[]) : [];
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, ""]);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputCls}
            value={item}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="neu-btn neu-pressed flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-red-300"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="neu-btn flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-cyan-300"
      >
        <Plus size={13} /> Agregar línea
      </button>
    </div>
  );
}

function PairListEditor({
  value,
  onChange,
  pairFields,
  addLabel,
}: {
  value: unknown;
  onChange: (v: PairItem[]) => void;
  pairFields: [PairField, PairField];
  addLabel?: string;
}) {
  const items = Array.isArray(value) ? (value as PairItem[]) : [];
  const blank = (): PairItem =>
    Object.fromEntries(pairFields.map((pf) => [pf.key, ""]));
  const set = (i: number, key: string, v: string) =>
    onChange(items.map((x, j) => (j === i ? { ...x, [key]: v } : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, blank()]);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="neu-pressed rounded-xl p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400/80">
              {(() => {
                const singular = (addLabel ?? "ítem").replace(/^Agregar\s+/i, "");
                return `${singular.charAt(0).toUpperCase()}${singular.slice(1)} ${i + 1}`;
              })()}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-slate-500 transition hover:text-red-300"
              aria-label="Eliminar ítem"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {pairFields.map((pf) => (
            <div key={pf.key} className="mb-2">
              <label className="mb-1 block text-[11px] font-medium text-slate-400">
                {pf.label}
              </label>
              {pf.multiline ? (
                <textarea
                  className={`${inputCls} min-h-16 resize-y`}
                  value={item[pf.key] ?? ""}
                  placeholder={pf.placeholder}
                  onChange={(e) => set(i, pf.key, e.target.value)}
                />
              ) : (
                <input
                  className={inputCls}
                  value={item[pf.key] ?? ""}
                  placeholder={pf.placeholder}
                  onChange={(e) => set(i, pf.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="neu-btn flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-cyan-300"
      >
        <Plus size={13} /> {addLabel ?? "Agregar ítem"}
      </button>
    </div>
  );
}

export default function SchemaForge() {
  const [schemaId, setSchemaId] = useState("product");
  const [values, setValues] = useState<Values>({});
  const [copied, setCopied] = useState(false);
  const [validated, setValidated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const schema = getSchema(schemaId);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "start 0.35"],
  });
  const formX = useTransform(scrollYProgress, [0, 1], ["-10%", "0%"]);
  const formOpacity = useTransform(scrollYProgress, [0, 0.55], [0, 1]);
  const codeScale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const codeOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const codeY = useTransform(scrollYProgress, [0, 1], [40, 0]);

  const json = useMemo(() => schema.build(values), [schema, values]);
  const missing = useMemo(() => new Set(schema.validate(json)), [schema, json]);
  const missingCount = missing.size;

  const setValue = (key: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const switchSchema = (id: string) => {
    setSchemaId(id);
    setValues({});
    setCopied(false);
    setValidated(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(scriptTag(json));
    } catch {
      const ta = document.createElement("textarea");
      ta.value = scriptTag(json);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Agrupar campos por sección visual
  const groups = useMemo(() => {
    const map = new Map<string, typeof schema.fields>();
    for (const f of schema.fields) {
      const g = f.group ?? "General";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(f);
    }
    return [...map.entries()];
  }, [schema]);

  const renderField = (f: (typeof schema.fields)[number]) => {
    const v = values[f.key];
    const common = { id: f.key, placeholder: f.placeholder };

    if (f.kind === "textarea") {
      return (
        <textarea
          {...common}
          className={`${inputCls} min-h-20 resize-y`}
          value={typeof v === "string" ? v : ""}
          onChange={(e) => setValue(f.key, e.target.value)}
        />
      );
    }
    if (f.kind === "select") {
      return (
        <select
          {...common}
          className={`${inputCls} appearance-none`}
          value={typeof v === "string" ? v : ""}
          onChange={(e) => setValue(f.key, e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    if (f.kind === "list") {
      return <ListEditor value={v} onChange={(nv) => setValue(f.key, nv)} placeholder={f.placeholder} />;
    }
    if (f.kind === "pairs") {
      return (
        <PairListEditor
          value={v}
          onChange={(nv) => setValue(f.key, nv)}
          pairFields={f.pairFields ?? [
            { key: "name", label: "Nombre" },
            { key: "value", label: "Valor" },
          ]}
          addLabel={f.addLabel}
        />
      );
    }
    return (
      <input
        {...common}
        type={f.kind === "number" ? "number" : f.kind === "email" ? "email" : f.kind === "url" ? "url" : "text"}
        className={inputCls}
        value={typeof v === "string" || typeof v === "number" ? String(v) : ""}
        onChange={(e) => setValue(f.key, e.target.value)}
      />
    );
  };

  return (
    <section id="forge" ref={sectionRef} className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Estudio interactivo
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Forjá tu <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">JSON-LD</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Elegí un tipo de schema, completá el formulario y copiá el código listo
            para pegar en el <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm">&lt;head&gt;</code> de tu sitio.
          </p>
        </motion.div>

        {/* Selector de schema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-wrap justify-center gap-3"
        >
          {SCHEMAS.map((s) => {
            const Icon = ICONS[s.id];
            const active = s.id === schemaId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => switchSchema(s.id)}
                data-pressed={active}
                className={`neu-btn flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium ${
                  active ? "neu-btn-active" : "text-slate-300"
                }`}
              >
                <Icon size={16} className={active ? "text-cyan-200" : "text-cyan-400/70"} />
                {s.name}
              </button>
            );
          })}
        </motion.div>

        {/* Split-screen: formulario + código */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Formulario */}
          <motion.div style={{ x: formX, opacity: formOpacity }}>
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="neu-pressed flex h-10 w-10 items-center justify-center rounded-xl">
                  <Braces size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{schema.name}</h3>
                  <p className="text-xs text-slate-400">{schema.tagline}</p>
                </div>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setValidated(true);
                }}
              >
                {groups.map(([groupName, fields]) => (
                  <fieldset key={groupName}>
                    <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/70">
                      {groupName}
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {fields.map((f) => (
                        <div
                          key={f.key}
                          className={f.kind === "textarea" || f.kind === "list" || f.kind === "pairs" ? "sm:col-span-2" : ""}
                        >
                          <label
                            htmlFor={f.key}
                            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300"
                          >
                            {f.label}
                            {f.required && <span className="text-red-400">*</span>}
                          </label>
                          {f.hint && <p className="mb-1 text-[11px] text-slate-500">{f.hint}</p>}
                          {renderField(f)}
                        </div>
                      ))}
                    </div>
                  </fieldset>
                ))}

                <button type="submit" className="neu-btn w-full rounded-2xl py-3 text-sm font-semibold text-cyan-200">
                  Validar schema
                </button>

                {validated && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2.5 rounded-2xl p-4 text-sm ${
                      missingCount === 0
                        ? "bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/30"
                        : "bg-amber-500/10 text-amber-200 ring-1 ring-amber-400/30"
                    }`}
                  >
                    {missingCount === 0 ? (
                      <>
                        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                        <span>
                          <strong>Schema válido.</strong> Todos los campos requeridos por Google
                          están completos. Podés copiar el JSON-LD.
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                        <span>
                          <strong>Faltan {missingCount} campo{missingCount > 1 ? "s" : ""} requerido{missingCount > 1 ? "s" : ""}.</strong>{" "}
                          Están marcados en ámbar dentro del JSON de la derecha.
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>

          {/* Output JSON */}
          <motion.div style={{ scale: codeScale, opacity: codeOpacity, y: codeY }}>
            <div className="glass-deep flex h-full flex-col rounded-3xl p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="neu-pressed flex h-8 w-8 items-center justify-center rounded-lg">
                    <Braces size={15} className="text-cyan-300" />
                  </span>
                  <span className="font-mono text-sm text-slate-300">schema.jsonld</span>
                </div>
                <div className="flex items-center gap-2">
                  {missingCount > 0 ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-amber-400/30">
                      <TriangleAlert size={12} />
                      {missingCount} requerido{missingCount > 1 ? "s" : ""} pendiente{missingCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/30">
                      <ShieldCheck size={12} />
                      Schema completo
                    </span>
                  )}
                </div>
              </div>

              <div className="neu-pressed min-h-[380px] flex-1 overflow-hidden rounded-2xl p-4">
                <JsonView data={json} missing={missing} />
              </div>

              {validated && missingCount > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 text-xs text-amber-300/90"
                >
                  <ShieldAlert size={14} />
                  Google exige los campos marcados en ámbar para mostrar rich results.
                </motion.p>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={copy}
                  className={`neu-btn flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors ${
                    copied ? "text-emerald-300" : "text-cyan-200"
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "¡Copiado!" : "Copiar JSON-LD"}
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-500">
                Copia el bloque completo <code className="font-mono text-slate-400">&lt;script&gt;</code> listo para el{" "}
                <code className="font-mono text-slate-400">&lt;head&gt;</code> de tu web.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
