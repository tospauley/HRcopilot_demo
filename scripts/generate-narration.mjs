/**
 * scripts/generate-narration.mjs
 * Generates missing narration MP3s via ElevenLabs → public/audio/narration/
 * Usage: node scripts/generate-narration.mjs
 * Skips files that already exist AND are > 20KB (valid audio).
 */
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const OUT_DIR   = path.join(ROOT, 'public', 'audio', 'narration');

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) throw new Error('.env.local not found');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const ENV      = loadEnv();
const API_KEY  = ENV.VITE_ELEVENLABS_API_KEY_2 || ENV.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = ENV.VITE_ELEVENLABS_VOICE_ID_2 || ENV.VITE_ELEVENLABS_VOICE_ID;
const MODEL    = 'eleven_turbo_v2_5';

if (!API_KEY || !VOICE_ID) { console.error('❌  Missing API key/voice ID in .env.local'); process.exit(1); }
console.log(`🔑  key=...${API_KEY.slice(-6)}  voice=${VOICE_ID}\n`);

const SCRIPTS = [
  // Onboarding
  { id:'onboarding.welcome',          role:null,      text:"Welcome to HRcopilot Explorer. I'm your AI guide. Let me show you what's possible when people, finance, and operations work as one." },
  { id:'role.ceo',                    role:null,      text:"As CEO, you'll see the full financial picture — payroll costs, procurement spend, and workforce ROI — all in one command centre." },
  { id:'role.hr',                     role:null,      text:"As HR Manager, you'll see how HRcopilot eliminates manual processes — attendance, payroll, and performance reviews all automated." },
  { id:'role.finance',                role:null,      text:"As Accountant, you'll see how every payroll run posts directly to the general ledger — automated journal entries, instant reconciliation." },
  { id:'onboarding.mode.guided',      role:null,      text:"HRcopilot At A Glance gives you the complete picture in under twelve minutes. I'll walk you through every module, show you a live payroll slip, reveal what your organisation is losing right now, and end with a personalised proposal." },
  { id:'onboarding.mode.sandbox',     role:null,      text:"Sandbox mode gives you full control. Add employees, run payroll, test the geofence — everything is live and you can reset any time." },
  { id:'onboarding.mode.flows',       role:null,      text:"Strategic flows show you complete business processes from start to finish — onboarding an employee, closing the month, running a compliance audit." },
  { id:'onboarding.org-profile',      role:null,      text:"Great. I've personalised your HRcopilot experience. Let's choose how you'd like to explore." },
  { id:'onboarding.org-profile-skip', role:null,      text:"No problem. You can customise your brand settings any time from the Settings module." },
  // hook.opening
  { id:'hook.opening', role:'CEO',     text:"Most organisations run on five or six disconnected systems. HRcopilot replaces all of them. One platform — people, finance, operations, and intelligence — all connected, all real-time. Let me show you what that looks like." },
  { id:'hook.opening', role:'HR',      text:"Every manual process your team runs today — attendance tracking, leave approvals, payroll reconciliation, performance reviews — HRcopilot automates all of it. Here is what your team gets back." },
  { id:'hook.opening', role:'FINANCE', text:"HRcopilot connects every financial control point — payroll, procurement, invoices, and the general ledger — in one auditable system. Every number has a verified source. Let me walk you through it." },
  // talentManagement
  { id:'talentManagement.hook', role:'CEO',     text:"Hiring pipeline, candidate scoring, onboarding progress, and cost-per-hire — all in one view. Talent acquisition is your most expensive people process. HRcopilot makes every step visible and measurable." },
  { id:'talentManagement.hook', role:'HR',      text:"From job posting to first payslip, every step of the hiring and onboarding process is tracked, automated, and connected to the rest of the HR system." },
  { id:'talentManagement.hook', role:'FINANCE', text:"Hiring costs, onboarding timelines, and headcount changes feed directly into financial planning. Cost-per-hire and time-to-productivity are tracked automatically." },
  { id:'talentManagement.pipeline', role:'CEO',     text:"Your hiring funnel — applications, screenings, interviews, offers, and hires — is visible in real time. You see where candidates are dropping off and why." },
  { id:'talentManagement.pipeline', role:'HR',      text:"The candidate pipeline tracks every applicant from first contact to first day. Interview scheduling, offer management, and onboarding checklists are all managed in one place." },
  { id:'talentManagement.pipeline', role:'FINANCE', text:"Recruitment spend by role, by department, and by hiring channel is tracked automatically. Cost-per-hire is calculated in real time." },
  { id:'talentManagement.onboarding', role:'CEO',     text:"New hire onboarding is a structured workflow — not a checklist on someone's desk. Every step is tracked, every document is collected, and the new employee is productive faster." },
  { id:'talentManagement.onboarding', role:'HR',      text:"Onboarding checklists, document collection, system access provisioning, and first-week scheduling are all automated. Your HR team focuses on the human side of onboarding." },
  { id:'talentManagement.onboarding', role:'FINANCE', text:"Onboarding completion rate and time-to-productivity are tracked automatically. The cost of a slow onboarding is quantified and visible." },
  { id:'talentManagement.advisorInsight', role:'CEO',     text:"The AI Advisor is analysing your talent pipeline right now. It will identify which open roles are at risk of extended vacancy — and quantify the productivity cost of each unfilled position." },
  { id:'talentManagement.advisorInsight', role:'HR',      text:"Watch the advisor predict which candidates in your pipeline are most likely to accept an offer — and which roles are most at risk of losing their top candidate to a competitor." },
  { id:'talentManagement.advisorInsight', role:'FINANCE', text:"The advisor is calculating the total cost of your current open positions — lost productivity, overtime coverage, and recruitment spend." },
  // employees
  { id:'employees.hook', role:'CEO',     text:"Your entire workforce — profiles, contracts, employment status, and complete history — in one searchable directory. One source of truth across every branch and department." },
  { id:'employees.hook', role:'HR',      text:"Every employee record is complete, searchable, and linked to attendance, payroll, performance, and leave data. No more hunting across five systems for one employee's information." },
  { id:'employees.hook', role:'FINANCE', text:"Employee records drive payroll configuration. Every salary band, deduction rule, and benefit entitlement is set here — and flows automatically into every payroll run." },
  { id:'employees.advisorInsight', role:'CEO',     text:"The AI Advisor is analysing your workforce composition right now. It will surface the department with the highest turnover risk and the retention action most likely to address it." },
  { id:'employees.advisorInsight', role:'HR',      text:"Watch the advisor identify employees showing early disengagement signals — declining performance, increased absenteeism, and leave pattern changes — before they become resignations." },
  { id:'employees.advisorInsight', role:'FINANCE', text:"The advisor is calculating the financial exposure of your current turnover risk — replacement costs, productivity gaps, and recruitment spend." },
  // attendance
  { id:'attendance.hook', role:'CEO',     text:"Every clock-in is verified with face recognition and live presence detection. Photos, videos, and GPS spoofing cannot fool this system." },
  { id:'attendance.hook', role:'HR',      text:"Attendance fraud is eliminated at the source. The system verifies the actual employee is physically present before a single second of work time is recorded." },
  { id:'attendance.hook', role:'FINANCE', text:"Ghost workers and buddy punching cost organisations thousands every month. Biometric verification with liveness detection closes that gap permanently." },
  // payroll
  { id:'payroll.hook', role:'CEO',     text:"Payroll runs in minutes, not days. Verified attendance data flows in automatically — no manual entry, no reconciliation errors, no disputes." },
  { id:'payroll.hook', role:'HR',      text:"Every payslip is calculated from biometrically verified attendance records. Payroll disputes drop to near zero because the source data is clean." },
  { id:'payroll.hook', role:'FINANCE', text:"Payroll posts directly to the general ledger the moment it is approved. The audit trail is complete before the run even starts." },
  { id:'payroll.ledgerPost', role:'CEO',     text:"Payroll approved. Journal entries are generated automatically and posted to the general ledger. The close cycle for this period is already complete." },
  { id:'payroll.ledgerPost', role:'HR',      text:"Every payslip is now a posted accounting record. HR costs are visible in the P&L in real time — no waiting for month-end." },
  { id:'payroll.ledgerPost', role:'FINANCE', text:"Payroll journal entries posted. Reconciliation is instant. The audit trail runs from individual clock-in records all the way to the ledger entry." },
  // procurement
  { id:'procurement.hook', role:'CEO',     text:"Every purchase request in your organisation goes through the same controlled approval workflow. Maverick spending is blocked before it happens." },
  { id:'procurement.hook', role:'HR',      text:"HR procurement — training programmes, equipment, benefits administration — follows the same approval workflow as every other department. No off-system purchases." },
  { id:'procurement.hook', role:'FINANCE', text:"Every purchase order is approved, three-way matched against the goods receipt and invoice, and posted to accounts payable automatically. Duplicate payments are impossible." },
  { id:'procurement.approvalWorkflow', role:'CEO',     text:"Purchase requests are routed automatically based on value thresholds and department rules. The right approver sees the right request — no manual routing, no missed approvals." },
  { id:'procurement.approvalWorkflow', role:'HR',      text:"HR purchase requests are approved through the same workflow as every other department. Consistency is enforced." },
  { id:'procurement.approvalWorkflow', role:'FINANCE', text:"Approval workflows enforce spending authority limits automatically. No purchase above the threshold can be processed without the correct approval chain." },
  { id:'procurement.threeWayMatch', role:'CEO',     text:"Three-way match verification runs automatically before any payment is released. Overbilling and duplicate invoices are caught before they cost you money." },
  { id:'procurement.threeWayMatch', role:'HR',      text:"Every HR vendor invoice is matched against the approved purchase order and confirmed delivery before payment is released." },
  { id:'procurement.threeWayMatch', role:'FINANCE', text:"Three-way match is the strongest accounts payable control available. HRcopilot runs it automatically on every invoice." },
  { id:'procurement.savingsTracker', role:'CEO',     text:"The procurement savings tracker quantifies cost avoidance from blocked maverick spending, caught duplicate invoices, and negotiated vendor discounts." },
  { id:'procurement.savingsTracker', role:'HR',      text:"HR procurement savings — avoided training overspend, blocked duplicate vendor invoices, and enforced contract rates — are tracked and reported automatically." },
  { id:'procurement.savingsTracker', role:'FINANCE', text:"Procurement cost avoidance is one of the most underreported financial controls. HRcopilot makes it visible — every blocked payment, every caught duplicate, every enforced contract rate is quantified." },
  { id:'procurement.advisorInsight', role:'CEO',     text:"The AI Advisor is analysing your procurement spend patterns. It will identify your highest-risk vendor relationships and the categories where maverick spending is most likely occurring." },
  { id:'procurement.advisorInsight', role:'HR',      text:"Watch the advisor identify HR procurement inefficiencies — vendors with declining performance scores, contracts approaching renewal, and categories where spend is trending above budget." },
  { id:'procurement.advisorInsight', role:'FINANCE', text:"The advisor is cross-referencing your procurement spend against contract rates and market benchmarks. It will surface the vendors where you are overpaying." },
  // performance
  { id:'performance.hook', role:'CEO',     text:"Performance management in most organisations is subjective, inconsistent, and disconnected from compensation. HRcopilot makes it objective, standardised, and directly linked to payroll — automatically." },
  { id:'performance.hook', role:'HR',      text:"Evaluation templates standardise reviews across every department. Every manager scores on the same criteria, with the same weights, producing comparable results." },
  { id:'performance.hook', role:'FINANCE', text:"Standardised performance scoring makes performance-linked payroll adjustments defensible, auditable, and fully controlled. No more bonus disputes." },
  { id:'performance.payrollTrigger', role:'CEO',     text:"The score meets the bonus threshold. A payroll adjustment is queued automatically — no email to HR, no manual calculation, no approval chain delay." },
  { id:'performance.payrollTrigger', role:'HR',      text:"Performance-linked pay rules fire automatically when the threshold is crossed. The adjustment is queued for the next payroll run." },
  { id:'performance.payrollTrigger', role:'FINANCE', text:"The pay rule triggers. The bonus amount, the triggering score, and the applicable pay rule are all recorded and traceable." },
  // accountingFinance
  { id:'accountingFinance.hook', role:'CEO',     text:"Every financial transaction in your organisation — payroll, procurement, invoices, expenses — posts to the general ledger automatically. No manual journal entries. No reconciliation backlog. Financial close in hours, not days." },
  { id:'accountingFinance.hook', role:'HR',      text:"Every HR cost is visible in real-time financial reports the moment it is incurred. Payroll, benefits, training, and recruitment costs are all tracked automatically." },
  { id:'accountingFinance.hook', role:'FINANCE', text:"Full double-entry accounting with automated journal entries, real-time reconciliation, and financial close in one system. The chart of accounts, AR, AP, and reporting are all connected." },
  { id:'accountingFinance.financialClose', role:'CEO',     text:"Monthly financial close used to take your team six to ten days. HRcopilot compresses it to under twenty-four hours — because every transaction is already posted, reconciled, and categorised." },
  { id:'accountingFinance.financialClose', role:'HR',      text:"The financial close is clean because the data was clean from the start. Verified attendance, automated payroll, and real-time cost posting mean there is nothing to reconcile manually." },
  { id:'accountingFinance.financialClose', role:'FINANCE', text:"Attendance locked, payroll posted, expenses reconciled, reports generated — in one automated sequence. The close cycle is a workflow, not a fire drill." },
  { id:'accountingFinance.advisorInsight', role:'CEO',     text:"The AI Advisor is analysing your financial position right now. It will surface the highest-priority variance — the number that most needs your attention before the close." },
  { id:'accountingFinance.advisorInsight', role:'HR',      text:"Watch the advisor identify where HR costs are trending above budget — and quantify the impact before it becomes a problem." },
  { id:'accountingFinance.advisorInsight', role:'FINANCE', text:"The advisor is cross-referencing your ledger data against your budget and prior periods. It will identify the root cause of every significant variance." },
  { id:'accountingFinance.costSavings', role:'CEO',     text:"Organisations using HRcopilot typically reduce their finance team's manual workload by sixty to seventy percent. That is headcount cost you can redeploy to higher-value work." },
  { id:'accountingFinance.costSavings', role:'HR',      text:"When HR costs post automatically, your finance team stops chasing HR for numbers. That friction disappears entirely." },
  { id:'accountingFinance.costSavings', role:'FINANCE', text:"Automated reconciliation, instant close, and real-time reporting eliminate the overtime, the errors, and the audit findings that come with manual financial processes." },
  // dashboard
  { id:'dashboard.advisor', role:'CEO',     text:"The AI Advisor is reading your live dashboard data right now. It will surface the one insight that matters most for your role — not a generic report, a specific actionable finding." },
  { id:'dashboard.advisor', role:'HR',      text:"Watch the advisor analyse your workforce metrics against global benchmarks. It identifies anomalies your team would normally spend hours finding." },
  { id:'dashboard.advisor', role:'FINANCE', text:"The advisor cross-references your financial KPIs against industry norms and flags the highest-priority variance for your attention." },
  // crmSales
  { id:'crmSales.hook', role:'CEO',     text:"Your sales pipeline, deal scoring, and revenue forecast — all AI-powered, all updated in real time. No more end-of-quarter surprises." },
  { id:'crmSales.hook', role:'HR',      text:"Sales team performance is tracked against targets in real time. Compensation adjustments are data-driven and automatic — no manual commission calculations." },
  { id:'crmSales.hook', role:'FINANCE', text:"Pipeline value, closed revenue, and forecast accuracy are visible before the month closes. Revenue recognition and invoicing are connected to the same system." },
  { id:'crmSales.pipeline', role:'CEO',     text:"Every deal in your pipeline is scored by AI against historical win patterns. The system tells you which opportunities to prioritise — and which ones are wasting your team's time." },
  { id:'crmSales.pipeline', role:'HR',      text:"Sales team activity, pipeline contribution, and performance against target are all visible in one view. Compensation decisions are based on data, not negotiation." },
  { id:'crmSales.pipeline', role:'FINANCE', text:"Pipeline coverage ratio, weighted forecast, and revenue probability are calculated automatically. Your revenue forecast is based on real deal data, not spreadsheet estimates." },
  { id:'crmSales.dealScoring', role:'CEO',     text:"AI deal scoring analyses engagement signals, deal velocity, and competitive factors to predict close probability. Your team focuses on the deals most likely to close." },
  { id:'crmSales.dealScoring', role:'HR',      text:"Sales performance data feeds directly into the performance management module. Commission calculations are automated and linked to verified deal outcomes." },
  { id:'crmSales.dealScoring', role:'FINANCE', text:"Deal probability scores feed directly into revenue forecasting. Your finance team has a data-driven basis for revenue recognition decisions." },
  { id:'crmSales.revenueLink', role:'CEO',     text:"When a deal closes, the invoice is generated automatically, the revenue is recognised, and the commission is queued for payroll — all in one connected workflow." },
  { id:'crmSales.revenueLink', role:'HR',      text:"Sales commissions flow from closed deals directly into the payroll engine. No manual commission sheets, no disputes, no delays." },
  { id:'crmSales.revenueLink', role:'FINANCE', text:"Closed deal to invoice to revenue recognition to commission payroll — one unbroken chain. Every revenue event is traceable from the CRM record to the ledger entry." },
  { id:'crmSales.advisorInsight', role:'CEO',     text:"The AI Advisor is analysing your pipeline right now. It will identify the deals most at risk of stalling and the actions most likely to accelerate your forecast." },
  { id:'crmSales.advisorInsight', role:'HR',      text:"Watch the advisor identify which sales team members are underperforming against target — and predict the compensation impact of the current pipeline outcome." },
  { id:'crmSales.advisorInsight', role:'FINANCE', text:"The advisor is forecasting your revenue close for the period based on current pipeline velocity. It will tell you the gap between your forecast and your target." },
  // leave
  { id:'leave.hook', role:'CEO',     text:"Leave requests, approvals, and balances are managed in one place. Staffing coverage is always visible — you never have a critical gap you did not see coming." },
  { id:'leave.hook', role:'HR',      text:"Leave policies, balances, and approval workflows are fully automated. No more spreadsheet tracking, no more manual balance calculations, no more approval emails." },
  { id:'leave.hook', role:'FINANCE', text:"Leave deductions flow automatically into payroll. No manual adjustments, no reconciliation errors, no end-of-month corrections." },
  // elevator pitch
  { id:'elevator.pitch.ceo',     role:'CEO',     text:"The average organisation with two hundred employees loses between forty and eighty thousand dollars annually to payroll errors, attendance fraud, manual reconciliation, and disconnected systems. HRcopilot closes every one of those gaps — and the ROI is typically visible within the first payroll cycle." },
  { id:'elevator.pitch.hr',      role:'HR',      text:"Your team spends an estimated thirty percent of its time on tasks that should be automated — chasing approvals, reconciling attendance, correcting payroll errors, and generating reports manually. HRcopilot gives that time back. Most HR teams recover eight to twelve hours per week within the first month." },
  { id:'elevator.pitch.finance', role:'FINANCE', text:"Manual payroll processing, disconnected procurement, and delayed financial close are your three biggest controllable cost risks. HRcopilot automates all three — payroll posts to the ledger automatically, procurement enforces three-way match, and financial close shrinks from days to hours." },
];

