import { auth } from "@/auth";
import { NextResponse } from "next/server";

// ── In-memory rate limiter (single PM2 instance) ──────────
// If the app is ever run in cluster mode this must move to Redis/Postgres:
// the Map is per-process, so the effective limit multiplies by instance count.
const rl = new Map<string, { count: number; resetAt: number }>();

const RATE_RULES = [
  { path: "/api/apply",  max: 5,  windowMs: 60_000 },
  { path: "/api/upload", max: 5,  windowMs: 60_000 },
  { path: "/admin/login", max: 10, windowMs: 300_000 },
];

const RL_CAP = 5_000;

function isRateLimited(ip: string, pathname: string): boolean {
  const rule = RATE_RULES.find((r) => pathname.startsWith(r.path));
  if (!rule) return false;

  const now = Date.now();

  // Runs on every call, before any early return, so the Map cannot grow
  // unbounded under a flood of fresh keys.
  if (rl.size > RL_CAP) {
    for (const [k, v] of rl) if (now > v.resetAt) rl.delete(k);
    // Sweeping only expired entries is not enough during an active flood.
    if (rl.size > RL_CAP) rl.clear();
  }

  const key = `${ip}|${rule.path}`;
  const entry = rl.get(key);

  if (!entry || now > entry.resetAt) {
    rl.set(key, { count: 1, resetAt: now + rule.windowMs });
    return false;
  }

  entry.count++;
  return entry.count > rule.max;
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = (session?.user as any)?.role;
  const isLoggedIn = !!session;

  // ── Rate limiting ──────────────────────────────────────
  // Only x-real-ip is trusted, and only when nginx sets it to $remote_addr.
  // x-forwarded-for is deliberately NOT used: its left-most element is
  // attacker-supplied under the standard nginx $proxy_add_x_forwarded_for.
  const rawIp = (req.headers.get("x-real-ip") ?? "").trim().slice(0, 45);
  const ip = /^[0-9a-fA-F:.]{3,45}$/.test(rawIp) ? rawIp : "unknown";

  if (isRateLimited(ip, pathname)) {
    return new NextResponse(
      JSON.stringify({ error: "Слишком много запросов. Попробуйте через минуту." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  // ── /admin ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isLoggedIn && role === "ADMIN")
        return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.next();
    }
    if (!isLoggedIn || role !== "ADMIN")
      return NextResponse.redirect(new URL("/admin/login", req.url));
    return NextResponse.next();
  }

  // ── /jury ──────────────────────────────────────────────
  if (pathname.startsWith("/jury")) {
    if (!isLoggedIn || role !== "JUDGE")
      return NextResponse.redirect(new URL("/login?from=jury", req.url));
    return NextResponse.next();
  }

  // ── /cabinet ───────────────────────────────────────────
  if (pathname.startsWith("/cabinet")) {
    if (!isLoggedIn || role !== "EMPLOYEE")
      return NextResponse.redirect(new URL("/login?from=cabinet", req.url));
    return NextResponse.next();
  }

  // ── /login, /register ──────────────────────────────────
  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn) {
      if (role === "ADMIN")    return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "JUDGE")    return NextResponse.redirect(new URL("/jury", req.url));
      if (role === "EMPLOYEE") return NextResponse.redirect(new URL("/cabinet", req.url));
    }
    // Самостоятельная регистрация отключена — доступ выдаёт администратор
    if (pathname === "/register")
      return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/jury/:path*",
    "/cabinet/:path*",
    "/login",
    "/register",
    "/api/apply",
    "/api/upload/:path*",
  ],
};
