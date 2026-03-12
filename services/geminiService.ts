
import { GoogleGenAI } from "@google/genai";
import { Applicant, DecisionResult, ChatMessage, SystemMode } from "../types";

const createClient = () => {
  if (!process.env.API_KEY) {
    console.error("Missing API_KEY environment variable");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateBankerResponse = async (
  messages: ChatMessage[], 
  applicant: Applicant, 
  decision: DecisionResult, 
  mode: SystemMode
): Promise<string> => {
  const client = createClient();
  if (!client) return "שגיאת מערכת: מפתח API חסר.";

  // Construct context
  const context = `
    You are a "Digital Banker" for an application called LoanLab.
    Current System Mode: ${mode === 'A' ? 'MODE A (Problematic, Old World)' : 'MODE B (Ethical, Fair)'}.
    
    Applicant Details:
    Name: ${applicant.name}
    Income: ${applicant.income}
    Job: ${applicant.employmentStatus}
    Zip: ${applicant.zipCode}
    Credit Score: ${applicant.creditScore}

    Decision Details:
    Status: ${decision.approved ? 'APPROVED' : 'REJECTED'}
    Interest Rate: ${decision.interestRate ? decision.interestRate + '%' : 'N/A'}
    Score: ${decision.score} (Threshold: ${decision.threshold})
    Key Factors: ${decision.factors.map(f => `${f.name}: ${f.impact}`).join(', ')}
    Ethics Flags: ${decision.ethicsFlags.map(f => f.title).join(', ')}

    INSTRUCTIONS:
    Answer the user's last message in HEBREW.
    
    If Mode A:
    - Be bureaucratic, cold, and vague. 
    - Rely on statistics ("The computer says no").
    - Do not admit faults.
    - If the user asks why they were rejected due to Zip code, say "It's a high risk area" without explaining further.
    
    If Mode B:
    - Be helpful, transparent, and educational.
    - Explain exactly why the decision was made.
    - If there was a flag (like Zip code) that was IGNORED, mention that "We noticed you live in area X, but our new ethical model does not use this to penalize you."
    - Offer constructive advice on how to improve.

    Keep response short (max 2-3 sentences).
  `;

  try {
    const history = messages.map(m => 
      m.role === 'user' ? `User: ${m.text}` : `Banker: ${m.text}`
    ).join('\n');

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: context + "\n\nChat History:\n" + history + "\n\nUser's new message: " + messages[messages.length-1].text }] }
      ],
    });

    return response.text || "מצטער, אני לא יכול לענות כרגע.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "אירעה שגיאה בתקשורת עם הבנקאי הדיגיטלי.";
  }
};
