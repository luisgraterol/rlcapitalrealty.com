# Plan: Missing STR Costs + Calculator Refactor

> **Status:** PR 1 complete — PR 2 pending  
> **Source doc:** `missing-costs.md`  
> **Target:** Two sequential PRs — refactor first, then new costs.

---

## PR 1 — Refactor `Calculator.astro`

**Goal:** Get the `<script>` block from ~920 → ~350 lines with zero behavior or UI changes.

### Files to create

#### `src/lib/charts.ts`
Extract from `Calculator.astro`:
- `drawGauge(breakEvenPct, actualPct)` — canvas semicircle gauge
- `zeroLinePlugin` — Chart.js plugin for the dashed zero line
- `renderVisuals(inputs, results, propertiesList, selectedPropertyId, charts)` — the full chart rendering function (waterfall, gauge, scenario bars, monthly cash flow, ROI curve). Returns updated chart instances so the caller can hold references.

#### `src/lib/exportMarkdown.ts`
Extract from `Calculator.astro`:
- `exportMarkdown(inputs, results, formState)` — builds and downloads the `.md` file. All data passed as arguments; no DOM reads inside the function.

#### `src/lib/propertyModal.ts`
Extract from `Calculator.astro`:
- `initPropertyModal(callbacks)` — wires all modal button handlers. Accepts a `callbacks` object: `{ onPropertyCreated(property), getLandlordsList(), getPropertiesList() }`.
- Internal: `openModal()`, `closeModal()`, landlord quick-create handler, modal save handler.
- On success: fires `CustomEvent('property-created', { detail: newProperty })` on `document` so the main script can update its local state.

### Changes to `Calculator.astro`

- Import and call the three new modules from the `<script>` block.
- Replace the extracted ~570 lines with import calls and event listeners.
- HTML and CSS stay completely untouched.

---

## PR 2 — Add Missing Costs

### Step 1 — `src/lib/calculations.ts`

**Add to `AnalysisInputs`:**

```ts
// Utilities (replaces single 'utilities' field)
electricity: number;
water: number;
sewer: number;
garbage: number;

// Property services
hasYard: boolean;
lawnCare: number;
pestControl: number;
bulkPickup: number;

// Supplies (additive to existing)
linens: number;

// Tech
minutSubscription: number;
streaming: number;
airbnbFeeType: '3%' | '15.5%';  // replaces hardcoded 0.03

// Maintenance & admin
preventiveInspection: number;
hvacFilters: number;
cpa: number;

// One-time startup
minutHardware: number;
wifiRouter: number;
welcomeKits: number;
```

Keep `utilities` in the interface (and in `calcFixedCosts`) for backward compatibility — existing saved analyses that have it will still load correctly. New analyses set `utilities: 0` and use the four breakdown fields.

**Update `calcFixedCosts`:**
- Add all new monthly fields to the sum.
- For `lawnCare`, `pestControl`, `bulkPickup`: multiply by `hasYard ? 1 : 0` for lawn care; pest control and bulk pickup are always included.

**Update `calcAll`:**
- Derive Airbnb fee rate: `const airbnbRate = inputs.airbnbFeeType === '15.5%' ? 0.155 : 0.03;`
- Use `airbnbRate` instead of `0.03` everywhere.

**Update `totalInvest` in `calcAll`:**
- Add `inputs.minutHardware + inputs.wifiRouter + inputs.welcomeKits`.

**Update `getRiskFlags`:**
- Add flag when `airbnbFeeType === '15.5%'`:  
  `⚠️ Airbnb fee is set to 15.5% (Hospitable API). At this rate, fee on base-case gross is ~$X/mo — confirm in Airbnb → Payments & Payouts.`

---

### Step 2 — `Calculator.astro`: "Fixed Monthly Costs" section

**Remove** the single "Utilities (elec/water/gas)" field.

**Add 4 separate utility fields** (2-column layout, 2 rows):

