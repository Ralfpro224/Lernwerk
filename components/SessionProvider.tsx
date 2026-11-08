"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, type UserView } from "@/lib/web-api";

type SessionValue = { user: UserView | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };
const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserView | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { const result = await api<{ user: UserView | null }>("/api/auth/me"); setUser(result.user); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const logout = async () => { await api("/api/auth/logout", { method: "POST" }); setUser(null); window.location.href = "/"; };
  return <SessionContext.Provider value={{ user, loading, refresh, logout }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider missing");
  return context;
}
