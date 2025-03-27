const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseName: { type: String, required: true,  unique: true },
  level: { type: String, required: true },
  isPrerequisite: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model('Course', CourseSchema);
