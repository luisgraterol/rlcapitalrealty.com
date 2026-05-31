# Admin Portal Redesign Plan

## Goals

1. Flip the entire admin area to light mode (neutral white/gray, SaaS tool feel)
2. Remove the "Welcome back" hero section — calculator is the primary content
3. Give the scenario analysis table more breathing room

## Design decisions

- **Palette:** `#f6f5f3` page body, `#ffffff` card/panel surfaces, `#0f1f2e` navy text, `#c9a96e`/`#a8885a` gold accents
- **Gold on white:** Use `#a8885a` (darker gold, ~3.2:1) for all gold text on white panels; reserve `#c9a96e` for decorative borders, icons, and dividers only
- **Navbar:** Light variant when authenticated — white bg, navy text, same wordmark treatment as homepage but inverted
- **Welcome section:** Deleted entirely; calculator is the first content below the navbar

---

## File-by-file changes

### `src/layouts/AdminLayout.astro`

**Navbar — light variant**

| Property | Before | After |
|---|---|---|
| `background` | `#0f1f2e` (navy) | `#ffffff` |
| Bottom border | none | `1px solid rgba(15,31,46,.1)` |
| Wordmark color | `#faf8f4` (cream) | `#0f1f2e` (navy) |
| Wordmark `&` accent | `#c9a96e` | `#c9a96e` (keep — decorative) |
| Wordmark divider | `rgba(cream,.35)` | `rgba(navy,.2)` |
| Wordmark sub "LLC" | `rgba(cream,.45)` | `rgba(navy,.4)` |
| User email | `rgba(cream,.6)` | `rgba(navy,.55)` |
| Sign Out button | cream outline on dark | navy outline on white |
| Sign Out hover | cream bg | navy bg, white text |

---

### `src/components/admin/Calculator.astro`

#### A. Remove welcome section

Delete the entire `.portal-header` block and its CSS:

**HTML to remove:**
```html
<div class="portal-header">
  <div class="portal-eyebrow">...</div>
  <h1 class="portal-headline">Welcome back, ...</h1>
  <p class="portal-sub">...</p>
  <div class="portal-badge">...</div>
</div>
```

**CSS to remove:** `.portal-header`, `.portal-headline`, `.portal-sub`, `.portal-badge`, `.portal-eyebrow`

Result: `PROPERTY FINANCIAL CALCULATOR` eyebrow + `.calc-layout` become the first visible content (~280px recovered).

---

#### B. Light mode — surfaces and layout chrome

| Element | Before | After |
|---|---|---|
| `body` background | `#0f1f2e` | `#f6f5f3` |
| `.calc-panel`, `.output-panel` bg | `#111b24` | `#ffffff` |
| Panel border | `rgba(250,248,244,.08)` | `rgba(15,31,46,.1)` |
| Panel box-shadow | dark glow | `0 1px 4px rgba(15,31,46,.06), 0 0 0 1px rgba(15,31,46,.08)` |
| `.compare-panel` bg | dark | `#ffffff` with same border |
| `.saved-card` bg | dark | `#ffffff` |
| `.saved-card` border | `rgba(cream,.08)` | `rgba(navy,.1)` |
| `.saved-card:hover` border | gold `.35` | gold `.5` |
| Page-level `color` (base) | `#faf8f4` | `#0f1f2e` |

---

#### C. Light mode — typography and labels

All `rgba(250,248,244, X)` (cream-on-dark) → `rgba(15,31,46, Y)` (navy-on-light). Opacity mappings preserve relative hierarchy:

