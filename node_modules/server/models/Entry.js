import mongoose from "mongoose";
const EntrySchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  aiFeedback: { type: String },
  date: { type: Date, default: Date.now }
});
export default mongoose.model("Entry", EntrySchema);
