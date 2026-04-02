import { prisma } from '@/lib/prisma';
import ApplyForm from '@/components/ApplyForm';

export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const nominations = await prisma.nomination.findMany({
    where: { isActive: true },
    orderBy: { title: 'asc' },
    select: { id: true, slug: true, title: true },
  });

  return (
    <main className="wrapper">
      <div className="section-title" style={{ marginTop: '40px' }}>
        <div className="kicker">Открытый прием заявок</div>
        <h2>Подача заявки на участие в Farovon Awards</h2>
      </div>
      <ApplyForm nominations={nominations} />
    </main>
  );
}
