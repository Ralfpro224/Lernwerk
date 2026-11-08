"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession } from "@/components/SessionProvider";
import { postJson } from "@/lib/web-api";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await postJson(`/api/auth/${mode}`, mode === "register" ? { email, password, displayName } : { email, password });
      await refresh(); router.push("/dashboard"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Ein Fehler ist aufgetreten"); }
    finally { setBusy(false); }
  }
  return <div className="flex min-h-screen items-center justify-center bg-[#eaf7ff] px-4 py-10"><div className="w-full max-w-md"><Link href="/" className="mb-8 flex items-center justify-center gap-2 text-2xl font-black text-ink"><span className="brand-mark">L</span>Lernwerk<span className="text-coral">.</span></Link><div className="card p-7 md:p-9"><p className="text-sm font-bold uppercase tracking-widest text-blue">{mode === "login" ? "Willkommen zurück" : "Starte deine Lernreise"}</p><h1 className="mt-2 text-3xl font-black">{mode === "login" ? "Anmelden" : "Konto erstellen"}</h1><p className="mt-2 text-muted">{mode === "login" ? "Lerne dort weiter, wo du aufgehört hast." : "Dein Fortschritt wird sicher gespeichert."}</p><form className="mt-7 space-y-4" onSubmit={(event) => void submit(event)}>{mode === "register" && <label className="block"><span className="label">Dein Name</span><input className="field" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} minLength={2} maxLength={80} autoComplete="name" required /></label>}<label className="block"><span className="label">E-Mail-Adresse</span><input className="field" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" required /></label><label className="block"><span className="label">Passwort</span><input className="field" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} minLength={mode === "register" ? 10 : 1} autoComplete={mode === "register" ? "new-password" : "current-password"} required /></label>{error && <p role="alert" className="error-box">{error}</p>}<button className="button button-primary w-full" disabled={busy}>{busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Konto erstellen"}</button></form><p className="mt-6 text-center text-sm text-muted">{mode === "login" ? "Noch kein Konto? " : "Schon ein Konto? "}<Link className="font-bold text-blue hover:underline" href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Jetzt registrieren" : "Zur Anmeldung"}</Link></p></div></div></div>;
}
