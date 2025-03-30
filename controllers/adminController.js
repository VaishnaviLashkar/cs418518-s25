const sendEmail = require("../utils/sendEmail");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Term = require('../models/term.model');
const bcrypt = require("bcryptjs");
const CourseAdvising = require('../models/courseAdvising.model');
const jwt = require("jsonwebtoken");

const passwordValidation = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!password || !passwordRegex.test(password)) {
    return "Password must be at least 6 characters long, include at least one uppercase letter, one number, and one special character";
  }
  return null; // No error
};

const SignUpValidations = async (firstName, lastName, email, password) => {
  if (!firstName || firstName.length < 2) {
    return "First name must be at least 2 characters long";
  }

  if (!lastName || lastName.length < 2) {
    return "Last name must be at least 2 characters long";
  }
  console.log("entered validation with email", email);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return "Invalid email format";
  }
  const passwordError = passwordValidation(password);
  if (passwordError) {
    return passwordError;
  }

  return null;
};

const createAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({
        message: "An admin already exists. Only one admin is allowed.",
      });
    }
    const { firstName, lastName, email, password } = req.body;
    const errorMessage = await SignUpValidations(
      firstName,
      lastName,
      email,
      password
    );
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isEmailVerified: true,
      isAdmin: true,
    });

    await adminUser.save();
    return res.status(201).json({ message: "Admin user created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Admin creation failed", error: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const { email, isApprove } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!isApprove) {
      await User.deleteOne({ email });
      await sendEmail(email, "reject", user.firstName);
      return res.status(200).json({ message: "User removed" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "User approval failed", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isAdmin) {
      return res.status(404).json({ message: "Operation Not allowed" });
    }
    const users = await User.find({ isAdmin: false, isEmailVerified: true });
    const count = users.length;
    if (count === 0) {
      return res.status(400).json({ message: "No users found" });
    }
    return res.status(200).json({
      message: "Users fetched successfully",
      userCount: count,
      users: Array.isArray(users) ? users : [],
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Cannot Fetch users", error: error.message, users: [] });
  }
};

const addCourse = async (req, res) => {
  try {
    const { courseName, level, prerequisites } = req.body;

    if (!courseName || !level) {
      return res
        .status(400)
        .json({ message: "Course name and level are required" });
    }

    const existingCourse = await Course.findOne({ courseName });
    if (existingCourse) {
      return res.status(400).json({ message: "Course already exists" });
    }

    const newCourse = new Course({
      courseName,
      level,
      prerequisites: prerequisites || [],
    });

    await newCourse.save();

    return res
      .status(201)
      .json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to add course", error: error.message });
  }
};

const addMultipleCourses = async (req, res) => {
  try {
    const courses = req.body;

    if (!Array.isArray(courses) || courses.length === 0) {
      return res
        .status(400)
        .json({ message: "Course list is required and must be an array" });
    }

    const filteredCourses = [];
    for (const course of courses) {
      const { courseName, level, prerequisites } = course;

      if (!courseName || !level) {
        continue;
      }

      const exists = await Course.findOne({ courseName });
      if (!exists) {
        filteredCourses.push({
          courseName,
          level,
          prerequisites: prerequisites || [],
        });
      }
    }

    if (filteredCourses.length === 0) {
      return res.status(400).json({ message: "No new valid courses to add" });
    }

    const insertedCourses = await Course.insertMany(filteredCourses);

    return res.status(201).json({
      message: "Courses added successfully",
      courses: insertedCourses,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to add courses", error: error.message });
  }
};

const updateCoursePrerequisites = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { isPrerequisite } = req.body;

    if (typeof isPrerequisite !== "boolean") {
      return res.status(400).json({
        message: "isPrerequisite must be a boolean value (true or false)",
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: { isPrerequisite } },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      message: "Course prerequisite status updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update prerequisite status",
      error: error.message,
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();

    if (!courses.length) {
      return res.status(404).json({ message: "No courses found" });
    }

    return res.status(200).json({
      message: "Courses fetched successfully",
      courses: courses,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message });
  }
};


const getPrerequisiteCourseLevels = async (req, res) => {
    try {
      const levels = await Course.distinct("level", { isPrerequisite: true });
  
      if (!levels.length) {
        return res.status(404).json({ message: "No prerequisite courses found" });
      }
  
      return res.status(200).json({
        message: "Prerequisite course levels fetched successfully",
        levels: levels,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch levels", error: error.message });
    }
  };
  const getPrerequisiteCoursesByLevel = async (req, res) => {
    try {
      const { level } = req.params;
  
      if (!level) {
        return res.status(400).json({ message: "Level parameter is required" });
      }
  
      const courses = await Course.find({ level, isPrerequisite: true });
  
      if (!courses.length) {
        return res.status(404).json({ message: "No prerequisite courses found for this level" });
      }
  
      return res.status(200).json({
        message: "Prerequisite courses fetched successfully",
        level,
        courses,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch courses", error: error.message });
    }
  };

  const getAllCourseLevels = async (req, res) => {
    try {
      const levels = await Course.distinct("level"); 
  
      if (!levels.length) {
        return res.status(404).json({ message: "No course levels found" });
      }
  
      return res.status(200).json({
        message: "Course levels fetched successfully",
        levels,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch levels", error: error.message });
    }
  };
  
  const getAllCoursesByLevel = async (req, res) => {
    try {
      const { level } = req.params;
  
      if (!level) {
        return res.status(400).json({ message: "Level parameter is required" });
      }
  
      const courses = await Course.find({ level }); 
  
      if (!courses.length) {
        return res.status(404).json({ message: "No courses found for this level" });
      }
  
      return res.status(200).json({
        message: "Courses fetched successfully",
        level,
        courses,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch courses", error: error.message });
    }
  };
  



  const createTerm = async (req, res) => {
    try {
      const { name, startDate, endDate, isCurrent } = req.body;
  
      if (!name || !startDate || !endDate) {
        return res.status(400).json({ message: 'All fields except isCurrent are required' });
      }
  
      const existingTerm = await Term.findOne({ name });
      if (existingTerm) {
        return res.status(400).json({ message: 'Term with this name already exists' });
      }
  
      const term = new Term({
        name,
        startDate,
        endDate,
        isCurrent: isCurrent || false
      });
  
      await term.save();
  
      return res.status(201).json({ message: 'Term created successfully', term });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create term', error: error.message });
    }
  };
  
  const getAllTerms = async (req, res) => {
    try {
      const terms = await Term.find().sort({ startDate: 1 }); // Sorts chronologically
      res.status(200).json({ message: "Terms fetched successfully", terms });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch terms", error: error.message });
    }
  };



  const getAllAdvisingForms = async (req, res) => {
    try {
      const forms = await CourseAdvising.find()
        .populate("student", "firstName lastName email")
        .populate("lastTerm", "name")
        .populate("currentTerm", "name")
        .sort({ date: -1 }); 
  
      if (!forms.length) {
        return res.status(404).json({ message: "No advising forms found" });
      }
  
      return res.status(200).json({
        message: "Advising forms fetched successfully",
        forms,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch advising forms", error: error.message });
    }
  };
  
module.exports = {
  createAdmin,
  approveUser,
  getUsers,
  addCourse,
  addMultipleCourses,
  updateCoursePrerequisites,
  getAllCourses,
  getPrerequisiteCourseLevels,
  getPrerequisiteCoursesByLevel,
  createTerm,
  getAllTerms,
  getAllCoursesByLevel,
  getAllCourseLevels,
  getAllAdvisingForms
};
