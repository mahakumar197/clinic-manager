export interface Patient {
  id: string;
  user: string;
  email: string;
  initials: string;
  role: string | null;
  status: string;
  lastLogin: string;
  lastUpdate: string;
  twoFA: boolean;
  phase: string;
  next: string;
}