# R&L Capital Realty — Product Brief

## Register

brand

## What We Do

R&L Capital Realty LLC is a Texas-based short-term rental (STR) arbitrage business. We lease residential properties, furnish them, and operate them as short-term rentals on platforms like Airbnb. We do not own the properties — we negotiate with landlords for master lease agreements and capture the spread between our rent cost and STR revenue.

Current market focus: **Abilene, TX** — driven by Dyess AFB military demand, Hardin-Simmons and ACU university traffic, and corporate/healthcare travelers.

## Primary Audiences

### 1. Military & Government Personnel
- TDY travelers, PCS movers, contractors
- Need: clean, furnished, flexible-stay housing near Dyess AFB
- Tone: reliable, no-nonsense, military-friendly

### 2. Corporate & Healthcare Travelers
- Extended-stay professionals, locum tenens healthcare workers
- Need: home-like amenities, fast WiFi, workspace, monthly pricing
- Tone: professional, convenient, cost-effective vs. hotels

### 3. University Visitors
- Parents, visiting faculty, prospective students (Hardin-Simmons, ACU, McMurry)
- Need: affordable, central, short-stay options
- Tone: welcoming, local knowledge, great value

### 4. Property Owners / Landlords (B2B)
- Landlords considering a master lease arrangement
- Need: reliable long-term tenant, no management headaches, consistent rent
- Tone: professional, trustworthy, business-partner framing

## Brand Voice

- **Professional and premium** — not budget, not flashy. Think boutique hotel confidence.
- **Trustworthy and local** — deep Abilene market knowledge, not a faceless national operator.
- **Direct and confident** — no fluff. State what we offer, why it matters, how to get it.
- **Military-aware** — understands the cadence of PCS moves, TDY lengths, BAH rates.

## Visual Identity

- **Colors:** Navy (#0f1f2e), Gold (#c9a96e), Cream (#faf8f4)
- **Typography:** Cormorant Garamond (headings — elegant serif), DM Sans (body — clean sans)
- **Feel:** Premium real estate meets boutique hospitality. Think luxury short-let agency, not Airbnb clone.

## Anti-References (What We Are NOT)

- ❌ Vacation rental platforms (Vrbo, Airbnb listing pages) — we're the operator, not the marketplace
- ❌ Budget motels or extended-stay chains (Extended Stay America aesthetic)
- ❌ Generic real estate agency sites with stock photo slideshows
- ❌ Overly corporate / cold / enterprise-looking
- ❌ Gradient-heavy, glassmorphism, trendy "startup" aesthetics

## Product Scope

### Public Site (`/`)
Marketing homepage. Converts two types of visitors:
1. **Travelers** → understand our properties, check availability, contact us
2. **Landlords** → understand the master lease model, trust us with their property

### Admin Portal (`/admin`)
Internal tool for R&L Capital operators. Password-protected.
- **Property Financial Calculator** — evaluate STR arbitrage opportunities: input property details, revenue assumptions, costs → get P&L, ROI, break-even, risk flags
- **Save & compare analyses** — persist to Supabase, compare multiple properties side-by-side
- **Export to Markdown** — shareable analysis reports

### Auth Flow (`/auth/login`, `/auth/callback`)
Email/password login + forgot-password reset. Supabase Auth. Single-operator use (small team).

## Design Goals for Migration

1. Preserve the existing premium aesthetic — this is a refinement, not a rebrand
2. Fix any visual inconsistencies that crept in from hand-crafted inline CSS
3. Ensure the admin calculator is scannable and data-dense without feeling cluttered
4. Mobile-first — travelers check availability on phones
5. Fast — static site, minimal JS, no layout shift
