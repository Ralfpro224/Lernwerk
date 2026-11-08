"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccessGate } from "@/components/AccessGate";
import { Shell } from "@/components/Shell";
import { useSession } from "@/components/SessionProvider";
import { api } from "@/lib/web-api";

type Progress = { lessonId: string; answered: number; correct: number; points: number; completedAt: string | null; updatedAt: string; lesson: { title: string; topic: { title: string; subject: { title: string } } } };

export default function ProgressPage() {
  const { user } = useSession();
  const [rows, setRows] = useState<Progress[]>([]);
  const [points, setPoints] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => { if (user) api<{ progress: Progress[]; points: number }>("/api/progress").then((r)=>{setRows(r.progress);setPoints(r.points);}).catch((e)=>setError(e.message)); }, [user]);
  return <Shell title="Dein Fortschritt" eyebrow="Dein Lernweg"><AccessGate>{error && <p className="error-box mb-5">{error}</p>}<div className="card mb-7 flex flex-wrap items-center justify-between gap-4 bg-[#eaf7ff] p-6"><div><h2 className="text-2xl font-black">Jeder Schritt zählt.</h2><p className="mt-1 text-muted">Deine Antworten werden dauerhaft gespeichert.</p></div><strong className="text-3xl text-blue">{points} ✦</strong></div><div className="space-y-4">{rows.map((row)=><Link href={`/lessons/${row.lessonId}`} key={row.lessonId} className="card block p-5 transition hover:border-blue hover:shadow-md"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-blue">{row.lesson.topic.subject.title} · {row.lesson.topic.title}</p><h2 className="mt-1 text-xl font-black">{row.lesson.title}</h2></div><span className={`badge ${row.completedAt ? "!bg-[#e4f9ec] !text-[#248350]" : ""}`}>{row.completedAt ? "Abgeschlossen" : "In Arbeit"}</span></div><div className="mt-4 progress-track"><div className="progress-fill" style={{width:`${row.answered ? Math.min(100,row.correct/row.answered*100) : 0}%`}} /></div><p className="mt-2 text-sm text-muted">{row.correct} richtige Antworten · {row.points} Punkte</p></Link>)}{rows.length===0 && !error && <div className="card p-8"><h2 className="text-xl font-black">Noch kein Fortschritt</h2><p className="mt-2 text-muted">Starte deine erste Lektion.</p><Link href="/subjects" className="button button-primary mt-5">Fächer entdecken</Link></div>}</div></AccessGate></Shell>;
}
