"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      username: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Неверный email или пароль");
      return;
    }
    // Refresh session to get role, then redirect
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    const role = (session?.user as any)?.role;
    if (role === "ADMIN") router.push("/admin");
    else if (role === "JUDGE" || from === "jury") router.push("/jury");
    else router.push("/cabinet");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: "40px 36px", width: "100%", maxWidth: 400 }}>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>Вход в систему</h1>
        <p style={{ color: "#888", fontSize: 14, textAlign: "center", marginBottom: 28 }}>
          Farovon Awards
        </p>

        {error && (
          <div style={{ background: "#2d1515", border: "1px solid #c0392b", borderRadius: 8, padding: "10px 14px", color: "#e74c3c", fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 6 }}>Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="ivan@example.com"
              style={{ width: "100%", padding: "10px 12px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 6 }}>Пароль</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••"
              style={{ width: "100%", padding: "10px 12px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, padding: "12px", background: "#C8973A", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p style={{ color: "#666", fontSize: 13, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Вход только для членов комиссии. Доступ выдаёт администратор — обратитесь
          в HR-отдел для получения логина и пароля.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