| Field | ID | Default | Range label |
|---|---|---|---|
| Electricity (AEP Texas) | `inp-electricity` | $130 | `$120–$140 (2BR) · $145–$170 (3BR)` |
| Water | `inp-water` | $45 | `$40–$50 (2BR) · $50–$60 (3BR) · confirm if landlord-included` |
| Sewer | `inp-sewer` | $50 | `$45–$55 (2BR) · $55–$65 (3BR) · confirm if landlord-included` |
| Garbage (City of Abilene) | `inp-garbage` | $24 | `$24 flat · confirm if landlord-included` |

**Add "Linens & Towels" field** next to Supplies:

| Field | ID | Default | Range label |
|---|---|---|---|
| Linens & Towels (reserve) | `inp-linens` | $41 | `$35 (2BR) · $48 (3BR)` |

---

### Step 3 — `Calculator.astro`: New "Property Services" subsection

Add as a new collapsible section between "Fixed Monthly Costs" and "Per-Stay Variable Costs".

**"Has Yard?" toggle** — a `<select>` (Yes / No, default No). When "No", Lawn Care field is `readonly` and value forced to `0`.

| Field | ID | Default | Range label |
|---|---|---|---|
| Lawn Care | `inp-lawn-care` | $78 | `$75 (2BR) · $82 (3BR) · Apr–Oct 2x/mo, Nov–Mar 1x/mo · prorated` |
| Pest Control | `inp-pest-control` | $51 | `$50 (2BR) · $53 (3BR) · quarterly · prorated` |
| Bulk Pickup | `inp-bulk-pickup` | $8 | `~2x/yr · prorated` |

---

### Step 4 — `Calculator.astro`: "Tech & Platforms" subsection

Add inside "Fixed Monthly Costs" after the PMS/PriceLabs row.

| Field | ID | Default | Range label |
|---|---|---|---|
| Minut (noise sensor) | `inp-minut-subscription` | $10 | `$10 flat` |
| Streaming (Netflix/Hulu) | `inp-streaming` | $8 | `$8 flat · guest profile` |

**Airbnb Host Fee** — change from `readonly disabled` input showing `3` to a `<select>`:
```
<option value="3%">3% — Direct (no API)</option>
<option value="15.5%">15.5% — Hospitable API</option>
```
Field note: `Verify in Airbnb → Payments & Payouts → Service fee. API-connected = 15.5%.`

---

### Step 5 — `Calculator.astro`: "Maintenance & Admin" subsection

Add inside "Fixed Monthly Costs" after the maintenance reserve row.

| Field | ID | Default | Range label |
|---|---|---|---|
| Preventive Inspection | `inp-preventive-inspection` | $50 | `$50 · handyman · every 2 mo (6x/yr) · prorated` |
| HVAC Filters | `inp-hvac-filters` | $10 | `$8 (2BR) · $12 (3BR) · every 45–60 days · prorated` |
| CPA / Taxes | `inp-cpa` | $42 | `~$500/yr billed Q1 · prorated` |

---

### Step 6 — `Calculator.astro`: "Setup & One-Time Costs" section

**Add fields:**

| Field | ID | Default | Range label |
|---|---|---|---|
| Minut Hardware | `inp-minut-hardware` | $100 | `$100 flat` |
| WiFi Router (premium) | `inp-wifi-router` | $100 | `$80 (2BR) · $120 (3BR)` |
| Welcome Kits (2-mo supply) | `inp-welcome-kits` | $195 | `$170 (2BR) · $220 (3BR)` |

**Update existing defaults:**

| Field | Old default | New default | Note |
|---|---|---|---|
| Photography | $200 | $205 | Midpoint of $180–230 (2BR) |
| Smart Lock | $150 | $180 | Matches Schlage/Yale actual |
| Legal | $300 | $400 | Matches TX attorney quote in doc |

---

### Step 7 — Wiring updates in `Calculator.astro`

