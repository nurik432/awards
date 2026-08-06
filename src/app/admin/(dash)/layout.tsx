import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminNav from "./AdminNav"
import "./admin.css"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as any)?.role
  // Defense in depth: layout also checks auth (proxy.ts is primary protection)
  if (!session || role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const pendingCount = await prisma.application.count({ where: { status: 'PENDING' } })
  const name = session.user?.name ?? 'Admin'

  return (
    <div className="adm-shell">
      <div className="adm-body">
        <aside className="adm-sidebar">
          <a href="/admin" className="adm-brand">
            <span className="adm-brand-mark" aria-hidden>🏆</span>
            <span>
              <span className="adm-brand-name">Farovon Awards</span>
              <span className="adm-brand-sub">Панель управления</span>
            </span>
          </a>

          <AdminNav pendingCount={pendingCount} />

          <div className="adm-sidebar-foot">
            <div className="adm-user">
              <span className="adm-avatar" aria-hidden>{name.slice(0, 1).toUpperCase()}</span>
              <span>
                <span className="adm-user-name">{name}</span>
                <span className="adm-user-role">Администратор</span>
              </span>
            </div>
            <a href="/" className="adm-nav-link">
              <span className="adm-nav-icon" aria-hidden>↗</span>
              <span>Открыть сайт</span>
            </a>
            <form action={async () => { "use server"; const { signOut } = await import("@/auth"); await signOut({ redirectTo: "/" }) }}>
              <button type="submit" className="adm-nav-link" style={{ width: '100%', background: 'none', border: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                <span className="adm-nav-icon" aria-hidden>⏻</span>
                <span>Выйти</span>
              </button>
            </form>
          </div>
        </aside>

        <main className="adm-main">
          <div className="adm-container">{children}</div>
        </main>
      </div>
    </div>
  )
}
