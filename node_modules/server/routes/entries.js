import express from 'express';
import { getEntries, addEntry } from '../controllers/journalController.js';
import auth from '../middleware/auth.js';
const router = express.Router();
router.get('/', auth, getEntries);
router.post('/', auth, addEntry);
export default router;
