"use client";

import { Fragment, type ReactNode } from "react";

interface JsonViewProps {
  data: unknown;
  missing?: Set<string>;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isArr = (v: unknown): v is unknown[] => Array.isArray(v);

function childPath(path: string, key: string | number) {
  return path === "" ? String(key) : `${path}.${key}`;
}

function Scalar({ value, path, missing }: { value: unknown; path: string; missing?: Set<string> }) {
  const warn = missing?.has(path) ?? false;
  const wrap = (content: ReactNode, cls: string) =>
    warn ? (
      <span className={`warn-pulse rounded px-1 ${cls} bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/40`}>
        {content}
      </span>
    ) : (
      <span className={cls}>{content}</span>
    );

  if (value === null || value === undefined) return wrap("null", "text-zinc-500 italic");
  if (typeof value === "boolean") return wrap(String(value), "text-fuchsia-400");
  if (typeof value === "number") return wrap(String(value), "text-amber-300");
  return wrap(`"${String(value)}"`, "text-emerald-300");
}

function Node({ value, path, missing, depth }: { value: unknown; path: string; missing?: Set<string>; depth: number }) {
  const indent = "  ".repeat(depth);

  if (isObj(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return <span className="text-zinc-500">{'{}'}</span>;
    return (
      <>
        <span className="text-zinc-500">{"{"}</span>
        {keys.map((k, i) => {
          const p = childPath(path, k);
          return (
            <Fragment key={k}>
              {"\n"}
              <span>{"  ".repeat(depth + 1)}</span>
              <span className="text-cyan-300">{`"${k}"`}</span>
              <span className="text-zinc-500">{": "}</span>
              <Node value={value[k]} path={p} missing={missing} depth={depth + 1} />
              {i < keys.length - 1 && <span className="text-zinc-500">{","}</span>}
            </Fragment>
          );
        })}
        {"\n"}
        <span>{indent}</span>
        <span className="text-zinc-500">{"}"}</span>
      </>
    );
  }

  if (isArr(value)) {
    if (value.length === 0) return <span className="text-zinc-500">{"[]"}</span>;
    return (
      <>
        <span className="text-zinc-500">{"["}</span>
        {value.map((item, i) => {
          const p = childPath(path, i);
          return (
            <Fragment key={i}>
              {"\n"}
              <span>{"  ".repeat(depth + 1)}</span>
              <Node value={item} path={p} missing={missing} depth={depth + 1} />
              {i < value.length - 1 && <span className="text-zinc-500">{","}</span>}
            </Fragment>
          );
        })}
        {"\n"}
        <span>{indent}</span>
        <span className="text-zinc-500">{"]"}</span>
      </>
    );
  }

  return <Scalar value={value} path={path} missing={missing} />;
}

export default function JsonView({ data, missing }: JsonViewProps) {
  return (
    <pre className="font-mono text-[13px] leading-6 overflow-x-auto whitespace-pre">
      <code>
        <Node value={data} path="" missing={missing} depth={0} />
      </code>
    </pre>
  );
}
