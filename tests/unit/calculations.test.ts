import { describe, it, expect } from 'vitest';
import {
  calcMaintenance,
  calcFixedCosts,
  calcAll,
  getScenariosData,
  getRiskFlags,
  type AnalysisInputs,
} from '@lib/calculations';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_INPUTS: AnalysisInputs = {
  rentNeg: 1200,
  rentAsk: 1400,
  deposit: 1400,
  adr: 167,
  occ: 77,
  avgStay: 3.2,
  cleaning: 120,
  utilities: 185,
  electricity: 0,
  water: 0,
  sewer: 0,
  garbage: 0,
  internet: 80,
  insurance: 100,
  supplies: 120,
  linens: 0,
  pms: 39,
  pricing: 20,
  minutSubscription: 0,
  streaming: 0,
  airbnbFeeType: '3%',
  hasYard: false,
  lawnCare: 0,
  pestControl: 0,
  bulkPickup: 0,
  preventiveInspection: 0,
  hvacFilters: 0,
  cpa: 0,
  furniture: 6500,
  photo: 200,
  lock: 150,
  legal: 300,
  misc: 500,
  minutHardware: 0,
  wifiRouter: 0,
  welcomeKits: 0,
  isHOA: false,
};

// ── calcMaintenance ───────────────────────────────────────────────────────────

describe('calcMaintenance', () => {
  it('clamps to floor of $75 when 1.5% is below it', () => {
    expect(calcMaintenance(1000)).toBe(75);
  });

  it('returns 1.5% of rent when in range', () => {
    expect(calcMaintenance(8000)).toBeCloseTo(120);
  });

  it('clamps to ceiling of $150 when 1.5% exceeds it', () => {
    expect(calcMaintenance(15000)).toBe(150);
  });

  it('clamps to floor for $0 rent', () => {
    expect(calcMaintenance(0)).toBe(75);
  });
});

// ── calcFixedCosts ────────────────────────────────────────────────────────────

describe('calcFixedCosts', () => {
  it('sums all cost lines including computed maintenance', () => {
    const maintenance = calcMaintenance(BASE_INPUTS.rentNeg); // 75 (floor)
    // BASE_INPUTS zeros out all new fields so only legacy fields contribute
    const expected =
      BASE_INPUTS.rentNeg +
      BASE_INPUTS.utilities +
      BASE_INPUTS.internet +
      BASE_INPUTS.insurance +
      BASE_INPUTS.supplies +
      BASE_INPUTS.pms +
      BASE_INPUTS.pricing +
      maintenance;
    expect(calcFixedCosts(BASE_INPUTS)).toBeCloseTo(expected);
  });

  it('does not drop internet when it is zero', () => {
    const noInternet = { ...BASE_INPUTS, internet: 0 };
    const withInternet = calcFixedCosts(BASE_INPUTS);
    const without = calcFixedCosts(noInternet);
    expect(withInternet - without).toBeCloseTo(BASE_INPUTS.internet);
  });
});

// ── calcAll ───────────────────────────────────────────────────────────────────

