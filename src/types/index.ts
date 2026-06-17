// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  subscription: SubscriptionPlan;
}

// Subscription types
export type SubscriptionPlan = "free" | "premium" | "institute";

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: "active" | "cancelled" | "expired";
  paypalSubscriptionId?: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

// Department types
export interface Department {
  id: string;
  userId: string;
  name: string;
  code?: string;
  createdAt: Date;
  semesters: Semester[];
}

export interface Semester {
  id: string;
  number: number;
  label: string;
}

// Analysis types
export interface Analysis {
  id: string;
  userId: string;
  departmentId: string;
  departmentName: string;
  semesterNumber: number;
  startSeat: string;
  endSeat: string;
  totalStudents: number;
  processedStudents: number;
  passCount: number;
  failCount: number;
  atktCount: number;
  passPercentage: number;
  distinctionCount: number;
  firstClassCount: number;
  students: StudentResult[];
  toppers: StudentResult[];
  subjectFailures: SubjectFailure[];
  status: "processing" | "completed" | "failed";
  createdAt: Date;
}

// Student Result types
export interface StudentResult {
  seatNo: string;
  name: string;
  subjects: SubjectMark[];
  totalMarks: number;
  percentage: number;
  totalCredit: number;
  remarks: string;
  finalStatus: "PASS" | "FAIL" | "ATKT" | "F.F." | string;
}

export interface SubjectMark {
  subjectName: string;
  subjectCode?: string;
  faTh: number | string;
  saTh: number | string;
  faPr: number | string;
  saPr: number | string;
  sla: number | string;
  credits: number | string;
  total?: number | string;
  grade?: string;
}

export interface SubjectFailure {
  subjectName: string;
  failCount: number;
  passCount: number;
  failPercentage: number;
}

// API Response types
export interface FetchResultRequest {
  seat_no: string;
}

export interface FetchResultResponse {
  success: boolean;
  data?: {
    name: string;
    seat_no: string;
    subjects: Array<{
      subject: string;
      fa_theory?: number | string;
      sa_theory?: number | string;
      fa_practical?: number | string;
      sa_practical?: number | string;
      sla?: number | string;
      credits?: number | string;
    }>;
    total_marks: number;
    percentage: number;
    total_credit: number;
    remarks: string;
    final_status: string;
  };
  error?: string;
}

// Progress tracking
export interface AnalysisProgress {
  current: number;
  total: number;
  currentSeat: string;
  failed: string[];
  status: "idle" | "processing" | "completed" | "error";
}

// Export options
export interface ExportOptions {
  format: "csv" | "pdf";
  includeWatermark: boolean;
  instituteLogo?: string;
  instituteName?: string;
}

// Statistics
export interface AnalysisStats {
  totalStudents: number;
  passCount: number;
  failCount: number;
  atktCount: number;
  passPercentage: number;
  distinctionCount: number;
  firstClassCount: number;
  avgMarks: number;
  avgPercentage: number;
  toppers: StudentResult[];
  subjectFailures: SubjectFailure[];
}
