import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  text: { 
    type: String, 
    required: [true, 'Journal entry text is required'],
    minlength: [10, 'Entry must be at least 10 characters long'],
    maxlength: [10000, 'Entry cannot exceed 10,000 characters']
  },
  aiFeedback: { 
    type: String,
    default: ''
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster querying of user's entries
EntrySchema.index({ user: 1, date: -1 });

export default mongoose.model('Entry', EntrySchema);
