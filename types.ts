
export type SystemMode = 'A' | 'B';

export type OriginGroup = 'majority' | 'immigrant' | 'minority_a' | 'minority_b' | 'ethiopian';

export interface Applicant {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  origin: OriginGroup; // Ethnicity/Population group
  zipCode: string; // Geographic location
  
  // Financials
  income: number;
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'gig-economy';
  employmentDurationYears: number;
  creditScore: number;
  debtToIncomeRatio: number;
  hasHistoricalDefault: boolean;
  loanAmount: number;
}

export interface DecisionResult {
  score: number;
  approved: boolean;
  interestRate?: number;
  
  // New: Compare against the other mode
  alternativeScore?: number;
  alternativeApproved?: boolean;
  
  // Explanation Data
  factors: {
    name: string;
    impact: number; // +/- points
    description: string;
    category: 'financial' | 'demographic' | 'history';
  }[];
  
  ethicsFlags: {
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
  }[];
  
  threshold: number;
  maxPossibleScore: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
