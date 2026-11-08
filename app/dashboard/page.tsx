"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccessGate } from "@/components/AccessGate";
import { Shell } from "@/components/Shell";
import { SubjectCard } from "@/components/SubjectCard";
import { useSession } from "@/components/SessionProvider";
import { api, type CatalogSubject } from "@/lib/web-api";

type Progress = { lessonId: string; answered: number; correct: number; completedAt: string | null; lesson: { title: string } };
export default function DashboardPage() {
  const { user } = useSession();
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [points, setPoints] = useState(0);
  useEffect(() => { api<{ subjects: CatalogSubject[] }>("/api/catalog").then((r)=>setSubjects(r.subjects)).catch(()=>{}); }, []);
  useEffect(() => { if (user) api<{ progress: Progress[]; points: number }>("/api/progress").then((r)=>{setProgress(r.progress);setPoints(r.points);}).catch(()=>{}); }, [user]);
  return <Shell title={`Hallo, ${user?.displayName ?? "du"}!`} eyebrow="Deine Übersicht"><AccessGate><div className="mb-8 grid gap-4 md:grid-cols-3"><div className="card p-6"><p className="text-sm font-bold text-muted">Gesammelte Punkte</p><p className="mt-2 text-4xl font-black text-blue">{points} <span className="text-gold">✦</span></p></div><div className="card p-6"><p className="text-sm font-bold text-muted">Begonnene Lektionen</p><p className="mt-2 text-4xl font-black">{progress.length}</p></div><div className="card p-6"><p className="text-sm font-bold text-muted">Abgeschlossen</p><p className="mt-2 text-4xl font-black text-mint">{progress.filter((p)=>p.completedAt).length}</p></div></div><div className="mb-9 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><section className="card relative overflow-hidden bg-[#e9f4ff] p-7 md:p-9"><div className="relative z-10"><p className="font-bold uppercase tracking-widest text-blue">Heute etwas Neues lernen</p><h2 className="mt-3 max-w-sm text-3xl font-black">Kleine Schritte, große Entdeckungen.</h2><p className="mt-3 max-w-sm text-muted">Wähle eine Lektion und sammle deine nächsten Punkte.</p><Link href="/subjects" className="button button-primary mt-6">Fächer entdecken →</Link></div><div className="absolute -bottom-14 -right-3 text-[180px] font-black text-[#c8e3fb]" aria-hidden>✳</div></section><section className="card p-7"><h2 className="text-xl font-black">Zuletzt gelernt</h2>{progress.length ? <div className="mt-4 space-y-3">{progress.slice(0,3).map((p)=><Link key={p.lessonId} href={`/lessons/${p.lessonId}`} className="block rounded-xl bg-[#f6f9fc] p-3 hover:bg-sky"><strong>{p.lesson.title}</strong><span className="mt-1 block text-sm text-muted">{p.correct} richtige Antworten</span></Link>)}</div> : <p className="mt-4 text-muted">Dein erster Lernschritt wartet schon.</p>}</section></div><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black">Fächer</h2><Link href="/subjects" className="font-bold text-blue hover:underline">Alle ansehen →</Link></div><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{subjects.map((s)=><SubjectCard key={s.id} subject={s} />)}</div></AccessGate></Shell>;
}
