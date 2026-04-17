// ============================================================
// FILE: services/financeData.ts
// PURPOSE: Enterprise Chart of Accounts, mock journals,
//          financial metrics, aging, customers, invoices
// ============================================================

// ── Types ─────────────────────────────────────────────────────
export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: string;
  group: string;
  normalBalance: 'Debit' | 'Credit';
  balance: number;
  currency: string;
  isActive: boolean;
  isBankAccount?: boolean;
  isReconcilable?: boolean;
  description: string;
}

// ── Chart of Accounts ─────────────────────────────────────────
export const CHART_OF_ACCOUNTS: Account[] = [

  // ════════════════════════════════════════════════════════════
  // CLASS 1 — ASSETS (1000–1999)
  // ════════════════════════════════════════════════════════════

  // Current Assets
  { id: 'a1000', code: '1000', name: 'Cash — Main Operating Account',       type: 'Asset', subType: 'Current Asset',    group: 'Cash & Cash Equivalents',  normalBalance: 'Debit', balance: 1_250_400, currency: 'USD', isActive: true, isBankAccount: true,  isReconcilable: true,  description: 'Primary operating bank account for day-to-day transactions.' },
  { id: 'a1010', code: '1010', name: 'Cash — Payroll Clearing Account',     type: 'Asset', subType: 'Current Asset',    group: 'Cash & Cash Equivalents',  normalBalance: 'Debit', balance: 320_000,   currency: 'USD', isActive: true, isBankAccount: true,  isReconcilable: true,  description: 'Dedicated account for payroll disbursements.' },
  { id: 'a1020', code: '1020', name: 'Petty Cash',                          type: 'Asset', subType: 'Current Asset',    group: 'Cash & Cash Equivalents',  normalBalance: 'Debit', balance: 5_000,     currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'On-hand cash for minor office expenses.' },
  { id: 'a1030', code: '1030', name: 'Money Market — Short-Term Reserve',   type: 'Asset', subType: 'Current Asset',    group: 'Cash & Cash Equivalents',  normalBalance: 'Debit', balance: 850_000,   currency: 'USD', isActive: true, isBankAccount: true,  isReconcilable: true,  description: 'High-yield money market account for liquidity reserve.' },
  { id: 'a1100', code: '1100', name: 'Accounts Receivable — Trade',         type: 'Asset', subType: 'Current Asset',    group: 'Receivables',              normalBalance: 'Debit', balance: 480_200,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: true,  description: 'Amounts owed by customers for goods and services delivered.' },
  { id: 'a1110', code: '1110', name: 'Allowance for Doubtful Accounts',     type: 'Asset', subType: 'Current Asset',    group: 'Receivables',              normalBalance: 'Credit', balance: -24_010,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-asset: estimated uncollectible receivables.' },
  { id: 'a1120', code: '1120', name: 'Intercompany Receivable',             type: 'Asset', subType: 'Current Asset',    group: 'Receivables',              normalBalance: 'Debit', balance: 95_000,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: true,  description: 'Amounts owed from affiliated entities within the group.' },
  { id: 'a1200', code: '1200', name: 'Inventory — Raw Materials',           type: 'Asset', subType: 'Current Asset',    group: 'Inventory',                normalBalance: 'Debit', balance: 210_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Unprocessed materials held for production.' },
  { id: 'a1210', code: '1210', name: 'Inventory — Work in Progress',        type: 'Asset', subType: 'Current Asset',    group: 'Inventory',                normalBalance: 'Debit', balance: 87_500,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Partially completed goods in the production cycle.' },
  { id: 'a1220', code: '1220', name: 'Inventory — Finished Goods',          type: 'Asset', subType: 'Current Asset',    group: 'Inventory',                normalBalance: 'Debit', balance: 145_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Completed goods ready for sale.' },
  { id: 'a1300', code: '1300', name: 'Prepaid Expenses',                    type: 'Asset', subType: 'Current Asset',    group: 'Prepayments',              normalBalance: 'Debit', balance: 62_400,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Expenses paid in advance (insurance, subscriptions, rent).' },
  { id: 'a1310', code: '1310', name: 'Prepaid Insurance',                   type: 'Asset', subType: 'Current Asset',    group: 'Prepayments',              normalBalance: 'Debit', balance: 18_000,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Insurance premiums paid ahead of coverage period.' },
  { id: 'a1320', code: '1320', name: 'Prepaid Rent',                        type: 'Asset', subType: 'Current Asset',    group: 'Prepayments',              normalBalance: 'Debit', balance: 24_000,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Rent paid in advance for future periods.' },
  { id: 'a1400', code: '1400', name: 'Short-Term Investments',              type: 'Asset', subType: 'Current Asset',    group: 'Short-Term Investments',   normalBalance: 'Debit', balance: 500_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Marketable securities and T-bills maturing within 12 months.' },
  { id: 'a1500', code: '1500', name: 'VAT Input Tax Recoverable',           type: 'Asset', subType: 'Current Asset',    group: 'Tax Assets',               normalBalance: 'Debit', balance: 34_800,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Input VAT claimable from tax authority.' },

  // Non-Current Assets
  { id: 'a1600', code: '1600', name: 'Land',                                type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Debit', balance: 1_200_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Land held for operational use. Not depreciated.' },
  { id: 'a1610', code: '1610', name: 'Buildings & Leasehold Improvements',  type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Debit', balance: 2_400_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Office buildings and tenant improvements.' },
  { id: 'a1611', code: '1611', name: 'Accum. Depreciation — Buildings',     type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Credit', balance: -480_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-asset: accumulated depreciation on buildings.' },
  { id: 'a1620', code: '1620', name: 'Machinery & Equipment',               type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Debit', balance: 860_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Production and operational machinery.' },
  { id: 'a1621', code: '1621', name: 'Accum. Depreciation — Machinery',     type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Credit', balance: -215_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-asset: accumulated depreciation on machinery.' },
  { id: 'a1630', code: '1630', name: 'Computer Hardware & IT Equipment',    type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Debit', balance: 340_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Servers, workstations, networking hardware.' },
  { id: 'a1631', code: '1631', name: 'Accum. Depreciation — IT Equipment',  type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Credit', balance: -136_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-asset: accumulated depreciation on IT equipment.' },
  { id: 'a1640', code: '1640', name: 'Vehicles & Fleet',                    type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Debit', balance: 180_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Company-owned vehicles for operations and logistics.' },
  { id: 'a1641', code: '1641', name: 'Accum. Depreciation — Vehicles',      type: 'Asset', subType: 'Non-Current Asset', group: 'Property, Plant & Equipment', normalBalance: 'Credit', balance: -54_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-asset: accumulated depreciation on vehicles.' },
  { id: 'a1700', code: '1700', name: 'Right-of-Use Asset — Operating Leases', type: 'Asset', subType: 'Non-Current Asset', group: 'Lease Assets (IFRS 16)',   normalBalance: 'Debit', balance: 620_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'ROU assets recognised under IFRS 16 / ASC 842.' },
  { id: 'a1701', code: '1701', name: 'Accum. Amortisation — ROU Assets',    type: 'Asset', subType: 'Non-Current Asset', group: 'Lease Assets (IFRS 16)',    normalBalance: 'Credit', balance: -124_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-asset: accumulated amortisation on ROU assets.' },
  { id: 'a1800', code: '1800', name: 'Goodwill',                            type: 'Asset', subType: 'Non-Current Asset', group: 'Intangible Assets',         normalBalance: 'Debit', balance: 950_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Excess purchase price over fair value of acquired net assets.' },
  { id: 'a1810', code: '1810', name: 'Patents & Intellectual Property',     type: 'Asset', subType: 'Non-Current Asset', group: 'Intangible Assets',         normalBalance: 'Debit', balance: 420_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Registered patents and proprietary technology.' },
  { id: 'a1811', code: '1811', name: 'Accum. Amortisation — Patents',       type: 'Asset', subType: 'Non-Current Asset', group: 'Intangible Assets',         normalBalance: 'Credit', balance: -84_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-asset: accumulated amortisation on patents.' },
  { id: 'a1820', code: '1820', name: 'Software Licences & Development',     type: 'Asset', subType: 'Non-Current Asset', group: 'Intangible Assets',         normalBalance: 'Debit', balance: 280_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Capitalised software development costs and enterprise licences.' },
  { id: 'a1821', code: '1821', name: 'Accum. Amortisation — Software',      type: 'Asset', subType: 'Non-Current Asset', group: 'Intangible Assets',         normalBalance: 'Credit', balance: -112_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-asset: accumulated amortisation on software.' },
  { id: 'a1900', code: '1900', name: 'Long-Term Investments',               type: 'Asset', subType: 'Non-Current Asset', group: 'Long-Term Investments',     normalBalance: 'Debit', balance: 750_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Strategic equity investments and bonds held to maturity.' },
  { id: 'a1910', code: '1910', name: 'Deferred Tax Asset',                  type: 'Asset', subType: 'Non-Current Asset', group: 'Tax Assets',                normalBalance: 'Debit', balance: 68_000,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Future tax benefit from temporary differences.' },

  // ════════════════════════════════════════════════════════════
  // CLASS 2 — LIABILITIES (2000–2999)
  // ════════════════════════════════════════════════════════════

  // Current Liabilities
  { id: 'l2000', code: '2000', name: 'Accounts Payable — Trade',            type: 'Liability', subType: 'Current Liability',     group: 'Payables',                  normalBalance: 'Credit', balance: 380_400,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: true,  description: 'Amounts owed to suppliers for goods and services received.' },
  { id: 'l2010', code: '2010', name: 'Intercompany Payable',                type: 'Liability', subType: 'Current Liability',     group: 'Payables',                  normalBalance: 'Credit', balance: 95_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: true,  description: 'Amounts owed to affiliated entities within the group.' },
  { id: 'l2100', code: '2100', name: 'Salaries & Wages Payable',            type: 'Liability', subType: 'Current Liability',     group: 'Accrued Liabilities',       normalBalance: 'Credit', balance: 142_600,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Earned but unpaid employee compensation at period end.' },
  { id: 'l2110', code: '2110', name: 'Payroll Tax Payable — PAYE',          type: 'Liability', subType: 'Current Liability',     group: 'Accrued Liabilities',       normalBalance: 'Credit', balance: 38_400,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Employee income tax withheld and due to tax authority.' },
  { id: 'l2120', code: '2120', name: 'Pension & Benefits Payable',          type: 'Liability', subType: 'Current Liability',     group: 'Accrued Liabilities',       normalBalance: 'Credit', balance: 24_800,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Employer pension contributions and benefits due.' },
  { id: 'l2130', code: '2130', name: 'Accrued Interest Payable',            type: 'Liability', subType: 'Current Liability',     group: 'Accrued Liabilities',       normalBalance: 'Credit', balance: 12_500,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Interest accrued on outstanding debt obligations.' },
  { id: 'l2140', code: '2140', name: 'Accrued Expenses — General',          type: 'Liability', subType: 'Current Liability',     group: 'Accrued Liabilities',       normalBalance: 'Credit', balance: 56_200,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Other accrued operating expenses not separately classified.' },
  { id: 'l2200', code: '2200', name: 'VAT / Sales Tax Payable',             type: 'Liability', subType: 'Current Liability',     group: 'Tax Liabilities',           normalBalance: 'Credit', balance: 48_600,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Output VAT collected from customers, due to tax authority.' },
  { id: 'l2210', code: '2210', name: 'Corporate Income Tax Payable',        type: 'Liability', subType: 'Current Liability',     group: 'Tax Liabilities',           normalBalance: 'Credit', balance: 124_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Current period corporate tax liability due within 12 months.' },
  { id: 'l2300', code: '2300', name: 'Deferred Revenue — Subscriptions',    type: 'Liability', subType: 'Current Liability',     group: 'Deferred Revenue',          normalBalance: 'Credit', balance: 210_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Cash received for SaaS subscriptions not yet earned.' },
  { id: 'l2310', code: '2310', name: 'Deferred Revenue — Services',         type: 'Liability', subType: 'Current Liability',     group: 'Deferred Revenue',          normalBalance: 'Credit', balance: 85_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Advance payments for professional services not yet delivered.' },
  { id: 'l2400', code: '2400', name: 'Short-Term Loan — Line of Credit',    type: 'Liability', subType: 'Current Liability',     group: 'Short-Term Borrowings',     normalBalance: 'Credit', balance: 200_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Revolving credit facility drawn and due within 12 months.' },
  { id: 'l2410', code: '2410', name: 'Current Portion of Long-Term Debt',   type: 'Liability', subType: 'Current Liability',     group: 'Short-Term Borrowings',     normalBalance: 'Credit', balance: 120_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Principal repayments on long-term debt due within 12 months.' },
  { id: 'l2500', code: '2500', name: 'Suspense / Clearing Account',         type: 'Liability', subType: 'Current Liability',     group: 'Clearing Accounts',         normalBalance: 'Credit', balance: 0,        currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: true,  description: 'Temporary holding account for unallocated transactions. Must net to zero at period end.' },

  // Non-Current Liabilities
  { id: 'l2600', code: '2600', name: 'Long-Term Debt — Term Loan',          type: 'Liability', subType: 'Non-Current Liability', group: 'Long-Term Borrowings',      normalBalance: 'Credit', balance: 800_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Bank term loan repayable over more than 12 months.' },
  { id: 'l2610', code: '2610', name: 'Bonds Payable',                       type: 'Liability', subType: 'Non-Current Liability', group: 'Long-Term Borrowings',      normalBalance: 'Credit', balance: 500_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Corporate bonds issued and outstanding.' },
  { id: 'l2700', code: '2700', name: 'Lease Liability — Operating (IFRS 16)', type: 'Liability', subType: 'Non-Current Liability', group: 'Lease Liabilities',       normalBalance: 'Credit', balance: 496_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Present value of future lease payments under IFRS 16.' },
  { id: 'l2800', code: '2800', name: 'Deferred Tax Liability',              type: 'Liability', subType: 'Non-Current Liability', group: 'Tax Liabilities',           normalBalance: 'Credit', balance: 92_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Tax payable in future periods from temporary differences.' },
  { id: 'l2900', code: '2900', name: 'Pension Obligation — Defined Benefit', type: 'Liability', subType: 'Non-Current Liability', group: 'Employee Obligations',     normalBalance: 'Credit', balance: 340_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Actuarially determined defined benefit pension liability.' },

  // ════════════════════════════════════════════════════════════
  // CLASS 3 — EQUITY (3000–3999)
  // ════════════════════════════════════════════════════════════

  { id: 'e3000', code: '3000', name: 'Common Stock / Share Capital',        type: 'Equity', subType: 'Equity', group: 'Contributed Capital',       normalBalance: 'Credit', balance: 1_000_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Par value of issued ordinary shares.' },
  { id: 'e3010', code: '3010', name: 'Additional Paid-in Capital',          type: 'Equity', subType: 'Equity', group: 'Contributed Capital',       normalBalance: 'Credit', balance: 2_400_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Share premium — amount received above par value on share issuance.' },
  { id: 'e3020', code: '3020', name: 'Treasury Stock',                      type: 'Equity', subType: 'Equity', group: 'Contributed Capital',       normalBalance: 'Debit',  balance: -180_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-equity: cost of shares repurchased and held by the company.' },
  { id: 'e3100', code: '3100', name: 'Retained Earnings',                   type: 'Equity', subType: 'Equity', group: 'Retained Earnings',         normalBalance: 'Credit', balance: 1_840_200, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Cumulative net income retained in the business after dividends.' },
  { id: 'e3110', code: '3110', name: 'Dividends Declared',                  type: 'Equity', subType: 'Equity', group: 'Retained Earnings',         normalBalance: 'Debit',  balance: -240_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Dividends declared to shareholders, reducing retained earnings.' },
  { id: 'e3200', code: '3200', name: 'Other Comprehensive Income (OCI)',     type: 'Equity', subType: 'Equity', group: 'Other Comprehensive Income', normalBalance: 'Credit', balance: 62_000,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Unrealised gains/losses on investments and FX translation.' },
  { id: 'e3210', code: '3210', name: 'Foreign Currency Translation Reserve', type: 'Equity', subType: 'Equity', group: 'Other Comprehensive Income', normalBalance: 'Credit', balance: -18_400,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Cumulative FX translation differences on foreign subsidiaries.' },
  { id: 'e3300', code: '3300', name: 'Non-Controlling Interests',           type: 'Equity', subType: 'Equity', group: 'Non-Controlling Interests',  normalBalance: 'Credit', balance: 320_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Equity attributable to minority shareholders in subsidiaries.' },

  // ════════════════════════════════════════════════════════════
  // CLASS 4 — REVENUE (4000–4999)
  // ════════════════════════════════════════════════════════════

  { id: 'r4000', code: '4000', name: 'SaaS Subscription Revenue',           type: 'Revenue', subType: 'Operating Revenue', group: 'Product & Service Revenue', normalBalance: 'Credit', balance: 1_480_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Recurring monthly and annual SaaS subscription fees.' },
  { id: 'r4010', code: '4010', name: 'Professional Services Revenue',       type: 'Revenue', subType: 'Operating Revenue', group: 'Product & Service Revenue', normalBalance: 'Credit', balance: 620_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Revenue from consulting, implementation, and advisory services.' },
  { id: 'r4020', code: '4020', name: 'Product Sales Revenue',               type: 'Revenue', subType: 'Operating Revenue', group: 'Product & Service Revenue', normalBalance: 'Credit', balance: 380_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Revenue from sale of physical or digital products.' },
  { id: 'r4030', code: '4030', name: 'Licensing & Royalty Revenue',         type: 'Revenue', subType: 'Operating Revenue', group: 'Product & Service Revenue', normalBalance: 'Credit', balance: 145_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Fees earned from licensing intellectual property.' },
  { id: 'r4040', code: '4040', name: 'Training & Certification Revenue',    type: 'Revenue', subType: 'Operating Revenue', group: 'Product & Service Revenue', normalBalance: 'Credit', balance: 68_000,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Revenue from training programmes and certification courses.' },
  { id: 'r4100', code: '4100', name: 'Sales Returns & Allowances',          type: 'Revenue', subType: 'Operating Revenue', group: 'Revenue Deductions',        normalBalance: 'Debit',  balance: -42_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-revenue: refunds and allowances granted to customers.' },
  { id: 'r4110', code: '4110', name: 'Sales Discounts',                     type: 'Revenue', subType: 'Operating Revenue', group: 'Revenue Deductions',        normalBalance: 'Debit',  balance: -28_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contra-revenue: early payment and volume discounts.' },
  { id: 'r4200', code: '4200', name: 'Interest Income',                     type: 'Revenue', subType: 'Non-Operating Revenue', group: 'Other Income',          normalBalance: 'Credit', balance: 24_800,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Interest earned on bank deposits and short-term investments.' },
  { id: 'r4210', code: '4210', name: 'Dividend Income',                     type: 'Revenue', subType: 'Non-Operating Revenue', group: 'Other Income',          normalBalance: 'Credit', balance: 18_000,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Dividends received from equity investments.' },
  { id: 'r4220', code: '4220', name: 'Gain on Disposal of Assets',          type: 'Revenue', subType: 'Non-Operating Revenue', group: 'Other Income',          normalBalance: 'Credit', balance: 12_400,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Profit on sale of fixed assets above net book value.' },
  { id: 'r4230', code: '4230', name: 'Foreign Exchange Gain',               type: 'Revenue', subType: 'Non-Operating Revenue', group: 'Other Income',          normalBalance: 'Credit', balance: 8_600,     currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Realised and unrealised FX gains on foreign currency transactions.' },
  { id: 'r4240', code: '4240', name: 'Grant Income',                        type: 'Revenue', subType: 'Non-Operating Revenue', group: 'Other Income',          normalBalance: 'Credit', balance: 50_000,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Government and institutional grants recognised as income.' },

  // ════════════════════════════════════════════════════════════
  // CLASS 5 — COST OF REVENUE (5000–5999)
  // ════════════════════════════════════════════════════════════

  { id: 'x5000', code: '5000', name: 'Direct Labour — Production',          type: 'Expense', subType: 'Cost of Revenue', group: 'Cost of Goods Sold',        normalBalance: 'Debit', balance: 320_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Wages for employees directly involved in production.' },
  { id: 'x5010', code: '5010', name: 'Direct Materials',                    type: 'Expense', subType: 'Cost of Revenue', group: 'Cost of Goods Sold',        normalBalance: 'Debit', balance: 210_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Raw materials consumed in production of goods sold.' },
  { id: 'x5020', code: '5020', name: 'Manufacturing Overhead',              type: 'Expense', subType: 'Cost of Revenue', group: 'Cost of Goods Sold',        normalBalance: 'Debit', balance: 95_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Indirect production costs: utilities, factory rent, maintenance.' },
  { id: 'x5030', code: '5030', name: 'Cloud Infrastructure & Hosting',      type: 'Expense', subType: 'Cost of Revenue', group: 'Cost of Goods Sold',        normalBalance: 'Debit', balance: 148_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'AWS/Azure/GCP costs directly attributable to product delivery.' },
  { id: 'x5040', code: '5040', name: 'Third-Party API & Data Costs',        type: 'Expense', subType: 'Cost of Revenue', group: 'Cost of Goods Sold',        normalBalance: 'Debit', balance: 42_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'External API, data feed, and integration costs tied to revenue.' },
  { id: 'x5050', code: '5050', name: 'Cost of Professional Services',       type: 'Expense', subType: 'Cost of Revenue', group: 'Cost of Goods Sold',        normalBalance: 'Debit', balance: 180_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Contractor and subcontractor costs for billable service delivery.' },

  // ════════════════════════════════════════════════════════════
  // CLASS 6 — OPERATING EXPENSES (6000–6999)
  // ════════════════════════════════════════════════════════════

  { id: 'x6000', code: '6000', name: 'Salaries & Wages — Staff',            type: 'Expense', subType: 'Operating Expense', group: 'Personnel Costs',          normalBalance: 'Debit', balance: 840_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Base salaries and wages for all permanent employees.' },
  { id: 'x6010', code: '6010', name: 'Salaries — Management & Executives',  type: 'Expense', subType: 'Operating Expense', group: 'Personnel Costs',          normalBalance: 'Debit', balance: 320_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Compensation for C-suite and senior management.' },
  { id: 'x6020', code: '6020', name: 'Overtime & Shift Allowances',         type: 'Expense', subType: 'Operating Expense', group: 'Personnel Costs',          normalBalance: 'Debit', balance: 48_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Overtime pay and shift differential allowances.' },
  { id: 'x6030', code: '6030', name: 'Employee Benefits & Welfare',         type: 'Expense', subType: 'Operating Expense', group: 'Personnel Costs',          normalBalance: 'Debit', balance: 124_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Health insurance, life cover, and employee welfare programmes.' },
  { id: 'x6040', code: '6040', name: 'Employer Pension Contributions',      type: 'Expense', subType: 'Operating Expense', group: 'Personnel Costs',          normalBalance: 'Debit', balance: 68_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Employer-side pension and retirement fund contributions.' },
  { id: 'x6050', code: '6050', name: 'Payroll Tax — Employer NI/FICA',      type: 'Expense', subType: 'Operating Expense', group: 'Personnel Costs',          normalBalance: 'Debit', balance: 92_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Employer payroll taxes: National Insurance, FICA, etc.' },
  { id: 'x6060', code: '6060', name: 'Staff Training & Development',        type: 'Expense', subType: 'Operating Expense', group: 'Personnel Costs',          normalBalance: 'Debit', balance: 36_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Employee training, certifications, and L&D programmes.' },
  { id: 'x6070', code: '6070', name: 'Recruitment & Onboarding Costs',      type: 'Expense', subType: 'Operating Expense', group: 'Personnel Costs',          normalBalance: 'Debit', balance: 28_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Hiring fees, background checks, and onboarding expenses.' },
  { id: 'x6100', code: '6100', name: 'Rent & Occupancy',                    type: 'Expense', subType: 'Operating Expense', group: 'Facilities',               normalBalance: 'Debit', balance: 180_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Office and facility lease payments.' },
  { id: 'x6110', code: '6110', name: 'Utilities — Electricity & Water',     type: 'Expense', subType: 'Operating Expense', group: 'Facilities',               normalBalance: 'Debit', balance: 24_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Electricity, water, and gas for office and production facilities.' },
  { id: 'x6120', code: '6120', name: 'Repairs & Maintenance',               type: 'Expense', subType: 'Operating Expense', group: 'Facilities',               normalBalance: 'Debit', balance: 18_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Routine maintenance and repairs to facilities and equipment.' },
  { id: 'x6200', code: '6200', name: 'Depreciation — PP&E',                 type: 'Expense', subType: 'Operating Expense', group: 'Depreciation & Amortisation', normalBalance: 'Debit', balance: 186_000, currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Periodic depreciation charge on property, plant and equipment.' },
  { id: 'x6210', code: '6210', name: 'Amortisation — Intangibles',          type: 'Expense', subType: 'Operating Expense', group: 'Depreciation & Amortisation', normalBalance: 'Debit', balance: 84_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Periodic amortisation of intangible assets.' },
  { id: 'x6220', code: '6220', name: 'Amortisation — ROU Assets',           type: 'Expense', subType: 'Operating Expense', group: 'Depreciation & Amortisation', normalBalance: 'Debit', balance: 62_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Amortisation of right-of-use assets under IFRS 16.' },
  { id: 'x6300', code: '6300', name: 'Software & SaaS Subscriptions',       type: 'Expense', subType: 'Operating Expense', group: 'Technology',               normalBalance: 'Debit', balance: 96_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Enterprise software licences and SaaS tool subscriptions.' },
  { id: 'x6310', code: '6310', name: 'IT Support & Managed Services',       type: 'Expense', subType: 'Operating Expense', group: 'Technology',               normalBalance: 'Debit', balance: 48_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Outsourced IT support, helpdesk, and managed service contracts.' },
  { id: 'x6320', code: '6320', name: 'Cybersecurity & Compliance Tools',    type: 'Expense', subType: 'Operating Expense', group: 'Technology',               normalBalance: 'Debit', balance: 36_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Security software, penetration testing, and compliance tooling.' },
  { id: 'x6400', code: '6400', name: 'Office Supplies & Consumables',       type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 12_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Stationery, printer supplies, and general office consumables.' },
  { id: 'x6410', code: '6410', name: 'Postage & Courier',                   type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 6_400,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Postage, courier, and document delivery costs.' },
  { id: 'x6420', code: '6420', name: 'Telephone & Communications',          type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 18_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Mobile, landline, internet, and video conferencing costs.' },

  // ════════════════════════════════════════════════════════════
  // CLASS 7 — SALES & MARKETING (7000–7999)
  // ════════════════════════════════════════════════════════════

  { id: 'x7000', code: '7000', name: 'Advertising & Digital Marketing',     type: 'Expense', subType: 'Operating Expense', group: 'Sales & Marketing',        normalBalance: 'Debit', balance: 124_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Paid media, SEO, content marketing, and digital advertising.' },
  { id: 'x7010', code: '7010', name: 'Sales Commissions & Incentives',      type: 'Expense', subType: 'Operating Expense', group: 'Sales & Marketing',        normalBalance: 'Debit', balance: 96_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Variable sales commissions and performance incentives.' },
  { id: 'x7020', code: '7020', name: 'Trade Shows & Events',                type: 'Expense', subType: 'Operating Expense', group: 'Sales & Marketing',        normalBalance: 'Debit', balance: 42_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Exhibition stands, sponsorships, and corporate events.' },
  { id: 'x7030', code: '7030', name: 'Travel & Entertainment — Sales',      type: 'Expense', subType: 'Operating Expense', group: 'Sales & Marketing',        normalBalance: 'Debit', balance: 38_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Client entertainment, sales travel, and hospitality.' },
  { id: 'x7040', code: '7040', name: 'Brand & Creative Production',         type: 'Expense', subType: 'Operating Expense', group: 'Sales & Marketing',        normalBalance: 'Debit', balance: 28_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Design, video production, and brand asset creation.' },
  { id: 'x7050', code: '7050', name: 'CRM & Sales Tools',                   type: 'Expense', subType: 'Operating Expense', group: 'Sales & Marketing',        normalBalance: 'Debit', balance: 24_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'CRM platform, sales intelligence, and prospecting tools.' },

  // ════════════════════════════════════════════════════════════
  // CLASS 8 — GENERAL & ADMINISTRATIVE (8000–8499)
  // ════════════════════════════════════════════════════════════

  { id: 'x8000', code: '8000', name: 'Legal & Professional Fees',           type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 84_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Legal counsel, contract review, and regulatory advisory fees.' },
  { id: 'x8010', code: '8010', name: 'Audit & Accounting Fees',             type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 48_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'External audit, tax preparation, and accounting advisory fees.' },
  { id: 'x8020', code: '8020', name: 'Insurance — General & Liability',     type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 36_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'General liability, D&O, and property insurance premiums.' },
  { id: 'x8030', code: '8030', name: 'Bank Charges & Transaction Fees',     type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 14_400,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Bank service charges, wire fees, and payment processing costs.' },
  { id: 'x8040', code: '8040', name: 'Bad Debt Expense',                    type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 24_010,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Write-off of uncollectible receivables.' },
  { id: 'x8050', code: '8050', name: 'Directors\' Fees & Board Expenses',   type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 60_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Non-executive director fees and board meeting expenses.' },
  { id: 'x8060', code: '8060', name: 'Regulatory & Compliance Fees',        type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 18_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Regulatory filing fees, licences, and compliance costs.' },
  { id: 'x8070', code: '8070', name: 'Travel & Accommodation — General',    type: 'Expense', subType: 'Operating Expense', group: 'General & Administrative', normalBalance: 'Debit', balance: 32_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Business travel, flights, hotels, and ground transport.' },

  // ════════════════════════════════════════════════════════════
  // CLASS 8 — NON-OPERATING & BELOW-THE-LINE (8500–8999)
  // ════════════════════════════════════════════════════════════

  { id: 'x8500', code: '8500', name: 'Interest Expense — Loans',            type: 'Expense', subType: 'Non-Operating Expense', group: 'Finance Costs',         normalBalance: 'Debit', balance: 48_000,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Interest on term loans and revolving credit facilities.' },
  { id: 'x8510', code: '8510', name: 'Interest Expense — Lease Liabilities', type: 'Expense', subType: 'Non-Operating Expense', group: 'Finance Costs',        normalBalance: 'Debit', balance: 24_800,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Interest component of IFRS 16 lease liability unwinding.' },
  { id: 'x8520', code: '8520', name: 'Foreign Exchange Loss',               type: 'Expense', subType: 'Non-Operating Expense', group: 'Finance Costs',         normalBalance: 'Debit', balance: 12_400,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Realised and unrealised FX losses on foreign currency transactions.' },
  { id: 'x8530', code: '8530', name: 'Loss on Disposal of Assets',          type: 'Expense', subType: 'Non-Operating Expense', group: 'Finance Costs',         normalBalance: 'Debit', balance: 8_200,    currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Loss on sale of fixed assets below net book value.' },
  { id: 'x8600', code: '8600', name: 'Income Tax Expense — Current',        type: 'Expense', subType: 'Non-Operating Expense', group: 'Taxation',              normalBalance: 'Debit', balance: 124_000,  currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Current period corporate income tax charge.' },
  { id: 'x8610', code: '8610', name: 'Income Tax Expense — Deferred',       type: 'Expense', subType: 'Non-Operating Expense', group: 'Taxation',              normalBalance: 'Debit', balance: 18_400,   currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Deferred tax charge arising from temporary differences.' },
  { id: 'x8700', code: '8700', name: 'Impairment Loss — Goodwill',          type: 'Expense', subType: 'Non-Operating Expense', group: 'Impairment',            normalBalance: 'Debit', balance: 0,        currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Goodwill impairment charge following annual impairment test.' },
  { id: 'x8710', code: '8710', name: 'Impairment Loss — Other Assets',      type: 'Expense', subType: 'Non-Operating Expense', group: 'Impairment',            normalBalance: 'Debit', balance: 0,        currency: 'USD', isActive: true, isBankAccount: false, isReconcilable: false, description: 'Write-down of assets where recoverable amount is below carrying value.' },
];

// ── Financial Metrics ─────────────────────────────────────────
export const FINANCIAL_METRICS = {
  totalRevenue:     2_840_000,
  totalExpenses:    1_530_000,
  operatingMargin:  38.4,
  currentRatio:     2.1,
  quickRatio:       1.8,
  ebitda:           1_310_000,
  burnRate:         125_000,
};

// ── Journal Entries ───────────────────────────────────────────
// Full double-entry journals. Each entry has balanced debit/credit lines.
export const MOCK_JOURNALS: any[] = [
  {
    id: 'JE-2026-001',
    date: '2026-04-01T08:00:00Z',
    description: 'Monthly Payroll Run — April 2026',
    reference: 'PAY-APR-2026',
    source: 'Payroll Module',
    status: 'POSTED',
    totalDebit: 284_600,
    totalCredit: 284_600,
    lines: [
      { accountCode: '6000', accountName: 'Salaries & Wages — Staff',       type: 'Debit',  amount: 210_000 },
      { accountCode: '6010', accountName: 'Salaries — Management & Executives', type: 'Debit', amount: 48_000 },
      { accountCode: '6020', accountName: 'Overtime & Shift Allowances',    type: 'Debit',  amount: 8_600  },
      { accountCode: '6050', accountName: 'Payroll Tax — Employer NI/FICA', type: 'Debit',  amount: 18_000 },
      { accountCode: '2100', accountName: 'Salaries & Wages Payable',       type: 'Credit', amount: 258_600 },
      { accountCode: '2110', accountName: 'Payroll Tax Payable — PAYE',     type: 'Credit', amount: 18_000  },
      { accountCode: '2120', accountName: 'Pension & Benefits Payable',     type: 'Credit', amount: 8_000   },
    ],
  },
  {
    id: 'JE-2026-002',
    date: '2026-04-01T09:30:00Z',
    description: 'Payroll Disbursement — April 2026',
    reference: 'DISB-APR-2026',
    source: 'Payroll Module',
    status: 'POSTED',
    totalDebit: 258_600,
    totalCredit: 258_600,
    lines: [
      { accountCode: '2100', accountName: 'Salaries & Wages Payable',       type: 'Debit',  amount: 258_600 },
      { accountCode: '1010', accountName: 'Cash — Payroll Clearing Account', type: 'Credit', amount: 258_600 },
    ],
  },
  {
    id: 'JE-2026-003',
    date: '2026-04-02T10:00:00Z',
    description: 'SaaS Subscription Revenue — Q2 Billing Cycle',
    reference: 'REV-SAAS-Q2-2026',
    source: 'Billing System',
    status: 'POSTED',
    totalDebit: 124_000,
    totalCredit: 124_000,
    lines: [
      { accountCode: '1100', accountName: 'Accounts Receivable — Trade',    type: 'Debit',  amount: 124_000 },
      { accountCode: '4000', accountName: 'SaaS Subscription Revenue',      type: 'Credit', amount: 124_000 },
    ],
  },
  {
    id: 'JE-2026-004',
    date: '2026-04-02T11:00:00Z',
    description: 'Deferred Revenue Recognition — March Subscriptions',
    reference: 'REV-DEF-MAR-2026',
    source: 'Revenue Module',
    status: 'POSTED',
    totalDebit: 85_000,
    totalCredit: 85_000,
    lines: [
      { accountCode: '2300', accountName: 'Deferred Revenue — Subscriptions', type: 'Debit',  amount: 85_000 },
      { accountCode: '4000', accountName: 'SaaS Subscription Revenue',        type: 'Credit', amount: 85_000 },
    ],
  },
  {
    id: 'JE-2026-005',
    date: '2026-04-03T08:45:00Z',
    description: 'Vendor Invoice — AWS Cloud Infrastructure (March)',
    reference: 'AP-AWS-MAR-2026',
    source: 'Accounts Payable',
    status: 'POSTED',
    totalDebit: 38_400,
    totalCredit: 38_400,
    lines: [
      { accountCode: '5030', accountName: 'Cloud Infrastructure & Hosting', type: 'Debit',  amount: 38_400 },
      { accountCode: '2000', accountName: 'Accounts Payable — Trade',       type: 'Credit', amount: 38_400 },
    ],
  },
  {
    id: 'JE-2026-006',
    date: '2026-04-03T14:00:00Z',
    description: 'Vendor Payment — AWS Invoice Settlement',
    reference: 'PMT-AWS-APR-2026',
    source: 'Accounts Payable',
    status: 'POSTED',
    totalDebit: 38_400,
    totalCredit: 38_400,
    lines: [
      { accountCode: '2000', accountName: 'Accounts Payable — Trade',       type: 'Debit',  amount: 38_400 },
      { accountCode: '1000', accountName: 'Cash — Main Operating Account',  type: 'Credit', amount: 38_400 },
    ],
  },
  {
    id: 'JE-2026-007',
    date: '2026-04-04T09:00:00Z',
    description: 'Monthly Depreciation — PP&E and Intangibles',
    reference: 'DEP-APR-2026',
    source: 'Fixed Assets Module',
    status: 'POSTED',
    totalDebit: 22_500,
    totalCredit: 22_500,
    lines: [
      { accountCode: '6200', accountName: 'Depreciation — PP&E',            type: 'Debit',  amount: 15_500 },
      { accountCode: '6210', accountName: 'Amortisation — Intangibles',     type: 'Debit',  amount: 7_000  },
      { accountCode: '1621', accountName: 'Accum. Depreciation — Machinery', type: 'Credit', amount: 8_000 },
      { accountCode: '1631', accountName: 'Accum. Depreciation — IT Equipment', type: 'Credit', amount: 7_500 },
      { accountCode: '1811', accountName: 'Accum. Amortisation — Patents',  type: 'Credit', amount: 7_000  },
    ],
  },
  {
    id: 'JE-2026-008',
    date: '2026-04-05T10:30:00Z',
    description: 'Customer Payment Received — Acme Corp Invoice #INV-0042',
    reference: 'REC-ACME-0042',
    source: 'Accounts Receivable',
    status: 'POSTED',
    totalDebit: 62_400,
    totalCredit: 62_400,
    lines: [
      { accountCode: '1000', accountName: 'Cash — Main Operating Account',  type: 'Debit',  amount: 62_400 },
      { accountCode: '1100', accountName: 'Accounts Receivable — Trade',    type: 'Credit', amount: 62_400 },
    ],
  },
  {
    id: 'JE-2026-009',
    date: '2026-04-07T08:00:00Z',
    description: 'Office Rent — April 2026',
    reference: 'RENT-APR-2026',
    source: 'Accounts Payable',
    status: 'POSTED',
    totalDebit: 15_000,
    totalCredit: 15_000,
    lines: [
      { accountCode: '6100', accountName: 'Rent & Occupancy',               type: 'Debit',  amount: 15_000 },
      { accountCode: '1000', accountName: 'Cash — Main Operating Account',  type: 'Credit', amount: 15_000 },
    ],
  },
  {
    id: 'JE-2026-010',
    date: '2026-04-08T11:00:00Z',
    description: 'VAT Return Filing — Q1 2026',
    reference: 'VAT-Q1-2026',
    source: 'Tax Module',
    status: 'POSTED',
    totalDebit: 48_600,
    totalCredit: 48_600,
    lines: [
      { accountCode: '2200', accountName: 'VAT / Sales Tax Payable',        type: 'Debit',  amount: 48_600 },
      { accountCode: '1000', accountName: 'Cash — Main Operating Account',  type: 'Credit', amount: 48_600 },
    ],
  },
  {
    id: 'JE-2026-011',
    date: '2026-04-09T09:15:00Z',
    description: 'Professional Services Revenue — Nexus Corp Implementation',
    reference: 'REV-PS-NEXUS-001',
    source: 'Billing System',
    status: 'POSTED',
    totalDebit: 48_000,
    totalCredit: 48_000,
    lines: [
      { accountCode: '1100', accountName: 'Accounts Receivable — Trade',    type: 'Debit',  amount: 48_000 },
      { accountCode: '4010', accountName: 'Professional Services Revenue',  type: 'Credit', amount: 48_000 },
    ],
  },
  {
    id: 'JE-2026-012',
    date: '2026-04-10T14:00:00Z',
    description: 'Prepaid Insurance Amortisation — April 2026',
    reference: 'PREP-INS-APR-2026',
    source: 'General Ledger',
    status: 'POSTED',
    totalDebit: 1_500,
    totalCredit: 1_500,
    lines: [
      { accountCode: '8020', accountName: 'Insurance — General & Liability', type: 'Debit',  amount: 1_500 },
      { accountCode: '1310', accountName: 'Prepaid Insurance',               type: 'Credit', amount: 1_500 },
    ],
  },
  {
    id: 'JE-2026-013',
    date: '2026-04-11T10:00:00Z',
    description: 'Accrual — Legal & Audit Fees Q1 2026',
    reference: 'ACC-LEGAL-Q1-2026',
    source: 'General Ledger',
    status: 'POSTED',
    totalDebit: 24_000,
    totalCredit: 24_000,
    lines: [
      { accountCode: '8000', accountName: 'Legal & Professional Fees',      type: 'Debit',  amount: 14_000 },
      { accountCode: '8010', accountName: 'Audit & Accounting Fees',        type: 'Debit',  amount: 10_000 },
      { accountCode: '2140', accountName: 'Accrued Expenses — General',     type: 'Credit', amount: 24_000 },
    ],
  },
  {
    id: 'JE-2026-014',
    date: '2026-04-12T09:00:00Z',
    description: 'IT Equipment Purchase — 12 Developer Workstations',
    reference: 'CAPEX-IT-APR-2026',
    source: 'Procurement Module',
    status: 'POSTED',
    totalDebit: 36_000,
    totalCredit: 36_000,
    lines: [
      { accountCode: '1630', accountName: 'Computer Hardware & IT Equipment', type: 'Debit',  amount: 36_000 },
      { accountCode: '2000', accountName: 'Accounts Payable — Trade',         type: 'Credit', amount: 36_000 },
    ],
  },
  {
    id: 'JE-2026-015',
    date: '2026-04-14T08:30:00Z',
    description: 'IFRS 16 Lease Liability — April Interest Unwinding',
    reference: 'LEASE-INT-APR-2026',
    source: 'Lease Module',
    status: 'POSTED',
    totalDebit: 2_067,
    totalCredit: 2_067,
    lines: [
      { accountCode: '8510', accountName: 'Interest Expense — Lease Liabilities', type: 'Debit',  amount: 2_067 },
      { accountCode: '2700', accountName: 'Lease Liability — Operating (IFRS 16)', type: 'Credit', amount: 2_067 },
    ],
  },
  {
    id: 'JE-2026-016',
    date: '2026-04-15T11:00:00Z',
    description: 'Bad Debt Write-Off — Orion Ltd (Unrecoverable)',
    reference: 'BD-ORION-APR-2026',
    source: 'Accounts Receivable',
    status: 'POSTED',
    totalDebit: 8_400,
    totalCredit: 8_400,
    lines: [
      { accountCode: '1110', accountName: 'Allowance for Doubtful Accounts', type: 'Debit',  amount: 8_400 },
      { accountCode: '1100', accountName: 'Accounts Receivable — Trade',     type: 'Credit', amount: 8_400 },
    ],
  },
  {
    id: 'JE-2026-017',
    date: '2026-04-15T14:00:00Z',
    description: 'Intercompany Loan Settlement — HRcopilot Nigeria Subsidiary',
    reference: 'IC-NG-APR-2026',
    source: 'Treasury',
    status: 'POSTED',
    totalDebit: 45_000,
    totalCredit: 45_000,
    lines: [
      { accountCode: '2010', accountName: 'Intercompany Payable',           type: 'Debit',  amount: 45_000 },
      { accountCode: '1000', accountName: 'Cash — Main Operating Account',  type: 'Credit', amount: 45_000 },
    ],
  },
  {
    id: 'JE-2026-018',
    date: '2026-04-16T09:00:00Z',
    description: 'Corporate Income Tax Provision — Q1 2026',
    reference: 'TAX-PROV-Q1-2026',
    source: 'Tax Module',
    status: 'POSTED',
    totalDebit: 31_000,
    totalCredit: 31_000,
    lines: [
      { accountCode: '8600', accountName: 'Income Tax Expense — Current',   type: 'Debit',  amount: 31_000 },
      { accountCode: '2210', accountName: 'Corporate Income Tax Payable',   type: 'Credit', amount: 31_000 },
    ],
  },
  {
    id: 'JE-2026-019',
    date: '2026-04-16T10:30:00Z',
    description: 'Sales Commission Accrual — Q1 2026 Closures',
    reference: 'COMM-Q1-2026',
    source: 'Payroll Module',
    status: 'DRAFT',
    totalDebit: 18_400,
    totalCredit: 18_400,
    lines: [
      { accountCode: '7010', accountName: 'Sales Commissions & Incentives', type: 'Debit',  amount: 18_400 },
      { accountCode: '2100', accountName: 'Salaries & Wages Payable',       type: 'Credit', amount: 18_400 },
    ],
  },
  {
    id: 'JE-2026-020',
    date: '2026-04-16T15:00:00Z',
    description: 'FX Revaluation — USD/NGN Open Balances at Period End',
    reference: 'FX-REVAL-APR-2026',
    source: 'Treasury',
    status: 'DRAFT',
    totalDebit: 4_200,
    totalCredit: 4_200,
    lines: [
      { accountCode: '8520', accountName: 'Foreign Exchange Loss',          type: 'Debit',  amount: 4_200 },
      { accountCode: '1120', accountName: 'Intercompany Receivable',        type: 'Credit', amount: 4_200 },
    ],
  },
];

// ── Aging Data ────────────────────────────────────────────────
export const AGING_DATA: any[] = [];

// ── Customers ─────────────────────────────────────────────────
export const CUSTOMERS: any[] = [
  { id: 'c001', name: 'Acme Corporation' },
  { id: 'c002', name: 'Nexus Technologies Ltd' },
  { id: 'c003', name: 'Orion Global Services' },
  { id: 'c004', name: 'Pinnacle Ventures Inc' },
  { id: 'c005', name: 'Meridian Consulting Group' },
  { id: 'c006', name: 'Apex Financial Partners' },
];

// ── Invoices ──────────────────────────────────────────────────
export const MOCK_INVOICES: any[] = [];
