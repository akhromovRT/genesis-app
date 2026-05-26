import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { earlyAccessLeads } from "@/db/schema";
import { notifyLead } from "@/lib/telegram";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Введите имя").max(120),
  email: z.string().trim().email("Введите корректный email").max(160),
  phone: z.string().trim().min(5, "Введите телефон").max(40),
  mainPain: z.string().trim().max(500).optional().default(""),
  source: z.string().trim().max(40).optional().default("roundtable"),
  utm: z.record(z.string(), z.string()).optional().default({}),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = leadSchema.parse(body);

    const [row] = await db
      .insert(earlyAccessLeads)
      .values({
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        mainPain: data.mainPain,
        source: data.source,
        utm: data.utm,
      })
      .returning({ id: earlyAccessLeads.id });

    notifyLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      mainPain: data.mainPain,
      source: data.source,
    }).catch((e) => console.error("[early-access] notify failed:", e));

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "validation", details: err.issues },
        { status: 400 }
      );
    }
    console.error("[early-access] error:", err);
    return NextResponse.json(
      { ok: false, error: "internal" },
      { status: 500 }
    );
  }
}
