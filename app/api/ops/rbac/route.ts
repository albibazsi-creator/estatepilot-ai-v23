import { NextResponse } from "next/server";
import { roleMatrix } from "@/lib/rbac-policy";

export async function GET() {
  return NextResponse.json({ matrix: roleMatrix() });
}