async function synthesise(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true } }),
  });
  if (!res.ok) { const b = await res.text().catch(() => ''); throw new Error(`ElevenLabs ${res.status}: ${b}`); }
  return Buffer.from(await res.arrayBuffer());
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let generated = 0, skipped = 0, failed = 0;

for (const s of SCRIPTS) {
  const safe     = s.id.replace(/[^a-zA-Z0-9_-]/g, '-');
  const filename = `${safe}${s.role ? '.' + s.role : ''}.mp3`;
  const outPath  = path.join(OUT_DIR, filename);

  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 20_000) {
    console.log(`⏭️   ${filename}`); skipped++; continue;
  }

  process.stdout.write(`🎙️   ${filename} … `);
  try {
    const mp3 = await synthesise(s.text);
    fs.writeFileSync(outPath, mp3);
    console.log(`✅  ${(mp3.length/1024).toFixed(0)} KB`);
    generated++;
    await new Promise(r => setTimeout(r, 350));
  } catch (err) {
    console.error(`❌  ${err.message}`);
    failed++;
    if (err.message.includes('401') || err.message.includes('quota')) {
      console.error('🛑  Key exhausted — re-run after cooldown or add another key.');
      break;
    }
  }
}

console.log(`\n✅  Done — ${generated} generated, ${skipped} skipped, ${failed} failed`);
if (failed > 0) process.exit(1);
