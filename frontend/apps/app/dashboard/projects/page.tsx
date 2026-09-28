"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
export default function ProjectsPage() {
  const [title, setTitle] = useState("New project");
  const [items, setItems] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const workspaceId = typeof window !== "undefined" ? localStorage.getItem("workspaceId") : null;
  const workspaceName = typeof window !== "undefined" ? localStorage.getItem("workspaceName") : null;
  async function load() { if (!workspaceId) return; setItems(await api<Project[]>(`/workspaces/${workspaceId}/projects`)); }
  useEffect(() => { load().catch((err: Error) => setError(err.message)); }, [workspaceId]);
  async function create() {
    if (!workspaceId) return setError("Pick a workspace first.");
    await api(`/workspaces/${workspaceId}/projects`, { method: "POST", body: JSON.stringify({ title }) });
    await load();
  }
  return (
    <section>
      <h1>Projects</h1>
      <p className="muted">{workspaceName ? `Workspace: ${workspaceName}` : "Open Workspaces and choose one."}</p>
      <div className="row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="button" onClick={() => create().catch((err: Error) => setError(err.message))}>Add</button>
      </div>
      {error ? <p className="err">{error}</p> : null}
      {items.map((project) => (<div className="card" key={project.id}>{project.title}</div>))}
    </section>
  );
}
