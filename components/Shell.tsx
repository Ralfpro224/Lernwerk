"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/SessionProvider";

const items = [
  { href: "/dashboard", label: "Übersicht", icon: "⌂" },
  { href: "/subjects", label: "Fächer", icon: "▦" },
  { href: "/progress", label: "Fortschritt", icon: "◔" },
  { href: "/rewards", label: "Belohnungen", icon: "✦" },
  { href: "/classes", label: "Klassen", icon: "♧" },
  { href: "/profile", label: "Profil", icon: "○" },
  { href: "/settings", label: "Einstellungen", icon: "⚙" },
];

export function Shell({ children, title, eyebrow }: { children: React.ReactNode; title?: string; eyebrow?: string }) {
  const pathname = usePathname();
  const { user, loading, logout } = useSession();
  const [open, setOpen] = useState(false);
  const nav = [...items, ...(user?.role === "TEACHER" || user?.role === "ADMIN" ? [{ href: "/teacher", label: "Lehrbereich", icon: "▤" }] : []), ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Verwaltung", icon: "✱" }] : [])];
  return <div className="min-h-screen bg-[#f6f9fc] text-ink">
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e4edf3] bg-white/95 px-4 backdrop-blur md:px-7">
      <div className="flex items-center gap-3"><button className="icon-button md:hidden" aria-label="Menü öffnen" onClick={() => setOpen(!open)}>☰</button><Link href="/dashboard" className="flex items-center gap-2 text-xl font-black tracking-tight"><span className="brand-mark">L</span> Lernwerk<span className="text-coral">.</span></Link></div>
      <div className="flex items-center gap-3">{!loading && user ? <><span className="hidden text-sm font-semibold text-muted sm:block">Hallo, {user.displayName}</span><Link href="/profile" aria-label="Profil öffnen" className="avatar" style={{ background: user.avatarColor }}>{user.displayName.slice(0,1).toUpperCase()}</Link></> : <Link href="/login" className="button button-primary text-sm">Anmelden</Link>}</div>
    </header>
    {open && <button aria-label="Menü schließen" className="fixed inset-0 z-30 bg-ink/30 md:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-16 left-0 z-40 w-64 border-r border-[#e4edf3] bg-white p-4 transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-5 px-3 text-xs font-bold uppercase tracking-[.18em] text-muted">Entdecken</div>
      <nav className="space-y-1" aria-label="Hauptnavigation">{nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`nav-link ${pathname === item.href || pathname.startsWith(item.href + "/") ? "nav-link-active" : ""}`}><span className="w-7 text-center text-xl" aria-hidden>{item.icon}</span>{item.label}</Link>)}</nav>
      <div className="absolute bottom-5 left-4 right-4 border-t border-[#edf2f6] pt-4">{user ? <button onClick={() => void logout()} className="nav-link w-full text-left"><span className="w-7 text-center" aria-hidden>↪</span>Abmelden</button> : <Link href="/register" className="button button-primary block text-center">Konto erstellen</Link>}</div>
    </aside>
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-7 md:ml-64 md:px-8 md:py-9 xl:mr-auto">
      {(title || eyebrow) && <div className="mb-7">{eyebrow && <p className="mb-1 text-sm font-bold uppercase tracking-[.16em] text-blue">{eyebrow}</p>}{title && <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>}</div>}
      {children}
    </main>
  </div>;
}
