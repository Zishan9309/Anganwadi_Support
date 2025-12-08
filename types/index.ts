

export interface Student {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  parentName: string;
  parentPhoneNumber: string; // New field
  weight: number;
  height: number;
  dateOfBirth: string;
  address: string;
  immunizationStatus: ImmunizationRecord[];
  attendanceRecords: AttendanceRecord[];
  nutritionRecords: NutritionRecord[];
  healthRecords: HealthRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ImmunizationRecord {
  id: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  // Added 'confirmed' status for the parent verification flow
  status: 'completed' | 'pending' | 'overdue' | 'confirmed';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  present: boolean;
  mealProvided: boolean;
  activities: string[];
}

export interface NutritionRecord {
  id: string;
  date: string;
  weight: number;
  height: number;
  nutritionStatus: 'healthy' | 'at-risk' | 'malnourished';
  mealDetails: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  checkupType: string;
  findings: string;
  recommendations: string;
}

export interface AWWProfile {
  id: string;
  name: string;
  phoneNumber: string;
  anganwadiCenterName: string;
  district: string;
  state: string;
  awwId: string;
  language: 'hindi' | 'english';
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  language: 'hindi' | 'english';
}

export interface GovernmentScheme {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  eligibility: string;
  eligibilityHindi: string;
  benefits: string;
  benefitsHindi: string;
}
