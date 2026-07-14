import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "manual_mvp",
    message: "MVP-ben manuális csomagértékesítés. Következő lépés: Stripe/Barion checkout session."
  });
}
