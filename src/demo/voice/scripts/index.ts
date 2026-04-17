/**
 * scripts/index.ts
 * HRcopilot Demo System — Complete Narration Script Library
 */

export const ALL_SCRIPTS: Record<string, any> = {

  'hook.opening': {
    CEO:     "Most organisations run on five or six disconnected systems. HRcopilot replaces all of them. One platform — people, finance, operations, and intelligence — all connected, all real-time. Let me show you what that looks like.",
    HR:      "Every manual process your team runs today — attendance tracking, leave approvals, payroll reconciliation, performance reviews — HRcopilot automates all of it. Here is what your team gets back.",
    FINANCE: "HRcopilot connects deevery financial control point — payroll, procurement, invoices, and the general ledger — in one auditable system. Every number has a verified source. Let me walk you through it.",
  },

  'elevator.pitch.ceo': {
    CEO: "The average organisation with two hundred employees loses between forty and eighty thousand dollars annually to payroll errors, attendance fraud, manual reconciliation, and disconnected systems. HRcopilot closes every one of those gaps — and the ROI is typically visible within the first payroll cycle.",
    HR:  "Your team spends an estimated thirty percent of its time on tasks that should be automated — chasing approvals, reconciling attendance, correcting payroll errors, and generating reports manually. HRcopilot gives that time back. Most HR teams recover eight to twelve hours per week within the first month.",
    FINANCE: "Manual payroll processing, disconnected procurement, and delayed financial close are your three biggest controllable cost risks. HRcopilot automates all three — payroll posts to the ledger automatically, procurement enforces three-way match, and financial close shrinks from days to hours.",
  },
  'elevator.pitch.hr': {
    HR: "Your team spends an estimated thirty percent of its time on tasks that should be automated — chasing approvals, reconciling attendance, correcting payroll errors, and generating reports manually. HRcopilot gives that time back. Most HR teams recover eight to twelve hours per week within the first month.",
  },
  'elevator.pitch.finance': {
    FINANCE: "Manual payroll processing, disconnected procurement, and delayed financial close are your three biggest controllable cost risks. HRcopilot automates all three — payroll posts to the ledger automatically, procurement enforces three-way match, and financial close shrinks from days to hours.",
  },

  'costsavings.payroll': {
    CEO:     "The American Payroll Association estimates manual payroll carries an error rate of one to eight percent. On a two-hundred-thousand-dollar monthly payroll, that is up to sixteen thousand dollars in errors every single month. HRcopilot brings that error rate to near zero.",
    HR:      "Payroll disputes are almost always caused by attendance data errors. When clock-in is biometrically verified, the disputes disappear — and so does the time your team spends resolving them.",
    FINANCE: "Automated payroll calculation eliminates manual entry errors, reduces reconciliation time by over ninety percent, and generates the journal entry before the run is even approved.",
  },
  'costsavings.attendance': {
    CEO:     "Time theft costs the average organisation four to five percent of total payroll annually. Biometric verification with liveness detection eliminates it entirely.",
    HR:      "Ghost workers and buddy punching are invisible in traditional systems. HRcopilot makes them impossible. Every clock-in is a verified biometric event tied to a confirmed location.",
    FINANCE: "Every unverified payroll hour is a financial liability. Biometric attendance means every hour you pay is an hour genuinely worked, in the right location, by the right person.",
  },
  'costsavings.procurement': {
    CEO:     "Maverick spending typically represents fifteen to twenty percent of total procurement spend. HRcopilot enforces approval workflows at the point of purchase, not after the invoice arrives.",
    HR:      "HR-related procurement follows the same controlled workflow as every other department. No more off-system purchases.",
    FINANCE: "Three-way match verification catches duplicate invoices, overbilling, and unauthorised purchases before payment is released. The average organisation recovers two to four percent of procurement spend through this control alone.",
  },
  'costsavings.performance': {
    CEO:     "Unstructured performance management leads to inconsistent bonuses, retention failures, and legal exposure. HRcopilot makes performance-linked pay rule-based, automatic, and fully auditable.",
    HR:      "When performance reviews are disconnected from payroll, high performers leave because they do not see the link between their results and their compensation. HRcopilot makes that link visible and automatic.",
    FINANCE: "Performance-linked payroll costs are one of the hardest line items to control manually. HRcopilot makes them rule-based — every bonus is triggered by a verified score, not a manager's discretion.",
  },
  'costsavings.finance': {
    CEO:     "Manual financial close costs finance teams an average of six to ten days per month. HRcopilot compresses it to under twenty-four hours.",
    HR:      "Every HR cost is captured automatically and visible in real-time financial reports. No more end-of-month surprises.",
    FINANCE: "Automated double-entry accounting, real-time reconciliation, and instant financial reporting eliminate the manual close cycle entirely. Your team focuses on analysis, not data entry.",
  },
  'costsavings.turnover': {
    CEO:     "Replacing an employee costs between fifty and two hundred percent of their annual salary. HRcopilot surfaces retention risk signals early — before the resignation letter arrives.",
    HR:      "The AI Advisor identifies employees showing early disengagement signals so you can intervene before you lose them.",
    FINANCE: "Turnover is your most underestimated cost. HRcopilot quantifies it in real time and gives you the data to justify retention investments before the cost hits your budget.",
  },

  'dashboard.overview': {
    CEO:     "This is your command centre. Headcount, attendance, turnover, payroll, and financial health — all in one view, updated in real time, filterable by branch, department, or date range.",
    HR:      "Every people metric that matters — present rate, pending leave, open positions, and performance distribution — visible the moment you log in.",
    FINANCE: "Payroll summary, expense trends, absenteeism costs, and procurement spend — all on one screen. No spreadsheet required.",
  },
  'dashboard.kpis': {
    CEO:     "Each KPI card is interactive. Click any metric to drill into the full breakdown — trend data, department splits, and the underlying records.",
    HR:      "Present rate, late arrivals, leave utilisation, and open positions — all live, all filterable. The dashboard tells you where to focus before your team starts their day.",
    FINANCE: "Monthly gross, net disbursed, YTD payroll total, and expense variance — with trend indicators against the prior period and budget targets.",
  },
  'dashboard.advisor': {
    CEO:     "The AI Advisor is reading your live dashboard data right now. It will surface the one insight that matters most for your role — not a generic report, a specific actionable finding.",
    HR:      "Watch the advisor analyse your workforce metrics against global benchmarks. It identifies anomalies your team would normally spend hours finding.",
    FINANCE: "The advisor cross-references your financial KPIs against industry norms and flags the highest-priority variance for your attention.",
  },

  'attendance.hook': {
    CEO:     "Every clock-in is verified with face recognition and live presence detection. Photos, videos, and GPS spoofing cannot fool this system.",
    HR:      "Attendance fraud is eliminated at the source. The system verifies the actual employee is physically present before a single second of work time is recorded.",
    FINANCE: "Ghost workers and buddy punching cost organisations thousands every month. Biometric verification with liveness detection closes that gap permanently.",
  },
  'attendance.clockInInitiate': {
    CEO:     "An employee initiates a clock-in. Three independent security checks run simultaneously — face recognition, geofence validation, and network verification — before any record is written.",
    HR:      "The clock-in process begins. Face recognition, geofence, and IP validation all run in parallel. All three must pass.",
    FINANCE: "Every clock-in is a security event. Watch the three verification layers activate simultaneously.",
  },
  'attendance.faceRecognition': {
    CEO:     "Face recognition confirms identity. Liveness detection confirms the employee is physically present — not a photo, not a video, not a mask.",
    HR:      "The system detects the face, runs liveness checks for blink and head movement, then locks the identity with a confidence score above ninety-eight percent.",
    FINANCE: "Biometric identity verification is the first payroll control. No verified face, no payable hours.",
  },
  'attendance.geofenceCheck': {
    CEO:     "Location is validated server-side against the approved branch radius. GPS spoofing is detected and blocked at the network level.",
    HR:      "The employee's location is confirmed within the geofence boundary. Outside the approved zone, the clock-in is rejected and an alert is generated.",
    FINANCE: "Every verified hour is a verified location. Labour costs map directly to actual operational activity at the correct site.",
  },
  'attendance.ipCheck': {
    CEO:     "The network origin is checked against approved IP ranges. Only authorised company networks can record attendance.",
    HR:      "IP whitelisting is the third security layer. Even if location is spoofed, the network check stops unauthorised clock-ins.",
    FINANCE: "Three verified layers: identity, location, and network. That is the strongest possible foundation for payroll accuracy.",
  },
  'attendance.clockInSuccess': {
    CEO:     "All three layers passed. A verified, timestamped attendance record is written — immutable, audit-ready, and linked directly to the payroll engine.",
    HR:      "Clock-in confirmed. The record includes biometric flag, geofence status, and network origin — every field your auditors will ever ask for.",
    FINANCE: "Verified clock-in recorded. This is the data your payroll runs on. Every hour is traceable to a verified identity at a verified location.",
  },
  'attendance.spoofBlocked': {
    CEO:     "A spoofing attempt fails liveness detection instantly. The attempt is logged as a security incident with timestamp and device ID.",
    HR:      "Liveness check failed. The system rejects the clock-in and generates an alert before any record is written.",
    FINANCE: "Anti-spoofing protection means every payroll hour is a verified hour. The financial exposure from attendance fraud drops to zero.",
  },
  'attendance.advisorInsight': {
    CEO:     "The AI Advisor is analysing your attendance security posture. It surfaces anomalies — repeated late arrivals, geofence edge cases, and unusual patterns — your team would normally miss.",
    HR:      "Watch the advisor identify patterns in attendance data — late arrival clusters, geofence violations by location, and employees approaching overtime thresholds.",
    FINANCE: "The advisor connects attendance anomalies to payroll cost exposure. It quantifies the financial risk of each pattern in real currency.",
  },

  'payroll.hook': {
    CEO:     "Payroll runs in minutes, not days. Verified attendance data flows in automatically — no manual entry, no reconciliation errors, no disputes.",
    HR:      "Every payslip is calculated from biometrically verified attendance records. Payroll disputes drop to near zero because the source data is clean.",
    FINANCE: "Payroll posts directly to the general ledger the moment it is approved. The audit trail is complete before the run even starts.",
  },
  'payroll.runPayroll': {
    CEO:     "One click initiates the payroll run. The system pulls verified attendance, applies leave deductions, calculates statutory obligations, and generates every payslip automatically.",
    HR:      "The payroll engine processes all active employees simultaneously — applying deductions, leave adjustments, and performance bonuses — without a single manual calculation.",
    FINANCE: "Gross pay, statutory deductions, net disbursement, and employer contributions are all calculated in real time. Every line item is traceable.",
  },
  'payroll.advisorIntro': {
    CEO:     "The AI Advisor is analysing your current payroll data against industry benchmarks. It will surface the highest-cost variance and the fastest path to correcting it.",
    HR:      "The advisor is reading your workforce cost data and comparing it to global norms. It identifies where your payroll spend is misaligned with your headcount and performance distribution.",
    FINANCE: "The AI is cross-referencing your payroll figures against sector benchmarks. It will tell you exactly where you stand — and what the financial impact of each variance is.",
  },
  'payroll.ledgerPost': {
    CEO:     "Payroll approved. Journal entries are generated automatically and posted to the general ledger. The close cycle for this period is already complete.",
    HR:      "Every payslip is now a posted accounting record. HR costs are visible in the P&L in real time — no waiting for month-end.",
    FINANCE: "Payroll journal entries posted. Reconciliation is instant. The audit trail runs from individual clock-in records all the way to the ledger entry.",
  },
  'payroll.compliance': {
    CEO:     "Statutory deductions — tax, pension, and social contributions — are calculated automatically against the current regulatory schedule. Compliance is built in, not bolted on.",
    HR:      "Every payroll run is compliant by default. Tax tables, pension rules, and statutory deduction rates are maintained centrally and applied automatically.",
    FINANCE: "Regulatory compliance is not a manual checklist in HRcopilot. It is an automated calculation that updates when the rules change.",
  },

  'performance.hook': {
    CEO:     "Performance management in most organisations is subjective, inconsistent, and disconnected from compensation. HRcopilot makes it objective, standardised, and directly linked to payroll — automatically.",
    HR:      "Evaluation templates standardise reviews across every department. Every manager scores on the same criteria, with the same weights, producing comparable results.",
    FINANCE: "Standardised performance scoring makes performance-linked payroll adjustments defensible, auditable, and fully controlled. No more bonus disputes.",
  },
  'performance.templateAssigned': {
    CEO:     "A manager opens an active evaluation. The template defines the scoring categories, weights, and thresholds — configured once by HR, applied consistently across the organisation.",
    HR:      "The evaluation template is pre-configured with weighted categories. The manager scores against defined criteria — there is no room for inconsistency.",
    FINANCE: "The evaluation template is the source document for any performance-linked compensation adjustment. Every bonus starts here.",
  },
  'performance.scoring': {
    CEO:     "Each category is scored. The composite score calculates in real time as the evaluator works through the template — no manual calculation, no rounding errors.",
    HR:      "Scores are entered per category. The system weights them automatically and shows the running composite score.",
    FINANCE: "The composite score is the direct input for performance-linked pay rules. Watch it calculate live.",
  },
  'performance.scoreLocked': {
    CEO:     "Evaluation submitted. The final score is locked — no retroactive changes, no manager overrides without an audit trail. Performance band assigned automatically.",
    HR:      "Score locked on submission. The performance band is assigned based on the composite score, not a manager's judgement.",
    FINANCE: "Final score locked and immutable. This is the auditable record that drives any payroll adjustment.",
  },
  'performance.payrollTrigger': {
    CEO:     "The score meets the bonus threshold. A payroll adjustment is queued automatically — no email to HR, no manual calculation, no approval chain delay.",
    HR:      "Performance-linked pay rules fire automatically when the threshold is crossed. The adjustment is queued for the next payroll run.",
    FINANCE: "The pay rule triggers. The bonus amount, the triggering score, and the applicable pay rule are all recorded and traceable.",
  },
  'performance.payrollBonus': {
    CEO:     "The performance bonus appears as a line item in the payroll run. Click the source link and you trace it directly back to the evaluation score that triggered it.",
    HR:      "The bonus line item is visible in payroll adjustments with a direct link to the source evaluation. The audit trail is complete.",
    FINANCE: "Performance bonus line item confirmed. The audit trail links this payroll cost to the specific evaluation score, template, and manager who submitted it.",
  },
  'performance.ledgerPost': {
    CEO:     "The bonus cost posts to accounting with the full evaluation audit trail attached. Every incentive cost is traceable from the ledger entry back to the performance score.",
    HR:      "Journal entry generated automatically. The performance bonus is now a documented, auditable accounting record.",
    FINANCE: "Ledger entry posted. The performance cost is fully traceable: evaluation score to pay rule trigger to payroll line item to journal entry.",
  },
  'performance.advisorPredictive': {
    CEO:     "The AI Advisor is forecasting your total incentive cost exposure for this evaluation cycle — based on current score distributions and your configured pay rules.",
    HR:      "The advisor predicts turnover risk based on current performance distribution. It identifies which employees are most likely to disengage.",
    FINANCE: "The advisor is projecting performance-linked payroll costs for the next quarter. It shows you the financial impact before the bonuses are paid.",
  },
  'performance.compliance': {
    CEO:     "Every evaluation is timestamped, locked, and stored with a full audit trail. If a performance decision is ever challenged, HRcopilot provides the complete documented record.",
    HR:      "Evaluation records are immutable once submitted. Every score, every comment, every approval is logged — giving you a defensible record for any employment dispute.",
    FINANCE: "Performance-linked compensation is one of the most legally exposed areas of payroll. HRcopilot makes every decision traceable and every payment justifiable.",
  },

  'accountingFinance.hook': {
    CEO:     "Every financial transaction in your organisation — payroll, procurement, invoices, expenses — posts to the general ledger automatically. No manual journal entries. No reconciliation backlog. Financial close in hours, not days.",
    HR:      "Every HR cost is visible in real-time financial reports the moment it is incurred. Payroll, benefits, training, and recruitment costs are all tracked automatically.",
    FINANCE: "Full double-entry accounting with automated journal entries, real-time reconciliation, and financial close in one system. The chart of accounts, AR, AP, and reporting are all connected.",
  },
  'accountingFinance.journalEntries': {
    CEO:     "Every payroll run, every approved purchase order, every posted invoice generates a journal entry automatically. Your finance team reviews and approves — they do not create.",
    HR:      "HR costs post to the correct cost centres automatically. No manual allocation, no month-end corrections, no finance team chasing HR for numbers.",
    FINANCE: "Automated double-entry journal entries are generated for every financial event — payroll, procurement, invoices, and expense claims. The ledger is always current.",
  },
  'accountingFinance.reconciliation': {
    CEO:     "Bank reconciliation, payroll reconciliation, and accounts payable matching all run automatically. Your finance team spends time on analysis, not data entry.",
    HR:      "HR cost reconciliation is automatic. Every payroll figure matches the attendance record that generated it.",
    FINANCE: "Three-way match reconciliation runs automatically before any payment is released. Duplicate payments and overbilling are blocked at the system level.",
  },
  'accountingFinance.financialClose': {
    CEO:     "Monthly financial close used to take your team six to ten days. HRcopilot compresses it to under twenty-four hours — because every transaction is already posted, reconciled, and categorised.",
    HR:      "The financial close is clean because the data was clean from the start. Verified attendance, automated payroll, and real-time cost posting mean there is nothing to reconcile manually.",
    FINANCE: "Attendance locked, payroll posted, expenses reconciled, reports generated — in one automated sequence. The close cycle is a workflow, not a fire drill.",
  },
  'accountingFinance.reporting': {
    CEO:     "Profit and loss, balance sheet, cash flow, and budget variance reports are generated on demand — not at month end. You see the financial position of your organisation in real time.",
    HR:      "HR cost reports — payroll by department, benefits utilisation, training spend — are available instantly. No waiting for finance to run the numbers.",
    FINANCE: "Financial statements, management accounts, and regulatory reports are generated automatically from the live ledger. No manual compilation.",
  },
  'accountingFinance.cashflow': {
    CEO:     "Cash position, accounts receivable aging, and accounts payable obligations are visible in real time. You know your liquidity position before your bank statement arrives.",
    HR:      "Payroll cash requirements are forecasted automatically based on the upcoming run. Treasury knows the exact disbursement amount before approval.",
    FINANCE: "Real-time cash flow visibility gives your treasury function the data it needs to optimise working capital.",
  },
  'accountingFinance.compliance': {
    CEO:     "Tax compliance, statutory reporting, and audit preparation are built into the system. Every transaction has a complete audit trail from source document to ledger entry.",
    HR:      "Statutory HR costs — pension contributions, tax deductions, and social levies — are calculated, posted, and reported automatically.",
    FINANCE: "Every financial record in HRcopilot is audit-ready by default. The complete trail from source transaction to ledger entry is preserved, immutable, and exportable.",
  },
  'accountingFinance.advisorInsight': {
    CEO:     "The AI Advisor is analysing your financial position right now. It will surface the highest-priority variance — the number that most needs your attention before the close.",
    HR:      "Watch the advisor identify where HR costs are trending above budget — and quantify the impact before it becomes a problem.",
    FINANCE: "The advisor is cross-referencing your ledger data against your budget and prior periods. It will identify the root cause of every significant variance.",
  },
  'accountingFinance.costSavings': {
    CEO:     "Organisations using HRcopilot typically reduce their finance team's manual workload by sixty to seventy percent. That is headcount cost you can redeploy to higher-value work.",
    HR:      "When HR costs post automatically, your finance team stops chasing HR for numbers. That friction disappears entirely.",
    FINANCE: "Automated reconciliation, instant close, and real-time reporting eliminate the overtime, the errors, and the audit findings that come with manual financial processes.",
  },

  'crmSales.hook': {
    CEO:     "Your sales pipeline, deal scoring, and revenue forecast — all AI-powered, all updated in real time. No more end-of-quarter surprises.",
    HR:      "Sales team performance is tracked against targets in real time. Compensation adjustments are data-driven and automatic — no manual commission calculations.",
    FINANCE: "Pipeline value, closed revenue, and forecast accuracy are visible before the month closes. Revenue recognition and invoicing are connected to the same system.",
  },
  'crmSales.pipeline': {
    CEO:     "Every deal in your pipeline is scored by AI against historical win patterns. The system tells you which opportunities to prioritise — and which ones are wasting your team's time.",
    HR:      "Sales team activity, pipeline contribution, and performance against target are all visible in one view. Compensation decisions are based on data, not negotiation.",
    FINANCE: "Pipeline coverage ratio, weighted forecast, and revenue probability are calculated automatically. Your revenue forecast is based on real deal data, not spreadsheet estimates.",
  },
  'crmSales.dealScoring': {
    CEO:     "AI deal scoring analyses engagement signals, deal velocity, and competitive factors to predict close probability. Your team focuses on the deals most likely to close.",
    HR:      "Sales performance data feeds directly into the performance management module. Commission calculations are automated and linked to verified deal outcomes.",
    FINANCE: "Deal probability scores feed directly into revenue forecasting. Your finance team has a data-driven basis for revenue recognition decisions.",
  },
  'crmSales.revenueLink': {
    CEO:     "When a deal closes, the invoice is generated automatically, the revenue is recognised, and the commission is queued for payroll — all in one connected workflow.",
    HR:      "Sales commissions flow from closed deals directly into the payroll engine. No manual commission sheets, no disputes, no delays.",
    FINANCE: "Closed deal to invoice to revenue recognition to commission payroll — one unbroken chain. Every revenue event is traceable from the CRM record to the ledger entry.",
  },
  'crmSales.advisorInsight': {
    CEO:     "The AI Advisor is analysing your pipeline right now. It will identify the deals most at risk of stalling and the actions most likely to accelerate your forecast.",
    HR:      "Watch the advisor identify which sales team members are underperforming against target — and predict the compensation impact of the current pipeline outcome.",
    FINANCE: "The advisor is forecasting your revenue close for the period based on current pipeline velocity. It will tell you the gap between your forecast and your target.",
  },

  'procurement.hook': {
    CEO:     "Every purchase request in your organisation goes through the same controlled approval workflow. Maverick spending is blocked before it happens.",
    HR:      "HR procurement — training programmes, equipment, benefits administration — follows the same approval workflow as every other department. No off-system purchases.",
    FINANCE: "Every purchase order is approved, three-way matched against the goods receipt and invoice, and posted to accounts payable automatically. Duplicate payments are impossible.",
  },
  'procurement.approvalWorkflow': {
    CEO:     "Purchase requests are routed automatically based on value thresholds and department rules. The right approver sees the right request — no manual routing, no missed approvals.",
    HR:      "HR purchase requests are approved through the same workflow as every other department. Consistency is enforced.",
    FINANCE: "Approval workflows enforce spending authority limits automatically. No purchase above the threshold can be processed without the correct approval chain.",
  },
  'procurement.threeWayMatch': {
    CEO:     "Three-way match verification runs automatically before any payment is released. Overbilling and duplicate invoices are caught before they cost you money.",
    HR:      "Every HR vendor invoice is matched against the approved purchase order and confirmed delivery before payment is released.",
    FINANCE: "Three-way match is the strongest accounts payable control available. HRcopilot runs it automatically on every invoice.",
  },
  'procurement.savingsTracker': {
    CEO:     "The procurement savings tracker quantifies cost avoidance from blocked maverick spending, caught duplicate invoices, and negotiated vendor discounts.",
    HR:      "HR procurement savings — avoided training overspend, blocked duplicate vendor invoices, and enforced contract rates — are tracked and reported automatically.",
    FINANCE: "Procurement cost avoidance is one of the most underreported financial controls. HRcopilot makes it visible — every blocked payment, every caught duplicate, every enforced contract rate is quantified.",
  },
  'procurement.advisorInsight': {
    CEO:     "The AI Advisor is analysing your procurement spend patterns. It will identify your highest-risk vendor relationships and the categories where maverick spending is most likely occurring.",
    HR:      "Watch the advisor identify HR procurement inefficiencies — vendors with declining performance scores, contracts approaching renewal, and categories where spend is trending above budget.",
    FINANCE: "The advisor is cross-referencing your procurement spend against contract rates and market benchmarks. It will surface the vendors where you are overpaying.",
  },

  'talentManagement.hook': {
    CEO:     "Hiring pipeline, candidate scoring, onboarding progress, and cost-per-hire — all in one view. Talent acquisition is your most expensive people process. HRcopilot makes every step visible and measurable.",
    HR:      "From job posting to first payslip, every step of the hiring and onboarding process is tracked, automated, and connected to the rest of the HR system.",
    FINANCE: "Hiring costs, onboarding timelines, and headcount changes feed directly into financial planning. Cost-per-hire and time-to-productivity are tracked automatically.",
  },
  'talentManagement.pipeline': {
    CEO:     "Your hiring funnel — applications, screenings, interviews, offers, and hires — is visible in real time. You see where candidates are dropping out, which roles are taking longest to fill, and what each hire is costing you.",
    HR:      "The candidate pipeline tracks every applicant from first contact to first day. Interview scheduling, offer management, and onboarding checklists are all managed in one place.",
    FINANCE: "Recruitment spend by role, by department, and by hiring channel is tracked automatically. Cost-per-hire is calculated in real time.",
  },
  'talentManagement.onboarding': {
    CEO:     "New hire onboarding is a structured workflow — not a checklist on someone's desk. Every step is tracked, every document is collected, and the new employee is productive faster.",
    HR:      "Onboarding checklists, document collection, system access provisioning, and first-week scheduling are all automated. Your HR team focuses on the human side of onboarding.",
    FINANCE: "Onboarding completion rate and time-to-productivity are tracked automatically. The cost of a slow onboarding is quantified and visible.",
  },
  'talentManagement.advisorInsight': {
    CEO:     "The AI Advisor is analysing your talent pipeline right now. It will identify which open roles are at risk of extended vacancy — and quantify the productivity cost of each unfilled position.",
    HR:      "Watch the advisor predict which candidates in your pipeline are most likely to accept an offer — and which roles are most at risk of losing their top candidate to a competitor.",
    FINANCE: "The advisor is calculating the total cost of your current open positions — lost productivity, overtime coverage, and recruitment spend.",
  },

  'employees.hook': {
    CEO:     "Your entire workforce — profiles, contracts, employment status, and complete history — in one searchable directory. One source of truth across every branch and department.",
    HR:      "Every employee record is complete, searchable, and linked to attendance, payroll, performance, and leave data. No more hunting across five systems for one employee's information.",
    FINANCE: "Employee records drive payroll configuration. Every salary band, deduction rule, and benefit entitlement is set here — and flows automatically into every payroll run.",
  },
  'employees.advisorInsight': {
    CEO:     "The AI Advisor is analysing your workforce composition right now. It will surface the department with the highest turnover risk and the retention action most likely to address it.",
    HR:      "Watch the advisor identify employees showing early disengagement signals — declining performance, increased absenteeism, and leave pattern changes — before they become resignations.",
    FINANCE: "The advisor is calculating the financial exposure of your current turnover risk — replacement costs, productivity gaps, and recruitment spend.",
  },

  'leave.hook': {
    CEO:     "Leave requests, approvals, and balances are managed in one place. Staffing coverage is always visible — you never have a critical gap you did not see coming.",
    HR:      "Leave policies, balances, and approval workflows are fully automated. No more spreadsheet tracking, no more manual balance calculations, no more approval emails.",
    FINANCE: "Leave deductions flow automatically into payroll. No manual adjustments, no reconciliation errors, no end-of-month corrections.",
  },
  'leave.advisorInsight': {
    CEO:     "The AI Advisor is analysing your leave patterns right now. It will identify the departments with the highest leave concentration risk.",
    HR:      "Watch the advisor identify leave abuse patterns — employees clustering leave around weekends, departments with unusually high sick leave rates, and teams approaching leave liability thresholds.",
    FINANCE: "The advisor is calculating your current leave liability — the financial obligation of accrued but untaken leave — and flagging the departments where that liability is growing fastest.",
  },

  'compliance.hook': {
    CEO:     "Employment law compliance, data protection, payroll regulations, and audit readiness — HRcopilot builds compliance into every process by default.",
    HR:      "Every HR process in HRcopilot is designed to be compliant by default. Evaluation records are immutable, attendance data is verified, and every action has an audit trail.",
    FINANCE: "Tax compliance, statutory reporting, and financial audit preparation are automated. Every transaction has a complete, immutable audit trail from source to ledger.",
  },
  'compliance.auditTrail': {
    CEO:     "Every action in HRcopilot is logged — who did what, when, and why. If you are ever audited, the complete record is available instantly. No scrambling, no reconstruction.",
    HR:      "Employment decisions — evaluations, disciplinary actions, promotions, and terminations — are all documented with immutable audit trails. Your legal exposure is minimised by design.",
    FINANCE: "Every financial transaction has a complete audit trail from the originating event to the ledger entry. Regulatory audits become a data export, not a manual reconstruction.",
  },
  'compliance.dataProtection': {
    CEO:     "Employee data is stored with role-based access controls. Only authorised users see sensitive information — and every access event is logged.",
    HR:      "Personal data, salary information, and performance records are protected by role-based access. GDPR and data protection compliance is built into the system architecture.",
    FINANCE: "Financial data access is controlled and logged. Sensitive payroll and accounting records are only visible to authorised roles — and every access is auditable.",
  },

  'advisor.elevator.intro': {
    CEO:     "Before we close, I want to show you something that sets HRcopilot apart from every other platform in this space. This is the AI Advisor — not a chatbot. It is a business intelligence engine that reads your live data and tells you what to do about it.",
    HR:      "The AI Advisor is the feature your team will use every single day. It reads your live workforce data and surfaces the one action that will have the most impact — right now, for your specific situation.",
    FINANCE: "The AI Advisor is not a report generator. It is a real-time financial intelligence engine that reads your live data, compares it to industry benchmarks, and tells you exactly where your numbers are off — and why.",
  },
  'advisor.elevator.descriptive': {
    CEO:     "Descriptive analysis tells you what is happening right now — not what happened last month. Your attendance rate, your payroll variance, your pipeline coverage — all live, all contextualised.",
    HR:      "The descriptive view shows you the current state of your workforce — present rate, leave utilisation, performance distribution — with context that tells you whether each number is good, bad, or concerning.",
    FINANCE: "Descriptive analysis shows you the current financial position — cash, payroll, receivables, payables — with variance indicators that tell you immediately where to focus.",
  },
  'advisor.elevator.predictive': {
    CEO:     "Predictive analysis tells you what is going to happen if current trends continue. Which employees are likely to leave. Which deals are likely to close. Which cost centres are likely to overspend. You act before the problem arrives.",
    HR:      "The predictive view identifies employees at risk of disengagement before they resign. It gives you a thirty to sixty day window to intervene — when retention is still possible.",
    FINANCE: "Predictive analysis forecasts your financial close position based on current data. You know your month-end result two weeks before the month ends — giving you time to act.",
  },
  'advisor.elevator.diagnostic': {
    CEO:     "Diagnostic analysis tells you why something is happening. Overtime is up twelve percent. The advisor tells you it is concentrated in one department, driven by two open roles, and costing you four thousand dollars a month more than it should.",
    HR:      "The diagnostic view identifies the root cause of workforce problems — not just the symptoms. High absenteeism in one team traces back to a specific manager. The advisor surfaces that connection.",
    FINANCE: "Diagnostic analysis identifies the root cause of financial variances. A payroll overspend traces back to a specific department, a specific pay rule, and a specific approval decision.",
  },
  'advisor.elevator.salesPitch': {
    CEO:     "Every other platform gives you data. HRcopilot gives you decisions. The AI Advisor turns your operational data into specific, actionable recommendations — so your leadership team spends less time in reports and more time running the business.",
    HR:      "The AI Advisor is the difference between an HR team that reacts to problems and one that prevents them. It gives you the intelligence to act before the resignation, before the payroll error, before the compliance breach.",
    FINANCE: "The AI Advisor gives your finance team the analytical capability of a team twice its size. Real-time variance analysis, predictive forecasting, and root cause diagnostics — without adding headcount.",
  },

  'closing.ceo': "HRcopilot gives you control over every cost centre, every compliance risk, and every people decision — in one platform. The organisations that move first on unified people and finance intelligence will have a structural advantage. The question is not whether you need this. It is how much you are losing every month without it.",
  'closing.hr':  "HRcopilot eliminates every manual process your team runs today — attendance tracking, leave management, payroll reconciliation, performance reviews, and compliance reporting. The time you recover goes back into the work that actually matters: your people.",
  'closing.finance': "HRcopilot closes every financial control gap — from payroll accuracy to procurement compliance to financial close. Every number is verified, every cost is traceable, and every audit is a data export. The ROI is measurable from the first payroll cycle.",

  'closing.pitch': {
    CEO:     "HRcopilot gives you control over every cost centre, every compliance risk, and every people decision — in one platform. The organisations that move first on unified people and finance intelligence will have a structural advantage. The question is not whether you need this. It is how much you are losing every month without it.",
    HR:      "HRcopilot eliminates every manual process your team runs today — attendance tracking, leave management, payroll reconciliation, performance reviews, and compliance reporting. The time you recover goes back into the work that actually matters: your people.",
    FINANCE: "HRcopilot closes every financial control gap — from payroll accuracy to procurement compliance to financial close. Every number is verified, every cost is traceable, and every audit is a data export. The ROI is measurable from the first payroll cycle.",
  },

  'closing.ceo.extended': "Think about the last time a payroll error caused a dispute. The last time an attendance record was questioned. The last time your finance team spent a week on month-end close. HRcopilot makes all of those problems structural impossibilities — not things you manage, things that cannot happen.",
  'closing.hr.extended':  "Your team did not go into HR to chase approvals and reconcile spreadsheets. HRcopilot gives them back the time to do the work that actually changes people's lives — development conversations, culture building, and strategic workforce planning.",
  'closing.finance.extended': "The finance function of the future is not a team that processes transactions. It is a team that analyses them. HRcopilot automates the processing so your team can focus on the analysis. That shift — from transaction processor to business partner — is what we are enabling.",

}
