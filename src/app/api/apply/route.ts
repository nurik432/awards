import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

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
  }
}
