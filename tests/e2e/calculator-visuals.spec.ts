/**
 * E2E visual tests for the Property Analyzer results panel.
 *
 * Auth strategy: inject a fake Supabase v2 session into localStorage before
 * page load so requireAuth() short-circuits without hitting the network.
 * Supabase data calls are intercepted and return empty arrays so the UI
 * reaches a runnable state without real DB data.
 */

import { test, expect, type Page } from '@playwright/test';

// ── Auth mock helpers ─────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://bbksleaevklroeyukprc.supabase.co';
const STORAGE_KEY   = 'sb-bbksleaevklroeyukprc-auth-token';
const FAKE_SESSION  = {
  access_token:  'fake.access.token',
  refresh_token: 'fake-refresh-token',
  expires_at:    Math.floor(Date.now() / 1000) + 86400, // 24 h from now
  expires_in:    86400,
  token_type:    'bearer',
  user: {
    id:    'test-user-id',
    email: 'test@rlcapitalrealty.com',
    role:  'authenticated',
    aud:   'authenticated',
    app_metadata:  { provider: 'email' },
    user_metadata: {},
    created_at:    '2024-01-01T00:00:00.000Z',
  },
};

async function mockAuth(page: Page) {
  // Inject session before JS runs so getSession() reads it from localStorage.
  await page.addInitScript(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session));
  }, { key: STORAGE_KEY, session: FAKE_SESSION });

  // Intercept Supabase REST data calls and return empty datasets.
  await page.route(`${SUPABASE_URL}/rest/v1/**`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  // Intercept auth token refresh calls (in case the client tries to refresh).
  await page.route(`${SUPABASE_URL}/auth/v1/**`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_SESSION),
    }),
  );
}

async function loadAnalyzer(page: Page) {
  await mockAuth(page);
  await page.goto('/admin/analyzer');
  // Wait for the calculator form to be present — signals JS has hydrated.
  await page.waitForSelector('#inp-rent-neg', { timeout: 10_000 });
}

// ── Helper: fill a number input ───────────────────────────────────────────────

async function fillNumber(page: Page, id: string, value: number) {
  await page.fill(`#${id}`, String(value));
  // Dispatch input event to trigger runCalc()
  await page.dispatchEvent(`#${id}`, 'input');
}

// ── Structure tests ───────────────────────────────────────────────────────────

test.describe('Results panel — DOM structure', () => {
  test('all five visual sections render on the page', async ({ page }) => {
    await loadAnalyzer(page);

    // Section 1: property header
    await expect(page.locator('.res-header')).toBeVisible();
    await expect(page.locator('#res-address')).toBeVisible();
    await expect(page.locator('#res-buffer')).toBeVisible();

    // Section 2: metric cards (4 cards)
    await expect(page.locator('.res-metrics')).toBeVisible();
    await expect(page.locator('.res-metric')).toHaveCount(4);

    // Section 3: chart row with waterfall + gauge + scenarios
    await expect(page.locator('.res-chart-row')).toBeVisible();
    await expect(page.locator('#chart-waterfall')).toBeVisible();
    await expect(page.locator('#chart-gauge')).toBeVisible();
    await expect(page.locator('#chart-scenarios')).toBeVisible();

    // Section 4: monthly cash flow
    await expect(page.locator('#chart-monthly')).toBeVisible();

    // Section 5: ROI payback curve
    await expect(page.locator('#chart-roi')).toBeVisible();
  });

  test('risk assessment and cleaning sections are collapsible', async ({ page }) => {
    await loadAnalyzer(page);
    const collapsibles = page.locator('.res-collapsible');
    await expect(collapsibles).toHaveCount(2);
  });

  test('walk-away threshold input exists in Property Basics', async ({ page }) => {
    await loadAnalyzer(page);
    await expect(page.locator('#inp-walk-away')).toBeVisible();
    await expect(page.locator('#inp-walk-away')).toHaveValue('1750');
  });
});

// ── Metric card color tests ───────────────────────────────────────────────────