describe('calcAll', () => {
  it('returns correct gross revenue for base case', () => {
    const r = calcAll(BASE_INPUTS);
    // adr * (occ/100) * 30
    expect(r.grossRevenue).toBeCloseTo(167 * 0.77 * 30, 0);
  });

  it('deducts 3% Airbnb fee from gross to get netPlatform', () => {
    const r = calcAll(BASE_INPUTS);
    expect(r.airbnbFee).toBeCloseTo(r.grossRevenue * 0.03, 4);
    expect(r.netPlatform).toBeCloseTo(r.grossRevenue * 0.97, 4);
  });

  it('computes netMonthly = netPlatform − fixed', () => {
    const r = calcAll(BASE_INPUTS);
    expect(r.netMonthly).toBeCloseTo(r.netPlatform - r.fixed, 4);
  });

  it('computes netAnnual = netMonthly * 12', () => {
    const r = calcAll(BASE_INPUTS);
    expect(r.netAnnual).toBeCloseTo(r.netMonthly * 12, 4);
  });

  it('computes staysPerMonth from occupancy and avg stay length', () => {
    const r = calcAll(BASE_INPUTS);
    expect(r.staysPerMonth).toBeCloseTo((0.77 * 30) / 3.2, 4);
  });

  it('computes totalInvest as sum of one-time costs', () => {
    const r = calcAll(BASE_INPUTS);
    const expected =
      BASE_INPUTS.deposit + BASE_INPUTS.furniture + BASE_INPUTS.photo +
      BASE_INPUTS.lock + BASE_INPUTS.legal + BASE_INPUTS.misc;
    expect(r.totalInvest).toBeCloseTo(expected, 4);
  });

  it('computes roi12 = (netAnnual / totalInvest) * 100', () => {
    const r = calcAll(BASE_INPUTS);
    expect(r.roi12).toBeCloseTo((r.netAnnual / r.totalInvest) * 100, 4);
  });

  it('computes roi24 = (netAnnual * 2 / totalInvest) * 100', () => {
    const r = calcAll(BASE_INPUTS);
    expect(r.roi24).toBeCloseTo((r.netAnnual * 2 / r.totalInvest) * 100, 4);
  });

  it('computes payback = totalInvest / netMonthly when profitable', () => {
    const r = calcAll(BASE_INPUTS);
    expect(r.payback).toBeCloseTo(r.totalInvest / r.netMonthly, 4);
  });

  it('returns Infinity payback when net monthly is zero or negative', () => {
    const r = calcAll({ ...BASE_INPUTS, occ: 0 });
    expect(r.payback).toBe(Infinity);
  });

  it('returns all zeros for revenue when occupancy is zero', () => {
    const r = calcAll({ ...BASE_INPUTS, occ: 0 });
    expect(r.grossRevenue).toBe(0);
    expect(r.airbnbFee).toBe(0);
    expect(r.netMonthly).toBeCloseTo(-r.fixed, 4);
  });

  it('isHOA flag does not affect arithmetic results', () => {
    const withHOA = calcAll({ ...BASE_INPUTS, isHOA: true });
    const without = calcAll({ ...BASE_INPUTS, isHOA: false });
    expect(withHOA.netMonthly).toBeCloseTo(without.netMonthly, 4);
    expect(withHOA.roi12).toBeCloseTo(without.roi12, 4);
  });

  it('returns 3 scenario rows', () => {
    const r = calcAll(BASE_INPUTS);
    expect(r.scenarioData).toHaveLength(3);
  });

  it('margin is zero when gross revenue is zero', () => {
    const r = calcAll({ ...BASE_INPUTS, adr: 0 });
    expect(r.margin).toBe(0);
  });

  it('multiple is zero when rentNeg is zero', () => {
    const r = calcAll({ ...BASE_INPUTS, rentNeg: 0 });
    expect(r.multiple).toBe(0);
  });

  it('clamps avgStay to 0.1 to avoid division by zero', () => {
    expect(() => calcAll({ ...BASE_INPUTS, avgStay: 0 })).not.toThrow();
    const r = calcAll({ ...BASE_INPUTS, avgStay: 0 });
    expect(isFinite(r.staysPerMonth)).toBe(true);
  });
});

// ── getScenariosData ──────────────────────────────────────────────────────────

describe('getScenariosData', () => {
  it('returns rows labeled best, base, worst in that order', () => {
    const rows = getScenariosData(167, 77, 1819);
    expect(rows.map(r => r.label)).toEqual(['best', 'base', 'worst']);
  });

  it('base row net matches calcAll result', () => {
    const r = calcAll(BASE_INPUTS);
    const [, base] = getScenariosData(BASE_INPUTS.adr, BASE_INPUTS.occ, r.fixed);
    expect(base.netMonthly).toBeCloseTo(r.netMonthly, 1);
  });

  it('best row has higher netMonthly than base, worst has lower', () => {
    const rows = getScenariosData(167, 77, 1819);
    expect(rows[0].netMonthly).toBeGreaterThan(rows[1].netMonthly);
    expect(rows[2].netMonthly).toBeLessThan(rows[1].netMonthly);
  });

  it('occupancy does not exceed 100 in best case', () => {
    // occ = 95 + 15 delta would push past 100 without clamping
    const rows = getScenariosData(167, 95, 1819);
    expect(rows[0].occ).toBeLessThanOrEqual(110); // label occ is raw, sOcc is clamped
    const sOccBest = Math.min(Math.max((95 + 15) / 100, 0), 1);
    const expectedGross = rows[0].adr * sOccBest * 30;
    expect(rows[0].netMonthly).toBeCloseTo(expectedGross * (1 - 0.03) - 1819, 0);
  });
});