- **`gatherInputs()`** — add all new field reads.
- **`inputIds[]`** — add all new IDs so change listeners fire `runCalc`.
- **`resetForm()` defaults** — add all new fields with their midpoint defaults.
- **`hasYard` toggle handler** — lock/unlock `inp-lawn-care` based on selection, call `runCalc`.
- **`airbnbFeeType` change handler** — already covered by `inputIds[]` if the select fires `input` events.

---

### Step 8 — `src/lib/charts.ts`

Update `renderVisuals` waterfall to include the new cost items as separate labeled bars. Suggested additions to `costItems`:

```ts
{ label: 'Water',     val: inputs.water },
{ label: 'Sewer',     val: inputs.sewer },
{ label: 'Garbage',   val: inputs.garbage },
{ label: 'Lawn/Pest', val: inputs.lawnCare + inputs.pestControl + inputs.bulkPickup },
{ label: 'Linens',    val: inputs.linens },
{ label: 'Minut/TV',  val: inputs.minutSubscription + inputs.streaming },
{ label: 'Insp/HVAC', val: inputs.preventiveInspection + inputs.hvacFilters },
{ label: 'CPA',       val: inputs.cpa },
```

`Electricity` replaces the existing `Utils` bar.

---

### Step 9 — `src/lib/exportMarkdown.ts`

Update the P&L table to include all new line items, grouped by subsection (Utilities, Property Services, Tech, Maintenance & Admin). Update the one-time investment table to include the three new startup costs.

---

### Step 10 — Migration: `migrations/007_backfill_analysis_inputs.sql`

Backfill all existing saved analyses in `property_analyses` with sensible defaults for the new fields. Uses `jsonb_set` with `create_missing = true`. Only sets fields that are absent — does not overwrite user data.

**New monthly fields and their backfill defaults:**

| Field key | Backfill value | Rationale |
|---|---|---|
| `inp-electricity` | `130` | Midpoint 2BR range |
| `inp-water` | `45` | Midpoint 2BR range |
| `inp-sewer` | `50` | Midpoint 2BR range |
| `inp-garbage` | `24` | Flat rate |
| `inp-utilities` | `0` | Superseded by breakdown fields |
| `inp-lawn-care` | `78` | Midpoint 2BR range |
| `inp-pest-control` | `51` | Midpoint 2BR range |
| `inp-bulk-pickup` | `8` | Flat prorated |
| `inp-linens` | `41` | Midpoint 2BR/3BR |
| `inp-minut-subscription` | `10` | Flat |
| `inp-streaming` | `8` | Flat |
| `inp-airbnb-fee-type` | `"3%"` | Conservative default; user must verify |
| `inp-preventive-inspection` | `50` | Flat prorated |
| `inp-hvac-filters` | `10` | Midpoint 2BR/3BR |
| `inp-cpa` | `42` | Flat prorated |

**New one-time fields:**

| Field key | Backfill value |
|---|---|
| `inp-minut-hardware` | `100` |
| `inp-wifi-router` | `100` |
| `inp-welcome-kits` | `195` |

> **Note:** The backfill sets `inp-utilities` to `0` on existing records because the new breakdown fields replace it. The old combined value (typically `185`) is effectively re-modeled as `electricity + water + sewer`. This will cause existing analyses to show higher costs than before — users should review their saved analyses after the migration runs.

**Script approach:** A single `UPDATE` using a chained `jsonb_set` (or a `WITH` CTE that iterates new keys). Only modifies rows where the key is absent (`NOT (inputs ? 'inp-electricity')`), so re-running the script is safe.

---

## Open Questions (resolved)

| Question | Decision |
|---|---|
| Airbnb fee | Dropdown: 3% or 15.5% |
| Utilities | Split into 4 fields |
| Lawn care | Has Yard? toggle |
| Refactor timing | Refactor first (PR 1), then costs (PR 2) |
| Old saved analyses | Backfill via `007_backfill_analysis_inputs.sql` |
| New field defaults | Midpoint of documented range, with range label below each input |

---

*R&L Capital Realty LLC · Internal · Jun 2026*
