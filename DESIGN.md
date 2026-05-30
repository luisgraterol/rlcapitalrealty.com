---
name: R&L Capital Realty
description: Premium furnished short-term housing for military, corporate, and university guests in Abilene, TX
colors:
  navy: "#0f1f2e"
  navy-mid: "#1a2f44"
  navy-light: "#243a52"
  gold: "#c9a96e"
  gold-light: "#dfc090"
  gold-dim: "#a8885a"
  cream: "#faf8f4"
  cream-dark: "#f2ede4"
  ink: "#3d3530"
  muted: "#7a6e65"
  profit: "#4caf81"
  profit-dim: "#3a8a64"
  risk: "#d4a32a"
  risk-dim: "#b88a1e"
  loss: "#c94a4a"
  loss-dim: "#a83838"
  error: "#c0392b"
  success: "#2e7d5e"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.8rem, 6vw, 5rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2rem, 3.5vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "0.01em"
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.22em"
rounded:
  none: "0"
  xs: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "28px"
  xl: "48px"
  section: "100px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy}"
    rounded: "{rounded.xs}"
    padding: "15px 40px"
  button-primary-hover:
    backgroundColor: "{colors.gold-light}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.xs}"
    padding: "15px 32px"
  button-ghost-gold:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    rounded: "{rounded.xs}"
    padding: "12px 30px"
  button-ghost-gold-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy}"
  nav-cta:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    rounded: "{rounded.xs}"
    padding: "8px 20px"
  nav-cta-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy}"
---

# Design System: R&L Capital Realty

## 1. Overview

**Creative North Star: "The Garrison Estate"**

R&L Capital Realty occupies a specific intersection: the measured confidence of a military command structure and the quiet prestige of a well-run estate. The system speaks to people who have been sent somewhere on someone else's schedule, or who are deciding whether to trust a stranger with their property. Neither audience tolerates decoration that pretends to be function. The design earns trust by looking like it was made by someone who does not need to impress you.

The palette is dark-anchored and gold-accented: a near-black deep navy as the primary structural color, a warm burnished gold as the sole emphasis voice, and an off-white cream as the light surface. These three colors have clear jobs and do not cross over. The typography pairs a weight-light display serif (Cormorant Garamond) for headings and italic emphasis with a clean geometric sans (DM Sans) for all functional text: labels, body, navigation, buttons. Motion is purposeful and entrance-focused, not choreographic.

The system explicitly rejects: vacation-rental marketplace aesthetics (Airbnb listing grid, Vrbo card layouts), budget hospitality chain identity, generic real estate agency templates with stock-photo hero sliders, over-corporate coldness, and any form of gradient text, glassmorphism, or startup-launch-page energy.

**Key Characteristics:**
- Dark-anchored pages (navy backgrounds for hero, trust, and admin surfaces) punctuated by warm cream sections
- Gold used as a single emphasis accent, never background fill except the marquee strip
- Serif headings always in lower weight (300-400), italic used for emotional emphasis within headline copy
- Square-cornered components throughout (2px radius maximum): no soft rounding
- Motion is entrance-only at the page/section level; components animate on hover state only

---

## 2. Colors: The Navy-Gold-Cream Triad

A three-color structural system with a semantic data layer for the admin portal.

### Primary
- **Deep Garrison Navy** (`#0f1f2e`): The primary dark surface. Used for the hero background, trust section, admin portal background, navigation bar, footer, and the contact CTA box. This color dominates the "serious" moments of the interface.
- **Mid Navy** (`#1a2f44`): Secondary dark surface. Used for card backgrounds and admin panel sections one level lighter than the base navy.
- **Navy Light** (`#243a52`): Tertiary dark surface. Input backgrounds and subtle panel differentiation in admin.

### Secondary
- **Burnished Gold** (`#c9a96e`): The single accent voice. Used for the wordmark ampersand, navigation hover states, CTA button fills, italic heading emphasis, border-bottom on the marquee strip, focus rings on inputs, and icon strokes. Appears on no more than 15% of any given screen surface.
- **Gold Light** (`#dfc090`): Hover state for gold fills only. Never used at rest.
- **Gold Dim** (`#a8885a`): Muted gold for secondary labels, section labels, icon strokes in low-emphasis contexts, and the subtle gold tints on decorative borders.

### Tertiary
- **Profit Green** (`#4caf81`): Positive financial outcomes in the admin calculator. P&L values in the green.
- **Risk Amber** (`#d4a32a`): Caution signals in the risk assessment panel.
- **Loss Red** (`#c94a4a`): Negative financial outcomes, error states.

### Neutral
- **Cream White** (`#faf8f4`): The primary light surface background. Used for the services and landlords sections, and as the page default background.
- **Cream Dark** (`#f2ede4`): Section accent background. The audience and contact sections use this one tier darker than cream to create rhythm without a color shift.
- **Ink** (`#3d3530`): Body text color. A warm near-black, not pure black. Reads as legible without clinical hardness.
- **Muted** (`#7a6e65`): Secondary text, card descriptions, supporting copy. Used only for text that is genuinely less important, not for decoration.

