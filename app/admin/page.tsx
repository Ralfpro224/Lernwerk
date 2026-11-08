"use client";

import { AccessGate } from "@/components/AccessGate";
import { AdminWorkspace } from "@/components/AdminWorkspace";
import { Shell } from "@/components/Shell";

export default function AdminPage(){return <Shell title="Verwaltung" eyebrow="Inhalte & Personen"><AccessGate roles={["ADMIN"]}><AdminWorkspace /></AccessGate></Shell>;}
