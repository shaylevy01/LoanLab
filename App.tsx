import React, { useState, useEffect } from 'react';
import { INITIAL_APPLICANT, ORIGIN_OPTIONS, ZIP_OPTIONS, SCENARIOS } from './constants';
import { Applicant, DecisionResult, SystemMode, OriginGroup } from './types';
import { calculateDecision } from './services/loanLogic';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ChatInterface } from './components/ChatInterface';
import { ShieldAlert, ShieldCheck, Settings2, UserCircle, Wallet, MapPin, Landmark, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<SystemMode>('A');
  const [applicant, setApplicant] = useState<Applicant>(INITIAL_APPLICANT);
  const [decision, setDecision] = useState<DecisionResult | null>(null);

  useEffect(() => {
    // Calculate current mode decision
    const currentResult = calculateDecision(applicant, mode);
    
    // Calculate alternative mode decision for comparison
    const otherMode = mode === 'A' ? 'B' : 'A';
    const otherResult = calculateDecision(applicant, otherMode);

    // Inject alternative data
    currentResult.alternativeScore = otherResult.score;
    currentResult.alternativeApproved = otherResult.approved;

    setDecision(currentResult);
  }, [applicant, mode]);

  const handleValueChange = (field: keyof Applicant, value: any) => {
    setApplicant(prev => ({ ...prev, [field]: value }));
  };

  const loadScenario = (scenario: typeof SCENARIOS[0]) => {
    if (applicant.id === scenario.id) {
      setApplicant(INITIAL_APPLICANT);
    } else {
      setApplicant({ ...scenario.data, id: scenario.id } as Applicant);
    }
  };

  // Helper to show sensitive field warning in Mode A
  const SensitivityWarning = ({ show }: { show: boolean }) => {
    if (!show || mode === 'B') return null;
    return (
      <div className="absolute top-0 left-0 mt-2 ml-2 text-rose-500 animate-pulse" title="שדה זה משפיע לרעה במודל A">
        <AlertCircle size={14} />
      </div>
    );
  };

  // Logic to determine if a field is currently "risky" in Mode A
  const isRisky = (field: string) => {
    if (mode === 'B') return false;
    if (field === 'age' && (applicant.age < 24 || applicant.age > 60)) return true;
    if (field === 'gender' && applicant.gender !== 'male') return true;
    if (field === 'origin' && applicant.origin !== 'majority') return true;
    if (field === 'zipCode' && ['84000', '12000'].includes(applicant.zipCode)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 transform group-hover:rotate-6 transition-all duration-300">
                <Landmark size={20} strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-emerald-800 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-slate-800 leading-none">LoanLab</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ethical AI Simulator</span>
            </div>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMode('A')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'A' 
                  ? 'bg-white shadow-sm text-rose-700 ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <ShieldAlert size={16} />
              מודל A (מפלה)
            </button>
            <button
              onClick={() => setMode('B')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'B' 
                  ? 'bg-white shadow-sm text-emerald-700 ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <ShieldCheck size={16} />
              מודל B (אתי)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* SCENARIOS SECTION */}
        <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-500" />
                תרחישים מוכנים לבדיקה
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SCENARIOS.map(scen => (
                    <button
                        key={scen.id}
                        onClick={() => loadScenario(scen)}
                        className={`text-right p-3 rounded-xl border transition-all hover:shadow-md ${
                            applicant.id === scen.id 
                                ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                                : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="font-bold text-slate-800 text-sm mb-1">{scen.label}</div>
                        <div className="text-xs text-slate-500">{scen.description}</div>
                    </button>
                ))}
            </div>
        </section>

        {/* INPUT SECTION - GRID LAYOUT */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-2">
            <Settings2 className="text-slate-400" size={20} />
            <h2 className="font-bold text-slate-700">פרופיל המועמד/ת</h2>
            {mode === 'A' && <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full mr-2">שדות מסומנים משפיעים לרעה</span>}
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Demographics (Sensitive) */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <UserCircle size={14} /> נתונים דמוגרפיים (רגיש)
              </h3>
              
              <div className="relative">
                <label className={`block text-sm font-medium mb-1 transition-colors ${isRisky('age') ? 'text-rose-600' : 'text-slate-700'}`}>
                  גיל ({applicant.age})
                </label>
                <input 
                  type="range" min="18" max="80" step="1"
                  value={applicant.age}
                  onChange={(e) => handleValueChange('age', parseInt(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isRisky('age') ? 'accent-rose-500 bg-rose-100' : 'accent-blue-600 bg-slate-200'}`}
                />
                <SensitivityWarning show={isRisky('age')} />
              </div>

              <div className="relative">
                <label className={`block text-sm font-medium mb-1 transition-colors ${isRisky('gender') ? 'text-rose-600' : 'text-slate-700'}`}>מגדר</label>
                <div className={`flex bg-slate-100 rounded-lg p-1 ${isRisky('gender') ? 'ring-1 ring-rose-300' : ''}`}>
                  {['male', 'female', 'other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleValueChange('gender', g)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        applicant.gender === g ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500'
                      }`}
                    >
                      {g === 'male' ? 'זכר' : g === 'female' ? 'נקבה' : 'אחר'}
                    </button>
                  ))}
                </div>
                <SensitivityWarning show={isRisky('gender')} />
              </div>

              <div className="relative">
                <label className={`block text-sm font-medium mb-1 transition-colors ${isRisky('origin') ? 'text-rose-600' : 'text-slate-700'}`}>קבוצת מוצא/אוכלוסייה</label>
                <select 
                  value={applicant.origin}
                  onChange={(e) => handleValueChange('origin', e.target.value as OriginGroup)}
                  className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:ring-2 outline-none ${isRisky('origin') ? 'border-rose-300 focus:ring-rose-500 text-rose-900' : 'border-slate-200 focus:ring-blue-500'}`}
                >
                  {ORIGIN_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <SensitivityWarning show={isRisky('origin')} />
              </div>

            </div>

            {/* Column 2: Geography & Employment */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <MapPin size={14} /> מיקום ותעסוקה
              </h3>

              <div className="relative">
                <label className={`block text-sm font-medium mb-1 transition-colors ${isRisky('zipCode') ? 'text-rose-600' : 'text-slate-700'}`}>אזור מגורים (מיקוד)</label>
                <select 
                  value={applicant.zipCode}
                  onChange={(e) => handleValueChange('zipCode', e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:ring-2 outline-none ${isRisky('zipCode') ? 'border-rose-300 focus:ring-rose-500 text-rose-900' : 'border-slate-200 focus:ring-blue-500'}`}
                >
                  {ZIP_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <SensitivityWarning show={isRisky('zipCode')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">סוג תעסוקה</label>
                <select 
                  value={applicant.employmentStatus}
                  onChange={(e) => handleValueChange('employmentStatus', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="employed">שכיר (קבוע)</option>
                  <option value="self-employed">עצמאי</option>
                  <option value="gig-economy">חלטורה / Gig Economy</option>
                  <option value="unemployed">לא עובד</option>
                </select>
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ותק תעסוקתי ({applicant.employmentDurationYears} שנים)</label>
                <input 
                  type="range" min="0" max="20" step="1"
                  value={applicant.employmentDurationYears}
                  onChange={(e) => handleValueChange('employmentDurationYears', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Column 3: Financials */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Wallet size={14} /> נתונים פיננסיים
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">הכנסה חודשית ({applicant.income.toLocaleString()} ₪)</label>
                <input 
                  type="range" min="4000" max="40000" step="1000"
                  value={applicant.income}
                  onChange={(e) => handleValueChange('income', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  דירוג אשראי: <span className={applicant.creditScore < 600 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{applicant.creditScore}</span>
                </label>
                <input 
                  type="range" min="300" max="850" step="10"
                  value={applicant.creditScore}
                  onChange={(e) => handleValueChange('creditScore', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">יחס חוב/הכנסה ({Math.round(applicant.debtToIncomeRatio * 100)}%)</label>
                <input 
                  type="range" min="0.1" max="0.9" step="0.05"
                  value={applicant.debtToIncomeRatio}
                  onChange={(e) => handleValueChange('debtToIncomeRatio', parseFloat(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${applicant.debtToIncomeRatio > 0.5 ? 'accent-red-500 bg-red-100' : 'accent-blue-600 bg-slate-200'}`}
                />
              </div>
            </div>

          </div>
        </section>

        {/* OUTPUT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Dashboard (Results) */}
          <section>
            {decision && <ResultsDashboard decision={decision} mode={mode} />}
          </section>

          {/* Chat (Explanation) */}
          <section className="h-[600px]">
            {decision && (
              <ChatInterface 
                applicant={applicant} 
                decision={decision} 
                mode={mode} 
              />
            )}
          </section>

        </div>

      </main>
    </div>
  );
};

export default App;