/**
 * ExportButton.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 6 — Close Sections
 * Org types supported: both
 * Dependencies: useCurrencyFormat
 * Demo IDs: export-button
 * Integration: OrganizationalIntelligenceWidget
 */

import React, { useState } from 'react'
import { useCurrencyFormat } from '../hooks/useCurrencyFormat.js'

function buildReportHTML(results, profile, aiAnalysis, currency, formatFn) {
  const fmt = formatFn
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const isNGO = profile.isNGO

  const domainRows = Object.entries(results.sections || {})
    .filter(([, s]) => s?.total > 0)
    .map(([key, s]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-transform:capitalize;font-size:12px">${key.replace(/([A-Z])/g, ' $1')}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;font-size:12px">${fmt(s.total)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:11px;color:#94a3b8">${results.totalLeakage > 0 ? ((s.total / results.totalLeakage) * 100).toFixed(1) + '%' : '—'}</td>
      </tr>
    `).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HRcopilot Leakage Intelligence Report — ${profile.orgTypeLabel}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #fff; }
    .header { background: linear-gradient(135deg, #0047cc, #0035a0); color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; }
    .header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    .header p { margin: 0; opacity: 0.7; font-size: 13px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
    .kpi-label { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 4px; }
    .kpi-value { font-size: 22px; font-weight: 900; color: #0047cc; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
    .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b; margin: 24px 0 12px; border-bottom: 2px solid #0047cc; padding-bottom: 8px; }
    .ai-card { background: #f8fafc; border-left: 4px solid #0047cc; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .ai-type { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #0047cc; margin-bottom: 6px; }
    .ai-headline { font-size: 13px; font-weight: 900; color: #1e293b; margin-bottom: 4px; }
    .ai-insight { font-size: 12px; color: #475569; line-height: 1.5; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Organizational Leakage Intelligence</h1>
    <p>${profile.orgTypeLabel} · ${profile.headcount} employees · Generated ${date}</p>
  </div>

  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Total Annual Leakage</div>
      <div class="kpi-value">${fmt(results.totalLeakage)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Recovery Estimate (50%)</div>
      <div class="kpi-value" style="color:#10b981">${fmt(results.recoveryEstimate)}</div>
    </div>
    ${isNGO
      ? `<div class="kpi"><div class="kpi-label">Additional Beneficiaries</div><div class="kpi-value">${(results.additionalBeneficiaries || 0).toLocaleString()}</div></div>`
      : `<div class="kpi"><div class="kpi-label">Year 1 ROI</div><div class="kpi-value">${results.yearOneROI > 0 ? Math.round(results.yearOneROI) + '%' : '—'}</div></div>`
    }
  </div>

  <div class="section-title">Leakage by Domain</div>
  <table>
    <thead><tr><th>Domain</th><th style="text-align:right">Annual Leakage</th><th style="text-align:right">% of Total</th></tr></thead>
    <tbody>${domainRows}</tbody>
    <tfoot>
      <tr style="background:#f8fafc">
        <td style="padding:10px 12px;font-weight:900;font-size:13px">Total</td>
        <td style="padding:10px 12px;text-align:right;font-weight:900;font-size:13px;color:#0047cc">${fmt(results.totalLeakage)}</td>
        <td style="padding:10px 12px;text-align:right;font-size:11px;color:#94a3b8">100%</td>
      </tr>
    </tfoot>
  </table>

  ${aiAnalysis?.descriptive ? `
  <div class="section-title">AI Analysis</div>
  ${aiAnalysis.descriptive ? `<div class="ai-card"><div class="ai-type">Descriptive — What Is Happening</div><div class="ai-headline">${aiAnalysis.descriptive.headline}</div><div class="ai-insight">${aiAnalysis.descriptive.insight}</div></div>` : ''}
  ${aiAnalysis.diagnostic ? `<div class="ai-card" style="border-color:#0ea5e9"><div class="ai-type" style="color:#0ea5e9">Diagnostic — Why It's Happening</div><div class="ai-headline">${aiAnalysis.diagnostic.headline}</div><div class="ai-insight">${aiAnalysis.diagnostic.rootCause}</div></div>` : ''}
  ${aiAnalysis.prescriptive ? `<div class="ai-card" style="border-color:#10b981"><div class="ai-type" style="color:#10b981">Prescriptive — What To Do</div><div class="ai-headline">${aiAnalysis.prescriptive.headline}</div><div class="ai-insight">${aiAnalysis.prescriptive.insight}</div></div>` : ''}
  ` : ''}

  <div class="footer">
    <p>Generated by HRcopilot Organizational Intelligence Widget · All figures calculated from user-provided inputs against globally sourced benchmarks.</p>
    <p>Sources: American Payroll Association, SHRM, Gallup, McKinsey Global Institute, Hackett Group, IOFM, Deloitte, PwC, Blackline, IDC, ACFE, Bain & Company, Salesforce, Harvard Business Review.</p>
    <p>This report is confidential and intended solely for the organization named above.</p>
  </div>
</body>
</html>`
}

export default function ExportButton({ results, profile, aiAnalysis, currency, locale }) {
  const [loading, setLoading] = useState(false)
  const { format } = useCurrencyFormat(currency, locale)

  const handleExport = async () => {
    setLoading(true)
    try {
      const html = buildReportHTML(results, profile, aiAnalysis, currency, format)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `HRcopilot-Leakage-Report-${profile.orgTypeLabel?.replace(/\s+/g, '-') || 'Report'}-${new Date().toISOString().slice(0, 10)}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      data-demo-id="export-button"
      onClick={handleExport}
      disabled={loading || !results?.totalLeakage}
      className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#0047cc]/40 hover:text-[#0047cc] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      {loading ? 'Generating...' : 'Download Report'}
    </button>
  )
}