### Named Rules
**The One Voice Rule.** Gold appears on one element at a time per viewport: either a button fill, a heading italic, or an icon stroke. Two gold elements competing for attention on the same screen is a mistake; one is never enough.

**The Section Alternation Rule.** Light sections (cream `#faf8f4`) and dark sections (navy `#0f1f2e`) alternate to create reading rhythm. Two light sections never stack without a dark separator between them.

---

## 3. Typography

**Display Font:** Cormorant Garamond (with Georgia, serif fallback)
**Body Font:** DM Sans (with system-ui, sans-serif fallback)

**Character:** The pair resolves the brand tension directly: Cormorant Garamond is the stationery that a well-established Abilene real estate firm would use; DM Sans is the type on the contract itself. One communicates standing; one communicates clarity. They share no visual DNA, which is the point.

### Hierarchy

- **Display** (300 weight, `clamp(2.8rem, 6vw, 5rem)`, lh 1.1): Hero headline only. Italics signal emotional emphasis, not decoration. Max viewport-capped at 5rem so it never shouts.
- **Headline** (400 weight, `clamp(2rem, 3.5vw, 3rem)`, lh 1.15): Section headings (h2). Carries the serif weight higher than display to anchor section structure.
- **Title** (500 weight, `1.3rem`-`1.6rem`, lh 1.3): Card headings, service names, trust card titles. Cormorant Garamond at 500 weight gives distinction without bulk.
- **Body** (300 weight, `0.87rem`-`1rem`, lh 1.6-1.75): DM Sans for all paragraph text. Light weight intentional: matches the restrained brand voice. Maximum line length 480-520px (approx. 65-70ch at 0.87rem).
- **Label** (500 weight, `0.65rem`-`0.75rem`, lh 1, uppercase, `0.18`-`0.22em` tracking): Section category markers, button text, nav links, contact field labels. All-caps only at this scale and weight; never used for running prose.

### Named Rules
**The Italic-Only Emphasis Rule.** Within serif headings, emphasis is conveyed exclusively through italics. No bold within display or headline copy. Italics are reserved for the emotionally significant phrase in a heading, used once per heading, not more.

**The Serif-Heading Sans-Body Split.** Cormorant Garamond is never used for body copy, form labels, or navigation. DM Sans is never used for headings. The two families have hard jurisdictions.

---

## 4. Elevation

This system is flat by default. Surfaces do not carry resting shadows; shadows appear only as hover-state feedback, signaling interactivity. The dark section backgrounds create perceived depth through tonal contrast, not shadow stacking.

### Shadow Vocabulary

- **Hover-lift ambient** (`0 8px 32px rgba(15,31,46,.08)`): Service cards and landlord benefit rows on hover. The navy-tinted shadow keeps the lift within the brand palette rather than reading as generic gray.
- **Button glow** (`0 12px 32px rgba(201,169,110,.25)`): Primary button on hover. Gold-tinted glow associates the lift with the accent color.
- **Nav scroll shadow** (`0 4px 24px rgba(0,0,0,.3)`): Navigation bar only, appears after 40px of vertical scroll. Signals that the nav has lifted above the page content.
- **Contact hover** (`0 4px 20px rgba(15,31,46,.06)`): Landlord benefit row on hover. Lighter than service cards to match the less prominent section register.

### Named Rules
**The Flat-By-Default Rule.** No component carries a shadow at rest. Shadows are state, not decoration. A resting box shadow on a card is not sophistication; it is visual noise.

---

## 5. Components

### Navigation
A fixed 68px bar, navy background at 97% opacity, 12px backdrop blur. Gold rule along the bottom border at 18% opacity. Wordmark in Cormorant Garamond (1.2rem, 400 weight) with the "&" in gold. Nav links in DM Sans at 0.76rem, 0.1em tracking, uppercase, at 65% cream opacity, gold on hover. CTA link is a 2px-radius border-ghost in gold, fills gold/navy on hover.

### Buttons

- **Shape:** Nearly square. `border-radius: 2px`. No pill shapes, no large rounding anywhere in the system.
- **Primary:** Gold fill (`#c9a96e`), navy text, 2px radius, `15px 40px` padding. DM Sans 0.78rem, 500 weight, 0.12em tracking, uppercase. On hover: lifts 2px, gold-light fill, box-glow.
- **Secondary (hero ghost):** Transparent, cream-tinted border at 40% opacity, cream text at 70% opacity. Gold border and text on hover. Same scale as primary.
- **Ghost gold (outline):** Transparent, full-opacity gold border, gold text. Gold fill, navy text on hover. Used in contact section and nav CTA.
- **Ghost neutral (ghost white):** Transparent, 18% cream border, 55% cream text. Full cream border and text on hover. Used for the WhatsApp button in the contact CTA box.
- All button text: arrow character (`→`) appended, transitions `translateX(4px)` on parent hover.

