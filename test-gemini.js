
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: "Say hello to OpportuNest in one sentence."
  });

  console.log(response.text);
}

main().catch(console.error);
