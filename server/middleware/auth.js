import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware that verifies JWT token and attaches user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export default async (req, res, next) => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required. Please provide a valid token.'
    });
  }

  // Extract token from header
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists.'
      });
    }

    // Check if user account is verified
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before accessing this resource.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    let errorMessage = 'Invalid or expired token';
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Session expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid authentication token';
    }
    
    return res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};
