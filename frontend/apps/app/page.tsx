"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { accessToken } from "@/lib/api";
export default function HomePage() {
  const router = useRouter();
  useEffect(() => { router.replace(accessToken() ? "/dashboard" : "/login"); }, [router]);
  return <p className="muted" style={{ padding: "2rem" }}>Opening…</p>;
}
