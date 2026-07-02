# Security Headers Standard

All deployed sites (nadidoug.com, demos) must send these headers. Verify with https://securityheaders.com — target grade **A**.

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' [API-ORIGINS]; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
```

Notes:
- Tighten `style-src` by removing `'unsafe-inline'` where the framework allows (use nonces/hashes).
- Three.js/WebGL demos may need `worker-src 'self' blob:`.
- WordPress client sites: apply via server config or a hardening plugin; document exceptions.
- Cookies: `Secure; HttpOnly; SameSite=Lax` minimum.
