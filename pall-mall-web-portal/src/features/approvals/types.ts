export interface SummaryInfo {
  fullName: string;
  dob: string;
  contact: string;
  email: string;
  surgeries: string;
  allergies: string;
  medications: string;
  notes: string;
}

export interface FormQuestion {
  q: string;
  yes: boolean;
  no: boolean;
}

export interface ApprovalItem {
  id: string;
  patientName: string;
  formTitle: string;
  urgency: "High" | "Medium" | "Low";
  submittedAt: string;
  status: "pending" | "approved" | "completed";
  summary: SummaryInfo;
  formData: FormQuestion[];
}

export interface ApprovalsState {
  approvals: ApprovalItem[];
  selectedId: string | null;
  viewMode: "details" | "form";
isFormModalOpen: boolean;
isMobileViewingDetails: boolean;

}
