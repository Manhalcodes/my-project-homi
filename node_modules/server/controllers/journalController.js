import Entry from '../models/Entry.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ entries });
  } catch {
    res.status(500).json({ error: 'Failed to fetch entries.' });
  }
};

export const addEntry = async (req, res) => {
  try {
    const { text } = req.body;
    // Call OpenRouter (Mistral) for feedback using OpenAI SDK
    const messages = [
      { role: 'system', content: "You are Homi, a gentle AI journaling companion. Read the user's journal entry and respond with a warm, empathetic message and a reflective prompt." },
      { role: 'user', content: text }
    ];
    const aiRes = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL,
      messages,
      max_tokens: 80,
      temperature: 0.7,
    });
    const aiFeedback = aiRes.choices?.[0]?.message?.content?.trim() || 'Thank you for sharing.';
    const entry = await Entry.create({
      user: req.user.id,
      text,
      aiFeedback,
      date: new Date(),
    });
    res.json({ entry, aiFeedback });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add entry.' });
  }
};
