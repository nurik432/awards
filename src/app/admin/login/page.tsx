import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const params = await searchParams;
  const errorMessage = params?.error === "CredentialsSignin" ? "Неверные данные для входа." : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="white-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: '#7f1d1d', marginTop: 0 }}>Вход для администратора</h2>
                <form
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
        </form>
      </div>
    </div>
  )
}
