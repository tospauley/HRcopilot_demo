
export enum UserRole {
  CEO = 'CEO',
  HR_MANAGER = 'HR_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  EMPLOYEE = 'EMPLOYEE'
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  deviceBound: boolean;
}

export interface UserProfile {
  uid?: string;
  name: string;
  username: string;
  avatar: string;
  role: UserRole;
}

// Enterprise Attendance Types
export type AttendanceSource = 'BIOMETRIC' | 'APP' | 'USB';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'ANOMALY';

export interface RawPunch {
  id: string;
  timestamp: string;
  type: 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END';
  source: AttendanceSource;
  location?: string;
  deviceId?: string;
  isSelfieVerified?: boolean;
}

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  isActive: boolean;
}

export interface AttendanceAggregate {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: string;
  firstIn: string | null;
  lastOut: string | null;
  totalHours: number;
  lateMins: number;
  otMins: number;
  status: AttendanceStatus;
  primarySource: AttendanceSource;
  isLocked: boolean;
  punches: RawPunch[];
}

export interface AttendancePolicy {
  graceMinutes: number;
  roundingMinutes: number;
  latePenaltyTiers: { thresholdMins: number; penaltyAmount: number }[];
  otAutoApprove: boolean;
  enforceGeofence: boolean;
  strictGeofence?: boolean; // Block punch if outside
  geofenceZones?: GeofenceZone[];
}

// --- Payroll Domain Types ---

export type PayrollRunStatus = 'DRAFT' | 'COMPUTED' | 'UNDER_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'LOCKED' | 'PAID';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export interface PayrollPeriod {
  id: string;
  name: string; // e.g. "April 2024"
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED' | 'PROCESSING';
}

export interface PayrollRun {
  id: string;
  periodId: string;
  periodName: string;
  status: PayrollRunStatus;
  branchScope: string;
  deptScope: string;
  totalGross: number;
  totalNet: number;
  anomalyCount: number;
  submittedBy?: string;
  submittedAt?: string;
  approvalChain: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  role: string;
  approverName?: string;
  status: ApprovalStatus;
  updatedAt?: string;
  comment?: string;
}

export interface PayrollLine {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: string;
  branch: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  latePenalty: number;
  overtimePay: number;
  performanceBonus: number;
  grossPay: number;
  netPay: number;
  variance: number; // vs previous period
  hasAnomalies: boolean;
  isOnHold: boolean;
}

export interface PayItem {
  id: string;
  type: 'ALLOWANCE' | 'DEDUCTION' | 'BONUS' | 'REIMBURSEMENT';
  name: string;
  amount: number;
  isTaxable: boolean;
}

export interface AttendanceSummary {
  employeeId: string;
  totalDays: number;
  lateMins: number;
  overtimeMins: number;
  absences: number;
  anomalies: number;
}

export interface PerformanceSummary {
  employeeId: string;
  kpiScore: number;
  okrCompletion: number;
  bonusEligibility: boolean;
  recommendedIncentive: number;
}

// --- Standard UI types ---

export interface Branch {
  id: string;
  code: string;
  name: string;
  type: 'HQ' | 'Regional' | 'Satellite' | 'Virtual';
  status: 'Active' | 'Inactive' | 'Archived';
  address: string;
  city: string;
  country: string;
  timezone: string;
  is_hq: boolean;
  manager_name: string;
  employee_count: number;
  device_count: number;
  attendance_today: {
    present: number;
    late: number;
    absent: number;
  };
  latitude?: number;
  longitude?: number;
  image?: string;
}

export interface BranchDevice {
  id: string;
  name: string;
  serial: string;
  type: 'Face' | 'Fingerprint' | 'Hybrid';
  status: 'ONLINE' | 'OFFLINE';
  lastSync: string;
}

export type OKRStatus = 'ON_TRACK' | 'AT_RISK' | 'COMPLETED' | 'BEHIND';
export type OKRCategory = 'Strategic' | 'Operational' | 'Growth' | 'Cultural';

export interface KeyResult {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., '%', 'USD', 'Points'
  weight: number; // 0-100
}

export interface Objective {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  category: OKRCategory;
  status: OKRStatus;
  startDate: string;
  endDate: string;
  keyResults: KeyResult[];
  alignmentId?: string; // ID of parent company goal
}

export type FormFieldType = 
  | 'SHORT_TEXT' 
  | 'PARAGRAPH' 
  | 'MULTIPLE_CHOICE' 
  | 'CHECKBOXES' 
  | 'DROPDOWN' 
  | 'RATING' 
  | 'DATE' 
  | 'FILE'
  | 'CURRENCY'
  | 'NUMBER'
  | 'KPI';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  weight: number;
  options?: string[];
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  sections: FormSection[];
  scope: string;
  editingId: string;
  createdAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'NGN';

export interface BrandSettings {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  currency: CurrencyCode;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: string;
}

export type NotificationType = 'CYCLE_EVENT' | 'PENDING_REVIEW' | 'EVALUATION_COMPLETE' | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface WorkdaySettings {
  workStart: string;
  workEnd: string;
  gracePeriod: number;
  workHoursPerDay: number;
  workingDays: string[];
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
}
