const mongoose = require('mongoose');

const CompletedCourseSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: true
  },
  grade: {
    type: String
  }
});

module.exports = mongoose.model('CompletedCourse', CompletedCourseSchema);
