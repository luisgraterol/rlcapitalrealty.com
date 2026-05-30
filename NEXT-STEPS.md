# Next Steps — Post-Migration Checklist

## 1. Vercel Environment Variables

In the Vercel dashboard for this project, rename the environment variables:

| Old name | New name |
|---|---|
| `SUPABASE_URL` | `PUBLIC_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | `PUBLIC_SUPABASE_ANON_KEY` |

**Where:** Vercel Dashboard → Project → Settings → Environment Variables

The old names will no longer work — Astro/Vite only exposes `PUBLIC_*` prefixed variables to client-side code.

---

## 2. Impeccable Setup (one-time)

Run this once before any design passes:

```
/impeccable init
```

This reads `PRODUCT.md` and `DESIGN.md` (if present) to load brand context. If `DESIGN.md` doesn't exist yet, run `/document` first (step 3).

---

## 3. Generate DESIGN.md

Run `/document` pointed at the new Astro source files. This extracts the visual system (colors, typography, component patterns) into a portable `DESIGN.md` spec that all subsequent Impeccable commands will reference.

```
/document
```

Review the generated `DESIGN.md` and verify the extracted tokens match the intended design (navy `#0f1f2e`, gold `#c9a96e`, cream `#faf8f4`, Cormorant Garamond + DM Sans).

---

## 4. Homepage Design Pass

Start the dev server first:

```bash
npm run dev
```

Then in Claude Code:

**a. Typography**
```
/typeset
```
Review heading scale, body copy sizing, letter-spacing, and line-height across all homepage sections. Pay attention to the hero headline (`clamp(2.8rem, 6vw, 5rem)`) and section titles.

**b. Layout & Spacing**
```
/layout
```
Check visual rhythm across sections: hero → marquee → audience → services → trust → landlords → contact. Fix any inconsistent padding or gap values.

**c. Live iteration (optional)**
```
/live
```
Click individual elements in the running browser to generate and compare variants. Good candidates: hero CTA buttons, service cards, trust grid cards.

---

## 5. Auth Pages Design Pass

With dev server running:

**a. Color usage on forms**
```
/colorize
```
Ensure error states (red), success states (green), and focus rings (gold) are used strategically on the login and password-reset forms without feeling garish.

**b. UX copy**
```
/clarify
```
Review button labels, error messages, placeholder text, and hint copy on both `/auth/login` and `/auth/callback` for clarity and tone consistency.

---

## 6. Admin Portal Design Pass

With dev server running:

**a. Layout & spacing**
```
/layout
```
Check the two-column sticky calculator layout, accordion section spacing, and the responsive collapse at ≤1024px. Verify the output panel stays readable when the input panel is long.

**b. Typography hierarchy**
```
/typeset
```
The output panel is data-dense — verify that metric values, labels, units, and section titles have clear visual hierarchy. Check scenario table and comparison table readability.

**c. Live iteration (optional)**
```
/live
```
Good candidates: saved analysis cards, metric rows in the output panel, risk flag badges.

---

## 7. Final Quality Pass (pre-deploy)

Run all three before pushing to production:

**a. Technical audit**
```
/audit
```
Five-dimension quality check with P0–P3 severity. Fix all P0 and P1 findings before shipping.

**b. Design review**
```
/critique
```
Scoring and persona tests. Run against: military TDY traveler (homepage), property owner (homepage landlord section), and internal operator (admin portal).

**c. Polish pass**
```
/polish
```
Final meticulous pass across all pages before pushing.

---

## 8. CI Detection Gate (optional)

Add this to your CI pipeline to catch design anti-patterns on every build:

```bash
npx impeccable detect src/
```

Returns exit code 1 if any of the 41 deterministic rules fail. Add as a build step in Vercel or a GitHub Actions workflow.

---

## 9. Deploy & Verify

1. Push to `main` — Vercel will run `npm run build` automatically
2. Confirm the Vercel build log shows `4 page(s) built` with no errors
3. Verify the following routes work on the live domain:
   - `rlcapitalrealty.com/` — homepage loads, tabs switch, scroll reveal fires
   - `rlcapitalrealty.com/auth/login` — login form works, forgot-password sends email
   - `rlcapitalrealty.com/auth/callback` — handles password reset link correctly
   - `rlcapitalrealty.com/admin` — redirects to login if unauthenticated; calculator saves/loads/compares/exports after login
4. Confirm old URLs redirect correctly:
   - `/admin.html` → `/admin`
   - `/auth/login.html` → `/auth/login`
   - `/auth/callback.html` → `/auth/callback`
5. Verify `CNAME` is served correctly for the custom domain

---

## 10. Update README

Update [README.md](README.md) to reflect the new stack:

- Stack: Astro + Tailwind CSS + TypeScript + Supabase + Vercel
- Setup: `npm install` instead of `node scripts/build.js`
- Dev: `npm run dev`
- Build: `npm run build`
- Env vars: `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
- Routes: `/admin`, `/auth/login`, `/auth/callback` (no `.html`)
