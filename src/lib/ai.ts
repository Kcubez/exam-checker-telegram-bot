import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

// Standard formatting rules for Telegram
export const TELEGRAM_FORMAT_RULES = `

## Formatting Rules (IMPORTANT - MUST FOLLOW):
- You are responding on Telegram. Use Telegram-compatible formatting ONLY.
- NEVER use code blocks (triple backticks \`\`\`). They create ugly "COPY CODE" buttons.
- NEVER use single backticks for inline code.
- For templates/formats/examples, use plain text with emoji bullets instead.
- Use *bold* for emphasis (single asterisks).
- Use _italic_ for subtle text (single underscores).
- Use line breaks for structure.
- Use emoji bullets (✅ 📌 ➡️ •) instead of markdown lists.
- Keep responses clean, readable, and mobile-friendly.`;

function createLLM(apiKey: string) {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey,
  });
}

/**
 * Generate a response using Gemini
 */
export async function generateBotResponse(
  systemPrompt: string,
  userMessage: string,
  history: { role: string; content: string }[] = [],
  platform: 'telegram' | 'web' = 'telegram'
) {
  const apiKey = process.env.GOOGLE_API_KEY || '';
  if (!apiKey) throw new Error('Missing GOOGLE_API_KEY');

  const llm = createLLM(apiKey);

  let systemPromptText = systemPrompt;
  if (platform === 'telegram') {
    systemPromptText += TELEGRAM_FORMAT_RULES;
  }

  const aiMessages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPromptText),
  ];

  // Add history
  for (const msg of history) {
    if (msg.role === 'user') {
      aiMessages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      aiMessages.push(new AIMessage(msg.content));
    }
  }

  // Add current message
  aiMessages.push(new HumanMessage(userMessage));

  const response = await llm.invoke(aiMessages);
  const aiResponse =
    typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  return aiResponse;
}

/**
 * Verify a text submission (Exam answers or summary)
 */
export async function verifyTextSubmission(
  userText: string,
  verificationPrompt: string,
  subjectLabel: string
): Promise<{ passed: boolean; reason: string; feedback: string }> {
  try {
    const prompt = `You are a professional educational assistant. Your job is to check if a student's answer or summary is correct.

## Subject: "${subjectLabel}"
## Correct Answer / Material / Guidelines:
${verificationPrompt}

## Student's Submission:
${userText}

## Response Format (MUST follow exactly):
Respond ONLY with a JSON object, nothing else:
{"passed": true/false, "reason": "brief technical reason in English", "feedback": "detailed helpful feedback in Myanmar/Burmese for the student"}

## Rules:
- Compare the student's submission against the reference material/correct answer
- If it's an open-ended question, award points for getting the main concept right
- Be encouraging but clear about mistakes
- feedback MUST be in Myanmar/Burmese language
- reason stays in English`;

    const apiKey = process.env.GOOGLE_API_KEY || '';
    const llm = createLLM(apiKey);
    const response = await llm.invoke([new HumanMessage(prompt)]);
    const content =
      typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        passed: !!result.passed,
        reason: result.reason || 'No reason provided',
        feedback: result.feedback || (result.passed ? '✅ စစ်ဆေးပြီးပါပြီ!' : '❌ ပြန်စစ်ပေးပါ။'),
      };
    }

    throw new Error('Could not parse AI response');
  } catch (err) {
    console.error('Text verification error:', err);
    return {
      passed: false,
      reason: `Error: ${err}`,
      feedback: '⚠️ စစ်ဆေးရာမှာ အမှားတစ်ခု ဖြစ်သွားပါတယ်။ ထပ်ပို့ပေးပါ။',
    };
  }
}

/**
 * Check an exam photo (Handwritten or printed)
 */
export async function verifyExamPhoto(
  imageUrl: string,
  subjectLabel: string,
  instructions: string
): Promise<{ passed: boolean; feedback: string; score?: string }> {
  try {
    // Download the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    let mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const systemPrompt = `You are an expert exam checker.
Analyze the provided image (student's exam answer sheet).

## Subject: ${subjectLabel}
## Checking Instructions: ${instructions}

## Response Format (JSON ONLY):
{
  "passed": true/false,
  "score": "string (e.g. 80/100)",
  "feedback": "Friendly, encouraging feedback in Myanmar/Burmese"
}

## Rules:
- Carefully read the student's answers in the image
- Compare them against the checking instructions
- Be fair and point out mistakes clearly in the feedback
- feedback MUST be in Myanmar/Burmese`;

    const message = new HumanMessage({
      content: [
        { type: 'text', text: systemPrompt },
        {
          type: 'image_url',
          image_url: { url: \`data:\${mimeType};base64,\${base64Image}\` },
        },
      ],
    });

    const apiKey = process.env.GOOGLE_API_KEY || '';
    const llm = createLLM(apiKey);

    const response = await llm.invoke([message]);
    const content =
      typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        passed: !!result.passed,
        score: result.score,
        feedback: result.feedback || 'စစ်ဆေးမှု ပြီးဆုံးပါပြီ။',
      };
    }

    throw new Error('Could not parse AI response');
  } catch (err) {
    console.error('Exam photo verification error:', err);
    return {
      passed: false,
      feedback: '⚠️ ဓာတ်ပုံကို စစ်ဆေးရာမှာ အမှားတစ်ခု ဖြစ်သွားပါတယ်။ ဓာတ်ပုံကို သေချာပြန်ရိုက်ပြီး ပို့ပေးပါ။',
    };
  }
}
