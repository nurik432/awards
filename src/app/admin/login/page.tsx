<<<<<<< HEAD
import type { CSSProperties } from "react"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '9px 11px',
  font: 'inherit',
  fontSize: 13.5,
  color: '#111827',
  background: '#fff',
};

=======
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const params = await searchParams;
  const errorMessage = params?.error === "CredentialsSignin" ? "Неверные данные для входа." : null;

  return (
<<<<<<< HEAD
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        color: '#111827',
        fontSize: 14,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(16, 24, 40, .04), 0 1px 3px rgba(16, 24, 40, .06)',
          padding: '28px 26px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div
            aria-hidden
            style={{
              width: 44,
              height: 44,
              margin: '0 auto 12px',
              borderRadius: 11,
              background: '#7f1d1d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 21,
              lineHeight: 1,
            }}
          >
            🏆
          </div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-.01em', color: '#111827' }}>
            Farovon Awards
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 13, color: '#6b7280' }}>
            Панель управления
          </p>
        </div>

        <form
=======
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="white-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: '#7f1d1d', marginTop: 0 }}>Вход для администратора</h2>
                <form
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
          action={async (formData) => {
            "use server"
            try {
              await signIn("credentials", formData)
            } catch (error) {
               if (error instanceof AuthError) {
                 // handle
               }
               throw error;
            }
          }}
<<<<<<< HEAD
        >
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="username" style={labelStyle}>Логин</label>
            <input type="text" id="username" name="username" required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="password" style={labelStyle}>Пароль</label>
            <input type="password" id="password" name="password" required style={inputStyle} />
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{
                marginBottom: 14,
                padding: '10px 12px',
                borderRadius: 9,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {errorMessage}
            </div>
          )}

          <input type="hidden" name="redirectTo" value={params?.callbackUrl || "/admin"} />

          <button
            type="submit"
            style={{
              width: '100%',
              height: 38,
              marginTop: 4,
              border: '1px solid #7f1d1d',
              borderRadius: 8,
              background: '#7f1d1d',
              color: '#fff',
              font: 'inherit',
              fontSize: 13.5,
              fontWeight: 600,
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            Войти
          </button>
=======
          className="form-field"
        >
          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="username">Логин</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" name="password" required />
          </div>
          {errorMessage && (
            <div className="form-note" style={{ color: 'red', borderColor: 'red' }}>
              {errorMessage}
            </div>
          )}
          <div style={{ display: 'none' }}>
             <input type="hidden" name="redirectTo" value={params?.callbackUrl || "/admin"} />
          </div>
          <button type="submit" className="apply-btn" style={{ width: '100%', marginTop: '10px' }}>Войти</button>
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
        </form>
      </div>
    </div>
  )
}
