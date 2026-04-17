/**
 * services/groqService.ts
 * All AI-powered features for HRcopilot — powered by Groq (llama-3.3-70b-versatile).
 *
 * Every function falls back gracefully to realistic mock data when no API
 * key is present, so the app always runs in development without a key.
 *
 * Set VITE_GROQ_API_KEY in .env.local to enable live AI responses.
 */

import { groqChat, groqChatMultiTurn, safeParse, getGroqClient } from '../src/lib/ai';

// ─── 1. Document Metadata — Virtual Cabinet ───────────────────────────────────

export interface DocumentMetadata {
  summary:     string;
  tags:        string[];
  category:    string;
  sensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  entities:    string[];
}

export async function extractDocumentMetadata(text: string): Promise<DocumentMetadata> {
  const fallback: DocumentMetadata = {
    summary:     'Document auto-indexed by HRcopilot Cabinet AI.',
    tags:        ['document', 'record', 'HRcopilot'],
    category:    'General',
    sensitivity: 'INTERNAL',
    entities:    ['HRcopilot'],
  };

  const raw = await groqChat(
    'You are a document intelligence AI for an enterprise HR platform. Respond ONLY with valid JSON. No prose.',
    `Extract metadata from the document below. Return JSON: { summary, tags: string[], category, sensitivity("PUBLIC"|"INTERNAL"|"CONFIDENTIAL"|"RESTRICTED"), entities: string[] }\n\nText: ${text.slice(0, 1500)}`,
  );

  return raw ? safeParse(raw, fallback) : fallback;
}

// ─── 2. Deal Scoring — CRM ────────────────────────────────────────────────────

export interface DealScore {
  score:       number;
  probability: number;
  rationale:   string;
  nextAction:  string;
}

export async function scoreDeal(dealSummary: string): Promise<DealScore> {
  const fallback: DealScore = {
    score:       72,
    probability: 0.68,
    rationale:   'Deal shows strong engagement signals with moderate competition risk.',
    nextAction:  'Schedule executive alignment call within 48 hours.',
  };

  const raw = await groqChat(
    'You are a CRM deal-scoring AI. Respond ONLY with valid JSON. No prose.',
    `Score this deal. Return JSON: { score(0-100), probability(0-1), rationale, nextAction }\n\nDeal: ${dealSummary.slice(0, 800)}`,
  );

  return raw ? safeParse(raw, fallback) : fallback;
}

// ─── 3. Transaction Categorisation — Finance ──────────────────────────────────

export interface TransactionCategory {
  category:    string;
  subcategory: string;
  confidence:  number;
  glCode:      string;
}

export async function categorizeTransaction(description: string, amount: number): Promise<TransactionCategory> {
  const fallback: TransactionCategory = {
    category:    'Operating Expenses',
    subcategory: 'General & Administrative',
    confidence:   0.85,
    glCode:       '6000',
  };

  const raw = await groqChat(
    'You are a finance AI that categorises accounting transactions. Respond ONLY with valid JSON.',
    `Categorise this transaction. Return JSON: { category, subcategory, confidence(0-1), glCode }\n\nDescription: ${description}\nAmount: ${amount}`,
  );

  return raw ? safeParse(raw, fallback) : fallback;
}

// ─── 4. Key Results Suggestion — Goals ───────────────────────────────────────

export interface SuggestedKeyResult {
  description: string;
  targetValue: number;
  unit:        string;
}

export async function suggestKeyResults(objective: string): Promise<SuggestedKeyResult[]> {
  const fallback: SuggestedKeyResult[] = [
    { description: 'Increase team productivity score',    targetValue: 90, unit: '%'       },
    { description: 'Complete quarterly training modules', targetValue: 4,  unit: 'modules' },
    { description: 'Reduce process cycle time',          targetValue: 20, unit: 'days'    },
  ];

  const raw = await groqChat(
    'You are an OKR coaching AI for enterprise teams. Respond ONLY with a valid JSON array.',
    `Suggest 3 measurable key results for this objective. Return a JSON array of { description, targetValue(number), unit }.\n\nObjective: ${objective}`,
  );

  if (!raw) return fallback;
  try {
    const arr = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] ?? '');
    return Array.isArray(arr) && arr.length > 0 ? arr : fallback;
  } catch {
    return fallback;
  }
}

// ─── 5. Performance Summary — Performance page ───────────────────────────────

export interface PerformanceSummary {
  overallRating: string;
  strengths:     string[];
  improvements:  string[];
  narrative:     string;
}

export async function summarizePerformance(data: any): Promise<PerformanceSummary> {
  const fallback: PerformanceSummary = {
    overallRating: 'Meets Expectations',
    strengths:     ['Consistent delivery', 'Strong collaboration'],
    improvements:  ['Proactive communication', 'Documentation quality'],
    narrative:     'Employee demonstrates solid performance with clear growth opportunities.',
  };

  const raw = await groqChat(
    'You are an HR performance review AI. Respond ONLY with valid JSON.',
    `Summarise this performance data. Return JSON: { overallRating, strengths: string[], improvements: string[], narrative }\n\nData: ${JSON.stringify(data).slice(0, 1000)}`,
  );

  return raw ? safeParse(raw, fallback) : fallback;
}

// ─── 6. Contract Term Extraction — Procurement ───────────────────────────────

