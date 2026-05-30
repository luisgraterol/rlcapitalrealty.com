export interface AnalysisInputs {
  rentNeg: number;
  rentAsk: number;
  deposit: number;
  adr: number;
  occ: number; // 0–100
  avgStay: number;
  cleaning: number;
  utilities: number;
  internet: number;
  insurance: number;
  supplies: number;
  pms: number;
  pricing: number;
  furniture: number;
  photo: number;
  lock: number;
  legal: number;
  misc: number;
  isHOA: boolean;
}

export interface AnalysisResults {
  grossRevenue: number;
  airbnbFee: number;
  netPlatform: number;
  fixed: number;
  maintenance: number;
  staysPerMonth: number;
  netMonthly: number;
  netAnnual: number;
  breakEvenOcc: number;
  margin: number;
  multiple: number;
  totalInvest: number;
  payback: number;
  roi12: number;
  roi24: number;
  scenarioData: ScenarioRow[];
}

export interface ScenarioRow {
  label: 'best' | 'base' | 'worst';
  occ: number;
  adr: number;
  netMonthly: number;
  netAnnual: number;
}

export interface RiskFlag {
  type: 'ok' | 'warn' | 'danger';
  icon: string;
  text: string;
}

export function calcMaintenance(rentNeg: number): number {
  return Math.min(Math.max(rentNeg * 0.015, 75), 150);
}

export function calcFixedCosts(inputs: AnalysisInputs): number {
  const maintenance = calcMaintenance(inputs.rentNeg);
  return (
    inputs.utilities +
    inputs.internet +
    inputs.insurance +
    inputs.supplies +
    inputs.pms +
    inputs.pricing +
    maintenance
  );
}

export function calcAll(inputs: AnalysisInputs): AnalysisResults {
  const occ = inputs.occ / 100;
  const avgStay = Math.max(inputs.avgStay, 0.1);

  const maintenance = calcMaintenance(inputs.rentNeg);
  const fixed = calcFixedCosts(inputs);

  const grossRevenue = inputs.adr * occ * 30;
  const airbnbFee = grossRevenue * 0.03;
  const netPlatform = grossRevenue - airbnbFee;
  const staysPerMonth = (occ * 30) / avgStay;
  const netMonthly = netPlatform - fixed;
  const netAnnual = netMonthly * 12;
  const breakEvenOcc = fixed / (inputs.adr * 30) * 100;
  const margin = grossRevenue > 0 ? (netMonthly / grossRevenue) * 100 : 0;
  const multiple = inputs.rentNeg > 0 ? grossRevenue / inputs.rentNeg : 0;

  const totalInvest =
    inputs.deposit + inputs.furniture + inputs.photo +
    inputs.lock + inputs.legal + inputs.misc;
  const payback = netMonthly > 0 ? totalInvest / netMonthly : Infinity;
  const roi12 = totalInvest > 0 ? (netAnnual / totalInvest) * 100 : 0;
  const roi24 = totalInvest > 0 ? ((netAnnual * 2) / totalInvest) * 100 : 0;

  const scenarioData = getScenariosData(inputs.adr, inputs.occ, fixed);

  return {
    grossRevenue, airbnbFee, netPlatform, fixed, maintenance, staysPerMonth,
    netMonthly, netAnnual, breakEvenOcc, margin, multiple,
    totalInvest, payback, roi12, roi24, scenarioData,
  };
}

export function getScenariosData(adr: number, occPct: number, fixed: number): ScenarioRow[] {
  const labels: Array<'best' | 'base' | 'worst'> = ['best', 'base', 'worst'];
  const dOccs = [15, 0, -15];
  const dAdrs = [0.15, 0, -0.15];

  return labels.map((label, i) => {
    const sOcc = Math.min(Math.max((occPct + dOccs[i]) / 100, 0), 1);
    const sAdr = adr * (1 + dAdrs[i]);
    const sGross = sAdr * sOcc * 30;
    const sNet = sGross * 0.97 - fixed;
    return {
      label,
      occ: occPct + dOccs[i],
      adr: sAdr,
      netMonthly: sNet,
      netAnnual: sNet * 12,
    };
  });
}

export function getRiskFlags(
  inputs: AnalysisInputs,
  results: AnalysisResults,
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (inputs.isHOA) {
    flags.push({ type: 'danger', icon: '🔴', text: 'HOA detected — this property is disqualified.' });
  }
  if (results.breakEvenOcc > 65) {
    flags.push({ type: 'warn', icon: '⚠️', text: 'High break-even. Market avg is 77% — margin of safety is narrow.' });
  }

  const worstOcc = Math.max(inputs.occ - 15, 0) / 100;
  const worstAdr = inputs.adr * 0.85;
  const worstGross = worstAdr * worstOcc * 30;
  const worstNet = worstGross * 0.97 - results.fixed;
  if (worstNet < 0) {
    flags.push({
      type: 'danger', icon: '🔴',
      text: 'Worst-case scenario is cash-flow negative. Ensure 2–3 months cash reserve before signing.',
    });
  }

  if (results.multiple > 0 && results.multiple < 1.8) {
    flags.push({ type: 'warn', icon: '⚠️', text: 'Revenue multiple below 1.8x. Arbitrage margin is thin — renegotiate rent or pass.' });
  }
  if (inputs.rentNeg > 1750) {
    flags.push({ type: 'warn', icon: '⚠️', text: 'Rent exceeds R&L walk-away threshold of $1,750/mo for Abilene 3BR.' });
  }
  if (inputs.avgStay > 0 && inputs.avgStay < 2) {
    flags.push({ type: 'warn', icon: '⚠️', text: 'Very short avg stay increases cleaning coordination load significantly.' });
  }

  return flags;
}
