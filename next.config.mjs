/** @type {import('next').NextConfig} */

// Security headers per SECURITY.md §7.
// CSP includes 'unsafe-inline' + 'unsafe-eval' in script-src — required by
// Next.js 14 hydration (inline bootstrap __next_f script tags) and dev-mode
// webpack/Turbopack HMR (eval). Documented tradeoff: tightening to nonces
// requires runtime nonce wiring across every route + every inline asset and
// is a separate hardening pass (deferred). All other controls (HSTS,
// X-Frame-Options, Permissions-Policy, connect-src allowlist) remain strict.
const isDev = process.env.NODE_ENV !== 'production'

const cspValue = [
  "default-src 'self'",
  // 'unsafe-inline' for Next.js bootstrap; 'unsafe-eval' for HMR (dev only).
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Anthropic API + WebSocket for HMR in dev.
  isDev
    ? "connect-src 'self' ws: wss: http://localhost:* https://api.anthropic.com"
    : "connect-src 'self' https://api.anthropic.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  { key: 'Content-Security-Policy', value: cspValue },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), microphone=(), camera=(), payment=()',
  },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // strip X-Powered-By disclosure
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
