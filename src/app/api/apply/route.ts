import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
<<<<<<< HEAD
import { auth } from '@/auth';

const MAX_BODY = 100 * 1024; // 100 KB — the form is text only
const EMAIL_RE = /^[^\s@<>";,]+@[^\s@<>";,]+\.[A-Za-z]{2,}$/;

/**
 * Accepts only a path produced by our own upload handlers.
 * Rejects absolute URLs, protocol-relative "//evil.tld/x", traversal and
 * anything outside the expected prefix — an attacker can POST here directly
 * without ever touching /api/upload.
 */
function localUpload(v: unknown, prefix: string): string | null {
  if (typeof v !== 'string' || v.length === 0 || v.length > 200) return null;
  if (!v.startsWith(prefix)) return null;
  if (v.startsWith(prefix + '/')) return null; // blocks "//evil.tld/..."
  if (v.includes('..') || v.includes('\\') || v.includes('://')) return null;
  if (!/^[A-Za-z0-9._/-]+$/.test(v)) return null;
  return v;
}

function httpLink(v: unknown): string | null {
  if (typeof v !== 'string' || v.length === 0 || v.length > 2000) return null;
  return /^https?:\/\/[^\s<>"']+$/i.test(v) ? v : null;
}

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY) {
      return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 });
    }

    const session = await auth();
    // userId comes from the verified session only — never from the request body
    const userId = (session?.user as any)?.id ?? null;

    const data = await req.json();

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 });
    }

    if (!data.nominationId && !data.nominationSlug) {
      return NextResponse.json({ error: 'Номинация не указана' }, { status: 400 });
    }

    // Nomination must already exist, be active, and accept applications
    const nomination = await prisma.nomination.findFirst({
      where: data.nominationId
        ? { id: String(data.nominationId), isActive: true, acceptsApplications: true }
        : { slug: String(data.nominationSlug), isActive: true, acceptsApplications: true },
    });

    if (!nomination) {
      return NextResponse.json(
        { error: 'Номинация не найдена или не принимает заявки' },
        { status: 404 }
      );
    }

    // Reject bad links loudly rather than silently nulling them, so a broken
    // legitimate client is visible instead of quietly losing the attachment.
    const photoUrl = data.photoUrl ? localUpload(data.photoUrl, '/uploads/') : null;
    if (data.photoUrl && !photoUrl) {
      return NextResponse.json({ error: 'Некорректная ссылка на фото' }, { status: 400 });
    }

    const presentationUrl = data.presentationUrl
      ? localUpload(data.presentationUrl, '/uploads/presentations/')
      : null;
    if (data.presentationUrl && !presentationUrl) {
      return NextResponse.json({ error: 'Некорректная ссылка на презентацию' }, { status: 400 });
    }

    const materialsLink = data.materialsLink ? httpLink(data.materialsLink) : null;
    if (data.materialsLink && !materialsLink) {
      return NextResponse.json({ error: 'Некорректная ссылка на материалы' }, { status: 400 });
    }

    const applicantEmail =
      typeof data.email === 'string' && EMAIL_RE.test(data.email.trim())
        ? data.email.trim().slice(0, 200)
        : null;
    if (data.email && !applicantEmail) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
    }

    const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '');
    const bool = (v: unknown) => v === true || v === 'true';

    const application = await prisma.application.create({
      data: {
        nominationId: nomination.id,
        ...(userId ? { userId } : {}),
        ...(photoUrl ? { photoUrl } : {}),
        ...(presentationUrl
          ? { presentationUrl, presentationName: str(data.presentationName, 255) || null }
          : {}),
        employeeData: JSON.stringify({
          name:       str(data.name, 200),
          email:      applicantEmail ?? '',
          department: str(data.department, 200),
          position:   str(data.position, 200),
          phone:      str(data.phone, 50),
        }),
        formData: JSON.stringify(
          data.projectName
            ? {
                managerName:          str(data.managerName),
                projectName:          str(data.projectName),
                projectDescription:   str(data.projectDescription, 5000),
                category:             Array.isArray(data.category) ? data.category.slice(0, 10).map(String) : [],
                implementationStatus: str(data.implementationStatus, 50),
                implementationPlace:  str(data.implementationPlace),
                problemsSolved:       str(data.problemsSolved, 5000),
                resultsSummary:       str(data.resultsSummary, 5000),
                startDate:            str(data.startDate, 20),
                endDate:              str(data.endDate, 20),
                actualResults:        str(data.actualResults, 5000),
                baselineValue:        str(data.baselineValue),
                actualValue:          str(data.actualValue),
                achievedEffect:       str(data.achievedEffect, 2000),
                calcMethod:           str(data.calcMethod, 2000),
                expectedEffect:       str(data.expectedEffect),
                expectedSavings:      str(data.expectedSavings),
                effectJustification:  str(data.effectJustification, 2000),
                plannedStartDate:     str(data.plannedStartDate, 20),
                plannedEndDate:       str(data.plannedEndDate, 20),
                scope:                str(data.scope, 50),
                hasParticipants:      str(data.hasParticipants, 10),
                participants:         str(data.participants, 2000),
                materialsLink:        materialsLink ?? '',
                confirmAccuracy:      bool(data.confirmAccuracy),
                managerApproved:      bool(data.managerApproved),
              }
            : { projectText: str(data.projectText, 5000) }
        ),
      },
    });

    // Email failures must not fail the submission
    try {
      if (applicantEmail) {
        await sendEmail(
          applicantEmail,
          'Успешная подача заявки – Farovon Awards',
          `Здравствуйте, ${str(data.name, 100)}!\nВаша заявка на номинацию "${nomination.title}" успешно зарегистрирована!\n\nHR отдел свяжется с вами при необходимости.`
        );
      }
      await sendEmail(
        'hr@farovon.com',
        'Новая заявка (Farovon Awards)',
        `Новая заявка от ${str(data.name, 100)} (${str(data.position, 100)}) по номинации "${nomination.title}".\nОтдел: ${str(data.department, 100)}`
      );
    } catch (emailErr) {
      console.error('Email error:', emailErr);
    }

    return NextResponse.json({ success: true, id: application.id });
  } catch (error) {
    console.error('Apply API Error:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при подаче заявки. Попробуйте позже.' },
      { status: 500 }
    );
