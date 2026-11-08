"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AccessGate } from "@/components/AccessGate";
import { Shell } from "@/components/Shell";
import { useSession } from "@/components/SessionProvider";
import { api, postJson } from "@/lib/web-api";

type Classroom = { id: string; name: string; joinCode?: string; teacher: { displayName: string }; _count: { members: number; assignments: number } };
export default function ClassesPage() {
  const { user } = useSession();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = () => api<{classes:Classroom[]}>("/api/classes").then((r)=>setClasses(r.classes)).catch((e)=>setError(e.message));
  useEffect(()=>{if(user) void load();},[user]);
  async function create(event:FormEvent){event.preventDefault();setError("");setMessage("");try{await postJson("/api/classes",{name});setName("");setMessage("Klasse erstellt.");await load();}catch(e){setError(e instanceof Error?e.message:"Fehler");}}
  async function join(event:FormEvent){event.preventDefault();setError("");setMessage("");try{await postJson("/api/classes/join",{joinCode});setJoinCode("");setMessage("Du bist der Klasse beigetreten.");await load();}catch(e){setError(e instanceof Error?e.message:"Fehler");}}
  return <Shell title="Klassen & Gruppen" eyebrow="Gemeinsam lernen"><AccessGate>{error && <p role="alert" className="error-box mb-5">{error}</p>}{message && <p role="status" className="success-box mb-5">{message}</p>}<div className="mb-8 grid gap-5 lg:grid-cols-2"><form onSubmit={(e)=>void join(e)} className="card p-6"><h2 className="text-xl font-black">Klasse beitreten</h2><p className="mt-2 text-sm text-muted">Frag deine Lehrkraft nach dem Einladungscode.</p><label className="mt-5 block"><span className="label">Einladungscode</span><input className="field uppercase" value={joinCode} onChange={(e)=>setJoinCode(e.target.value)} minLength={6} maxLength={20} required /></label><button className="button button-primary mt-4">Beitreten</button></form>{(user?.role === "TEACHER" || user?.role === "ADMIN") && <form onSubmit={(e)=>void create(e)} className="card p-6"><h2 className="text-xl font-black">Neue Klasse</h2><p className="mt-2 text-sm text-muted">Erstelle einen Lernraum für deine Gruppe.</p><label className="mt-5 block"><span className="label">Klassenname</span><input className="field" value={name} onChange={(e)=>setName(e.target.value)} minLength={2} maxLength={100} placeholder="Zum Beispiel 4a" required /></label><button className="button button-secondary mt-4">Klasse erstellen</button></form>}</div><h2 className="mb-5 text-2xl font-black">Meine Klassen</h2><div className="grid gap-4 md:grid-cols-2">{classes.map((item)=><Link key={item.id} href={`/classes/${item.id}`} className="card block p-6 hover:border-blue hover:shadow-md"><div className="flex items-start justify-between"><div><h3 className="text-xl font-black">{item.name}</h3><p className="mt-1 text-sm text-muted">Lehrkraft: {item.teacher.displayName}</p></div><span className="text-2xl text-blue">→</span></div><div className="mt-5 flex gap-2"><span className="badge">{item._count.members} Mitglieder</span><span className="badge">{item._count.assignments} Aufträge</span></div></Link>)}</div>{classes.length===0 && <p className="text-muted">Du bist noch keiner Klasse beigetreten.</p>}</AccessGate></Shell>;
}
