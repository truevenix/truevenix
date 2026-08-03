import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS,
  });
}

export async function GET() {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: CORS }
      );
    }

    const promoCodes = await db.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ promoCodes }, { headers: CORS });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: CORS }
    );
  }
}

const Schema = z.object({
  code: z.string().min(3).transform((v) => v.trim().toUpperCase()),
  percentage: z.number().min(1).max(100),
  expiresAt: z.string().datetime().optional(),
  usageLimit: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: CORS }
      );
    }

    const body = await req.json();

    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: CORS }
      );
    }

    const promo = await db.promoCode.create({
      data: {
        code: parsed.data.code,
        percentage: parsed.data.percentage,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
        usageLimit: parsed.data.usageLimit,
      },
    });

    return NextResponse.json(
      {
        success: true,
        promo,
      },
      {
        status: 201,
        headers: CORS,
      }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      {
        status: 500,
        headers: CORS,
      }
    );
  }
}