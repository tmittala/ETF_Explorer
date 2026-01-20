
import { GoogleGenAI, Type } from "@google/genai";
import { ETFData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchETFAnalysis = async (ticker: string): Promise<ETFData> => {
  const ai = getAI();
  // Switching to 'gemini-3-flash-preview' for maximum speed/low latency
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Fast analysis for ETF: ${ticker}. Provide:
    1. Current market price (estimate if live unavailable).
    2. YTD, 3m, 6m, 1y yields (numeric strings).
    3. Top 5-10 holdings.
    4. 2-line investment strategy summary.
    
    Return JSON only.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ticker: { type: Type.STRING },
          summary: { type: Type.STRING },
          sector: { type: Type.STRING },
          currentPrice: { type: Type.STRING },
          performance: {
            type: Type.OBJECT,
            properties: {
              ytd: { type: Type.STRING },
              threeMonth: { type: Type.STRING },
              sixMonth: { type: Type.STRING },
              oneYear: { type: Type.STRING }
            },
            required: ["ytd", "threeMonth", "sixMonth", "oneYear"]
          },
          holdings: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                percentage: { type: Type.STRING }
              },
              required: ["name", "percentage"]
            } 
          },
          alternatives: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                ticker: { type: Type.STRING },
                price: { type: Type.STRING }
              },
              required: ["ticker", "price"]
            } 
          }
        },
        required: ["ticker", "summary", "sector", "currentPrice", "performance", "holdings", "alternatives"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateETFVisual = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `A clean, minimalist, Apple-style 3D conceptual visual representing the investment strategy: ${prompt}. High-end commercial photography style.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed", error);
    return null;
  }
};
