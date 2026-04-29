import { NextResponse } from "next/server";
import { generateSupervisorHandover } from "@/lib/aiHandover";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const handover = await generateSupervisorHandover();
  return NextResponse.json(handover);
}