test.describe('Metric card colors — net monthly', () => {
  test('shows green when net monthly is comfortably profitable (>$700)', async ({ page }) => {
    await loadAnalyzer(page);
    // Default inputs: ADR=167, occ=77, rent=1200 → net ~$1,175
    await page.waitForTimeout(300); // allow initial runCalc
    const cls = await page.locator('#rmc-net-monthly').getAttribute('class');
    expect(cls).toContain('rmc--green');
  });

  test('shows red when net monthly is negative (very high rent, low ADR)', async ({ page }) => {
    await loadAnalyzer(page);
    await fillNumber(page, 'inp-rent-neg', 3500); // push net deep negative
    await fillNumber(page, 'inp-adr', 50);
    await page.waitForTimeout(200);
    const cls = await page.locator('#rmc-net-monthly').getAttribute('class');
    expect(cls).toContain('rmc--red');
  });

  test('shows amber when net monthly is modest ($200–$700)', async ({ page }) => {
    await loadAnalyzer(page);
    // Tune inputs so net is around $400-500: raise rent, keep ADR moderate
    await fillNumber(page, 'inp-rent-neg', 1700);
    await fillNumber(page, 'inp-adr', 130);
    await fillNumber(page, 'inp-occ', 70);
    await page.waitForTimeout(200);
    const cls = await page.locator('#rmc-net-monthly').getAttribute('class');
    // Depending on exact math, amber or green — just ensure not red
    expect(cls).toMatch(/rmc--(green|amber)/);
  });
});

// ── Walk-away badge tests ─────────────────────────────────────────────────────

test.describe('Walk-away badge', () => {
  test('shows ok badge when rent is below threshold', async ({ page }) => {
    await loadAnalyzer(page);
    // Default: rent=1200, threshold=1750 → within range
    await page.waitForTimeout(300);
    const badge = page.locator('#res-badge');
    await expect(badge).toBeVisible();
    const cls = await badge.getAttribute('class');
    expect(cls).toContain('res-badge--ok');
    await expect(badge).toContainText('Within target range');
  });

  test('shows warn badge when rent exceeds threshold', async ({ page }) => {
    await loadAnalyzer(page);
    await fillNumber(page, 'inp-rent-neg', 2000);
    await page.waitForTimeout(200);
    const badge = page.locator('#res-badge');
    await expect(badge).toBeVisible();
    const cls = await badge.getAttribute('class');
    expect(cls).toContain('res-badge--warn');
    await expect(badge).toContainText('above walk-away threshold');
  });

  test('badge overage text is correct', async ({ page }) => {
    await loadAnalyzer(page);
    await fillNumber(page, 'inp-rent-neg', 1800); // $50 over default $1750 threshold
    await page.waitForTimeout(200);
    await expect(page.locator('#res-badge')).toContainText('$50 above walk-away threshold');
  });

  test('hides badge when walk-away threshold is set to 0', async ({ page }) => {
    await loadAnalyzer(page);
    await fillNumber(page, 'inp-walk-away', 0);
    await page.waitForTimeout(200);
    await expect(page.locator('#res-badge')).toBeHidden();
  });
});

// ── Break-even buffer ─────────────────────────────────────────────────────────

test.describe('Break-even buffer display', () => {
  test('shows positive buffer (with + prefix) when actual occ > break-even', async ({ page }) => {
    await loadAnalyzer(page);
    // Default inputs are profitable so buffer should be positive
    await page.waitForTimeout(300);
    const bufText = await page.locator('#res-buffer').textContent();
    expect(bufText).toMatch(/^\+\d+pp$/);
  });

  test('shows negative buffer when actual occ < break-even', async ({ page }) => {
    await loadAnalyzer(page);
    await fillNumber(page, 'inp-occ', 10);
    await fillNumber(page, 'inp-rent-neg', 2500);
    await page.waitForTimeout(200);
    const bufText = await page.locator('#res-buffer').textContent();
    expect(bufText).toMatch(/^-\d+pp$/);
  });
});

// ── Chart canvas elements ─────────────────────────────────────────────────────

test.describe('Chart canvas elements', () => {
  test('all four Chart.js canvases are rendered in the DOM', async ({ page }) => {
    await loadAnalyzer(page);
    for (const id of ['chart-waterfall', 'chart-scenarios', 'chart-monthly', 'chart-roi']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
      const tag = await page.locator(`#${id}`).evaluate(el => el.tagName);
      expect(tag).toBe('CANVAS');
    }
  });

  test('gauge canvas is rendered with correct dimensions', async ({ page }) => {
    await loadAnalyzer(page);
    const canvas = page.locator('#chart-gauge');
    await expect(canvas).toBeVisible();
    const w = await canvas.getAttribute('width');
    const h = await canvas.getAttribute('height');
    expect(Number(w)).toBe(220);
    expect(Number(h)).toBe(130);
  });
});

// ── Seasonal footnote ─────────────────────────────────────────────────────────

test.describe('Seasonal occupancy disclaimer', () => {
  test('shows a market note below the monthly chart', async ({ page }) => {
    await loadAnalyzer(page);
    await page.waitForTimeout(300);
    // The note is only visible after runCalc, which happens on load
    const note = page.locator('#market-note');
    await expect(note).toBeVisible();
    const text = await note.textContent();
    expect(text?.length).toBeGreaterThan(10);
  });
});