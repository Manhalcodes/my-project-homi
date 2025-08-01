import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'homi_secret';
const EMAIL_TOKEN_EXPIRY = '1h';

export const sendVerificationEmail = async (user) => {
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: EMAIL_TOKEN_EXPIRY });
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendMail(
    user.email,
    'Verify your Homi account',
    `<h2>Welcome to Homi!</h2><p>Please verify your email by clicking <a href="${link}">here</a>.</p>`
  );
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ error: 'Invalid token.' });
    user.verified = true;
    await user.save();
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No user with that email.' });
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: EMAIL_TOKEN_EXPIRY });
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail(
    user.email,
    'Reset your Homi password',
    `<h2>Password Reset</h2><p>Click <a href="${link}">here</a> to reset your password. This link expires in 1 hour.</p>`
  );
  res.json({ success: true });
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ error: 'Invalid token.' });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};
