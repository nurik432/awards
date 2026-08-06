import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import AppNav from "@/components/AppNav";

const CABINET_NAV = [
  { href: '/cabinet',         label: 'Мои заявки' },
  { href: '/cabinet/apply',   label: 'Подать заявку' },
  { href: '/cabinet/profile', label: 'Профиль' },
  { href: '/',                label: '← На сайт', faded: true },
];

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== 'EMPLOYEE') redirect("/login");

  const user = session.user as any;

  return (
    <div className="glass-page">
      <div className="wrapper">
        <header className="site-topbar cabinet-topbar-wrap">
          <div className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/image_1.png" alt="Логотип Фаровон" />
            <div className="brand-copy">
              <span>Корпоративная премия</span>
              <strong>Farovon Awards</strong>
            </div>
          </div>

          <AppNav items={CABINET_NAV} />

          <div className="topbar-auth">
            <span className="topbar-auth-name">{user?.name}</span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" className="btn btn-secondary btn-topbar-sm">
                Выйти
              </button>
            </form>
          </div>
        </header>

        <main className="cabinet-main">
          {children}
        </main>
      </div>
    </div>
  );
}
