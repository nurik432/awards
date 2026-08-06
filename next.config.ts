import type { NextConfig } from "next";

// script-src / style-src are intentionally absent: Next.js injects inline
// hydration scripts, and a strict policy without a nonce pipeline breaks the
// app. Everything else is locked to same-origin, which is what limits the
// damage of a user-supplied URL reaching an iframe or img.
const csp = [
  "default-src 'self'",
  "frame-src 'self'",
  "img-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "X-Frame-Options",         value: "SAMEORIGIN" },
  { key: "X-XSS-Protection",        value: "1; mode=block" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  // Report-only first: check the browser console on /, /admin and /jury for
  // violations, then rename to "Content-Security-Policy" to enforce.
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Uploaded files are attacker-supplied. "default-src 'none'" stops such
        // a document from pulling in any subresource. The `sandbox` directive is
        // deliberately omitted — it disables Chrome's built-in PDF viewer and
        // would break presentation preview for the jury.
        source: "/uploads/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
