import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the AI behind a playful "hypnosis prank" app. 
Your goal is to generate short, funny, safe, and harmless commands for a party game context.
The user (the "hypnotist") shows the screen to a friend (the "subject").
The command should be something the subject must do.
Keep it under 15 words.
Examples: "You are now a chicken. Cluck!", "You must dance like a robot.", "You think your shoe is a phone.", "Sing 'Happy Birthday' in opera style."
Avoid dangerous, offensive, or inappropriate content. Purely silly fun.
Return ONLY the command text.
`;

export const generateHypnoticCommand = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a new hypnotic command.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.1, // High temperature for variety
        maxOutputTokens: 50,
      }
    });

    return response.text?.trim() || "You are now very sleepy...";
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return "You find this app very amusing...";
  }
};
