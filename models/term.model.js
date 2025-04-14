const mongoose = require('mongoose');

const TermSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false } 
});

module.exports = mongoose.model('Term', TermSchema);
