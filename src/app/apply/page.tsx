import { prisma } from '@/lib/prisma';
import ApplyForm from '@/components/ApplyForm';
<<<<<<< HEAD
import Breadcrumb from '@/components/Breadcrumb';

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ nomination?: string }> }) {
  const { nomination: preselectedId } = await searchParams;

  const nominations = await prisma.nomination.findMany({
    where: { isActive: true, acceptsApplications: true },
    orderBy: { title: 'asc' },
    select: { id: true, slug: true, title: true, formType: true },
=======

export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const nominations = await prisma.nomination.findMany({
    where: { isActive: true },
    orderBy: { title: 'asc' },
    select: { id: true, slug: true, title: true },
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  });

  return (
    <main className="wrapper">
<<<<<<< HEAD
      <Breadcrumb items={[
        { label: 'Главная', href: '/' },
        { label: 'Подать заявку' },
      ]} />
      <div className="section-title" style={{ marginTop: '8px' }}>
        <div className="kicker">Открытый прием заявок</div>
        <h2>Подача заявки на участие в Farovon Awards</h2>
      </div>
      <ApplyForm nominations={nominations} preselectedId={preselectedId} />
=======
      <div className="section-title" style={{ marginTop: '40px' }}>
        <div className="kicker">Открытый прием заявок</div>
        <h2>Подача заявки на участие в Farovon Awards</h2>
      </div>
      <ApplyForm nominations={nominations} />
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
    </main>
  );
}
