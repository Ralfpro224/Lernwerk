import { NextResponse } from "next/server";
import { currentUser, safeUser } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const user = await currentUser(request);
    return NextResponse.json({ user: user ? safeUser(user) : null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
