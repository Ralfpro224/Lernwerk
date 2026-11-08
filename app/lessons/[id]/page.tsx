"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QuestionPlayer } from "@/components/QuestionPlayer";
import { Shell } from "@/components/Shell";
import { useSession } from "@/components/SessionProvider";
import { api, type LessonView } from "@/lib/web-api";

type Progress = { answered: number; correct: number; points: number; completedAt: string | null };

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const [lesson, setLesson] = useState<LessonView | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [earned, setEarned] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => { api<{ lesson: LessonView; progress: Progress | null }>(`/api/lessons/${id}`).then((r)=>{setLesson(r.lesson);setProgress(r.progress);}).catch((e)=>setError(e.message)); }, [id]);
  const total = lesson?.questions.length ?? 0;
  const question = lesson?.questions[index];
  function next() { if (index + 1 < total) { setIndex(index + 1); setSolved(false); } else { setIndex(total); setSolved(false); } }
  return <Shell title={lesson?.title ?? "Lektion"} eyebrow={lesson ? `${lesson.topic.subject.title} · Klasse ${lesson.topic.grade}` : "Lernen"}>{error && <div role="alert" className="error-box">{error}</div>}{lesson && <><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><Link className="font-bold text-blue hover:underline" href={`/subjects/${lesson.topic.subject.slug}`}>← Zurück zum Fach</Link><span className="badge">{progress?.correct ?? 0} richtig · {progress?.points ?? 0} Punkte</span></div><div className="mx-auto mb-8 max-w-3xl"><div className="mb-2 flex justify-between text-sm font-bold text-muted"><span>Dein Weg durch die Lektion</span><span>{Math.min(index + 1,total)} / {total}</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${total ? Math.min(100,((index+(solved?1:0))/total)*100) : 0}%`}} /></div></div>{total === 0 && <div className="card p-8 text-muted">Diese Lektion enthält noch keine Aufgaben.</div>}{question && <><QuestionPlayer key={question.id} question={question} number={index+1} total={total} onCorrect={(r)=>{setSolved(true);setProgress(r.progress);setEarned(earned+r.earned);}} />{solved && <div className="mx-auto mt-5 flex max-w-3xl justify-end"><button className="button button-primary" onClick={next}>{index + 1 < total ? "Nächste Aufgabe →" : "Lektion abschließen →"}</button></div>}</>}{index >= total && total > 0 && <div className="card mx-auto max-w-2xl p-9 text-center"><div className="text-6xl text-gold">✦</div><h2 className="mt-4 text-3xl font-black">Lektion geschafft!</h2><p className="mt-3 text-muted">Du hast {earned} neue Punkte gesammelt. Dein Fortschritt ist gespeichert.</p><div className="mt-7 flex justify-center gap-3"><Link href="/progress" className="button button-primary">Fortschritt ansehen</Link><Link href="/subjects" className="button button-secondary">Weiterlernen</Link></div></div>}{!user && <div className="card mx-auto mt-6 max-w-3xl p-5 text-sm text-muted">Du kannst die Aufgaben ansehen. <Link className="font-bold text-blue" href="/login">Melde dich an</Link>, um Antworten zu prüfen und Fortschritt zu speichern.</div>}</>}{!lesson && !error && <p className="text-muted">Lektion wird geladen …</p>}</Shell>;
}
