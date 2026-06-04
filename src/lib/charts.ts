import { Chart } from 'chart.js/auto';
import { fmtK, gaugeAngle, metricCardClass, badgeState, getMonthlyProfile } from '@lib/visualLogic';
import type { AnalysisInputs, AnalysisResults } from '@lib/calculations';

export interface RenderContext {
  propertiesList: any[];
  selectedPropertyId: string | null;
  walkAway: number;
  driver: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  isHOA: boolean;
}

const C = { green: '#1D9E75', blue: '#378ADD', red: '#E24B4A' };
const isDark  = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const gridColor = () => isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
const tickColor = () => isDark() ? '#a0a09a' : '#5f5e5a';

let chartWaterfall: Chart | null = null;
let chartScenarios: Chart | null = null;
let chartMonthly:   Chart | null = null;
let chartRoi:       Chart | null = null;

export const zeroLinePlugin = {
  id: 'zeroLine',
  beforeDraw(chart: any) {
    const { ctx, chartArea, scales } = chart;
    if (!scales.y) return;
    const yZero = scales.y.getPixelForValue(0);
    if (yZero < chartArea.top || yZero > chartArea.bottom) return;
    ctx.save();
    ctx.beginPath(); ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isDark() ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.moveTo(chartArea.left, yZero); ctx.lineTo(chartArea.right, yZero); ctx.stroke();
    ctx.restore();
  },
};

export function drawGauge(breakEvenPct: number, actualPct: number): void {
  const canvas = document.getElementById('chart-gauge') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H - 8;
  const r  = Math.min(cx - 12, cy - 6);
  const lw = 13;
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI, false);
  ctx.strokeStyle = '#d0cdc8'; ctx.lineWidth = lw; ctx.lineCap = 'butt'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, gaugeAngle(breakEvenPct), false);
  ctx.strokeStyle = C.red; ctx.lineWidth = lw; ctx.stroke();
  if (actualPct > breakEvenPct) {
    ctx.beginPath(); ctx.arc(cx, cy, r, gaugeAngle(breakEvenPct), gaugeAngle(actualPct), false);
    ctx.strokeStyle = C.green; ctx.lineWidth = lw; ctx.stroke();
  }
  const midY = cy - r * 0.46;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f1f2e';
  ctx.font = 'bold 22px "DM Sans", system-ui'; ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(actualPct) + '%', cx, midY);
  ctx.fillStyle = '#7a6e65';
  ctx.font = '11px "DM Sans", system-ui';
  ctx.fillText('occupancy', cx, midY + 22);
}

