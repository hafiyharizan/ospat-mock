# OSPAT+ Operations Concept

A polished MVP web dashboard exploring how a workforce-readiness / fitness-for-work
platform could surface trends to safety supervisors in mining, transport, civil,
and heavy-industrial operations.

> **Demo data only.** This is a portfolio / interview concept piece. It is
> not affiliated with, endorsed by, or representative of any real product,
> brand, or vendor. No production branding, copy, or proprietary UI is used.

---

## What it is

An operations command-centre style web app that imagines an "insights companion"
to a quick start-of-shift readiness assessment system:

- Each employee has a **personal baseline** built from their own historical
  performance.
- Today's assessment is compared against that baseline, and anomalies surface
  as **Pass / Retest / Flag**.
- Supervisors get a single console showing today's volume, flagged cases by
  shift and site, individual employee trajectories, and a focused review
  queue with suggested actions.
- Workers get a touch-first mobile check-in that measures reaction response,
  target tracking, missed events, and false taps against a locally stored
  baseline.
- OpenRouter can generate a supervisor handover brief from already-classified
  Retest/Flag cases, with a deterministic fallback if the API is unavailable.

The design priorities were: signal density without clutter, dark "command
centre" aesthetic appropriate for a 24/7 operations environment, and clearly
communicating *why* something is flagged (deviation %, consecutive declines)
rather than just *what*.

## Screens

| Route              | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `/`                | Role selector — operations console or worker check-in                   |
| `/live`            | Operations console — KPIs, shift-start wave, attention queue, AI brief  |
| `/worker`          | Touch-first worker check-in — reaction + coordination measurement       |
| `/feed`            | Live assessment feed — searchable / filterable / sortable + CSV export  |
| `/sites`           | Site risk view — per-site assessments, flagged counts, trend, sparkline |
| `/employees/[id]`  | Employee detail — last 20 scores vs. baseline, timeline, insight card   |
| `/review`          | Supervisor review queue — acknowledge, mark reviewed, add note          |
| `/reports`         | Supervisor action log and audit-ready result summaries                  |
| `/settings`        | Routing rules, thresholds, export policy, and demo configuration        |
| `/api/ai/handover` | Server-only OpenRouter handover generation endpoint                     |

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS** (`darkMode: 'class'`, dark by default)
- **Recharts** for line / area / bar / donut / sparkline charts
- **Zustand** (with `persist` middleware) for the review-queue local state
- **lucide-react** for monotone iconography
- **Inter** via `next/font/google`
- **OpenRouter-compatible AI handover brief** with deterministic fallback

No database and no auth. The dataset is generated deterministically
from a seeded PRNG (`mulberry32`) at module load, so charts, KPIs, and sample
employees are stable across reloads and across machines.

## Running locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Optional AI handover testing:

```env
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

The API key stays server-side in `.env.local`. If the OpenRouter key, quota, or
model fails, the UI keeps working with a deterministic rule-based handover
summary.

Production build:

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_BASE_PATH=/ospat-mock` only when serving the app from that
sub-path. The AI route requires a server-capable Next deployment, not static
HTML export.

## Project structure

```
app/                       App Router routes + per-route loading skeletons
  api/ai/handover/route.ts Server-only AI handover endpoint
  layout.tsx               App metadata + conditional shell
  page.tsx                 Role selector
  live/page.tsx            Operations console
  worker/page.tsx          Worker mobile check-in
  feed/page.tsx            Live assessment feed (CSV export)
  sites/page.tsx           Site risk view
  employees/[id]/page.tsx  Employee detail (async params)
  review/page.tsx          Supervisor review queue
  reports/page.tsx         Action/audit summaries
  settings/page.tsx        Rules and routing configuration
components/
  ai/                      AI handover UI
  layout/                  Sidebar, Topbar, SummaryBar, DemoBadge
  ui/                      Card, StatCard, StatusBadge, Skeleton, EmptyState, PageHeader
  charts/                  All "use client" — Recharts wrappers + ChartCard
  feed/                    FeedTable (search / filter / sort / export)
  review/                  ReviewQueue (Zustand-backed actions)
  worker/                  Touch-first worker check-in experience
lib/
  aiHandover.ts            OpenRouter request + deterministic fallback
  types.ts                 Domain types
  rng.ts                   mulberry32 + helpers
  risk.ts                  Pure classification (Pass / Retest / Flag)
  generate.ts              Deterministic mock dataset
  data.ts                  Singleton + selectors used by server components
  csv.ts                   toCsv + downloadCsv
  format.ts                Date / time / pct formatting (en-AU, fixed timezone)
store/
  reviewStore.ts           Zustand + persist + useHasHydrated()
```

## AI handover

The AI handover flow is deliberately constrained:

- The server route sends only generated demo Retest/Flag cases to OpenRouter.
- The model is asked to summarise operational signals, not diagnose medical
  conditions.
- The deterministic rule fallback is the source of truth when the API is
  missing, rate-limited, or returns no text.
- The browser sees the generated brief and metadata, never the API key.

## Worker check-in

The worker surface is a mobile-first touch interaction:

