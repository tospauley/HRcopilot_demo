/**
 * narrationScripts.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 1 — Data Layer
 * Org types supported: both
 * Dependencies: none
 * Demo IDs: none
 * Integration: NarrationEngine, widget walkthrough steps
 */

export const LEAKAGE_NARRATION = {
  hook: {
    CEO: "Right now, while we speak, your organization is losing money in at least six places simultaneously. This analysis names every one of them.",
    HR: "Every manual HR process has a price. This analysis quantifies it against global benchmarks for your industry and size.",
    FINANCE: "Payroll errors, duplicate payments, reconciliation waste, late penalties — this is the complete financial leakage map for your organization.",
  },

  clockExplain: {
    CEO: "This number has been climbing since you opened this report. It represents your estimated organizational leakage — based on your actual inputs against auditor-grade global benchmarks.",
    HR: "Every second this counter runs represents real cost — from time theft, admin waste, turnover, and disengagement across your workforce.",
    FINANCE: "This is not an estimate pulled from thin air. Every figure is calculated from your inputs using benchmarks from SHRM, Gallup, IOFM, and the Hackett Group.",
  },

  conservativeTier: {
    CEO: "This is the conservative view — the lowest defensible estimate. Even here, the number is significant.",
    HR: "Conservative figures use the lower bound of each benchmark range. Your actual exposure is likely higher.",
    FINANCE: "The conservative tier applies the most favorable assumptions from each research source. This is the floor, not the ceiling.",
  },

  uncontrolledTier: {
    CEO: "This is what your exposure looks like with no digital controls in place. Most organizations are somewhere between these two numbers.",
    HR: "Without automated controls, every leakage category compounds. This is the uncontrolled scenario.",
    FINANCE: "The uncontrolled tier reflects organizations with manual processes and no systematic oversight. It is the upper bound of your risk.",
  },

  workforceDomain: {
    CEO: "Your workforce is your largest cost center. Payroll errors, time theft, and turnover are bleeding value every pay cycle.",
    HR: "These are the costs of manual people management — quantified, sourced, and benchmarked against your industry peers.",
    FINANCE: "Workforce leakage flows directly into payroll cost variance. Every figure here has a corresponding line in your accounts.",
  },

  performanceDomain: {
    CEO: "Disengaged employees cost thirty-four percent of their salary in lost productivity. At your headcount, that adds up fast.",
    HR: "Low performers and disengaged staff are your highest-cost invisible expense. This section puts a number on it.",
    FINANCE: "Performance-linked costs are the hardest to see in a P&L. This section makes them visible and measurable.",
  },

  procurementDomain: {
    CEO: "Maverick spending, vendor overpricing, and manual purchase orders are draining your procurement budget silently.",
    HR: "Procurement leakage affects every department that buys anything. HR-related procurement is often the least controlled.",
    FINANCE: "Duplicate payments, contract leakage, and manual PO costs are recoverable with the right controls. This is your baseline.",
  },

  financeDomain: {
    CEO: "Reconciliation waste, late payment penalties, and slow financial close are costing you more than your finance team realizes.",
    HR: "Finance leakage is not just a finance problem — it starts with payroll data quality and attendance accuracy.",
    FINANCE: "Every day your books take to close costs you in delayed decisions. Every duplicate payment is a recoverable loss.",
  },

  documentDomain: {
    CEO: "Knowledge workers spend ninety minutes a day searching for documents they cannot find. That is eleven percent of your payroll, wasted.",
    HR: "When employees leave, they take undocumented knowledge with them. This section quantifies that institutional loss.",
    FINANCE: "Document search and recreation costs are pure overhead. They disappear with a properly structured virtual cabinet.",
  },

  allDomains: {
    CEO: "Six domains. Each one leaking independently. Together, they represent a recoverable opportunity that exceeds the cost of fixing them many times over.",
    HR: "Every domain you just saw is addressable with the right system. HRcopilot closes each one systematically.",
    FINANCE: "The total leakage figure is the sum of six independently sourced, benchmarked calculations. This is your organization's financial exposure.",
  },

  maturityHook: {
    CEO: "Your organizational leakage maturity score tells you where you rank against peers — and which intervention delivers the fastest return.",
    HR: "The maturity score shows you exactly which people systems are underperforming relative to your industry benchmark.",
    FINANCE: "Financial control maturity determines how much of this leakage is recoverable in year one. Your score shows the path.",
  },

  advisorDescriptive: {
    CEO: "The AI Advisor is analyzing your current leakage profile. Watch as it surfaces the patterns your team would normally spend weeks finding.",
    HR: "The advisor is reading your workforce data against global benchmarks. It will identify the highest-priority intervention for your situation.",
    FINANCE: "The AI is cross-referencing your financial leakage against industry norms. It will tell you exactly where you stand.",
  },

  advisorPrescriptive: {
    CEO: "Now the advisor is prescribing the highest-ROI intervention sequence — which HRcopilot module to activate first, and what recovery to expect.",
    HR: "The prescriptive analysis tells you which HRcopilot module closes the most leakage fastest, based on your specific profile.",
    FINANCE: "The advisor is sequencing the interventions by financial impact. This is your implementation roadmap.",
  },

  roiClose: {
    CEO: "HRcopilot recovers an estimated fifty percent of this leakage. At your scale, that pays for the platform many times over in year one.",
    HR: "The people-related leakage alone justifies the investment. Everything else is upside.",
    FINANCE: "The break-even point on HRcopilot is measured in weeks, not years. The leakage it stops in month one exceeds its annual cost.",
  },

  missionImpactClose: {
    CEO: "Every dollar recovered from leakage is a dollar that reaches your beneficiaries. This is the mission case for operational efficiency.",
    HR: "Recovering this leakage means more programme delivery, more beneficiaries served, and stronger donor confidence.",
    FINANCE: "Operational efficiency is not just a financial metric for your organization — it is a mission multiplier.",
  },

  // Step-specific narration
  step1Profile: {
    CEO: "Tell us about your organization. The more accurate your inputs, the more precise your leakage calculation.",
    HR: "Your organization profile determines which benchmarks apply. Every input drives a specific calculation.",
    FINANCE: "Accurate inputs produce accurate results. Take two minutes to complete this profile.",
  },

  step2Workforce: {
    CEO: "Your workforce data drives the largest leakage category. Payroll, turnover, and time theft are calculated from these inputs.",
    HR: "These are the inputs that determine your people cost leakage. Use your most recent payroll figures.",
    FINANCE: "Workforce leakage is the most directly recoverable category. These inputs determine your baseline.",
  },

  step3Performance: {
    CEO: "Performance leakage is the cost of underperformance and disengagement — the invisible drag on your productivity.",
    HR: "Low performers and disengaged staff are your highest-cost invisible expense. These inputs quantify it.",
    FINANCE: "Performance costs are rarely visible in financial reports. This section makes them measurable.",
  },

  step4Procurement: {
    CEO: "Your procurement spend is a major leakage source. Maverick spending and manual processes are the primary drivers.",
    HR: "Procurement affects every department. HR-related procurement is often the least controlled.",
    FINANCE: "Procurement leakage is highly recoverable. These inputs determine your exposure.",
  },

  step5Revenue: {
    CEO: "Your sales pipeline is leaking leads, deals, and customers. This section quantifies the revenue impact.",
    HR: "Sales team productivity is a workforce issue as much as a revenue issue. These inputs connect both.",
    FINANCE: "Revenue leakage flows directly to your top line. These inputs determine your pipeline exposure.",
  },

  step5Programme: {
    CEO: "Programme delivery efficiency determines how much of your budget reaches beneficiaries. This section measures the gap.",
    HR: "Programme staff productivity and grant reporting burden are the primary drivers of programme leakage.",
    FINANCE: "Programme efficiency ratio is your most important financial metric. This section benchmarks it.",
  },

  step6Finance: {
    CEO: "Your finance function is leaking through reconciliation waste, late payments, and slow close cycles.",
    HR: "Finance leakage starts with payroll data quality. These inputs connect HR accuracy to financial outcomes.",
    FINANCE: "These are your direct financial control metrics. Every input drives a specific recoverable cost.",
  },

  step7Document: {
    CEO: "Document and knowledge management is a hidden productivity tax. This section quantifies it.",
    HR: "Knowledge loss at employee exit is one of the most underestimated costs in HR. This section measures it.",
    FINANCE: "Document search and recreation costs are pure overhead. These inputs determine your exposure.",
  },

  step8Compliance: {
    CEO: "Compliance risk is jurisdiction-agnostic. These inputs determine your regulatory exposure regardless of where you operate.",
    HR: "Compliance failures start with people processes. These inputs connect HR risk to compliance cost.",
    FINANCE: "Compliance leakage is the most unpredictable category. These inputs establish your risk baseline.",
  },

  step9Reputational: {
    CEO: "Donor confidence is your most fragile asset. Reputational risk translates directly to funding loss.",
    HR: "Staff conduct and programme delivery quality drive reputational risk. These inputs quantify the exposure.",
    FINANCE: "Reputational leakage is the hardest to recover. These inputs establish your donor attrition risk.",
  },
}
