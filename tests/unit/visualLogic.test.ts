import { describe, it, expect } from 'vitest';
import {
  fmtK,
  gaugeAngle,
  metricCardClass,
  badgeState,
  getMonthlyProfile,
} from '@lib/visualLogic';

// ── fmtK ─────────────────────────────────────────────────────────────────────

describe('fmtK', () => {
  it('formats zero as $0', () => {
    expect(fmtK(0)).toBe('$0');
  });

  it('formats values below $1k as whole dollars', () => {
    expect(fmtK(500)).toBe('$500');
    expect(fmtK(999)).toBe('$999');
    expect(fmtK(1)).toBe('$1');
  });

  it('formats $1000 as $1.0k', () => {
    expect(fmtK(1000)).toBe('$1.0k');
  });

  it('formats values >= $1k with one decimal and k suffix', () => {
    expect(fmtK(1234)).toBe('$1.2k');
    expect(fmtK(1500)).toBe('$1.5k');
    expect(fmtK(9999)).toBe('$10.0k');
  });

  it('prefixes negative values with minus before the dollar sign', () => {
    expect(fmtK(-500)).toBe('-$500');
    expect(fmtK(-1500)).toBe('-$1.5k');
    expect(fmtK(-1000)).toBe('-$1.0k');
  });

  it('rounds sub-$1k values', () => {
    expect(fmtK(499.6)).toBe('$500');
    expect(fmtK(100.4)).toBe('$100');
  });
});

// ── gaugeAngle ────────────────────────────────────────────────────────────────

describe('gaugeAngle', () => {
  it('0% maps to π (9 o\'clock, left)', () => {
    expect(gaugeAngle(0)).toBeCloseTo(Math.PI, 10);
  });

  it('100% maps to 2π (3 o\'clock, right)', () => {
    expect(gaugeAngle(100)).toBeCloseTo(2 * Math.PI, 10);
  });

  it('50% maps to 3π/2 (top of arc)', () => {
    expect(gaugeAngle(50)).toBeCloseTo(1.5 * Math.PI, 10);
  });

  it('clamps values below 0 to π', () => {
    expect(gaugeAngle(-10)).toBeCloseTo(Math.PI, 10);
    expect(gaugeAngle(-100)).toBeCloseTo(Math.PI, 10);
  });

  it('clamps values above 100 to 2π', () => {
    expect(gaugeAngle(110)).toBeCloseTo(2 * Math.PI, 10);
    expect(gaugeAngle(200)).toBeCloseTo(2 * Math.PI, 10);
  });

  it('angle increases monotonically from 0 to 100', () => {
    const a25 = gaugeAngle(25);
    const a50 = gaugeAngle(50);
    const a75 = gaugeAngle(75);
    expect(a25).toBeGreaterThan(Math.PI);
    expect(a50).toBeGreaterThan(a25);
    expect(a75).toBeGreaterThan(a50);
  });
});

// ── metricCardClass ───────────────────────────────────────────────────────────

describe('metricCardClass — monthly thresholds (700 / 200)', () => {
  const green = 700, amber = 200;

  it('returns rmc--green when value exceeds green threshold', () => {
    expect(metricCardClass(701, green, amber)).toBe('rmc--green');
    expect(metricCardClass(1000, green, amber)).toBe('rmc--green');
  });

  it('returns rmc--amber at exactly the green threshold (not strictly greater)', () => {
    expect(metricCardClass(700, green, amber)).toBe('rmc--amber');
  });

  it('returns rmc--amber when value is between amber and green thresholds', () => {
    expect(metricCardClass(500, green, amber)).toBe('rmc--amber');
    expect(metricCardClass(200, green, amber)).toBe('rmc--amber');
  });

  it('returns rmc--red when value is below amber threshold', () => {
    expect(metricCardClass(199, green, amber)).toBe('rmc--red');
    expect(metricCardClass(0, green, amber)).toBe('rmc--red');
    expect(metricCardClass(-500, green, amber)).toBe('rmc--red');
  });
});

describe('metricCardClass — annual thresholds (8400 / 2400)', () => {
  const green = 8400, amber = 2400;

  it('returns rmc--green above $8,400', () => {
    expect(metricCardClass(8401, green, amber)).toBe('rmc--green');
    expect(metricCardClass(12000, green, amber)).toBe('rmc--green');
  });

  it('returns rmc--amber at exactly $8,400', () => {
    expect(metricCardClass(8400, green, amber)).toBe('rmc--amber');
  });

  it('returns rmc--amber between $2,400 and $8,400', () => {
    expect(metricCardClass(5000, green, amber)).toBe('rmc--amber');
    expect(metricCardClass(2400, green, amber)).toBe('rmc--amber');
  });

  it('returns rmc--red below $2,400', () => {
    expect(metricCardClass(2399, green, amber)).toBe('rmc--red');
    expect(metricCardClass(-1000, green, amber)).toBe('rmc--red');
  });
});

// ── badgeState ────────────────────────────────────────────────────────────────