- The worker drags a visible finger marker inside a tracking area.
- Amber events require a quick tap within the enlarged target ring.
- Metrics include average reaction time, coordination score, missed events,
  false taps, and a derived readiness score.
- The first completed run creates a local baseline in `localStorage`; later
  runs compare against that baseline.
- Tilt mode is currently hidden so the demo stays reliable for finger use.

## Risk classification

The rules in `lib/risk.ts` classify assessments into:

| Outcome           | Trigger                                                     |
| ----------------- | ----------------------------------------------------------- |
| **Pass**          | Inside the worker's expected personal range                 |
| **Retest**        | 8%+ baseline drop, reduced readiness, fatigue signal, or moderate anomaly |
| **Flag**          | 18%+ baseline drop, low readiness, high fatigue signal, or severe anomaly |

Flagged cases include metric-level reasons such as reaction time, accuracy,
coordination/consistency, or fatigue-risk movement against baseline.

## Mock dataset

Generated once at module load via a seeded PRNG:

- **40 employees** with realistic role / site / shift distributions
- **4 sites**: Mine Site A · Transport Depot B · Construction Zone C · Industrial Plant D
- **3 shift types**: Day · Night · FIFO
- **20 historical assessments** per employee across the last 30 days
- **Baseline** per employee in the 70–92 range
- **Score** drawn from a normal-ish distribution around baseline, with a
  fraction of employees given a fatigue trajectory so the review queue is
  meaningful

Because the seed is fixed, screenshots and demo videos stay reproducible.

## Polish

- Dark mode by default — `<html class="dark">` set in the root layout, no flash
- Sticky top **summary bar** with live KPIs visible on every page
- Per-route `loading.tsx` skeletons that match the final layout (zero CLS)
- Empty states for every list and table
- Tabular numerals everywhere (`font-variant-numeric: tabular-nums`)
- Subtle radial gradient background — keeps the surface alive without noise
- "Demo data only" badge in the topbar at all times
- CSV export from the feed produces a real file from the currently filtered rows
- Touch check-in uses large rings/markers so the tracked point remains visible
  under a finger
- AI handover card works from the dashboard and review queue without exposing
  secrets to the client
- Status colors are consistent across badges, dots, sparklines, and charts:
  sage = Pass, amber = Retest, coral = Flag

## Future roadmap

If this concept were taken to production, the natural next steps would be:

- **Supervisor mobile app** — push notifications for review-required cases
  delivered to the supervisor on shift, with offline-first acknowledgements
- **Authentication & role-based access** — supervisor / safety officer /
  operations / read-only auditor roles, SSO with site-level scoping
- **Real backend & database** — Postgres + an ingestion service for assessment
  events, aggregates pre-computed for the dashboard
- **Integration with physical OSPAT-style test terminals** — secure device
  enrolment, deterministic scoring pipeline, retry / resync semantics
- **Audit logs** — every supervisor action (acknowledge, note, override)
  recorded immutably for compliance and incident investigations
- **Predictive fatigue / risk modelling** — moving beyond rule-based deviations
  to per-employee models that incorporate roster patterns, sleep proxies, and
  cumulative shift load
- **Optional tilt input** — re-enable a sensor-based worker mode after device
  permission handling and visibility are production-ready
- **Site comparison & benchmarking** — anonymised cross-site insights for
  enterprise customers operating multiple sites

## Interview talking points

A few things this concept tries to demonstrate:

- **Domain framing** — safety-critical software is fundamentally about
  *signal vs. noise* for the people who have to act on it. Every screen here
  answers a specific operational question (who do I talk to first? which site
  needs attention? is this a one-off or a trend?).
- **Personal baselines, not population baselines** — readiness is meaningful
  relative to *that person's* normal, not a generic threshold. The deviation
  metric and the "X consecutive declines" rule are deliberate: they mirror how
  a shift supervisor would actually reason about an operator.
- **The review queue is a workflow, not a list** — Acknowledge / Mark Reviewed
  / Add Note are the primitives for accountability. Persisting state locally
  is the MVP shim; in production this becomes an audit-logged backend action.
- **AI is bounded by operational rules** — OpenRouter only turns existing
  Retest/Flag signals into handover copy. The app still works without the
  model, and the fallback output remains deterministic.
- **Worker UX is touch-first** — The check-in avoids fragile sensor permissions
  and keeps the tracked marker large enough to remain visible under a finger.
- **Server / client boundary discipline** — mock data is generated on the
  server (deterministic seed), passed as serializable props to client
  components. The OpenRouter call is isolated to a server route, while charts
  and interactive surfaces stay in client components.
- **Consistent visual language for risk** — the same three colours
  (emerald / amber / rose) appear in every chart, badge, dot, and sparkline.
  In a 24/7 operations setting, that consistency lowers cognitive load.
- **Restraint in scope** — no auth, no database, no half-built features. The
  product surface that exists is finished; the rest is documented as roadmap.

## License & attribution

This project is a conceptual demo built for portfolio / interview discussion.
Any resemblance to real products, branding, or proprietary platforms is
unintentional.
