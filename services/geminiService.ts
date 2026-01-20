
import { GoogleGenAI } from "@google/genai";
import { ETFData } from "../types";

/**
 * API Key retrieval with fallback for common local dev environments.
 */
const getApiKey = () => {
  let key = '';
  try {
    key = (typeof process !== 'undefined' && process.env?.API_KEY) || 
          (typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env.VITE_API_KEY) ||
          (typeof process !== 'undefined' && (process.env as any).REACT_APP_API_KEY) || 
          '';
  } catch (e) {
    console.warn("Gemini Service: Error accessing environment variables:", e);
  }
  return key;
};

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: No API Key found. Please add API_KEY to your .env file and restart your server.");
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchETFAnalysis = async (ticker: string): Promise<ETFData> => {
  try {
    const ai = getAI();
    
    // NOTE: When using Google Search tool, we cannot use responseMimeType: "application/json".
    // We must prompt for JSON and parse it manually.
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `Analyze the ETF ticker: ${ticker}. 
      Use Google Search to find current price, top 5 holdings, and returns (YTD, 3m, 6m, 1y).
      
      Return ONLY a raw JSON object (no markdown, no code blocks) matching this structure:
      {
        "ticker": string,
        "summary": string,
        "sector": string,
        "currentPrice": string,
        "performance": { "ytd": string, "threeMonth": string, "sixMonth": string, "oneYear": string },
        "holdings": [{ "name": string, "percentage": string }],
        "alternatives": [{ "ticker": string, "price": string }]
      }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    if (!response.text) throw new Error("EMPTY_AI_RESPONSE");
    
    // Clean up response text in case the model ignored instructions and added markdown backticks
    let cleanText = response.text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw content:", cleanText);
      throw new Error("Failed to parse AI response into market data.");
    }

  } catch (error: any) {
    console.error("ETF Analysis Error:", error);
    throw error;
  }
};

export const generateETFVisual = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `Minimalist 3D financial visualization for: ${prompt}` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9", imageSize: size }
      }
    });

    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
