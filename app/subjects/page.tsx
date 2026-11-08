"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { SubjectCard } from "@/components/SubjectCard";
import { api, type CatalogSubject } from "@/lib/web-api";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { api<{ subjects: CatalogSubject[] }>("/api/catalog").then((r) => setSubjects(r.subjects)).catch((e) => setError(e.message)); }, []);
  const filtered = subjects.filter((s) => `${s.title} ${s.description}`.toLowerCase().includes(search.toLowerCase()));
  return <Shell title="Wähle dein Fach" eyebrow="Entdecken"><div className="mb-7 max-w-xl"><label htmlFor="subject-search" className="label">Fach suchen</label><input id="subject-search" className="field" placeholder="Zum Beispiel Mathematik" value={search} onChange={(e)=>setSearch(e.target.value)} /></div>{error && <div className="error-box mb-5">{error}</div>}<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}</div>{!error && subjects.length === 0 && <p className="mt-6 text-muted">Fächer werden geladen …</p>}{subjects.length > 0 && filtered.length === 0 && <p className="text-muted">Keine passenden Fächer gefunden.</p>}</Shell>;
}
