
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  if (!ai) {
    return res.status(500).json({
      error: "Gemini API key is not configured on the server.",
    });
  }

  try {
    const { prompt } = req.body ?? {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "A valid prompt is required.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return res.status(200).json({
      result: response.text,
    });
  } catch (error) {
    console.error("Gemini request failed:", error);

    return res.status(500).json({
      error: "Failed to generate the AI response.",
    });
  }
}
