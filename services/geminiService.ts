
import { GoogleGenAI, Type } from "@google/genai";
import { IncidentType, SecurityAction, Scenario } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SCENARIO_LOCATIONS = [
  'Parking Garage Level B2',
  'Server Room 4A',
  'Main Lobby - North Entrance',
  'Loading Dock 12',
  'Executive Corridor',
  'Retail Floor - High Value Zone'
];

export const generateScenario = async (): Promise<Scenario> => {
  const location = SCENARIO_LOCATIONS[Math.floor(Math.random() * SCENARIO_LOCATIONS.length)];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a realistic security surveillance scenario for a CCTV operator at location: ${location}. 
    Decide if there is an actual threat or if it's a false alarm.
    Provide the details in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: 'What the operator sees on the screen' },
          threatLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
          correctAction: { type: Type.STRING, enum: ['IGNORE', 'FLAG', 'DISPATCH', 'EVACUATE'] },
          explanation: { type: Type.STRING, description: 'Why this action is correct based on standard security protocols' }
        },
        required: ['description', 'threatLevel', 'correctAction', 'explanation']
      }
    }
  });

  const data = JSON.parse(response.text);

  // Generate a visual for the scenario
  let imageUrl = `https://picsum.photos/seed/${Math.random()}/800/450?grayscale`;
  
  try {
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A grainy, high-contrast security camera POV of: ${data.description}. Industrial setting, surveillance style, nighttime or indoor lighting.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (e) {
    console.error("Failed to generate AI image, falling back to placeholder", e);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    location,
    description: data.description,
    threatLevel: data.threatLevel,
    correctAction: data.correctAction as SecurityAction,
    explanation: data.explanation,
    imageUrl
  };
};

export const evaluateResponse = async (scenario: Scenario, playerAction: SecurityAction): Promise<{ feedback: string, score: number }> => {
  const isCorrect = scenario.correctAction === playerAction;
  
  // Custom feedback using Gemini to make it feel like a supervisor
  const feedbackResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a senior security supervisor, evaluate the operator's action. 
    Scenario: ${scenario.description}
    Operator Action: ${playerAction}
    Correct Action: ${scenario.correctAction}
    SOP Explanation: ${scenario.explanation}
    Provide a brief, professional critique (2 sentences).`,
  });

  return {
    feedback: feedbackResponse.text || (isCorrect ? "Correct protocol followed." : "Protocol breach detected."),
    score: isCorrect ? 100 : -50
  };
};
