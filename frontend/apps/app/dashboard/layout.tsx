"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { accessToken, clearSession } from "@/lib/api";
const links = [
  { href: "/dashboard", label: "Workspaces" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/audit", label: "Audit" },
];
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => { if (!accessToken()) router.replace("/login"); }, [router]);
  function signOut() { clearSession(); router.replace("/login"); }
  return (
    <div className="shell">
      <aside>
        <strong>Tenant Workspace</strong>
        <p className="muted">{typeof window !== "undefined" ? localStorage.getItem("email") : ""}</p>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>{link.label}</Link>
        ))}
        <button type="button" className="link" onClick={signOut}>Sign out</button>
      </aside>
      <main>{children}</main>
    </div>
  );
}
