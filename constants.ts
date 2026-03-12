
import { Applicant } from './types';

export const INITIAL_APPLICANT: Applicant = {
  id: 'user-input',
  name: 'מועמד לבדיקה',
  
  // Demographics (Sensitive)
  age: 35,
  gender: 'male',
  origin: 'majority',
  zipCode: '62000', // Center/Strong

  // Financials
  income: 15000,
  employmentStatus: 'employed',
  employmentDurationYears: 5,
  creditScore: 720,
  debtToIncomeRatio: 0.3,
  hasHistoricalDefault: false,
  loanAmount: 50000,
};

export const SCENARIOS = [
  {
    id: 'tech_bro',
    label: 'הייטקיסט צעיר מת"א',
    description: 'הכנסה גבוהה, גיל צעיר',
    data: { ...INITIAL_APPLICANT, name: 'עומר', age: 23, income: 28000, zipCode: '62000', employmentStatus: 'employed', origin: 'majority' }
  },
  {
    id: 'single_mom',
    label: 'חד-הורית מהפריפריה',
    description: 'הכנסה ממוצעת, מיקוד "חלש"',
    data: { ...INITIAL_APPLICANT, name: 'דנה', age: 42, income: 9000, zipCode: '12000', gender: 'female', employmentStatus: 'employed', origin: 'majority' }
  },
  {
    id: 'ethiopian_elder',
    label: 'מבוגר יוצא אתיופיה',
    description: 'ותק תעסוקתי גבוה, אפליית מוצא',
    data: { ...INITIAL_APPLICANT, name: 'דניאל', age: 62, income: 11000, zipCode: '84000', origin: 'ethiopian', employmentDurationYears: 20 }
  },
  {
    id: 'gig_worker',
    label: 'פרילנסר (Gig Economy)',
    description: 'דירוג אשראי טוב, עבודה "לא יציבה"',
    data: { ...INITIAL_APPLICANT, name: 'אמיר', age: 29, income: 14000, zipCode: '46000', employmentStatus: 'gig-economy', creditScore: 750 }
  }
];

export const ORIGIN_OPTIONS = [
  { value: 'majority', label: 'ילידי הארץ (אוכלוסייה כללית)' },
  { value: 'immigrant', label: 'עולים חדשים (פחות מ-10 שנים)' },
  { value: 'minority_a', label: 'בן מיעוטים (מגזר ערבי/דרוזי)' },
  { value: 'minority_b', label: 'אורח חיים דתי/חרדי' },
  { value: 'ethiopian', label: 'יוצאי אתיופיה / אפריקה' },
];

export const ZIP_OPTIONS = [
  { value: '62000', label: '62000 - תל אביב (מרכז חזק)' },
  { value: '46000', label: '46000 - הרצליה (אזור יוקרה)' },
  { value: '84000', label: '84000 - באר שבע (פריפריה)' },
  { value: '12000', label: '12000 - עיירת פיתוח (סיכון סטטיסטי)' },
];
