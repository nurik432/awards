import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Серверная проверка — основная защита
  const session = await auth()
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          background: '#fff',
          padding: '20px 30px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="/admin" style={{ textDecoration: 'none' }}>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#7f1d1d' }}>Farovon Admin</h1>
          </a>
          <nav style={{ display: 'flex', gap: '12px' }}>
            <a href="/admin" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', color: '#7f1d1d', borderColor: '#fecaca' }}>
              📋 Заявки
            </a>
            <a href="/admin/nominations" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', color: '#7f1d1d', borderColor: '#fecaca' }}>
              🏆 Номинации
            </a>
            <a href="/admin/winners" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', color: '#7f1d1d', borderColor: '#fecaca' }}>
              🥇 Победители
            </a>
            <a href="/admin/gallery" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', color: '#7f1d1d', borderColor: '#fecaca' }}>
              📸 Галерея
            </a>
            <a href="/admin/content" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', color: '#7f1d1d', borderColor: '#fecaca' }}>
              ✏️ Контент
            </a>
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>👤 {session.user?.name}</span>
          <a href="/" className="btn btn-secondary" style={{ color: '#64748b', borderColor: '#e2e8f0', fontSize: '13px' }}>
            ← На сайт
          </a>
          <form action={async () => { "use server"; const { signOut } = await import("@/auth"); await signOut({ redirectTo: "/admin/login" }) }}>
            <button type="submit" className="btn btn-secondary" style={{ color: '#dc2626', borderColor: '#fecaca', fontSize: '13px', cursor: 'pointer' }}>
              Выйти
            </button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}