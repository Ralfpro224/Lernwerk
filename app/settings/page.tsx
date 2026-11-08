"use client";

import { useEffect, useState } from "react";
import { AccessGate } from "@/components/AccessGate";
import { Shell } from "@/components/Shell";

export default function SettingsPage() {
  const [large, setLarge] = useState(false);
  const [contrast, setContrast] = useState(false);
  useEffect(()=>{setLarge(localStorage.getItem("lernwerk-large-text")==="true");setContrast(localStorage.getItem("lernwerk-high-contrast")==="true");},[]);
  useEffect(()=>{document.body.dataset.largeText=String(large);localStorage.setItem("lernwerk-large-text",String(large));},[large]);
  useEffect(()=>{document.body.dataset.highContrast=String(contrast);localStorage.setItem("lernwerk-high-contrast",String(contrast));},[contrast]);
  return <Shell title="Einstellungen" eyebrow="Dein Lernraum"><AccessGate><div className="card max-w-2xl p-7"><h2 className="text-xl font-black">Bedienungshilfen</h2><p className="mt-2 text-muted">Diese Einstellungen gelten für diesen Browser.</p><label className="mt-7 flex items-center justify-between gap-4 border-t border-[#e4edf3] py-5"><span><strong className="block">Größere Schrift</strong><small className="text-muted">Texte leichter lesen</small></span><input type="checkbox" className="h-5 w-5 accent-blue" checked={large} onChange={(e)=>setLarge(e.target.checked)} /></label><label className="flex items-center justify-between gap-4 border-t border-[#e4edf3] py-5"><span><strong className="block">Mehr Kontrast</strong><small className="text-muted">Farben deutlicher unterscheiden</small></span><input type="checkbox" className="h-5 w-5 accent-blue" checked={contrast} onChange={(e)=>setContrast(e.target.checked)} /></label></div></AccessGate></Shell>;
}
