export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  PATIENT = 'PATIENT',
  MANAGER = 'MANAGER',
  SURGEON = 'SURGEON',
  COORDINATOR = 'COORDINATOR',
  MARKETING = 'MARKETING',
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
}
