# Environment Variable Documentation Standard

Every project MUST ship a committed `.env.example` with every variable it reads — placeholder values only, never real secrets.

## Format
```
# ── Server ──────────────────────────────
PORT=3000                     # HTTP port (default 3000)
NODE_ENV=development          # development | production | test

# ── Database ────────────────────────────
DATABASE_URL=postgres://user:pass@localhost:5432/app   # required

# ── Third-party APIs ────────────────────
ANTHROPIC_API_KEY=sk-ant-xxx  # required for AI features — get at console.anthropic.com
TWILIO_ACCOUNT_SID=ACxxx      # required for SMS features
STRIPE_SECRET_KEY=sk_test_xxx # optional — payments disabled if unset
```

## Rules
1. Group by concern; mark **required vs optional** and document defaults.
2. Note where to obtain each credential.
3. App must **fail fast with a clear error** when a required variable is missing (validate at startup, e.g., zod/envalid).
4. Never log environment values.
