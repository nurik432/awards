import { prisma } from '@/lib/prisma';
import ApplyForm from '@/components/ApplyForm';
import Breadcrumb from '@/components/Breadcrumb';

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ nomination?: string }> }) {
  const { nomination: preselectedId } = await searchParams;

  const nominations = await prisma.nomination.findMany({
    where: { isActive: true, acceptsApplications: true },
    orderBy: { title: 'asc' },
    select: { id: true, slug: true, title: true, formType: true },
  });

  return (
    <main className="wrapper">
      <Breadcrumb items={[
        { label: 'Главная', href: '/' },
        { label: 'Подать заявку' },
      ]} />
      <div className="section-title" style={{ marginTop: '8px' }}>
        <div className="kicker">Открытый прием заявок</div>
        <h2>Подача заявки на участие в Farovon Awards</h2>
      </div>
      <ApplyForm nominations={nominations} preselectedId={preselectedId} />
    </main>
  );
}