| Selector | Before | After |
|---|---|---|
| `.portal-sub` (removed) | — | — |
| `label` | `rgba(cream,.58)` | `rgba(navy,.55)` |
| `.field-note` | `rgba(cream,.48)` | `rgba(navy,.45)` |
| `.metric-label` | `rgba(cream,.55)` | `rgba(navy,.52)` |
| `.metric-value` | `#faf8f4` | `#0f1f2e` |
| `.scenario-table th` | `rgba(cream,.52)` | `rgba(navy,.5)` |
| `.scenario-table td` | `#faf8f4` | `#0f1f2e` |
| `.saved-card-addr` | `rgba(cream,.52)` | `rgba(navy,.5)` |
| `.saved-meta-label` | `rgba(cream,.48)` | `rgba(navy,.45)` |
| `.empty-state` | `rgba(cream,.4)` | `rgba(navy,.38)` |
| `.hoa-block-body` | `rgba(cream,.9)` | `rgba(navy,.75)` |
| `.hot-info p` | `rgba(cream,.58)` | `rgba(navy,.55)` |
| Section eyebrow (`PROPERTY FINANCIAL CALCULATOR`) | `rgba(cream,.35)` | `rgba(navy,.35)` |
| Gold text (section labels, metric highlights) | `#c9a96e` | `#a8885a` (darker gold for contrast on white) |
| Profit green `#4caf81` | keep | verify on white — keep if ≥3:1 |
| Risk amber `#d4a32a` | keep | keep (decorative, not body text) |
| Loss red `#c94a4a` | keep | keep |

---

#### D. Light mode — form inputs

| Property | Before | After |
|---|---|---|
| Input `background` | `rgba(0,0,0,.25)` | `#ffffff` |
| Input `color` | `#faf8f4` | `#0f1f2e` |
| Input `border` | `rgba(cream,.1)` | `rgba(navy,.15)` |
| Input `::placeholder` | `rgba(cream,.45)` | `#8a7e78` (same as auth pages, ≥4.5:1) |
| Input `:focus` border | `#c9a96e` | `#c9a96e` (keep — on white it's fine as a focus ring) |
| Input `:focus` shadow | `rgba(gold,.2)` | `rgba(gold,.18)` |
| Select `background` | dark | `#ffffff` |
| `.field-note` | `rgba(cream,.48)` | `rgba(navy,.45)` |

---

#### E. Light mode — accordion headers

| Property | Before | After |
|---|---|---|
| Accordion header bg | `rgba(cream,.05)` | `rgba(navy,.04)` |
| Accordion header text | `#c9a96e` (gold) | `#a8885a` |
| Accordion header border-bottom | `rgba(cream,.08)` | `rgba(navy,.08)` |
| Accordion chevron | `#c9a96e` | `#a8885a` |
| Accordion open indicator | gold | `#a8885a` |

---

#### F. Light mode — buttons

Primary buttons (Save Analysis, Export .MD) are navy-on-dark currently — they stay navy, still work on light:

| Selector | Before | After |
|---|---|---|
| `.btn-save` / `.btn-export` bg | `rgba(cream,.08)` border, cream text | navy bg `#0f1f2e`, white text (more contrast on light) |
| `.btn-save:hover` | lighten | `#243a52` (same hover pattern as auth page) |
| `.btn-delete-card` | `rgba(cream,.35)` | `rgba(navy,.35)` |
| `.btn-delete-card:hover` | red | keep red |

---

#### G. Scenario analysis table — spacing

| Property | Before | After |
|---|---|---|
| `th` padding | `8px 12px` | `12px 16px` |
| `td` padding | `8px 12px` | `11px 16px` |
| `th` font-size | `.62rem` | `.68rem` |
| `td` font-size | `.88rem` | `.92rem` |
| Section label → table gap | `0` | `margin-top: 8px` on table |
| Row divider color | `rgba(cream,.08)` | `rgba(navy,.08)` (same ratio, new base) |

---

## Implementation order

1. `AdminLayout.astro` — navbar light variant (isolated, low risk)
2. `Calculator.astro` — delete welcome section (structural, straightforward)
3. `Calculator.astro` — body/surface light mode (broad, touch body + panels)
4. `Calculator.astro` — text/label opacity flips (fine-grained)
5. `Calculator.astro` — input light mode
6. `Calculator.astro` — accordion + buttons
7. `Calculator.astro` — scenario table spacing
8. Build + screenshot verify all sections

## Verification checklist

- [ ] Navbar: light bg, navy wordmark, email readable, sign out button works
- [ ] Calculator opens as first content below navbar (no welcome section)
- [ ] All inputs readable: placeholder ≥4.5:1, label ≥4.5:1, value text ≥4.5:1
- [ ] Gold text uses `#a8885a` where it appears over white (≥3.2:1)
- [ ] Profit/risk/loss semantic colors still legible on white bg
- [ ] Scenario table rows have visible height, numbers easy to scan
- [ ] Saved analyses cards read correctly on white
- [ ] Compare panel reads correctly
- [ ] `npm run build` passes with no errors
