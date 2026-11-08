"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccessGate } from "@/components/AccessGate";
import { Shell } from "@/components/Shell";
import { useSession } from "@/components/SessionProvider";
import { api } from "@/lib/web-api";

type Classroom = { id: string; name: string; _count: { members: number; assignments: number } };
export default function TeacherPage() {
  const { user } = useSession();
  const [classes, setClasses] = useState<Classroom[]>([]);
  useEffect(()=>{if(user && user.role!=="STUDENT")api<{classes:Classroom[]}>("/api/classes").then((r)=>setClasses(r.classes)).catch(()=>{});},[user]);
  return <Shell title="Lehrbereich" eyebrow="Gemeinsam fördern"><AccessGate roles={["TEACHER","ADMIN"]}><div className="card mb-7 bg-[#e9f7f0] p-7"><h2 className="text-2xl font-black">Lernräume gestalten</h2><p className="mt-2 max-w-2xl text-muted">Erstelle Klassen, lade Lernende per Code ein und weise passende Lektionen zu.</p><Link href="/classes" className="button button-primary mt-5">Klassen verwalten →</Link></div><h2 className="mb-5 text-2xl font-black">Deine Klassen</h2><div className="grid gap-4 md:grid-cols-2">{classes.map((c)=><Link href={`/classes/${c.id}`} key={c.id} className="card p-6 hover:border-blue"><h3 className="text-xl font-black">{c.name}</h3><p className="mt-2 text-muted">{c._count.members} Mitglieder · {c._count.assignments} Aufträge</p></Link>)}</div>{classes.length===0 && <p className="text-muted">Erstelle deine erste Klasse, um zu beginnen.</p>}</AccessGate></Shell>;
}