export function renderVisuals(inputs: AnalysisInputs, r: AnalysisResults, ctx: RenderContext): void {

  // 1: Property header
  const prop = ctx.propertiesList.find(p => p.id === ctx.selectedPropertyId);
  document.getElementById('res-address')!.textContent = prop?.address_line1 || ctx.address || '—';
  const br = ctx.bedrooms || '—', ba = ctx.bathrooms || '—', type = ctx.propertyType || '—';
  document.getElementById('res-subline')!.textContent =
    `${br} BR · ${ba} BA · ${type}${ctx.isHOA ? ' · HOA' : ''}`;

  const bufferPP = Math.round(inputs.occ - r.breakEvenOcc);
  const bufEl = document.getElementById('res-buffer')!;
  bufEl.textContent = (bufferPP >= 0 ? '+' : '') + bufferPP + 'pp';
  (bufEl as HTMLElement).style.color = bufferPP >= 0 ? C.green : C.red;

  const bState = badgeState(inputs.rentNeg, ctx.walkAway);
  const badge = document.getElementById('res-badge')!;
  if (bState.show) {
    badge.className = `res-badge res-badge--${bState.type}`; badge.style.display = '';
    badge.textContent = bState.text;
  } else {
    badge.style.display = 'none';
  }

  // 2: Metric cards
  document.getElementById('res-net-monthly')!.textContent = '$' + Math.round(r.netMonthly).toLocaleString();
  document.getElementById('rmc-net-monthly')!.className = 'res-metric ' + metricCardClass(r.netMonthly, 700, 200);
  document.getElementById('res-margin-sub')!.textContent = Math.round(r.margin) + '% margin';

  document.getElementById('res-net-annual')!.textContent = '$' + Math.round(r.netAnnual).toLocaleString();
  document.getElementById('rmc-net-annual')!.className = 'res-metric ' + metricCardClass(r.netAnnual, 8400, 2400);

  document.getElementById('res-roi12')!.textContent = Math.round(r.roi12) + '%';
  document.getElementById('res-roi-sub')!.textContent = 'on $' + Math.round(r.totalInvest).toLocaleString() + ' invested';

  document.getElementById('res-payback')!.textContent = isFinite(r.payback) ? r.payback.toFixed(1) + ' mo' : '—';
  document.getElementById('res-mult-sub')!.textContent = r.multiple.toFixed(2) + 'x rent/rev';

  // 3a: Waterfall chart
  let floor = r.grossRevenue;
  const costItems = [
    { label: 'Rent',       val: inputs.rentNeg },
    { label: 'Utils',      val: inputs.utilities },
    { label: 'Internet',   val: inputs.internet },
    { label: 'Insurance',  val: inputs.insurance },
    { label: 'Supplies',   val: inputs.supplies },
    { label: 'Hospitable', val: inputs.pms + inputs.pricing },
    { label: 'Maint.',     val: r.maintenance },
    { label: 'Airbnb',     val: r.airbnbFee },
  ];
  const wfLabels: string[] = ['Gross'];
  const wfData: [number, number][] = [[0, r.grossRevenue]];
  const wfColors: string[] = [C.blue];
  costItems.forEach(({ label, val }) => {
    wfLabels.push(label);
    wfData.push([Math.max(0, floor - val), floor]);
    wfColors.push(C.red);
    floor -= val;
  });
  wfLabels.push('Net');
  wfColors.push(r.netMonthly >= 0 ? C.green : C.red);
  wfData.push(r.netMonthly >= 0 ? [0, r.netMonthly] : [r.netMonthly, 0]);

  if (!chartWaterfall) {
    const c2 = (document.getElementById('chart-waterfall') as HTMLCanvasElement).getContext('2d')!;
    chartWaterfall = new Chart(c2, {
      type: 'bar',
      data: { labels: wfLabels, datasets: [{ data: wfData as any, backgroundColor: wfColors, borderWidth: 0, borderRadius: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => {
          const [mn, mx] = c.raw as [number, number];
          return '$' + Math.round(Math.abs(mx - mn)).toLocaleString();
        }}}},
        scales: {
          x: { grid: { color: gridColor() }, ticks: { color: tickColor(), font: { size: 10 } } },
          y: { grid: { color: gridColor() }, ticks: { color: tickColor(), font: { size: 10 }, callback: (v: any) => fmtK(v) } },
        },
      },
    });
  } else {
    const ds = chartWaterfall.data.datasets[0];
    ds.data = wfData as any; (ds as any).backgroundColor = wfColors;
    chartWaterfall.data.labels = wfLabels;
    chartWaterfall.update();
  }

  // 3b: Gauge
  drawGauge(r.breakEvenOcc, inputs.occ);
  document.getElementById('gauge-legend')!.innerHTML =
    `<span class="gauge-dot" style="background:${C.red}"></span>Break-even ${Math.round(r.breakEvenOcc)}%` +
    `&emsp;<span class="gauge-dot" style="background:${C.green}"></span>Actual ${Math.round(inputs.occ)}%`;

  // 3c: Scenario bars
  const scData   = r.scenarioData.map(s => s.netAnnual);
  const scColors = [C.green, C.blue, C.red];
  if (!chartScenarios) {
    const c2 = (document.getElementById('chart-scenarios') as HTMLCanvasElement).getContext('2d')!;
    chartScenarios = new Chart(c2, {
      type: 'bar',
      data: { labels: ['Best', 'Base', 'Worst'], datasets: [{ data: scData, backgroundColor: scColors, borderWidth: 0, borderRadius: 2 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor() }, ticks: { color: tickColor(), font: { size: 10 }, callback: (v: any) => fmtK(v) } },
          y: { grid: { display: false }, ticks: { color: tickColor(), font: { size: 10 } } },
        },
      },
    });
  } else {
    chartScenarios.data.datasets[0].data = scData; chartScenarios.update();
  }

  // 4: Monthly cash flow
  const profile = getMonthlyProfile(ctx.driver, inputs.occ);
  const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyNets   = profile.occs.map(occ => occ * inputs.adr * 30 * 0.97 - r.fixed);
  const monthlyColors = monthlyNets.map(v => v >= 0 ? C.green : C.red);

  if (!chartMonthly) {
    const c2 = (document.getElementById('chart-monthly') as HTMLCanvasElement).getContext('2d')!;
    chartMonthly = new Chart(c2, {
      type: 'bar',
      data: { labels: months, datasets: [{ data: monthlyNets, backgroundColor: monthlyColors, borderWidth: 0, borderRadius: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor() }, ticks: { color: tickColor(), font: { size: 10 } } },
          y: { grid: { color: gridColor() }, ticks: { color: tickColor(), font: { size: 10 }, callback: (v: any) => fmtK(v) } },
        },
      },
      plugins: [zeroLinePlugin],
    });
  } else {
    const ds = chartMonthly.data.datasets[0];
    ds.data = monthlyNets; (ds as any).backgroundColor = monthlyColors;
    chartMonthly.update();
  }
  const occRange = Math.round((Math.max(...profile.occs) - Math.min(...profile.occs)) * 100);
  document.getElementById('monthly-footnote')!.textContent =
    `Based on ${profile.marketType} demand profile (${ctx.driver}). ±${occRange}pp occupancy variance applied monthly. Dashed line = break-even at $0.`;
  document.getElementById('market-note')!.textContent = profile.note;

  // 5: ROI curve
  const roiPoints = Array.from({ length: 25 }, (_, i) => -r.totalInvest + i * r.netMonthly);
  const roiLabels = Array.from({ length: 25 }, (_, i) => i % 2 === 0 ? `M${i}` : '');
  if (!chartRoi) {
    const c2 = (document.getElementById('chart-roi') as HTMLCanvasElement).getContext('2d')!;
    chartRoi = new Chart(c2, {
      type: 'line',
      data: { labels: roiLabels, datasets: [{ data: roiPoints, borderColor: C.blue, backgroundColor: 'rgba(55,138,221,0.12)', fill: true, tension: 0, pointRadius: 0, borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor() }, ticks: { color: tickColor(), font: { size: 10 } } },
          y: { grid: { color: gridColor() }, ticks: { color: tickColor(), font: { size: 10 }, callback: (v: any) => fmtK(v) } },
        },
      },
      plugins: [zeroLinePlugin],
    });
  } else {
    chartRoi.data.datasets[0].data = roiPoints; chartRoi.update();
  }
  document.getElementById('roi-footnote')!.textContent =
    `Dashed line = initial investment ($${Math.round(r.totalInvest).toLocaleString()}). Crossover = payback month. Base case assumptions.`;
}
