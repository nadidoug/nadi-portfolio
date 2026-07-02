# Secrets Management

## Non-negotiables
1. **Secrets never enter git.** `.env` is gitignored globally; only `.env.example` is committed.
2. **Pre-commit scanning.** [gitleaks](https://github.com/gitleaks/gitleaks) runs as a pre-commit hook and in CI. GitHub **secret scanning + push protection** enabled on all repos.
3. **Storage.** Local dev: `.env` files. Production: platform secret stores (GitHub Actions Secrets, Vercel/Netlify env, Supabase vault, Docker secrets) — never in code, images, or client bundles.
4. **Client-side exposure.** Only variables explicitly prefixed for public use (`NEXT_PUBLIC_`, `VITE_`) may reach the browser, and they must be non-sensitive.
5. **Rotation.** Rotate credentials on: suspected exposure (immediately), contributor offboarding, or every [12] months for long-lived keys.
6. **Least privilege.** Scoped tokens over account-wide keys (fine-grained GitHub PATs, restricted API keys, per-project Supabase service roles).

## If a secret leaks
1. Rotate/revoke immediately — **before** cleaning git history (history rewrites don't un-leak anything).
2. Purge from history (`git filter-repo`) and force-push.
3. Review provider logs for unauthorized use; document the incident.
