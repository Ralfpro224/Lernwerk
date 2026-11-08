import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = { title: "Lernwerk – Lernen, das weiterbringt", description: "Eigenständige Lernplattform für Schule und Zuhause." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body><SessionProvider>{children}</SessionProvider></body></html>;
}
