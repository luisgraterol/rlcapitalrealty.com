// Pure display-logic helpers for the property analyzer visual panel.
// Extracted here so they can be unit-tested without a browser environment.

export function fmtK(v: number): string {
  const a = Math.abs(v);
  return (v < 0 ? '-' : '') + '$' + (a >= 1000 ? (a / 1000).toFixed(1) + 'k' : Math.round(a).toLocaleString());
}

// Maps a percentage [0–100] to a gauge arc angle in radians.
// 0% = π (9 o'clock left), 100% = 2π (3 o'clock right), clockwise through top.
export function gaugeAngle(pct: number): number {
  return Math.PI + (Math.min(Math.max(pct, 0), 100) / 100) * Math.PI;
}

// Returns the CSS modifier class for a metric card based on value thresholds.
export function metricCardClass(
  value: number,
  greenThreshold: number,
  amberThreshold: number,
): 'rmc--green' | 'rmc--amber' | 'rmc--red' {
  if (value > greenThreshold) return 'rmc--green';
  if (value >= amberThreshold) return 'rmc--amber';
  return 'rmc--red';
}

export interface BadgeState {
  show: boolean;
  type: 'ok' | 'warn' | null;
  text: string;
}

// Determines walk-away badge visibility, type, and text.
export function badgeState(rentNeg: number, walkAway: number): BadgeState {
  if (walkAway > 0 && rentNeg > walkAway) {
    const over = Math.round(rentNeg - walkAway);
    return {
      show: true,
      type: 'warn',
      text: `⚠ Rent $${over.toLocaleString()} above walk-away threshold`,
    };
  }
  if (walkAway > 0) {
    return { show: true, type: 'ok', text: '✓ Within target range' };
  }
  return { show: false, type: null, text: '' };
}

export interface MonthlyProfile {
  marketType: string;
  note: string;
  occs: number[];
}

// Derives estimated monthly occupancy rates from a demand driver and base occupancy %.
// Returns 12 values (Jan–Dec) clamped to [0, 1].
export function getMonthlyProfile(driver: string, occPct: number): MonthlyProfile {
  const b = occPct / 100;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const profiles: Record<string, { marketType: string; note: string; factors: number[] }> = {
    'Military TDY': {
      marketType: 'year-round',
      note: 'Seasonal factors estimated from typical military TDY patterns — near-flat year-round. Verify against your own PMS data before relying on monthly projections.',
      factors: [0.95, 0.96, 0.98, 1.01, 1.02, 1.03, 1.04, 1.03, 1.02, 1.01, 0.98, 0.97],
    },
    'University Events': {
      marketType: 'vacational',
      note: 'Seasonal factors estimated from typical university demand curves — peaks in fall/spring semesters, significant summer drop. Verify against AirDNA seasonality data.',
      factors: [1.10, 1.08, 0.95, 0.88, 0.80, 0.70, 0.68, 0.75, 1.12, 1.15, 1.10, 0.90],
    },
    'Corporate/Contractor': {
      marketType: 'year-round',
      note: 'Seasonal factors estimated from typical corporate travel patterns — consistent with minor summer slowdown. Verify against your own PMS data.',
      factors: [1.02, 1.02, 1.03, 1.02, 1.01, 0.96, 0.94, 0.95, 1.01, 1.02, 1.02, 0.98],
    },
    'Mixed': {
      marketType: 'mixed',
      note: 'Seasonal factors estimated from a blended demand profile — moderate variance year-round. Verify against AirDNA seasonality data for this market.',
      factors: [0.97, 0.96, 0.98, 1.00, 1.01, 1.02, 1.03, 1.02, 1.01, 1.02, 1.00, 0.98],
    },
  };
  const p = profiles[driver] ?? profiles['Mixed'];
  return { marketType: p.marketType, note: p.note, occs: p.factors.map(f => clamp(b * f)) };
}