### Cards / Containers

- **Service Cards:** White background, 1px navy border at 7% opacity, `32px 36px` padding. On hover: border shifts to gold at 30% opacity, ambient navy lift shadow, `translateX(6px)` slide. Square corners throughout.
  - Has a gold left-border accent (`::before` 3px, scaleY on hover). **Flagged for replacement in the polish pass:** this is a side-stripe border pattern and violates the absolute bans. Replace with a top border, full-border shift, or background tint.
- **Trust Cards:** Navy surface at 4% cream opacity (`rgba(250,248,244,.04)`), gold border at 10% opacity, `40px 28px` padding. Bottom 2px gradient line (transparent > gold > transparent) reveals on hover. On dark navy background.
- **Landlord Benefits:** White background, thin 7% navy border, `22px 24px` padding, flex row with 36x36 square icon frame (gold border at 25% opacity).
- **Contact CTA Box:** Full navy background, 2px gold top border, `52px 44px` padding. Serves as the primary conversion surface on the homepage.
- **Auth Card:** Same navy system as Trust/Hero sections. White card centered on dark background, white surface.

### Inputs / Fields

- **Style:** Standard HTML inputs. Dark background variants in auth/admin: navy-light background, cream text, gold focus ring.
- **Focus:** Gold border or glow at full opacity. No animated scale, no custom box-shadow stack.
- **Error:** Loss red (`#c94a4a`) text and border.

### Section Labels (Use with restraint)

The `.section-label` pattern is a small-caps DM Sans label (`0.65rem`, `0.22em` tracking, gold-dim color) with a 28px horizontal rule before it. It appears on multiple sections in the current build. **Named as a pattern here for documentation; the polish pass should reduce frequency** — one deliberate kicker as a brand voice move, not an eyebrow on every section.

### Marquee Strip
Full-width gold fill (`#c9a96e`). DM Sans text in navy, 0.7rem, 500 weight, 0.18em tracking, uppercase. Animated `translateX(-50%)` over 28s. Separators are 4px navy dots at 40% opacity.

### Admin Data Components (product register)
- **Metric rows:** Label in DM Sans 0.75rem muted, value in Cormorant Garamond 1.8-2rem at 300 weight
- **Scenario table:** Standard table with gold header accent, navy background, cream text
- **Risk badges:** Pill-shaped (border-radius 4px), color-coded by profit/risk/loss semantic tokens

---

## 6. Do's and Don'ts

### Do:
- **Do** use navy (`#0f1f2e`) as the background for any section that needs authority: hero, trust, admin, footer, contact CTA.
- **Do** use gold (`#c9a96e`) as a single emphasis voice per screen region: one gold call-to-action, one gold italic word, one gold icon set. Not all three simultaneously.
- **Do** use Cormorant Garamond in italic for the emotionally charged word or phrase in any hero or section headline, once per heading.
- **Do** keep all border radii at 2px or zero. No rounding above 4px for any surface in this system.
- **Do** use cream (`#faf8f4`) and cream-dark (`#f2ede4`) to alternate light section backgrounds, creating rhythm without color shifts.
- **Do** size display text with `clamp()` and cap the max at 5rem. A heading that fills the viewport is shouting.
- **Do** provide `@media (prefers-reduced-motion: reduce)` alternatives for every scroll reveal and entrance animation.
- **Do** use DM Sans at 300 weight for body copy. The brand voice is measured, not heavy.

### Don't:
- **Don't** use vacation rental platform aesthetics: photo grid layouts, star ratings, map embeds, booking-widget UI patterns, or anything that reads as "Airbnb listing." We are the operator, not the marketplace.
- **Don't** use glassmorphism. No frosted-glass cards, no blur-backed translucent panels as a decorative default. The nav backdrop blur is a functional exception, not a pattern to extend.
- **Don't** use gradient text (`background-clip: text`). Gold is a single solid color. Emphasis via weight or size, not color gradients.
- **Don't** add side-stripe borders: `border-left` wider than 1px as a colored accent on cards or list items. Replace with full border, background tint, or leading icon.
- **Don't** use the section-label eyebrow pattern on every section. Reserve it for one or two moments where the category label genuinely aids navigation.
- **Don't** use numbered section markers (01 / 02 / 03) as decorative scaffolding unless the sequence genuinely carries ordered information the reader needs.
- **Don't** use warm-neutral cream (`#faf8f4`) as a premium-feel shortcut. It is the page background. Brand premium is carried by navy + gold + Cormorant Garamond, not by a warm off-white body.
- **Don't** extend the font count beyond two families. No secondary sans, no display mono, no script accents.
- **Don't** use budget hospitality chain conventions: floor plan icons, "from $X/night" rate tables in the hero, review score badges, amenity icon grids labeled with checkmarks.
- **Don't** use overly corporate design conventions: feature comparison tables, enterprise SaaS pricing tiers, HR-style staff grids.
