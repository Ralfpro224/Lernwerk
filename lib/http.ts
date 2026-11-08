import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Ungültige Eingabe", details: error.flatten() }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: "Eintrag existiert bereits" }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Eintrag nicht gefunden" }, { status: 404 });
  }
  // Never return request data, credentials or database internals.
  console.error("API request failed", error instanceof Error ? error.name : "unknown");
  return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const source = new URL(origin);
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const protocol = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  if (source.host !== host || source.protocol !== `${protocol}:`) {
    throw new HttpError(403, "Ursprung nicht erlaubt");
  }
}

export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new HttpError(415, "JSON erforderlich");
  }
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Ungültiges JSON");
  }
}
