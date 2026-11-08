"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api, type CatalogSubject } from "@/lib/web-api";

export default function SubjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [subject, setSubject] = useState<CatalogSubject | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api<{ subjects: CatalogSubject[] }>("/api/catalog").then((r) => setSubject(r.subjects.find((s)=>s.slug===slug) ?? null)).catch((e)=>setError(e.message)); }, [slug]);
  const grades = [...new Set(subject?.topics.map((t)=>t.grade) ?? [])].sort((a,b)=>a-b);
  const topics = subject?.topics.filter((t)=>grade === null || t.grade === grade) ?? [];
  return <Shell title={subject?.title ?? "Fach entdecken"} eyebrow="Fächer"><Link href="/subjects" className="mb-6 inline-flex font-bold text-blue hover:underline">← Alle Fächer</Link>{error && <div className="error-box">{error}</div>}{subject && <><p className="mb-7 max-w-2xl text-muted">{subject.description}</p><div className="mb-7 flex flex-wrap gap-2" aria-label="Klassenstufe wählen"><button className={`button ${grade === null ? "button-primary" : "button-secondary"}`} onClick={()=>setGrade(null)}>Alle Stufen</button>{grades.map((g)=><button key={g} className={`button ${grade === g ? "button-primary" : "button-secondary"}`} onClick={()=>setGrade(g)}>Klasse {g}</button>)}</div><div className="space-y-6">{topics.map((topic)=><section key={topic.id} className="card p-6"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><span className="badge">Klasse {topic.grade}</span><h2 className="mt-3 text-2xl font-black">{topic.title}</h2><p className="mt-1 text-muted">{topic.description}</p></div><span className="text-3xl" aria-hidden>✦</span></div><div className="grid gap-3 md:grid-cols-2">{topic.lessons.map((lesson)=><Link key={lesson.id} href={`/lessons/${lesson.id}`} className="group flex items-center gap-4 rounded-2xl border border-[#e4edf3] p-4 hover:border-blue hover:bg-sky"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#eaf3ff] text-2xl text-blue">▶</span><span className="flex-1"><strong className="block group-hover:text-blue">{lesson.title}</strong><small className="text-muted">{lesson._count.questions} Aufgaben · {lesson.description}</small></span><span className="text-blue">→</span></Link>)}</div></section>)}</div></>}{!subject && !error && <p className="text-muted">Fach wird geladen …</p>}</Shell>;
}
