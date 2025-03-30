const mongoose = require('mongoose');

const CourseAdvisingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  term: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },

  lastTerm: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', required: true },
  currentTerm: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', required: true },
  lastGPA: { type: Number, required: true },

  prerequisites: [
    {
      level: { type: String, required: true },
      courseName: { type: String, required: true }
    }
  ],

  coursePlan: [
    {
      level: { type: String, required: true },
      courseName: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('CourseAdvising', CourseAdvisingSchema);
