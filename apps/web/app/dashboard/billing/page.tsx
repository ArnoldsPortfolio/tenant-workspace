"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Billing } from "@/lib/types";
export default function BillingPage() {
  const [data, setData] = useState<Billing | null>(null);
  const [error, setError] = useState("");
  const workspaceId = typeof window !== "undefined" ? localStorage.getItem("workspaceId") : null;
  useEffect(() => {
    if (!workspaceId) return;
    api<Billing>(`/workspaces/${workspaceId}/billing`).then(setData).catch((err: Error) => setError(err.message));
  }, [workspaceId]);
  return (
    <section>
      <h1>Billing</h1>
      {!workspaceId ? <p className="muted">Pick a workspace first.</p> : null}
      {error ? <p className="err">{error}</p> : null}
      {data ? <div className="card"><p>Plan: {data.plan}</p><p>Seats: {data.seats}</p></div> : null}
    </section>
  );
}
