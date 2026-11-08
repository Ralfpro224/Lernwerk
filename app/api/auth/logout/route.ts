import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";
import { assertSameOrigin, errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const response = NextResponse.json({ ok: true });
    await endSession(request, response);
    return response;
  } catch (error) { return errorResponse(error); }
}
