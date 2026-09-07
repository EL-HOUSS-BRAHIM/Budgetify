# Reuse ledger

Every artefact in `legacy/` has exactly one row here and exactly one verdict.
This is the mechanism that enforces the project rule: **reuse if it exists,
recreate only if it does not, never duplicate.**

## How to use it

Before writing any new function, search this file for the capability. If a row
exists with verdict `PORT` or `REWRITE`, the legacy implementation is the
specification — read it before writing. If the row says `DROP`, do not
resurrect it without an ADR. If the capability has no row, it is genuinely new;
add a row for it once built.

When a row is actioned, change its status from `pending` to `done` and record
where the capability now lives. A row whose status is `done` must name a real
file in `packages/core`, `apps/mobile`, `services/ai` or `supabase/`.

Verdicts:

- **PORT** — the logic is correct and survives; re-express it in TypeScript with
  tests. Behaviour must not change.
- **REWRITE** — the intent survives, the implementation does not. Legacy code is
  reference only.
- **DROP** — superseded by the platform, or never worked. Deleting it is the
  decision.

## Domain logic

| Capability | Legacy source | Verdict | Status | Lands in |
|---|---|---|---|---|
| Per-category budget analysis (budgeted / spent / remaining / % used) | `backend/app/utils/financial_utils.py::analyze_budget` | PORT | pending | `packages/core` |
| Monthly report aggregation | `backend/app/services/report_service.py::generate_monthly_report` | PORT | pending | `packages/core` |
| Month/year filtering of budgets and expenses | `frontend/src/utils/helpers.js` | PORT | pending | `packages/core` |
| Category totals aggregation | `frontend/src/utils/helpers.js` | PORT | pending | `packages/core` |
| Date-range expense filtering | `frontend/src/utils/helpers.js` | PORT | pending | `packages/core` |
| Currency formatting (`Intl.NumberFormat`) | `frontend/src/utils/helpers.js::formatCurrency` | PORT | pending | `packages/core` |
| Date formatting | `frontend/src/utils/helpers.js::formatDate` | PORT | pending | `packages/core` |
| Goal progress percentage | `backend/app/services/goal_service.py` | PORT | pending | `packages/core` (module `goals`, V3) |
| Net worth calculation | `backend/app/utils/financial_utils.py::calculate_net_worth` | DROP | pending | — assets/liabilities were never modelled; the function had no callers |

**Amount representation changes on port.** Legacy stores money as `Float`.
Ported code uses integer minor units. This is a deliberate behaviour change, not
a port defect: float accumulation across a month of transactions drifts.

## Auth and identity

| Capability | Legacy source | Verdict | Status | Lands in |
|---|---|---|---|---|
| Registration, login, password hashing | `backend/app/services/auth_service.py` | DROP | pending | — Supabase Auth |
| JWT issue and verify | `backend/app/utils/auth_utils.py` | DROP | pending | — Supabase Auth |
| Token storage and 401 handling | `frontend/src/utils/auth.js`, `api.js` | REWRITE | pending | `apps/mobile` — Supabase client with SecureStore session persistence |
| Email OTP | `backend/app/utils/otp_utils.py` | DROP | pending | — Supabase OTP; the in-memory dict was never multi-worker safe |
| Per-request profile-completeness redirect | `frontend/src/utils/api.js` interceptor | REWRITE | pending | `apps/mobile` — onboarding state read once from session, not per request |
| Social login | `frontend/src/components/Login/socialLogin.js` | DROP | pending | — Supabase OAuth providers; the legacy buttons were inert |
| Row ownership enforcement | every `*_service.py` `filter_by(user_id=...)` | REWRITE | pending | `supabase/` RLS policies |

## Storage, email, infrastructure

| Capability | Legacy source | Verdict | Status | Lands in |
|---|---|---|---|---|
| Avatar upload/serve | `backend/app/services/profile_service.py` | REWRITE | pending | Supabase Storage bucket |
| Google Drive avatar hosting | `backend/app/services/drive_service.py` | DROP | pending | — hardcoded folder id, no tenancy |
| SVG initial-avatar generation | `profile_service.py::generate_svg_avatar` | PORT | pending | `packages/core` |
| Transactional email | `backend/app/services/mail_service.py` | DROP | pending | — Supabase Auth emails |
| Email templates | `backend/app/templates/email/` | REWRITE | pending | Supabase Auth email templates |
| Standard API envelope | `backend/app/utils/response_utils.py` | DROP | pending | — PostgREST defines the wire format |
| Required-field decorator | `backend/app/utils/validation_utils.py` | REWRITE | pending | `packages/core` — Zod schemas, shared by UI and assistant tools |

## UI

| Capability | Legacy source | Verdict | Status | Lands in |
|---|---|---|---|---|
| Dashboard information architecture | `frontend/src/pages/Dashboard.js` + `components/Dashboard/` | REWRITE | pending | `apps/mobile` — layout is reference, code is not portable |
| Expense list / add / edit | `components/Expense/` | REWRITE | pending | `apps/mobile` (module `ledger`) |
| Budget categories with progress bars | `components/Budget/` | REWRITE | pending | `apps/mobile` (module `budgeting`) |
| Reports with date-range filter | `pages/Reports.js`, `components/Reports/` | REWRITE | pending | `apps/mobile` (module `insights`, V3) |
| Multi-step profile wizard | `components/CompleteProfile.js` | REWRITE | pending | `apps/mobile` (module `consent-onboarding`) — step structure is reference |
| Chart.js visualisations | `components/*/\*Chart.js` | REWRITE | pending | `apps/mobile` — Chart.js does not run in React Native |
| Dark mode toggle | `components/DMT/DMT.js` | REWRITE | pending | `apps/mobile` — theme provider, not DOM class mutation |
| PDF export | `pages/Reports.js` (jsPDF) | REWRITE | pending | `apps/mobile` (module `insights`, V3) |
| CSV export | `frontend/src/utils/csvGenerator.js` | REWRITE | pending | `packages/core` (module `data-io`, V3) |
| Marketing site (Home, Hero, Features, Testimonials, CTA) | `components/Home/` | DROP | pending | — an app has no landing page |
| Privacy policy / terms copy | `pages/PrivacyPolicy.js`, `pages/TermsOfService.js` | PORT | pending | `apps/mobile` (module `consent-onboarding`) — the prose is reusable, the rendering is not |
| Settings stubs: password change, data export, account deletion | `components/Settings/` | DROP | pending | — never implemented; rebuilt properly under `consent-onboarding` as GDPR data rights |
| Notifications list | `components/Dashboard/Notifications.js` | DROP | pending | — read from an endpoint that never existed |
| Toast notifications | `frontend/src/utils/notifications.js` | REWRITE | pending | `apps/mobile` |
| localStorage wrapper | `frontend/src/utils/storage.js` | DROP | pending | — SecureStore / MMKV |
| Error boundary, loader | `components/ErrorBoundary.js`, `Loader.js` | REWRITE | pending | `apps/mobile` |

## Deleted outright

| Artefact | Reason |
|---|---|
| `backend/app/routes/test_email.py` | Debug endpoint with a hardcoded personal recipient address, unauthenticated. |
| `backend/conf/certs/certificates.cert` | MySQL CA certificate for a cluster being decommissioned. Must not carry forward. |
| `backend/migrations/` | Alembic history for a MySQL schema that is being replaced, not migrated. |
| `frontend/build/` | Committed build output. |
