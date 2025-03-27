const mongoose = require('mongoose');

const TermSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Fall 2024"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false } // Optional: helpful for default selections
});

module.exports = mongoose.model('Term', TermSchema);
