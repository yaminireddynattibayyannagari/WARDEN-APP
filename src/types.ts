export interface LogEntry {
  action: 'Submitted' | 'Approved' | 'Rejected' | 'Checked Out' | 'Returned';
  timestamp: string;
  user: string;
  message: string;
}

export interface LeaveRequest {
  id: string;
  studentName: string;
  rollNumber: string;
  department: string;
  block: string;
  roomNumber: string;
  destination: string;
  startDate: string;
  endDate: string;
  reason: string;
  emergencyStatus: boolean;
  status: 'submitted' | 'pending' | 'approved' | 'rejected' | 'checked_out' | 'returned';
  createdAt: string;
  updatedAt: string;
  pdfLetterUrl: string | null; // Data URI of the generated PDF
  checkoutTime: string | null;
  checkinTime: string | null;
  logs: LogEntry[];
  studentEmail?: string;
  parentEmail?: string;
  parentConsentStatus?: 'not_required' | 'pending' | 'approved' | 'rejected';
}

export type UserRole = 'student' | 'warden' | 'guard';