export interface ContractTerms {
  supplier:       string;
  value:          string;
  startDate:      string;
  endDate:        string;
  paymentTerms:   string;
  keyObligations: string[];
  riskFlags:      string[];
}

export async function extractContractTerms(contractText: string): Promise<ContractTerms> {
  const fallback: ContractTerms = {
    supplier:       'Vendor Name',
    value:          'N/A',
    startDate:      'N/A',
    endDate:        'N/A',
    paymentTerms:   'Net 30',
    keyObligations: ['Delivery within agreed SLA', 'Monthly reporting'],
    riskFlags:      ['Auto-renewal clause detected'],
  };

  const raw = await groqChat(
    'You are a procurement AI that extracts contract terms. Respond ONLY with valid JSON.',
    `Extract contract terms. Return JSON: { supplier, value, startDate, endDate, paymentTerms, keyObligations: string[], riskFlags: string[] }\n\nContract: ${contractText.slice(0, 1500)}`,
  );

  return raw ? safeParse(raw, fallback) : fallback;
}

// ─── 7. HR Assistant Chat — AI Advisor Modal ─────────────────────────────────

const HR_ADVISOR_SYSTEM = `You are an expert HR advisor built into HRcopilot, an enterprise HR platform.
You help CEOs, HR managers, accountants, and employees navigate the platform and make data-driven decisions.
Be concise, professional, and actionable. Respond in plain text only — no markdown asterisks, no hash headers.
Use numbered lists or plain dashes for lists. Never invent data.

When referencing a module, embed a navigation link using this exact format: [Module Name](/route)
Available routes:
- Dashboard: [Dashboard](/)
- Employees: [Employees](/employees)
- Branches: [Branches](/branches)
- Attendance: [Attendance](/attendance)
- Leave Management: [Leave Management](/leave)
- Payroll: [Payroll](/payroll)
- Performance: [Performance](/performance)
- Goals & OKRs: [Goals & OKRs](/goals)
- Talent Management: [Talent Management](/talent)
- Finance: [Finance](/finance)
- Procurement: [Procurement](/procurement)
- CRM & Sales: [CRM & Sales](/crm)
- Team Chat: [Team Chat](/communication/chat)
- Memo: [Memo](/communication/memo)
- Virtual Cabinet: [Virtual Cabinet](/cabinet)
- Invoices: [Invoices](/invoices)
- Identity & Security: [Identity & Security](/identity)
- Settings: [Settings](/settings)

Always include at least one relevant navigation link in your response so the user can go directly to the module.`;

const OFFLINE_RESPONSES: [RegExp, string][] = [
  [/payroll/i,     'For payroll queries, go to **Payroll → Current Run** and review computed figures. Drill into individual payslips from the employee record.'],
  [/leave/i,       'Leave balances are under **Leave → Policy Engine**. Configure accrual rules, carry-forward caps, and approval chains per department.'],
  [/attendance/i,  'Attendance streams in real-time from biometric and app sources. See **Attendance → Live View** for today\'s clock-in status across all branches.'],
  [/performance/i, 'Performance cycles are in **Performance → Cycles**. Set KPI weights, evaluation periods, and multi-level approval chains.'],
  [/finance|budget|invoice/i, 'Financial data is in **Accounting & Finance**. You can view the General Ledger, Trial Balance, and run budget vs actuals reports.'],
  [/employee|staff|headcount/i, 'Employee records are under **Employees**. Use filters to drill down by department, branch, or role.'],
];

export async function generateHRAssistantResponse(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
): Promise<string> {
  // groqChatMultiTurn uses withGroqKey internally — works with UI-only keys too
  const hasKey = !!getGroqClient();

  if (!hasKey) {
    for (const [pattern, response] of OFFLINE_RESPONSES) {
      if (pattern.test(userMessage)) return response;
    }
    return "I'm your HRcopilot AI Advisor. I can help with payroll, attendance, leave, performance, and more. What would you like to know?";
  }

  const result = await groqChatMultiTurn(
    HR_ADVISOR_SYSTEM,
    [...history, { role: 'user', content: userMessage }],
    700,
  );

  return result || "I was unable to generate a response. Please try again.";
}

// ─── 8. Form Template Generation — Form Builder ──────────────────────────────

export interface GeneratedFormTemplate {
  title:       string;
  description: string;
  sections: {
    title:  string;
    fields: { label: string; type: string; required: boolean }[];
  }[];
}

export async function generateFormTemplate(prompt: string): Promise<GeneratedFormTemplate> {
  const fallback: GeneratedFormTemplate = {
    title:       'Generated Form',
    description: 'Auto-generated by HRcopilot AI.',
    sections: [{
      title:  'General Information',
      fields: [
        { label: 'Full Name',  type: 'SHORT_TEXT', required: true  },
        { label: 'Department', type: 'DROPDOWN',   required: true  },
        { label: 'Start Date', type: 'DATE',       required: true  },
        { label: 'Comments',   type: 'PARAGRAPH',  required: false },
      ],
    }],
  };

  const raw = await groqChat(
    'You are an HR form builder AI. Respond ONLY with valid JSON.',
    `Generate a form template for: "${prompt}". Return JSON: { title, description, sections: [{ title, fields: [{ label, type("SHORT_TEXT"|"PARAGRAPH"|"DROPDOWN"|"RATING"|"DATE"|"NUMBER"), required(bool) }] }] }`,
    600,
  );

  return raw ? safeParse(raw, fallback) : fallback;
}
