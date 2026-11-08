"use client";

import { useEffect, useState } from "react";
import { AccessGate } from "@/components/AccessGate";
import { Shell } from "@/components/Shell";
import { useSession } from "@/components/SessionProvider";
import { api } from "@/lib/web-api";

const milestones = [{ points: 10, title: "Erster Funke", icon: "✧" }, { points: 30, title: "Neugierig", icon: "✦" }, { points: 60, title: "Dranbleiber", icon: "★" }, { points: 100, title: "Wissensreise", icon: "✳" }];

export default function RewardsPage() {
  const { user } = useSession();
  const [points, setPoints] = useState(0);
  useEffect(()=>{ if(user) api<{points:number}>("/api/progress").then((r)=>setPoints(r.points)).catch(()=>{}); },[user]);
  return <Shell title="Deine Belohnungen" eyebrow="Sammle und wachse"><AccessGate><div className="card mb-7 bg-[#fff7df] p-8 text-center"><div className="text-6xl text-[#e8ac29]">✦</div><p className="mt-3 text-sm font-bold uppercase tracking-widest text-[#956c1b]">Gesammelt</p><p className="mt-1 text-5xl font-black text-ink">{points} Punkte</p><p className="mt-3 text-muted">Richtige Antworten bringen beim ersten Lösen Punkte.</p></div><h2 className="mb-5 text-2xl font-black">Meilensteine</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{milestones.map((m)=><div key={m.points} className={`card p-6 ${points < m.points ? "opacity-55" : "border-[#f6cf6a]"}`}><div className="text-5xl text-[#e8ac29]">{m.icon}</div><h3 className="mt-4 text-lg font-black">{m.title}</h3><p className="mt-1 text-sm text-muted">Ab {m.points} Punkten</p><span className="badge mt-4">{points >= m.points ? "Freigeschaltet" : `${m.points-points} Punkte fehlen`}</span></div>)}</div></AccessGate></Shell>;
}
