"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Workspace } from "@/lib/types";
export default function WorkspacesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Workspace[]>([]);
  const [name, setName] = useState("New workspace");
  const [error, setError] = useState("");
  async function load() { setItems(await api<Workspace[]>("/workspaces")); }
  useEffect(() => { load().catch((err: Error) => setError(err.message)); }, []);
  async function create() { setError(""); await api("/workspaces", { method: "POST", body: JSON.stringify({ name }) }); await load(); }
  function openWorkspace(ws: Workspace) {
    localStorage.setItem("workspaceId", ws.id);
    localStorage.setItem("workspaceName", ws.name);
    router.push("/dashboard/projects");
  }
  return (
    <section>
      <h1>Workspaces</h1>
      <div className="row">
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" onClick={() => create().catch((err: Error) => setError(err.message))}>Create</button>
      </div>
      {error ? <p className="err">{error}</p> : null}
      {items.map((ws) => (
        <article className="card" key={ws.id}>
          <button type="button" className="ghost" onClick={() => openWorkspace(ws)}>{ws.name}</button>
          <p className="muted">{ws.plan} · {ws.role}</p>
        </article>
      ))}
    </section>
  );
}
