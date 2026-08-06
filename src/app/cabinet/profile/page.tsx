import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";

export default async function ProfilePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, department: true, createdAt: true },
  });
  if (!user) return null;

  const appCount = await prisma.application.count({ where: { userId } });

  const rows = [
    { label: "ФИО",            value: user.name },
    { label: "Email",           value: user.email },
    { label: "Подразделение",   value: user.department ?? "—" },
    { label: "Зарегистрирован", value: new Date(user.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) },
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      <Breadcrumb items={[
        { label: 'Кабинет', href: '/cabinet' },
        { label: 'Профиль' },
      ]} />
      <h1 className="glass-section-title" style={{ marginBottom: 6 }}>Мой профиль</h1>
      <p className="glass-section-sub">Ваши данные в системе Farovon Awards</p>

      <div className="glass-card">
        {rows.map((r, i) => (
          <div key={r.label}>
            {i > 0 && <hr className="glass-divider" />}
            <div style={{ padding: "14px 0" }}>
              <p className="glass-label" style={{ marginBottom: 2 }}>{r.label}</p>
              <p style={{ color: "#fff", fontSize: 15, margin: 0 }}>{r.value}</p>
            </div>
          </div>
        ))}
        <hr className="glass-divider" />
        <div style={{ padding: "14px 0" }}>
          <p className="glass-label" style={{ marginBottom: 4 }}>Подано заявок</p>
          <p style={{ color: "#C8973A", fontSize: 28, fontWeight: 800, margin: 0 }}>{appCount}</p>
        </div>
      </div>
    </div>
  );
}
