import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

// ── Startup guard: refuse to run with a weak or missing signing secret ────
const AUTH_SECRET = process.env.AUTH_SECRET ?? "";
if (
  process.env.NODE_ENV === "production" &&
  (AUTH_SECRET.length < 32 || /change-in-production|dev-secret/i.test(AUTH_SECRET))
) {
  throw new Error(
    "AUTH_SECRET отсутствует или является небезопасным значением. " +
      "Задайте криптослучайный секрет (openssl rand -base64 48) в окружении процесса."
  );
}

function safeCompare(a: string, b: string): boolean {
  const bufa = Buffer.from(a);
  const bufb = Buffer.from(b);
  // Length is compared first; timingSafeEqual requires equal-length buffers.
  if (bufa.length !== bufb.length) return false;
  return timingSafeEqual(bufa, bufb);
}

// ── Login throttling: lock a (username, ip) pair after repeated failures ──
const fails = new Map<string, { n: number; until: number }>();
const LOCK_AFTER = 5;
const BASE_LOCK_MS = 15 * 60_000;
const FAILS_CAP = 10_000;

function lockKey(username: string, req?: Request): string {
  const raw = (req?.headers.get("x-real-ip") ?? "").trim().slice(0, 45);
  const ip = /^[0-9a-fA-F:.]{3,45}$/.test(raw) ? raw : "unknown";
  // Username is part of the key so a rotating-IP attack still trips the lock.
  return `${username.toLowerCase()}|${ip}`;
}

function isLocked(key: string): boolean {
  const e = fails.get(key);
  return !!e && Date.now() < e.until;
}

function noteFail(key: string): void {
  const now = Date.now();
  if (fails.size > FAILS_CAP) {
    for (const [k, v] of fails) if (now > v.until && v.n < LOCK_AFTER) fails.delete(k);
    if (fails.size > FAILS_CAP) fails.clear();
  }
  const e = fails.get(key) ?? { n: 0, until: 0 };
  e.n++;
  if (e.n >= LOCK_AFTER) e.until = now + BASE_LOCK_MS * 2 ** Math.min(e.n - LOCK_AFTER, 5);
  fails.set(key, e);
}

const ROLES = new Set(["ADMIN", "JUDGE", "EMPLOYEE"]);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Email или логин" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: async (credentials, request) => {
        if (!credentials?.username || !credentials?.password) return null;

        const username = String(credentials.username);
        const password = String(credentials.password);
        const key = lockKey(username, request as Request);

        if (isLocked(key)) return null;

        // Uniform delay so a failure costs the attacker real time either way.
        const fail = async () => {
          noteFail(key);
          await new Promise((r) => setTimeout(r, 300));
          return null;
        };

        // Admin login via environment credentials — constant-time comparison.
        const adminUser = process.env.ADMIN_USERNAME ?? "";
        const adminPass = process.env.ADMIN_PASSWORD ?? "";
        if (adminUser && adminPass && safeCompare(username, adminUser)) {
          if (safeCompare(password, adminPass)) {
            fails.delete(key);
            return { id: "admin", name: "Admin", email: "admin@farovon.com", role: "ADMIN" };
          }
          return fail();
        }

        const user = await prisma.user.findUnique({
          where: { email: username },
        });

        if (!user || !user.isActive) return fail();

        const valid = await bcryptjs.compare(password, user.password);
        if (!valid) return fail();

        fails.delete(key);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Sign-in: seed the claims from the authorized user.
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        (token as any).checkedAt = Date.now();
        return token;
      }

      const id = String((token as any).id ?? token.sub ?? "");
      // The env-based admin has no row in User; nothing to revalidate.
      if (id === "admin") return token;
      if (!id) return null;

      // Re-read role and isActive so deactivation and role changes take effect
      // on live sessions. Cached briefly to avoid a query on every request.
      const last = (token as any).checkedAt ?? 0;
      if (Date.now() - last < 60_000) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id },
        select: { role: true, isActive: true },
      });

      if (!dbUser || !dbUser.isActive) return null;

      token.role = dbUser.role;
      (token as any).checkedAt = Date.now();
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const role = (token as any)?.role;
        // Fail closed: an unrecognised role grants nothing.
        (session.user as any).role = ROLES.has(role) ? role : undefined;
        (session.user as any).id = (token as any)?.id ?? token?.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours instead of the 30-day default
  },
  secret: AUTH_SECRET,
});
