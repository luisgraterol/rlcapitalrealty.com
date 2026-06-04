import { fmt, fmtPct, fmtX } from '@lib/formatters';
import type { AnalysisInputs, AnalysisResults, RiskFlag } from '@lib/calculations';

export interface ExportMeta {
  name: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  notes: string;
  riskFlags: RiskFlag[];
}

export function exportMarkdown(
  inputs: AnalysisInputs,
  r: AnalysisResults,
  meta: ExportMeta,
): void {
  const name = meta.name || 'New Analysis';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const flagLines = meta.riskFlags.map(f => `- ${f.text}`);

  const mdTotalCosts  = r.airbnbFee + r.fixed;
  const mdStays       = r.staysPerMonth;
  const mdClean       = mdStays * inputs.cleaning;
  const mdInternetLine = inputs.internet > 0
    ? `| Internet | ${fmt(inputs.internet)} |\n` : '';

  const md = `# Property Analysis — ${name}
**R&L Capital Realty LLC** | Abilene, TX | Generated: ${date}

## Property Details
- Address: ${meta.address || 'N/A'}
- Bedrooms: ${meta.bedrooms} | Bathrooms: ${meta.bathrooms}
- Property Type: ${meta.propertyType}
- Negotiated Rent: ${fmt(inputs.rentNeg)}

## Revenue Assumptions
- ADR: ${fmt(inputs.adr)} | Occupancy: ${inputs.occ}% | Avg Stay: ${inputs.avgStay} nights
- Estimated stays/month: ${mdStays.toFixed(1)}

## Monthly P&L — Base Case
| Metric | Amount |
|--------|--------|
| Gross Revenue | ${fmt(r.grossRevenue)} |
| **Monthly Costs** | |
| Rent | ${fmt(inputs.rentNeg)} |
| Utilities | ${fmt(inputs.utilities)} |
${mdInternetLine}| Insurance (Proper STR) | ${fmt(inputs.insurance)} |
| Supplies & Amenities | ${fmt(inputs.supplies)} |
| Hospitable PMS | ${fmt(inputs.pms)} |
| PriceLabs | ${fmt(inputs.pricing)} |
| Maintenance Reserve | ${fmt(r.maintenance)} |
| Airbnb Fee (3%) | ${fmt(r.airbnbFee)} |
| STR Permit | $0 |
| **Total Costs** | **${fmt(mdTotalCosts)}** |
| Net Monthly Profit | ${fmt(r.netMonthly)} |
| Net Annual Profit | ${fmt(r.netAnnual)} |
| Break-Even Occupancy | ${fmtPct(r.breakEvenOcc)} |
| Margin % | ${fmtPct(r.margin)} |
| Rent-to-Revenue Multiple | ${fmtX(r.multiple)} |

## Cleaning — Pass-Through
| | |
|-|-|
| Stays / Month | ${mdStays.toFixed(1)} |
| Cleaning Collected (from guest) | ${fmt(mdClean)} |
| Cleaning Paid (to cleaner) | ${fmt(mdClean)} |
| Net P&L Impact | $0 |

## Scenario Analysis
| Scenario | Occ% | ADR | Net/mo | Net/yr |
|----------|------|-----|--------|--------|
${r.scenarioData.map(s => `| ${s.label.charAt(0).toUpperCase() + s.label.slice(1)} | ${fmtPct(s.occ)} | ${fmt(s.adr)} | ${fmt(s.netMonthly)} | ${fmt(s.netAnnual)} |`).join('\n')}

## Investment Summary
| Metric | Value |
|--------|-------|
| Total Initial Investment | ${fmt(r.totalInvest)} |
| Payback Period | ${isFinite(r.payback) ? r.payback.toFixed(1) + ' months' : '—'} |
| 12-Month ROI | ${fmtPct(r.roi12)} |
| 24-Month ROI | ${fmtPct(r.roi24)} |

## Risk Assessment
${flagLines.length ? flagLines.join('\n') : 'No risk flags triggered.'}

## Abilene Market Notes
- STR permit: Not required (City of Abilene, 2026)
- HOT tax: Collected and remitted by Airbnb — no operator action required
- Primary demand driver: Dyess Air Force Base (TDY military) + ACU / Hardin-Simmons / McMurry
- Insurance: Proper Insurance STR policy (~$98–103/mo), landlord named as additional insured
- Sublease: Requires explicit addendum — Texas RE attorney review recommended (~$300)

## Notes
${meta.notes || 'None.'}
`;

  const blob = new Blob([md], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  const ts   = new Date();
  const pad  = (n: number) => String(n).padStart(2, '0');
  const stamp = `${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
  a.download = (name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'analysis') + '-' + stamp + '.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
