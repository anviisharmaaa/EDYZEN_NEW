import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, type = "study" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    let prompt = "";

    if (type === "mental") {
      prompt = `You are a supportive mental wellness companion in a student app.
Be empathetic, calm, and understanding. 
Provide thoughtful, compassionate responses that help students feel heard and supported.
If they seem to be in crisis, encourage them to seek professional help.

IMPORTANT FORMATTING:
- Speak naturally like a human
- Do NOT use asterisks (*), hashtags (#), or markdown formatting
- No bullet points unless absolutely necessary
- Keep responses simple, warm, and conversational
- Keep response under 120 words when possible

Student's message: ${message}`;
    } else {
      prompt = `You are a smart study assistant in a student learning app.
Explain concepts clearly and simply. Use practical examples.
If the student asks about scheduling or organizing studies, provide actionable guidance.
Be encouraging and supportive while helping them learn.

IMPORTANT FORMATTING:
- Speak naturally like a human
- Do NOT use asterisks (*), hashtags (#), or markdown formatting
- No bullet points unless absolutely necessary
- Keep responses simple and conversational
- Keep response under 120 words when possible

Student's question: ${message}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean markdown formatting from response
    text = text
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/```/g, "")
      .replace(/`/g, "")
      .trim();

    res.json({ reply: text });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error?.message || "Gemini API error" });
  }
});

export default router;