=======

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Auto-create nomination if missing just for MVP
    let nomination = await prisma.nomination.findFirst({
      where: { slug: data.nominationSlug }
    });
    
    if (!nomination) {
      nomination = await prisma.nomination.create({
         data: {
           slug: data.nominationSlug || 'basic-nomination',
           title: data.nominationTitle || 'Основная номинация',
           description: "Автоматически созданная номинация",
           criteria: "[]",
           steps: "[]",
           tags: "[]"
         }
      });
    }

    const application = await prisma.application.create({
      data: {
        nominationId: nomination.id,
        employeeData: JSON.stringify({
          name: data.name,
          email: data.email,
          department: data.department,
          position: data.position,
          phone: data.phone,
        }),
        formData: JSON.stringify({
          projectText: data.projectText,
        }),
      }
    });

    if (data.email) {
      await sendEmail(
        data.email, 
        'Успешная подача заявки – Farovon Awards', 
        `Здравствуйте, ${data.name}!\nВаша заявка на номинацию "${data.nominationTitle}" успешно зарегистрирована!\n\nHR отдел свяжется с вами при необходимости.`
      );
    }
    await sendEmail(
      'hr@farovon.com', 
      'Новая заявка (Farovon Awards)', 
      `Поступила новая заявка от ${data.name} на позицию ${data.position} по номинации "${data.nominationTitle}".\nОтдел: ${data.department}\nОбоснование: ${data.projectText}`
    );

    return NextResponse.json({ success: true, id: application.id });

  } catch (error: any) {
    console.error('Apply API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  }
}
