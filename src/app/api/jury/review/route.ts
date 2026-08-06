import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TERMINAL = ["APPROVED", "REJECTED"];

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== "JUDGE") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const { appId, reviewNote } = await req.json();

    if (!appId || typeof appId !== "string") {
      return NextResponse.json({ error: "appId обязателен" }, { status: 400 });
    }

    const app = await prisma.application.findUnique({
      where: { id: appId },
      select: { status: true },
    });

    if (!app) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    // A judge must not be able to reopen what an admin already decided.
    if (TERMINAL.includes(app.status)) {
      return NextResponse.json(
        { error: "Заявка уже рассмотрена администратором" },
        { status: 409 }
      );
    }

    const note = typeof reviewNote === "string" ? reviewNote.trim().slice(0, 2000) : "";

    // Judges can only add a note and move the application into review —
    // approving or rejecting stays an admin decision.
    await prisma.application.update({
      where: { id: appId },
      data: {
        ...(note ? { reviewNote: note } : {}), // never blank an existing note
        status: "REVIEW",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Jury review error:", e);
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}
