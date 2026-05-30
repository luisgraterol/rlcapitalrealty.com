# rlcapitalrealty.com

Static site for **R&L Capital Realty LLC** — a Texas-based short-term rental arbitrage business. Deployed on Vercel with Supabase for auth and data persistence.

## Stack

- Static HTML/CSS/JS — no frontend framework
- Supabase (auth + database)
- Vercel (hosting)

## Setup

1. Copy `.env.example` to `.env` and fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Run `node scripts/build.js` to generate `js/auth.js`
3. Open `index.html` locally or deploy to Vercel

The build script injects Supabase credentials into `js/auth.js` at build time. The generated file is gitignored.

## Calculator

`admin.html` includes a **Property Financial Calculator** — an internal tool for evaluating rental arbitrage opportunities in Abilene, TX. Access requires authentication.

### Features

- **Live calculations** — all output metrics update in real time as inputs change
- **6 input sections** — Property Basics, Revenue Assumptions, Fixed Monthly Costs, Per-Stay Costs, Setup Costs, HOT Tax info
- **Pre-populated Abilene, TX defaults** — AirDNA market data, Dyess AFB demand profile, confirmed insurance and permit details
- **Monthly P&L** — gross revenue, platform fees, fixed costs, net monthly/annual profit, break-even occupancy, margin, rent-to-revenue multiple
- **Scenario analysis** — best/base/worst case (±15pp occupancy, ±15% ADR)
- **Investment summary** — total initial investment, payback period, 12- and 24-month ROI
- **Automated risk flags** — break-even occupancy, worst-case cash flow, revenue multiple, rent threshold, stay length
- **HOA hard block** — disqualifies properties with HOA; save/export disabled while active
- **Supabase persistence** — save, update, and delete analyses; accessible from any authenticated device
- **Side-by-side comparison** — select 2+ saved analyses to compare all key metrics, best values highlighted
- **Export to Markdown** — downloads a structured `.md` file for offline review or sharing

### Database migration

Run `migrations/001_property_analyses.sql` in the Supabase SQL editor to create the `property_analyses` table and enable row-level security.

### Abilene market defaults

| Parameter | Default | Source |
|-----------|---------|--------|
| ADR (2BR) | $167/night | AirDNA 2026 |
| Occupancy | 77% | AirDNA Abilene annual avg |
| Avg stay | 3.2 nights | Military TDY / university profile |
| Rent target | $1,200/mo (negotiated) | R&L Capital operating range |
| Walk-away rent | $1,750/mo | R&L Capital policy |
| STR permit | None required | City of Abilene, 2026 |
| HOT tax | Collected by Airbnb | No operator action required |
