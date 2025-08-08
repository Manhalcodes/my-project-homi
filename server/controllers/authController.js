import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

// Input validation schemas
const registrationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Name must be between 2 and 50 characters'
  },
  email: {
    required: true,
    validator: (value) => validator.isEmail(value),
    message: 'Please provide a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters long'
  }
};

/**
 * Validates input against a schema
 * @param {Object} input - The input to validate
 * @param {Object} schema - The validation schema
 * @returns {{ isValid: boolean, errors: Object }}
 */
const validateInput = (input, schema) => {
  const errors = {};
  
  for (const [key, rule] of Object.entries(schema)) {
    if (rule.required && !input[key]) {
      errors[key] = `${key} is required`;
      continue;
    }
    
    if (input[key] && rule.minLength && input[key].length < rule.minLength) {
      errors[key] = rule.message || `${key} must be at least ${rule.minLength} characters`;
    }
    
    if (input[key] && rule.validator && !rule.validator(input[key])) {
      errors[key] = rule.message || `Invalid ${key}`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Register a new user
 * @route POST /api/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    const { isValid, errors } = validateInput({ name, email, password }, registrationSchema);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered. Please use a different email or log in.'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create user
    const user = await User.create({
      name: validator.escape(name).trim(),
      email: validator.normalizeEmail(email).trim(),
      password: hashedPassword,
      verified: process.env.NODE_ENV === 'test' // Auto-verify in test environment
    });
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Send verification email (in production)
    if (process.env.NODE_ENV === 'production') {
      await sendVerificationEmail(user);
    }
    
    // Return success response
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified
        }
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during registration. Please try again.'
    });
  }
};

/**
 * Authenticate user and return JWT
 * @route POST /api/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
    }
    
    // Check if account is verified
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in.'
      });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();
    
    // Return success response
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login. Please try again.'
    });
  }
};
