"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AccessGate } from "@/components/AccessGate";
import { Shell } from "@/components/Shell";
import { useSession } from "@/components/SessionProvider";
import { api, type UserView } from "@/lib/web-api";

const colors = ["#2876df", "#e87c65", "#41a983", "#945cc4", "#d69a2d"];
export default function ProfilePage() {
  const { user, refresh } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [avatarColor, setAvatarColor] = useState(colors[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(()=>{ if(user){setDisplayName(user.displayName);setAvatarColor(user.avatarColor);} },[user]);
  async function save(event: FormEvent) { event.preventDefault();setError("");setMessage("");try { await api<{user:UserView}>("/api/profile",{method:"PATCH",body:JSON.stringify({displayName,avatarColor})});await refresh();setMessage("Profil gespeichert."); } catch(e){setError(e instanceof Error?e.message:"Speichern fehlgeschlagen");} }
  return <Shell title="Dein Profil" eyebrow="Persönlich"><AccessGate><div className="card max-w-2xl p-7"><div className="mb-6 flex items-center gap-5"><div className="grid h-20 w-20 place-items-center rounded-full text-4xl font-black text-white" style={{background:avatarColor}}>{displayName.slice(0,1).toUpperCase()}</div><div><h2 className="text-xl font-black">{user?.displayName}</h2><p className="text-muted">{user?.email}</p><span className="badge mt-2">{user?.role === "ADMIN" ? "Administration" : user?.role === "TEACHER" ? "Lehrkraft" : "Lernende Person"}</span></div></div><form onSubmit={(e)=>void save(e)} className="space-y-5"><label className="block"><span className="label">Anzeigename</span><input className="field" value={displayName} minLength={2} maxLength={80} onChange={(e)=>setDisplayName(e.target.value)} required /></label><fieldset><legend className="label">Avatarfarbe</legend><div className="flex gap-3">{colors.map((color)=><button type="button" key={color} onClick={()=>setAvatarColor(color)} aria-label={`Farbe ${color}`} aria-pressed={avatarColor===color} className={`h-10 w-10 rounded-full ${avatarColor===color ? "ring-4 ring-offset-2 ring-blue" : ""}`} style={{background:color}} />)}</div></fieldset>{message && <p role="status" className="success-box">{message}</p>}{error && <p role="alert" className="error-box">{error}</p>}<button className="button button-primary">Änderungen speichern</button></form></div></AccessGate></Shell>;
}
