import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const TERMINAL = ['APPROVED', 'REJECTED'];

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  if (!session || (role !== 'JUDGE' && role !== 'ADMIN'))
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });

  // The env-based admin has no User row, so judgeId would violate the FK.
  if (!userId || userId === 'admin')
    return NextResponse.json(
      { error: 'Оценка доступна только members комиссии с учётной записью' },
      { status: 403 }
    );

  try {
    const { applicationId, score, comment } = await req.json();

    if (!applicationId || typeof applicationId !== 'string')
      return NextResponse.json({ error: 'applicationId обязателен' }, { status: 400 });

    if (!Number.isInteger(score) || score < 1 || score > 10)
      return NextResponse.json({ error: 'Балл должен быть целым числом от 1 до 10' }, { status: 400 });

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { userId: true, status: true },
    });

    if (!app) return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });

    // A judge must not be able to change scoring after an admin already decided.
    if (TERMINAL.includes(app.status))
      return NextResponse.json(
        { error: 'Заявка уже рассмотрена администратором' },
        { status: 409 }
      );

    // A judge must not score their own application.
    if (app.userId && app.userId === userId)
      return NextResponse.json({ error: 'Нельзя оценивать собственную заявку' }, { status: 403 });

    const juryScore = await prisma.juryScore.upsert({
      where: { applicationId_judgeId: { applicationId, judgeId: userId } },
      create: {
        applicationId,
        judgeId: userId,
        score,
        comment: typeof comment === 'string' ? comment.slice(0, 2000) : null,
      },
      update: {
        score,
        comment: typeof comment === 'string' ? comment.slice(0, 2000) : null,
      },
    });

    // Mirror the average onto the legacy Application.score field.
    const allScores = await prisma.juryScore.findMany({ where: { applicationId } });
    if (allScores.length > 0) {
      const avg = Math.round(allScores.reduce((s, j) => s + j.score, 0) / allScores.length);
      await prisma.application.update({ where: { id: applicationId }, data: { score: avg } });
    }

    return NextResponse.json({ success: true, juryScore });
  } catch (error) {
    console.error('Jury score error:', error);
    return NextResponse.json({ error: 'Ошибка сохранения оценки' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'JUDGE' && role !== 'ADMIN'))
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const nominationSlug = searchParams.get('nominationSlug');

  const where = nominationSlug
    ? { application: { nomination: { slug: nominationSlug } } }
    : {};

  const scores = await prisma.juryScore.findMany({
    where,
    take: 2000,
    include: {
      judge: { select: { id: true, name: true } },
      application: { select: { id: true, nominationId: true } },
    },
  });

  return NextResponse.json(scores);
}
