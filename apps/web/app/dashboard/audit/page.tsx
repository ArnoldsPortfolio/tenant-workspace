"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";
export default function AuditPage() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [error, setError] = useState("");
  const workspaceId = typeof window !== "undefined" ? localStorage.getItem("workspaceId") : null;
  useEffect(() => {
    if (!workspaceId) return;
    api<AuditEntry[]>(`/workspaces/${workspaceId}/audit`).then(setItems).catch((err: Error) => setError(err.message));
  }, [workspaceId]);
  return (
    <section>
      <h1>Audit</h1>
      {!workspaceId ? <p className="muted">Pick a workspace first.</p> : null}
      {error ? <p className="err">{error}</p> : null}
      {items.map((entry) => (<div className="card" key={entry.id}><strong>{entry.action}</strong><p className="muted">{entry.detail}</p></div>))}
    </section>
  );
}
