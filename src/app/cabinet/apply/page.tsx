import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CabinetApplyForm from "./CabinetApplyForm";
import Breadcrumb from "@/components/Breadcrumb";

export default async function CabinetApplyPage() {
  const session = await auth();
  const user = session?.user as any;

  const nominations = await prisma.nomination.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, title: true, icon: true, description: true, formType: true },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Кабинет', href: '/cabinet' },
        { label: 'Подать заявку' },
      ]} />
      <h1 className="glass-section-title" style={{ marginBottom: 6 }}>Подать заявку</h1>
      <p className="glass-section-sub">Выберите номинацию и заполните форму</p>
      <CabinetApplyForm
        nominations={nominations}
        userName={user?.name ?? ""}
        userEmail={user?.email ?? ""}
        userId={user?.id ?? ""}
      />
    </div>
  );
}
