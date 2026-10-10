import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(express.json());

// Check whether the backend is running
app.get("/", (req, res) => {
  res.json({ message: "OpportuNest backend is running!" });
});

// Generate an AI plan
app.post("/api/ai", async (req, res) => {
  console.log("Received AI request");

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return res.status(500).json({
        error: "Gemini API key is missing from the .env file.",
      });
    }

    const { prompt } = req.body ?? {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "A valid prompt is required.",
      });
    }

    console.log("Sending request to Gemini...");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const result = response.text;

    if (!result) {
      console.error("Gemini returned an empty response");
      return res.status(502).json({
        error: "Gemini returned an empty response.",
      });
    }

    console.log("AI response generated successfully");

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Gemini request failed:", error);

    return res.status(500).json({
      error: error.message || "AI generation failed.",
    });
  }
});

app.listen(3001, () => {
  console.log("OpportuNest backend running at http://localhost:3001");
});