// ── getRiskFlags ──────────────────────────────────────────────────────────────

describe('getRiskFlags', () => {
  it('returns no flags for clean base case inputs', () => {
    const r = calcAll(BASE_INPUTS);
    const flags = getRiskFlags(BASE_INPUTS, r);
    expect(flags).toHaveLength(0);
  });

  it('emits danger flag when isHOA is true', () => {
    const inputs = { ...BASE_INPUTS, isHOA: true };
    const flags = getRiskFlags(inputs, calcAll(inputs));
    expect(flags.some(f => f.type === 'danger' && f.text.includes('HOA'))).toBe(true);
  });

  it('emits warn flag when break-even occupancy exceeds 65%', () => {
    // Drive break-even high by lowering ADR relative to fixed costs
    const inputs = { ...BASE_INPUTS, adr: 60 };
    const r = calcAll(inputs);
    expect(r.breakEvenOcc).toBeGreaterThan(65);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.type === 'warn' && f.text.includes('break-even'))).toBe(true);
  });

  it('does not emit break-even flag when occupancy required is at or below 65%', () => {
    const inputs = { ...BASE_INPUTS, adr: 300 };
    const r = calcAll(inputs);
    expect(r.breakEvenOcc).toBeLessThanOrEqual(65);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.text.includes('break-even'))).toBe(false);
  });

  it('emits danger flag when worst-case scenario is cash-flow negative', () => {
    const inputs = { ...BASE_INPUTS, adr: 60, rentNeg: 1700 };
    const r = calcAll(inputs);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.type === 'danger' && f.text.includes('negative'))).toBe(true);
  });

  it('emits warn flag when revenue multiple is below 1.8', () => {
    // With adr=60 and occ=77, gross ≈ $1,386 / rentNeg=$1,200 → multiple ≈ 1.155
    const inputs = { ...BASE_INPUTS, adr: 60 };
    const r = calcAll(inputs);
    expect(r.multiple).toBeLessThan(1.8);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.text.includes('multiple'))).toBe(true);
  });

  it('does not emit multiple flag when multiple is at or above 1.8', () => {
    const inputs = { ...BASE_INPUTS, adr: 167, rentNeg: 500 };
    const r = calcAll(inputs);
    expect(r.multiple).toBeGreaterThanOrEqual(1.8);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.text.includes('multiple'))).toBe(false);
  });

  it('emits warn flag when rentNeg exceeds $1,750', () => {
    const inputs = { ...BASE_INPUTS, rentNeg: 1800 };
    const r = calcAll(inputs);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.text.includes('$1,750'))).toBe(true);
  });

  it('does not emit rent-threshold flag when rentNeg is exactly $1,750', () => {
    const inputs = { ...BASE_INPUTS, rentNeg: 1750 };
    const r = calcAll(inputs);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.text.includes('$1,750'))).toBe(false);
  });

  it('emits warn flag when avgStay is below 2 nights', () => {
    const inputs = { ...BASE_INPUTS, avgStay: 1.5 };
    const r = calcAll(inputs);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.text.includes('short avg stay'))).toBe(true);
  });

  it('does not emit short-stay flag when avgStay is exactly 2', () => {
    const inputs = { ...BASE_INPUTS, avgStay: 2 };
    const r = calcAll(inputs);
    const flags = getRiskFlags(inputs, r);
    expect(flags.some(f => f.text.includes('short avg stay'))).toBe(false);
  });

  it('can emit multiple flags simultaneously', () => {
    const inputs = { ...BASE_INPUTS, isHOA: true, rentNeg: 1800, avgStay: 1 };
    const r = calcAll(inputs);
    const flags = getRiskFlags(inputs, r);
    expect(flags.length).toBeGreaterThanOrEqual(2);
  });
});
