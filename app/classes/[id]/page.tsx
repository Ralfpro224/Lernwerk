"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AccessGate } from "@/components/AccessGate";
import { Shell } from "@/components/Shell";
import { useSession } from "@/components/SessionProvider";
import { api, postJson, type CatalogSubject } from "@/lib/web-api";

type Assignment = { id: string; dueAt: string | null; lesson: { id: string; title: string } };
type Classroom = { id: string; name: string; joinCode?: string; teacher: { id: string; displayName: string }; members?: Array<{ user: { id: string; displayName: string; email: string } }>; assignments: Assignment[] };

export default function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [name, setName] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canEdit = user?.role === "ADMIN" || classroom?.teacher.id === user?.id;
  const load = () => api<{classroom:Classroom}>(`/api/classes/${id}`).then((r)=>{setClassroom(r.classroom);setName(r.classroom.name);}).catch((e)=>setError(e.message));
  useEffect(()=>{if(user){void load();api<{subjects:CatalogSubject[]}>("/api/catalog").then((r)=>setSubjects(r.subjects)).catch(()=>{});}},[user,id]);
  const lessons = subjects.flatMap((s)=>s.topics.flatMap((t)=>t.lessons.map((l)=>({id:l.id,label:`${s.title} · ${l.title}`}))));
  async function rename(event:FormEvent){event.preventDefault();try{await api(`/api/classes/${id}`,{method:"PATCH",body:JSON.stringify({name})});setMessage("Name gespeichert.");await load();}catch(e){setError(e instanceof Error?e.message:"Fehler");}}
  async function assign(event:FormEvent){event.preventDefault();try{await postJson("/api/assignments",{classId:id,lessonId,dueAt:dueAt?new Date(dueAt).toISOString():null});setMessage("Lektion zugewiesen.");setLessonId("");await load();}catch(e){setError(e instanceof Error?e.message:"Fehler");}}
  async function removeAssignment(assignmentId:string){try{await api(`/api/assignments/${assignmentId}`,{method:"DELETE"});await load();}catch(e){setError(e instanceof Error?e.message:"Fehler");}}
  async function deleteClass(){if(!confirm("Diese Klasse und ihre Aufträge wirklich löschen?"))return;try{await api(`/api/classes/${id}`,{method:"DELETE"});router.push("/classes");}catch(e){setError(e instanceof Error?e.message:"Fehler");}}
  return <Shell title={classroom?.name ?? "Klasse"} eyebrow="Gemeinsam lernen"><AccessGate><Link href="/classes" className="mb-6 inline-flex font-bold text-blue">← Alle Klassen</Link>{error && <p role="alert" className="error-box mb-5">{error}</p>}{message && <p role="status" className="success-box mb-5">{message}</p>}{classroom && <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><section className="card p-6"><h2 className="text-2xl font-black">Lernaufträge</h2><p className="mt-1 text-muted">Von {classroom.teacher.displayName}</p><div className="mt-5 space-y-3">{classroom.assignments.map((item)=><div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#e2edf5] p-4"><Link href={`/lessons/${item.lesson.id}`} className="flex-1 font-bold text-blue hover:underline">{item.lesson.title}<span className="block text-sm font-normal text-muted">{item.dueAt ? `Bis ${new Date(item.dueAt).toLocaleDateString("de")}` : "Ohne Frist"}</span></Link>{canEdit && <button className="button button-danger !min-h-9 !px-3" onClick={()=>void removeAssignment(item.id)}>Entfernen</button>}</div>)}{classroom.assignments.length===0 && <p className="text-muted">Noch keine Lektionen zugewiesen.</p>}</div></section><div className="space-y-6">{canEdit && <><div className="card p-6"><h2 className="text-xl font-black">Lektion zuweisen</h2><form className="mt-4 space-y-3" onSubmit={(e)=>void assign(e)}><label className="block"><span className="label">Lektion</span><select className="field" value={lessonId} onChange={(e)=>setLessonId(e.target.value)} required><option value="">Auswählen</option>{lessons.map((l)=><option key={l.id} value={l.id}>{l.label}</option>)}</select></label><label className="block"><span className="label">Frist (optional)</span><input type="date" className="field" value={dueAt} onChange={(e)=>setDueAt(e.target.value)} /></label><button className="button button-primary">Zuweisen</button></form></div><div className="card p-6"><h2 className="text-xl font-black">Klasse verwalten</h2><form className="mt-4 flex gap-2" onSubmit={(e)=>void rename(e)}><input aria-label="Klassenname" className="field" value={name} onChange={(e)=>setName(e.target.value)} minLength={2} required /><button className="button button-secondary">Speichern</button></form><p className="mt-4 text-sm text-muted">Einladungscode: <strong className="select-all text-ink">{classroom.joinCode}</strong></p><button className="button button-danger mt-4" onClick={()=>void deleteClass()}>Klasse löschen</button></div><div className="card p-6"><h2 className="text-xl font-black">Mitglieder</h2><ul className="mt-4 space-y-2">{classroom.members?.map((item)=><li key={item.user.id} className="rounded-xl bg-[#f6f9fc] p-3"><strong>{item.user.displayName}</strong><span className="block text-sm text-muted">{item.user.email}</span></li>)}</ul></div></>}</div></div>}</AccessGate></Shell>;
}
