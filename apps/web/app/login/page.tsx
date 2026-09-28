"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, saveSession } from "@/lib/api";
import type { TokenPair } from "@/lib/types";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@workspace.dev");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  async function submit(path: "/auth/sign-in" | "/auth/sign-up", event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const tokens = await api<TokenPair>(path, { method: "POST", body: JSON.stringify({ email, password }) });
      saveSession(tokens, email);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  }
  return (
    <div className="auth">
      <form className="auth-card" onSubmit={(e) => submit("/auth/sign-in", e)}>
        <p className="muted">Tenant Workspace</p>
        <h1>Sign in</h1>
        <p><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></p>
        <p><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required /></p>
        {error ? <p className="err">{error}</p> : null}
        <div className="row">
          <button type="submit">Sign in</button>
          <button type="button" className="ghost" onClick={(e) => submit("/auth/sign-up", e)}>Create account</button>
        </div>
      </form>
    </div>
  );
}
