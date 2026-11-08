"use client";

import Link from "next/link";
import { useSession } from "@/components/SessionProvider";
import type { Role } from "@/lib/web-api";

export function AccessGate({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, loading } = useSession();
  if (loading) return <div className="card p-8 text-muted" role="status">Konto wird geladen …</div>;
  if (!user) return <div className="card max-w-xl p-8"><h2 className="text-2xl font-black">Melde dich an</h2><p className="mt-2 text-muted">Für deinen Fortschritt und deine Klassen benötigst du ein Konto.</p><Link href="/login" className="button button-primary mt-5">Zur Anmeldung</Link></div>;
  if (roles && !roles.includes(user.role)) return <div className="error-box">Dieser Bereich ist für deine Rolle nicht freigegeben.</div>;
  return <>{children}</>;
}
