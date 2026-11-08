import Link from "next/link";
import type { CatalogSubject } from "@/lib/web-api";

export function SubjectCard({ subject }: { subject: CatalogSubject }) {
  const lessonCount = subject.topics.reduce((sum, topic) => sum + topic.lessons.length, 0);
  return <Link href={`/subjects/${subject.slug}`} className="card group block overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-lg"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-4xl text-white" style={{ background: subject.color }}>{subject.icon}</div><h3 className="text-xl font-black group-hover:text-blue">{subject.title}</h3><p className="mt-2 min-h-12 text-sm leading-relaxed text-muted">{subject.description}</p><div className="mt-5 flex items-center justify-between"><span className="badge">{lessonCount} Lektion{lessonCount === 1 ? "" : "en"}</span><span className="font-black text-blue" aria-hidden>→</span></div></Link>;
}
