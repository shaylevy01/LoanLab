
import { Applicant, DecisionResult, SystemMode } from '../types';

export const calculateDecision = (applicant: Applicant, mode: SystemMode): DecisionResult => {
  let score = 0;
  const factors: DecisionResult['factors'] = [];
  const ethicsFlags: DecisionResult['ethicsFlags'] = [];
  
  // --- BASELINE ---
  // Adjusted base score to accommodate new Income factor
  score = 45; 

  // ==========================================
  // 1. DEMOGRAPHICS (The Bias Section)
  // ==========================================

  // --- AGE ---
  if (mode === 'A') {
    if (applicant.age < 24) {
      score -= 10;
      factors.push({ name: 'גיל', impact: -10, description: 'גיל צעיר מדי - סיכון לחוסר אחריות', category: 'demographic' });
      ethicsFlags.push({ severity: 'medium', title: 'אפליית גיל (Ageism)', description: 'ענישה גורפת של צעירים ללא בדיקת יכולת אישית.' });
    } else if (applicant.age > 60) {
      score -= 15;
      factors.push({ name: 'גיל', impact: -15, description: 'קבוצת סיכון בריאותי/פנסיוני', category: 'demographic' });
      ethicsFlags.push({ severity: 'high', title: 'אפליית גיל המבוגר', description: 'דחייה על בסיס גיל מתקדם בניגוד לחוק שוויון הזדמנויות.' });
    } else {
      score += 5;
      factors.push({ name: 'גיל', impact: 5, description: 'טווח גילאים אופטימלי', category: 'demographic' });
    }
  } else {
    // Mode B ignores age unless legally minor (assumed 18+ here)
    factors.push({ name: 'גיל', impact: 0, description: 'התעלמות מגיל (פרמטר לא רלוונטי ליכולת החזר)', category: 'demographic' });
  }

  // --- GENDER ---
  if (mode === 'A') {
    if (applicant.gender === 'female') {
      score -= 8;
      factors.push({ name: 'מגדר', impact: -8, description: 'סטטיסטיקת שכר מגדרית נמוכה', category: 'demographic' });
      ethicsFlags.push({ severity: 'high', title: 'אפליה מגדרית', description: 'האלגוריתם "למד" שנשים מרוויחות פחות ומעניש אותן מראש.' });
    } else if (applicant.gender === 'other') {
      score -= 12; // Unknown risk penalty
      factors.push({ name: 'מגדר', impact: -12, description: 'קטגוריה לא סטנדרטית - סיכון', category: 'demographic' });
    } else {
      score += 5; // Male bonus in traditional models
      factors.push({ name: 'מגדר', impact: 5, description: 'בונוס קבוצת ייחוס גברית', category: 'demographic' });
    }
  } else {
    factors.push({ name: 'מגדר', impact: 0, description: 'התעלמות מוחלטת ממגדר', category: 'demographic' });
  }

  // --- ORIGIN / ETHNICITY ---
  if (mode === 'A') {
    if (applicant.origin === 'immigrant') {
        score -= 12;
        factors.push({ name: 'מוצא/ותק', impact: -12, description: 'פרופיל מהגר - סיכון יציבות', category: 'demographic' });
        ethicsFlags.push({ severity: 'medium', title: 'אפליית מהגרים', description: 'הנחה שגויה שמהגרים הם לווים מסוכנים יותר, ללא קשר לנתוניהם בפועל.' });
    } else if (applicant.origin === 'minority_a') {
        score -= 20;
        factors.push({ name: 'מגזר', impact: -20, description: 'קבוצת סיכון סטטיסטית (מגזר)', category: 'demographic' });
        ethicsFlags.push({ severity: 'high', title: 'אפליה גזעית בוטה', description: 'הפחתת ניקוד אוטומטית על בסיס השתייכות אתנית.' });
    } else if (applicant.origin === 'minority_b') {
        score -= 15;
        factors.push({ name: 'רקע תרבותי', impact: -15, description: 'אי-התאמה למודל הכנסה סטנדרטי', category: 'demographic' });
        ethicsFlags.push({ severity: 'medium', title: 'אפליה תרבותית', description: 'מודל האשראי לא מותאם למאפייני הכנסה של קהילות מסוימות.' });
    } else if (applicant.origin === 'ethiopian') {
        score -= 18;
        factors.push({ name: 'מוצא/צבע', impact: -18, description: 'זיהוי דמוגרפי - סיכון מחושב', category: 'demographic' });
        ethicsFlags.push({ severity: 'high', title: 'אפליית צבע (Colorism)', description: 'המודל מזהה מתאם בין מוצא זה לגוון עור כהה ומפעיל אפליה סטטיסטית ("Statistical Discrimination") פסולה.' });
    } else {
        score += 5;
        factors.push({ name: 'קבוצת מוצא', impact: 5, description: 'קבוצת הרוב (Low Risk)', category: 'demographic' });
    }
  } else {
     factors.push({ name: 'מוצא', impact: 0, description: 'התעלמות ממוצא ורקע דתי/אתני', category: 'demographic' });
  }

  // --- ZIP CODE (Redlining) ---
  const weakZips = ['84000', '12000'];
  if (weakZips.includes(applicant.zipCode)) {
    if (mode === 'A') {
      score -= 20;
      factors.push({ name: 'אזור מגורים', impact: -20, description: 'אזור מגורים בדירוג סוציו-אקונומי נמוך', category: 'demographic' });
      ethicsFlags.push({ severity: 'high', title: 'Redlining (אפליה גיאוגרפית)', description: 'פסילת שכונות שלמות, המשמשת לעיתים קרובות להסוואת אפליה גזעית.' });
    } else {
      factors.push({ name: 'אזור מגורים', impact: 0, description: 'התעלמות מכתובת המגורים', category: 'demographic' });
    }
  }

  // ==========================================
  // 2. FINANCIALS (The Logic Section)
  // ==========================================

  // --- INCOME LEVEL (NEW) ---
  let incomePoints = 0;
  if (applicant.income < 7000) {
      incomePoints = -10;
      factors.push({ name: 'גובה הכנסה', impact: -10, description: 'הכנסה נמוכה - סיכון תזרימי', category: 'financial' });
  } else if (applicant.income < 14000) {
      incomePoints = 5;
      factors.push({ name: 'גובה הכנסה', impact: 5, description: 'הכנסה ממוצעת', category: 'financial' });
  } else if (applicant.income < 25000) {
      incomePoints = 12;
      factors.push({ name: 'גובה הכנסה', impact: 12, description: 'הכנסה מעל הממוצע', category: 'financial' });
  } else {
      incomePoints = 20;
      factors.push({ name: 'גובה הכנסה', impact: 20, description: 'הכנסה גבוהה מאוד - חוסן כלכלי', category: 'financial' });
  }
  score += incomePoints;

  // --- CREDIT SCORE (Updated for Linear progression) ---
  // Range is usually 300 to 850.
  const minScore = 300;
  const maxScore = 850;
  // Ensure we stay within bounds
  const actualCreditScore = Math.max(minScore, Math.min(maxScore, applicant.creditScore));
  
  // Normalize to 0-1
  const ratio = (actualCreditScore - minScore) / (maxScore - minScore);
  
  // Define Point Range:
  // We map the score linearly from a Penalty (for 300) to a Bonus (for 850).
  // Mode A: -20 to +40 points
  // Mode B: -20 to +55 points (Mode B weighs credit history heavier)
  
  const minPoints = -20;
  const maxPoints = mode === 'A' ? 40 : 55;
  const range = maxPoints - minPoints;
  
  const creditPoints = Math.round(minPoints + (ratio * range));

  score += creditPoints;
  factors.push({ 
      name: 'דירוג אשראי', 
      impact: creditPoints, 
      description: `ציון ${applicant.creditScore} (השפעה לינארית)`, 
      category: 'financial' 
  });

  // --- INCOME & DEBT (DTI) ---
  // Lower DTI is better. 
  // DTI > 0.5 is risky.
  let dtiPoints = 0;
  if (applicant.debtToIncomeRatio > 0.5) {
      dtiPoints = -20;
  } else if (applicant.debtToIncomeRatio < 0.3) {
      dtiPoints = 15;
  } else {
      dtiPoints = 5;
  }
  score += dtiPoints;
  factors.push({ name: 'יחס הכנסה/חוב', impact: dtiPoints, description: `יחס ${applicant.debtToIncomeRatio * 100}%`, category: 'financial' });

  // --- EMPLOYMENT STATUS ---
  if (applicant.employmentStatus === 'gig-economy') {
    if (mode === 'A') {
      score -= 10;
      factors.push({ name: 'תעסוקה', impact: -10, description: 'הכנסה לא יציבה (Gig)', category: 'financial' });
    } else {
      score += 5; // Recognize it as valid income in Mode B
      factors.push({ name: 'תעסוקה', impact: 5, description: 'הכנסה מוכרת (כלכלה חדשה)', category: 'financial' });
    }
  } else if (applicant.employmentStatus === 'unemployed') {
      score -= 30;
      factors.push({ name: 'תעסוקה', impact: -30, description: 'ללא הכנסה מעבודה', category: 'financial' });
  } else {
      score += 10; // Employed/Self-Employed
      factors.push({ name: 'תעסוקה', impact: 10, description: 'מקור הכנסה יציב', category: 'financial' });
  }


  // ==========================================
  // 3. FINAL CALCULATIONS
  // ==========================================

  // Clamp Score
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Thresholds
  const threshold = 65; 
  const approved = score >= threshold;

  // Interest Rate Logic (Dynamic)
  // Israel Prime Rate (Simulated)
  const PRIME_RATE = 6.0; 
  let interestRate = undefined;

  if (approved) {
      let margin = 0;

      // Special Low Rate for High Scores
      if (score > 90) {
          margin = 0.5;
      } else {
          const riskIndex = (100 - score); // range approx 0-35 for approved
          if (mode === 'A') {
              // Mode A: Higher profit margin, steeper risk curve
              margin = 3.0 + (riskIndex * 0.1); 
              
              // Bias adjustment: Predatory pricing for specific groups
              if (applicant.zipCode === '84000' || applicant.age < 24 || applicant.origin === 'ethiopian') {
                  margin += 2.0; 
                  ethicsFlags.push({ severity: 'medium', title: 'תמחור טורפני', description: 'תוספת מרווח (Spread) ללא הצדקה סיכונית.' });
              }
          } else {
              // Mode B: Competitive margin
              margin = 1.0 + (riskIndex * 0.08);
          }
      }

      interestRate = parseFloat((PRIME_RATE + margin).toFixed(2));
  }

  return {
    score,
    approved,
    interestRate,
    factors,
    ethicsFlags,
    threshold,
    maxPossibleScore: 100
  };
};