describe('badgeState', () => {
  it('returns warn badge when rent exceeds walk-away threshold', () => {
    const s = badgeState(1800, 1750);
    expect(s.show).toBe(true);
    expect(s.type).toBe('warn');
    expect(s.text).toBe('⚠ Rent $50 above walk-away threshold');
  });

  it('rounds the overage to the nearest dollar', () => {
    const s = badgeState(1751.7, 1750);
    expect(s.text).toBe('⚠ Rent $2 above walk-away threshold');
  });

  it('uses locale-formatted comma separators in the overage amount', () => {
    const s = badgeState(13750, 1750);
    expect(s.text).toBe('⚠ Rent $12,000 above walk-away threshold');
  });

  it('returns ok badge when rent is exactly at the walk-away threshold', () => {
    const s = badgeState(1750, 1750);
    expect(s.show).toBe(true);
    expect(s.type).toBe('ok');
    expect(s.text).toBe('✓ Within target range');
  });

  it('returns ok badge when rent is below the walk-away threshold', () => {
    const s = badgeState(1200, 1750);
    expect(s.show).toBe(true);
    expect(s.type).toBe('ok');
    expect(s.text).toBe('✓ Within target range');
  });

  it('hides the badge when walk-away is zero', () => {
    const s = badgeState(1200, 0);
    expect(s.show).toBe(false);
    expect(s.type).toBeNull();
    expect(s.text).toBe('');
  });

  it('hides the badge when both values are zero', () => {
    const s = badgeState(0, 0);
    expect(s.show).toBe(false);
  });

  it('hides the badge when walk-away is negative (invalid input)', () => {
    const s = badgeState(1200, -100);
    expect(s.show).toBe(false);
  });
});

// ── getMonthlyProfile ─────────────────────────────────────────────────────────

describe('getMonthlyProfile — structure', () => {
  it('always returns exactly 12 monthly occupancy values', () => {
    for (const driver of ['Military TDY', 'University Events', 'Corporate/Contractor', 'Mixed', 'Unknown']) {
      expect(getMonthlyProfile(driver, 77).occs).toHaveLength(12);
    }
  });

  it('all occupancy values are in [0, 1]', () => {
    for (const driver of ['Military TDY', 'University Events', 'Corporate/Contractor', 'Mixed']) {
      const { occs } = getMonthlyProfile(driver, 100);
      occs.forEach(o => {
        expect(o).toBeGreaterThanOrEqual(0);
        expect(o).toBeLessThanOrEqual(1);
      });
    }
  });

  it('all values are 0 when occupancy is 0%', () => {
    const { occs } = getMonthlyProfile('Military TDY', 0);
    occs.forEach(o => expect(o).toBe(0));
  });

  it('unknown driver falls back to Mixed profile', () => {
    const unknown = getMonthlyProfile('Seasonal Beach', 77);
    const mixed   = getMonthlyProfile('Mixed', 77);
    expect(unknown.occs).toEqual(mixed.occs);
    expect(unknown.marketType).toBe('mixed');
  });

  it('returns the correct marketType for each driver', () => {
    expect(getMonthlyProfile('Military TDY', 77).marketType).toBe('year-round');
    expect(getMonthlyProfile('University Events', 77).marketType).toBe('vacational');
    expect(getMonthlyProfile('Corporate/Contractor', 77).marketType).toBe('year-round');
    expect(getMonthlyProfile('Mixed', 77).marketType).toBe('mixed');
  });

  it('includes a non-empty note for every driver', () => {
    for (const driver of ['Military TDY', 'University Events', 'Corporate/Contractor', 'Mixed']) {
      expect(getMonthlyProfile(driver, 77).note.length).toBeGreaterThan(10);
    }
  });
});

describe('getMonthlyProfile — Military TDY seasonality', () => {
  it('peak month (July, index 6) has the highest occupancy', () => {
    const { occs } = getMonthlyProfile('Military TDY', 77);
    const max = Math.max(...occs);
    expect(occs[6]).toBeCloseTo(max, 10);
  });

  it('trough month (January, index 0) has the lowest occupancy', () => {
    const { occs } = getMonthlyProfile('Military TDY', 77);
    const min = Math.min(...occs);
    expect(occs[0]).toBeCloseTo(min, 10);
  });

  it('variance is small (near-flat year-round profile)', () => {
    const { occs } = getMonthlyProfile('Military TDY', 77);
    const max = Math.max(...occs), min = Math.min(...occs);
    expect(max - min).toBeLessThan(0.15);
  });
});

describe('getMonthlyProfile — University Events seasonality', () => {
  it('summer months (June/July, indices 5/6) are the lowest', () => {
    const { occs } = getMonthlyProfile('University Events', 77);
    const summerMin = Math.min(occs[5], occs[6]);
    const nonSummerMax = Math.max(...occs.filter((_, i) => i < 4 || i > 8));
    expect(summerMin).toBeLessThan(nonSummerMax);
  });

  it('October (index 9) has the highest occupancy for university events', () => {
    const { occs } = getMonthlyProfile('University Events', 77);
    const max = Math.max(...occs);
    expect(occs[9]).toBeCloseTo(max, 10);
  });

  it('has higher variance than Military TDY (vacational vs year-round)', () => {
    const military   = getMonthlyProfile('Military TDY', 77).occs;
    const university = getMonthlyProfile('University Events', 77).occs;
    const militarySpread   = Math.max(...military) - Math.min(...military);
    const universitySpread = Math.max(...university) - Math.min(...university);
    expect(universitySpread).toBeGreaterThan(militarySpread);
  });
});

describe('getMonthlyProfile — occupancy scaling', () => {
  it('scales linearly with base occupancy for unclamped values', () => {
    const at50 = getMonthlyProfile('Military TDY', 50).occs;
    const at77 = getMonthlyProfile('Military TDY', 77).occs;
    // Each month's occ should be proportional to the base occ rate
    at50.forEach((v50, i) => {
      expect(v50 / (50 / 100)).toBeCloseTo(at77[i] / (77 / 100), 5);
    });
  });

  it('clamps to 1.0 when base occupancy × factor > 1', () => {
    // University Events October factor = 1.15; 100% occ × 1.15 would be 1.15 → clamp to 1
    const { occs } = getMonthlyProfile('University Events', 100);
    occs.forEach(o => expect(o).toBeLessThanOrEqual(1));
  });
});