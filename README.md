# OSPAT Insights Concept

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
  as **Cleared / Monitor / Review Required**.
- Supervisors get a single console showing today's volume, flagged cases by
  shift and site, individual employee trajectories, and a focused review
  queue with suggested actions.

The design priorities were: signal density without clutter, dark "command
centre" aesthetic appropriate for a 24/7 operations environment, and clearly
communicating *why* something is flagged (deviation %, consecutive declines)
rather than just *what*.

## Screens

| Route              | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `/`                | Dashboard overview — KPIs, trend, risk distribution, sites, shifts      |
| `/feed`            | Live assessment feed — searchable / filterable / sortable + CSV export  |
| `/sites`           | Site risk view — per-site assessments, flagged counts, trend, sparkline |
| `/employees/[id]`  | Employee detail — last 20 scores vs. baseline, timeline, insight card   |
| `/review`          | Supervisor review queue — acknowledge, mark reviewed, add note          |

## Tech stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS** (`darkMode: 'class'`, dark by default)
- **Recharts** for line / area / bar / donut / sparkline charts
- **Zustand** (with `persist` middleware) for the review-queue local state
- **lucide-react** for monotone iconography
- **Inter** via `next/font/google`

No database, no API routes, no auth. The dataset is generated deterministically
from a seeded PRNG (`mulberry32`) at module load, so charts, KPIs, and sample
employees are stable across reloads and across machines.

## Running locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Project structure

```
app/                       App Router routes + per-route loading skeletons
  layout.tsx               Sidebar + Topbar + sticky SummaryBar shell
  page.tsx                 Dashboard overview
  feed/page.tsx            Live assessment feed (CSV export)
  sites/page.tsx           Site risk view
  employees/[id]/page.tsx  Employee detail (async params)
  review/page.tsx          Supervisor review queue
components/
  layout/                  Sidebar, Topbar, SummaryBar, DemoBadge
  ui/                      Card, StatCard, StatusBadge, Skeleton, EmptyState, PageHeader
  charts/                  All "use client" — Recharts wrappers + ChartCard
  feed/                    FeedTable (search / filter / sort / export)
  review/                  ReviewQueue (Zustand-backed actions)
lib/
  types.ts                 Domain types
  rng.ts                   mulberry32 + helpers
  risk.ts                  Pure classification (Cleared / Monitor / Review Required)
  generate.ts              Deterministic mock dataset
  data.ts                  Singleton + selectors used by server components
  csv.ts                   toCsv + downloadCsv
  format.ts                Date / time / pct formatting (en-AU, fixed timezone)
store/
  reviewStore.ts           Zustand + persist + useHasHydrated()
```

## Risk classification

The pure function `classify(score, baseline, recentScores)` in `lib/risk.ts`
encodes the rules:

| Outcome           | Trigger                                                     |
| ----------------- | ----------------------------------------------------------- |
| **Review Required** | Score >15% below personal baseline, **or** 3+ consecutive declining results below baseline |
| **Monitor**         | Score 10–15% below personal baseline                       |
| **Cleared**         | Otherwise (within ~10% of baseline or above)                |

Deviation is reported as `(score − baseline) / baseline × 100`.

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
- Status colors are consistent across badges, dots, sparklines, and charts:
  emerald = Cleared, amber = Monitor, rose = Review Required

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
- **Server / client boundary discipline** — mock data is generated on the
  server (deterministic seed), passed as serializable props to client
  components. Charts and interactive surfaces are isolated to client
  components. This avoids hydration mismatches and keeps the JS bundle
  focused.
- **Consistent visual language for risk** — the same three colours
  (emerald / amber / rose) appear in every chart, badge, dot, and sparkline.
  In a 24/7 operations setting, that consistency lowers cognitive load.
- **Restraint in scope** — no auth, no backend, no half-built features. The
  product surface that exists is finished; the rest is documented as roadmap.

## License & attribution

This project is a conceptual demo built for portfolio / interview discussion.
Any resemblance to real products, branding, or proprietary platforms is
unintentional.
