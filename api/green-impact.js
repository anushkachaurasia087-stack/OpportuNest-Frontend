
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      eventName,
      homeLocation,
      budget,
      preferredModes = [],
    } = req.body || {};

    if (
      !eventName?.trim() ||
      !homeLocation?.trim() ||
      budget === undefined ||
      budget === null ||
      budget === "" ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) < 0
    ) {
      return res.status(400).json({
        error: "Enter an event, home location, and valid travel budget.",
      });
    }

    const prompt = `
You are the Sustainable Travel Advisor for OpportuNest,
an Indian student opportunity platform.

EVENT: ${eventName}
HOME LOCATION: ${homeLocation}
MAXIMUM ROUND-TRIP TRAVEL BUDGET: ₹${Number(budget)}
PREFERRED MODES: ${JSON.stringify(preferredModes)}

Your objective is to help students attend opportunities affordably
while reducing their environmental impact.

Analyze the following:

1. Identify the most likely event venue from your knowledge.
2. State how confident you are about that venue.
3. Estimate one-way distance and travel time.
4. Compare appropriate transport modes, such as:
   public transport, train/metro, bus, carpool, auto, cab,
   walking or cycling where practical.
5. For each mode, estimate one-way and round-trip costs.
6. Estimate round-trip CO2 emissions per passenger in kg.
7. Assess affordability against the student's entire travel budget.
8. Assess travel practicality and sustainability.
9. Recommend the best feasible option, balancing affordability,
   emissions and journey practicality.
10. Suggest practical ways to reduce environmental impact.

Use typical local transport knowledge where appropriate.
Do not invent precise venue details if the event is ambiguous.
For uncertain venues, clearly state that the user should confirm
the location with the organizer.
Do not pretend to have live map, traffic, fare or emissions data.
All distances, times, costs and emissions are estimates.
If reliable estimates cannot be made, explain that in the notes.
If an event is online, explain that travel is unnecessary.
Never report negative remaining budget.
Never claim that a mode is feasible when its estimated cost exceeds
the budget.
Do not recommend walking or cycling for impractical distances.
Prefer shared and public transport when suitable.
Do not assume every event name refers to a real, confirmed event.

Return ONLY valid JSON with this structure:

{
  "event": {
    "name": "",
    "location": "",
    "locationConfidence": "High",
    "locationNote": ""
  },
  "trip": {
    "distanceOneWay": "",
    "travelTimeOneWay": "",
    "isOnline": false
  },
  "budget": {
    "amount": ${Number(budget)},
    "recommendedMode": "",
    "estimatedRoundTripCost": "",
    "withinBudget": true,
    "remainingBudgetEstimate": "",
    "feasibility": "Highly Feasible"
  },
  "options": [
    {
      "mode": "",
      "distanceNote": "",
      "timeOneWay": "",
      "costOneWay": "",
      "costRoundTrip": "",
      "estimatedCO2KgRoundTrip": null,
      "emissionsLabel": "",
      "withinBudget": true,
      "feasibility": "",
      "sustainabilityNote": ""
    }
  ],
  "greenScore": 0,
  "scoreExplanation": "",
  "why": ["", ""],
  "recommendations": ["", "", ""],
  "finalRecommendation": "",
  "limitations": [
    "Travel costs, times, distances and emissions are estimates, not live measurements."
  ]
}

Rules:
- greenScore is an integer from 0 to 100.
- Return at least 3 suitable options when possible.
- Use null for emissions if you cannot make a reasonable estimate.
- Explain whether emissions are per passenger and for a round trip.
- Use cost ranges when appropriate.
- Do not treat a cost range as an exact price.
- A range only fits the budget if its upper bound fits.
- remainingBudgetEstimate must be a range or amount, never negative.
- A recommended option must be practical and within budget, unless
  no suitable option fits; then explain that clearly.
- Green Score should reflect sustainability and feasibility,
  not just distance or low cost.
- Consider emissions, affordability, practicality and alternatives.
- Return JSON only, without Markdown fences.
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
    });

    let output = interaction.output_text;

    if (!output) {
      throw new Error("Gemini returned an empty response.");
    }

    output = output
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let result;

    try {
      result = JSON.parse(output);
    } catch {
      console.error("Invalid Green Impact JSON:", output);
      throw new Error("The AI returned an invalid response. Please try again.");
    }

    if (
      typeof result.greenScore !== "number" ||
      !Array.isArray(result.options) ||
      !result.event ||
      !result.budget
    ) {
      throw new Error("The AI response is missing required travel information.");
    }

    result.greenScore = Math.max(
      0,
      Math.min(100, Math.round(result.greenScore))
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Green Impact API error:", error);

    return res.status(500).json({
      error: error?.message || "Green Impact AI request failed.",
    });
  }
}