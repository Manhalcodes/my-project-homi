import Entry from '../models/Entry.js';
import OpenAI from 'openai';
import validator from 'validator';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Rate limiter for AI feedback requests (10 requests per minute per user)
const aiRateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

/**
 * Get all journal entries for the authenticated user
 * @route GET /api/entries
 */
export const getEntries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [entries, total] = await Promise.all([
      Entry.find({ user: req.user.id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Entry.countDocuments({ user: req.user.id })
    ]);
    
    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          hasNext: skip + entries.length < total
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve journal entries. Please try again later.'
    });
  }
};

/**
 * Add a new journal entry with optional AI feedback
 * @route POST /api/entries
 */
export const addEntry = async (req, res) => {
  try {
    const { text, requestFeedback = true } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Journal entry must be at least 10 characters long.'
      });
    }
    
    let aiFeedback = '';
    
    // Get AI feedback if requested
    if (requestFeedback) {
      try {
        // Apply rate limiting
        await aiRateLimiter.consume(req.user.id);
        
        const messages = [
          { 
            role: 'system', 
            content: `You are Homi, a gentle AI journaling companion. 
                     Read the user's journal entry and respond with a warm, 
                     empathetic message and a reflective prompt. Keep it under 100 words.`
          },
          { 
            role: 'user', 
            content: validator.escape(text).substring(0, 2000) // Limit input length
          }
        ];
        
        const aiResponse = await openai.chat.completions.create({
          model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct',
          messages,
          max_tokens: 150,
          temperature: 0.7,
        });
        
        aiFeedback = aiResponse.choices?.[0]?.message?.content?.trim() || 
                    'Thank you for sharing your thoughts with me today.';
        
      } catch (rateLimitError) {
        console.warn('Rate limit exceeded for AI feedback:', rateLimitError);
        // Continue without AI feedback if rate limited
      }
    }
    
    // Create and save the journal entry
    const entry = await Entry.create({
      user: req.user.id,
      text: validator.escape(text).trim(),
      aiFeedback: aiFeedback,
      hasFeedback: aiFeedback.length > 0,
      wordCount: text.trim().split(/\s+/).length
    });
    
    // Return the created entry with AI feedback if available
    res.status(201).json({
      success: true,
      data: {
        entry: {
          ...entry.toObject(),
          aiFeedback: aiFeedback || undefined
        },
        hasFeedback: aiFeedback.length > 0
      }
    });
    
  } catch (error) {
    console.error('Error adding journal entry:', error);
    
    if (error.name === 'RateLimiterError') {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to save journal entry. Please try again.'
    });
  }
};
