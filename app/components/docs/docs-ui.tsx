import type { ReactNode } from "react";
import { CopyButton } from "~/components/copy-button";

export function DocsHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="space-y-2 border-b pb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-lg text-muted-foreground">{lead}</p>
    </header>
  );
}

export function Section({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      {title ? (
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      ) : null}
      <div className="space-y-4 leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  );
}

export function Snippet({
  label,
  code,
  html,
}: {
  label: string;
  code: string;
  html: string;
}) {
  return (
    <div className="source-view overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <CopyButton value={code} label="Copy" />
      </div>
      <div
        className="overflow-x-auto p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function Callout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-relaxed">
      {title ? <p className="mb-1 font-medium">{title}</p> : null}
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}

export function FieldTable({
  title,
  fields,
}: {
  title: string;
  fields: readonly (readonly [string, string, string])[];
}) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="border-b bg-muted/40 px-4 py-2 text-sm font-medium">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Field</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map(([name, type, description]) => (
              <tr key={name}>
                <td className="px-4 py-2 font-mono text-xs">{name}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                  {type}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const METHOD_CLASS: Record<string, string> = {
  GET: "text-emerald-600 dark:text-emerald-400",
  POST: "text-sky-600 dark:text-sky-400",
  PATCH: "text-amber-600 dark:text-amber-400",
  PUT: "text-amber-600 dark:text-amber-400",
  DELETE: "text-destructive",
};

export interface Endpoint {
  method: string;
  path: string;
  description: string;
}

export function EndpointTable({ rows }: { rows: Endpoint[] }) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Method</th>
            <th className="px-4 py-2 font-medium">Path</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={`${row.method} ${row.path}`}>
              <td
                className={`px-4 py-2 font-mono text-xs font-semibold whitespace-nowrap ${METHOD_CLASS[row.method] ?? ""}`}
              >
                {row.method}
              </td>
              <td className="px-4 py-2 font-mono text-xs whitespace-nowrap">
                {row.path}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
