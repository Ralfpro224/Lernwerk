export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type UserView = { id: string; email: string; displayName: string; role: Role; avatarColor: string; createdAt: string };
export type QuestionView = { id: string; type: string; prompt: string; config: Record<string, unknown>; points: number; sortOrder: number };
export type LessonView = { id: string; title: string; description: string; topic: { id: string; title: string; grade: number; subject: { id: string; slug: string; title: string; color: string; icon: string } }; questions: QuestionView[] };
export type CatalogLesson = { id: string; title: string; description: string; _count: { questions: number } };
export type CatalogTopic = { id: string; title: string; description: string; grade: number; lessons: CatalogLesson[] };
export type CatalogSubject = { id: string; slug: string; title: string; description: string; color: string; icon: string; topics: CatalogTopic[] };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data as T;
}

export function postJson<T>(path: string, data: unknown): Promise<T> {
  return api<T>(path, { method: "POST", body: JSON.stringify(data) });
}
