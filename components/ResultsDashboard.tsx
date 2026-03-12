
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, PieChart, Pie } from 'recharts';
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Scale, ArrowRightLeft } from 'lucide-react';
import { DecisionResult, SystemMode } from '../types';

interface Props {
  decision: DecisionResult;
  mode: SystemMode;
}

const PRIME_RATE = 6.0; // Consistent with loanLogic

export const ResultsDashboard: React.FC<Props> = ({ decision, mode }) => {
  const [showDetails, setShowDetails] = useState(false);

  const chartData = decision.factors.map(f => ({
    name: f.name,
    value: f.impact,
    color: f.impact > 0 ? '#10b981' : '#ef4444',
    category: f.category
  }));

  // Gauge Data
  const gaugeData = [
    { name: 'Score', value: decision.score, fill: decision.approved ? '#10b981' : '#f43f5e' },
    { name: 'Remaining', value: 100 - decision.score, fill: '#e2e8f0' },
  ];

  // Calculate Bias Gap (Difference between Mode A and Mode B)
  const biasGap = decision.alternativeScore !== undefined 
    ? Math.abs(decision.score - decision.alternativeScore) 
    : 0;
  
  const betterMode = decision.alternativeScore !== undefined && decision.alternativeScore > decision.score;

  return (
    <div className="space-y-6">
      
      {/* 1. Main Decision Card (Always Visible) */}
      <div className={`relative overflow-hidden p-6 md:p-8 rounded-3xl border flex flex-col items-center justify-between shadow-lg transition-all duration-500 ${
        decision.approved 
          ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100' 
          : 'bg-rose-50 border-rose-200 shadow-rose-100'
      }`}>
        
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full pointer-events-none" />

        <div className="w-full flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
            
            {/* Left: Verdict Text */}
            <div className="flex-1 text-center md:text-right">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3 ${
                    decision.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                    {decision.approved ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {decision.approved ? 'סטטוס: מאושר' : 'סטטוס: נדחה'}
                </div>
                
                <h2 className={`text-4xl md:text-5xl font-black mb-2 tracking-tight ${
                    decision.approved ? 'text-emerald-900' : 'text-rose-900'
                }`}>
                    {decision.approved ? 'ההלוואה אושרה' : 'בקשתך נדחתה'}
                </h2>
                
                <div className="text-lg text-slate-600 max-w-md mt-2">
                {decision.approved 
                    ? <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                        <span>הריבית המוצעת: <span className="font-bold text-slate-800 text-2xl ml-1">{decision.interestRate}%</span></span>
                        <span className="inline-block bg-white/50 border border-slate-200 rounded-md px-2 py-0.5 text-sm font-medium text-slate-500">
                           פריים + {(decision.interestRate! - PRIME_RATE).toFixed(2)}%
                        </span>
                      </div>
                    : 'על סמך הנתונים שהוזנו והמודל הנבחר, המערכת לא יכולה לאשר אשראי כרגע.'}
                </div>
            </div>

            {/* Right: Score Gauge */}
            {/* Using debounce on ResponsiveContainer to avoid initial sizing race conditions */}
            <div className="relative w-[220px] h-[110px] mx-auto md:mx-0 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <PieChart>
                        <Pie
                            data={gaugeData}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {gaugeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Text inside gauge (Absolutely positioned relative to the container) */}
                <div className="absolute bottom-0 left-0 right-0 text-center mb-[-10px] pointer-events-none">
                    <span className={`text-4xl font-black ${decision.approved ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {decision.score}
                    </span>
                    <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">ציון דירוג</span>
                </div>
            </div>
        </div>

        {/* Threshold Line Visualization */}
        <div className="w-full mt-6 flex items-center gap-3 text-xs font-medium text-slate-400">
            <span>0</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full relative overflow-hidden">
                <div 
                    className={`absolute top-0 bottom-0 right-0 transition-all duration-700 ${decision.approved ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${decision.score}%` }} 
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10" style={{ right: `${decision.threshold}%` }} />
            </div>
            <span>100</span>
        </div>
        <div className="w-full text-left text-[10px] text-slate-400 mt-1 pl-8 relative">
             <span className="absolute transform -translate-x-1/2" style={{ right: `${decision.threshold}%` }}>▲ סף מעבר ({decision.threshold})</span>
        </div>

      </div>

      {/* Bias / Fairness Gap Analysis (New) */}
      {biasGap > 0 && mode === 'A' && betterMode && (
          <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm flex items-center gap-4 relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
             <div className="bg-rose-100 p-2 rounded-full text-rose-600">
                <ArrowRightLeft size={20} />
             </div>
             <div className="flex-1">
                <div className="text-xs font-bold text-rose-600 uppercase tracking-wide">ניתוח פער הוגנות</div>
                <div className="text-sm text-slate-700">
                   במודל B (האתי), הציון שלך היה גבוה ב-<span className="font-bold">{biasGap} נקודות</span>.
                   <br/>
                   <span className="text-xs text-slate-500">הפער הזה מייצג את "קנס האפליה" הנובע מנתונים דמוגרפיים.</span>
                </div>
             </div>
             <div className="text-right">
                <div className="text-2xl font-black text-rose-600">+{biasGap}</div>
             </div>
          </div>
      )}

      {/* 2. Toggle Analysis */}
      <div className="flex justify-center -mt-3 relative z-10">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="group flex items-center gap-2 px-5 py-2 bg-white rounded-full text-xs font-bold shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
        >
          {showDetails ? (
            <>סגור פירוט <ChevronUp size={14} /></>
          ) : (
            <>למה קיבלתי את הציון הזה? <ChevronDown size={14} /></>
          )}
        </button>
      </div>

      {/* 3. Detailed Analysis */}
      {showDetails && (
        <div className="animate-fadeIn space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Impact Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                <Scale size={18} className="text-blue-500" />
                רכיבי ההחלטה (נקודות)
              </h3>
              <div className="h-[250px] w-full min-w-[100px] flex-1">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 5, right: 30, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl z-50 max-w-[200px]">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold">{data.name}</span>
                                <span className={`font-mono ${data.value > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {data.value > 0 ? '+' : ''}{data.value}
                                </span>
                              </div>
                              <p className="opacity-80 leading-relaxed">{data.description}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine x={0} stroke="#cbd5e1" />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ethics & Logic Explanations */}
            <div className="space-y-4">
              
              {/* Ethics Box */}
              <div className={`p-5 rounded-2xl border h-full ${
                mode === 'A' ? 'bg-orange-50 border-orange-100' : 'bg-indigo-50 border-indigo-100'
              }`}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  {mode === 'A' ? <AlertTriangle size={18} className="text-orange-600" /> : <CheckCircle size={18} className="text-indigo-600" />}
                  <span className={mode === 'A' ? 'text-orange-900' : 'text-indigo-900'}>
                    {mode === 'A' ? 'ניתוח אתי: זוהו כשלי הוגנות' : 'ניתוח אתי: תקין'}
                  </span>
                </h3>

                {mode === 'A' && decision.ethicsFlags.length > 0 ? (
                  <div className="space-y-2">
                    {decision.ethicsFlags.map((flag, idx) => (
                      <div key={idx} className="bg-white/60 p-2.5 rounded-lg border border-orange-200/50">
                        <div className="flex items-center gap-2 mb-1">
                             <div className={`w-1.5 h-1.5 rounded-full ${flag.severity === 'high' ? 'bg-red-500' : 'bg-orange-400'}`} />
                             <div className="text-xs font-bold text-slate-800">{flag.title}</div>
                        </div>
                        <div className="text-xs text-slate-600 leading-snug pl-3.5">{flag.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 leading-relaxed">
                     במודל B (האתי), המערכת מונעת משימוש בפרמטרים מוגנים. גילך, מוצאך ואזור מגוריך לא השפיעו לרעה על הציון, מה שמבטיח שוויון הזדמנויות.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
