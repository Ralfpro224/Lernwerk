"use client";

import { useMemo, useState } from "react";
import type { QuestionView } from "@/lib/web-api";
import { postJson } from "@/lib/web-api";

type Choice = { id: string; label: string; shape?: string };
type Pair = { id: string; label: string };
type Verdict = { correct: boolean; feedback: string; earned: number; progress: { answered: number; correct: number; points: number; completedAt: string | null } };

function items(value: unknown): Choice[] {
  return Array.isArray(value) ? value.filter((x): x is Choice => !!x && typeof x.id === "string" && typeof x.label === "string") : [];
}

export function QuestionPlayer({ question, number, total, onCorrect }: { question: QuestionView; number: number; total: number; onCorrect: (result: Verdict) => void }) {
  const config = question.config ?? {};
  const choices = useMemo(() => items(config.choices), [config]);
  const left = useMemo(() => items(config.left) as Pair[], [config]);
  const right = useMemo(() => items(config.right) as Pair[], [config]);
  const blanks = useMemo(() => items(config.blanks) as Pair[], [config]);
  const sortItems = useMemo(() => items(config.items), [config]);
  const [value, setValue] = useState<unknown>(question.type === "ORDERING" ? sortItems.map((x)=>x.id) : question.type === "MULTIPLE_CHOICE" ? [] : ["CLOZE","MATCHING"].includes(question.type) ? {} : "");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selected = String(value);
  const selectedMany = Array.isArray(value) ? value as string[] : [];
  const mapped = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, string> : {};
  const canSubmit = question.type === "ORDERING" ? selectedMany.length > 0 : question.type === "MULTIPLE_CHOICE" ? selectedMany.length > 0 : ["CLOZE","MATCHING"].includes(question.type) ? Object.keys(mapped).length === (question.type === "CLOZE" ? blanks.length : left.length) && Object.values(mapped).every(Boolean) : selected.trim().length > 0;

  async function submit() {
    setBusy(true); setError("");
    try {
      const result = await postJson<Verdict>("/api/attempts", { questionId: question.id, response: value });
      setVerdict(result);
      if (result.correct) onCorrect(result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Antwort konnte nicht geprüft werden"); }
    finally { setBusy(false); }
  }

  function move(id: string, direction: -1 | 1) {
    const arr = [...selectedMany]; const index = arr.indexOf(id); const target = index + direction;
    if (index < 0 || target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]]; setValue(arr);
  }

  return <div className="card mx-auto max-w-3xl p-6 md:p-9"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="badge">Aufgabe {number} von {total}</span><span className="font-bold text-muted">{question.points} Punkte</span></div><h2 className="mb-7 text-2xl font-black leading-snug md:text-3xl">{question.prompt}</h2>
    {(["SINGLE_CHOICE","MULTIPLE_CHOICE","IMAGE"].includes(question.type)) && <div className={`grid gap-3 ${question.type === "IMAGE" ? "sm:grid-cols-3" : ""}`}>{choices.map((choice) => { const active = question.type === "MULTIPLE_CHOICE" ? selectedMany.includes(choice.id) : selected === choice.id; return <button type="button" key={choice.id} aria-pressed={active} className={`choice ${active ? "choice-selected" : ""} ${question.type === "IMAGE" ? "text-center" : ""}`} onClick={() => question.type === "MULTIPLE_CHOICE" ? setValue(active ? selectedMany.filter((id)=>id!==choice.id) : [...selectedMany,choice.id]) : setValue(choice.id)}>{question.type === "IMAGE" && <div className={`shape shape-${choice.shape || "circle"}`} aria-hidden />}<span>{choice.label}</span></button>; })}</div>}
    {(["TEXT","MATH"].includes(question.type)) && <div className="max-w-md"><label className="label" htmlFor="answer-input">Deine Antwort</label><div className="flex items-center gap-3"><input id="answer-input" className="field" type={question.type === "MATH" ? "text" : "text"} inputMode={question.type === "MATH" ? "decimal" : "text"} placeholder={typeof config.placeholder === "string" ? config.placeholder : "Antwort eingeben"} value={selected} onChange={(e)=>setValue(e.target.value)} /><span className="font-bold text-muted">{String(config.unit ?? "")}</span></div></div>}
    {question.type === "CLOZE" && <div className="grid gap-4 sm:grid-cols-2">{blanks.map((blank)=><label key={blank.id} className="block"><span className="label">{blank.label}</span><input className="field" value={mapped[blank.id] ?? ""} onChange={(e)=>setValue({ ...mapped, [blank.id]: e.target.value })} placeholder="Wort ergänzen" /></label>)}</div>}
    {question.type === "MATCHING" && <div className="space-y-3">{left.map((item)=><label key={item.id} className="flex flex-col gap-2 rounded-xl bg-[#f6f9fc] p-4 sm:flex-row sm:items-center"><span className="flex-1 font-bold">{item.label}</span><select className="field sm:max-w-48" aria-label={`Zuordnung für ${item.label}`} value={mapped[item.id] ?? ""} onChange={(e)=>setValue({ ...mapped, [item.id]: e.target.value })}><option value="">Ergebnis wählen</option>{right.map((option)=><option value={option.id} key={option.id}>{option.label}</option>)}</select></label>)}</div>}
    {question.type === "ORDERING" && <div className="space-y-2">{selectedMany.map((id,index)=>{ const item=sortItems.find((x)=>x.id===id); return <div key={id} className="flex items-center gap-3 rounded-xl border border-[#dce8f0] bg-white p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-sky font-black text-blue">{index+1}</span><strong className="flex-1">{item?.label ?? id}</strong><button type="button" className="icon-button" aria-label={`${item?.label ?? id} nach oben`} disabled={index===0} onClick={()=>move(id,-1)}>↑</button><button type="button" className="icon-button" aria-label={`${item?.label ?? id} nach unten`} disabled={index===selectedMany.length-1} onClick={()=>move(id,1)}>↓</button></div>;})}</div>}
    {question.type === "INTERACTIVE" && <div><p className="mb-4 text-muted">Tippe auf die passende Stelle.</p><div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(15,Math.max(1,Number(config.max ?? 10)-Number(config.min ?? 0)+1))},minmax(0,1fr))` }}>{Array.from({length:Math.min(15,Math.max(1,Number(config.max ?? 10)-Number(config.min ?? 0)+1))},(_,i)=>String(Number(config.min ?? 0)+i)).map((n)=><button key={n} type="button" aria-pressed={selected===n} className={`rounded-lg border-2 py-3 text-center font-black ${selected===n ? "border-blue bg-blue text-white" : "border-[#dce8f0] bg-white hover:bg-sky"}`} onClick={()=>setValue(n)}>{n}</button>)}</div></div>}
    {error && <p role="alert" className="error-box mt-6">{error}</p>}{verdict && <p role="status" className={`mt-6 ${verdict.correct ? "success-box" : "error-box"}`}>{verdict.feedback}{verdict.earned > 0 ? ` +${verdict.earned} Punkte` : ""}</p>}
    <div className="mt-7 flex items-center justify-end gap-3">{verdict && !verdict.correct && <button className="button button-secondary" onClick={()=>setVerdict(null)}>Erneut versuchen</button>}<button className="button button-primary" onClick={()=>void submit()} disabled={!canSubmit || busy || !!verdict?.correct}>{busy ? "Prüfe …" : "Antwort prüfen"}</button></div>
  </div>;
}
