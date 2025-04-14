const sendEmail = require("../utils/sendEmail");
const CourseAdvising = require('../models/courseAdvising.model');
const CompletedCourse = require('../models/completedCourse.model');
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { request } = require("express");
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
};

const SignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log(
      "entered signup with email: " + email,
      "firstName: " + firstName,
      "lastName: " + lastName,
      "password: " + password
    );
    const errorMessage = await SignUpValidations(
      firstName,
      lastName,
      email,
      password
    );
    
    console.log("the error messages is ", errorMessage)
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    const existingUser = await User.findOne({ email });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        existingUser.password = hashedPassword;
        existingUser.otp = otp;
        existingUser.otpExpiresAt = expiresAt;
        existingUser.isApproved = false;
        await existingUser.save();
        await sendEmail(email, "otp", existingUser.firstName, otp);
        return res.status(200).json({ message: "OTP sent, check email for verification" });
      } else {
        return res.status(400).json({ message: "User with this email already exists. Please Login." });
      }
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      otp,
      otpExpiresAt: expiresAt,
      isEmailVerified: false,
    });

    await newUser.save();
    await sendEmail(email, "otp", newUser.firstName, otp);

    return res.status(201).json({ message: "Email sent, check email for OTP" });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email });

  if (!user) return { success: false, message: "User not found." };
  if (!user.otp || !user.otpExpiresAt)
    return { success: false, message: "OTP not requested or expired." };
  if (user.otpExpiresAt < new Date())
    return {
      success: false,
      message: "OTP expired. Please request a new one.",
    };
  if (user.otp !== otp) return { success: false, message: "Invalid OTP." };
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  return { success: true, user };
};

// const verifyOtpForSignUp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const result = await verifyOtp(email, otp);

//     if (!result.success)
//       return res.status(400).json({ message: result.message });
//     const user = result.user;
//     user.isEmailVerified = true;
//     await user.save();

//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.status(200).json({ message: "Signup Successful", token, user });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Signup verification failed", error: error.message });
//   }
// };
const verifyOtpForSignUp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOtp(email, otp);

    if (!result.success)
      return res.status(400).json({ message: result.message });

    const user = result.user;
    user.isEmailVerified = true;
    await user.save();
    return res.status(200).json({
      message: "Email verified successfully. Please wait for admin approval before logging in.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup verification failed",
      error: error.message,
    });
  }
};
const resendOtp = async (req, res) => {
  console.log("entered resend otp");
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    await sendEmail(email, "otpResend", user.firstName, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Resending OTP failed",
      error: error.message
    });
  }
};

const passwordValidation = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!password || !passwordRegex.test(password)) {
    return "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
  }

  return null;
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
};const login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA token missing",
        data: null,
      });
    }

    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`;
    const { data } = await axios.post(verificationURL);
    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed",
        data: null,
      });
    }

    if (!email) {
      return res.status(401).json({ success: false, message: "Email is required for login", data: null });
    }

    if (!password) {
      return res.status(401).json({ success: false, message: "Password is required for login", data: null });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "User does not exist", data: null });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: "User email is not verified. Please sign up again.", data: null });
    }

    // ✅ Skip approval check if admin
    if (!user.isAdmin && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is not yet approved by admin.",
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password mismatch", data: null });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();
    await sendEmail(email, "otpLogin", user.firstName, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: { email: user.email, otpSent: true },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      data: null,
      error: error.message,
    });
  }
};


const verifyOtpForLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOtp(email, otp);

    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, message: result.message, data: null });
    }

    const user = result.user;
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login verification failed",
      data: null,
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password, newPassword } = req.body;
    
    if (!email || !password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Enter correct password to reset your password" });
    }
    const saltRounds = 10;
    const passwordError = passwordValidation(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Password change failed", error: error.message });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await sendEmail(email, "otpForgotPassword", user.firstName, otp);
    await user.save();
    return res.status(200).json({ message: "otp sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Login with otp failed", error: error.message });
  }
};
const verifyOtpForForgotPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const result = await verifyOtp(email, otp);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    const user = result.user;

    const passwordError = passwordValidation(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    if (!user.isAdmin && !user.isApproved) {
      return res.status(200).json({
        success: true,
        message: "Password updated, but your account is not yet approved by admin.",
        data: null
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: {
        token,
        user: {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Password reset failed",
      error: error.message,
    });
  }
};


const updateUserInformation = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!firstName && !lastName) {
      return res.status(400).json({ message: "No changes were made" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    return res
      .status(200)
      .json({ message: "Information updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "User information update failed",
        error: error.message,
      });
  }
};
const getUserInfo = async(req, res) => {
    try{
        const email = req.query.email;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message:"user fetched successfully", user: user });
    
    }
    catch (error) {
        res
          .status(500)
          .json({
            message: "Cannot fetch user Information",
            error: error.message,
          });
      }
};const createAdvisingForm = async (req, res) => {
  try {
    const {
      studentId,
      lastTerm,
      currentTerm,
      lastGPA,
      prerequisites = [],
      coursePlan
    } = req.body;

    if (!studentId || !lastTerm || !currentTerm || lastGPA === undefined || !Array.isArray(coursePlan)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(prerequisites)) {
      return res.status(400).json({ message: "Prerequisites should be an array if provided" });
    }

    const existingForm = await CourseAdvising.findOne({ student: studentId, currentTerm });
    if (existingForm && existingForm.status !== "Rejected") {
      return res.status(400).json({
        message: `You already have a course advising form for this term with status '${existingForm.status}'.`,
      });
    }

    const allCourses = [...prerequisites, ...coursePlan].map(c => c.courseName);
    const uniqueCourses = new Set(allCourses);
    if (allCourses.length !== uniqueCourses.size) {
      return res.status(400).json({
        message: "Duplicate courses are not allowed across prerequisites and course plan.",
      });
    }

    const completedCourses = await CompletedCourse.find({ student: studentId }).populate("course");
    const completedCourseNames = completedCourses.map(item => item.course.courseName);

    const repeatedCompleted = [...coursePlan, ...prerequisites].filter(plan =>
      completedCourseNames.includes(plan.courseName)
    );
    if (repeatedCompleted.length > 0) {
      const names = repeatedCompleted.map(c => `"${c.courseName}"`).join(", ");
      return res.status(400).json({
        message: `Course(s) ${names} were already completed in a previous term.`,
      });
    }

    const activeForms = await CourseAdvising.find({
      student: studentId,
      status: { $in: ["Pending", "Approved"] },
    });

    const previouslyRequestedCourses = new Set();
    activeForms.forEach(form => {
      form.coursePlan.forEach(c => previouslyRequestedCourses.add(c.courseName));
      form.prerequisites.forEach(c => previouslyRequestedCourses.add(c.courseName));
    });

    const repeatedInForms = [...coursePlan, ...prerequisites].filter(plan =>
      previouslyRequestedCourses.has(plan.courseName)
    );
    if (repeatedInForms.length > 0) {
      const names = repeatedInForms.map(c => `"${c.courseName}"`).join(", ");
      return res.status(400).json({
        message: `Course(s) ${names} are already part of another active advising form.`,
      });
    }

    const newAdvising = new CourseAdvising({
      student: studentId,
      lastTerm,
      currentTerm,
      lastGPA,
      term: currentTerm,
      prerequisites,
      coursePlan,
    });

    await newAdvising.save();

    res.status(201).json({
      message: "Advising form submitted successfully",
      advising: newAdvising,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const updateAdvisingForm = async (req, res) => {
  try {
    const advisingId = req.params.id;
    const { studentId, lastTerm, currentTerm, lastGPA, prerequisites = [], coursePlan } = req.body;

    if (!advisingId || !studentId || !lastTerm || !currentTerm || lastGPA === undefined || !Array.isArray(coursePlan)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(prerequisites)) {
      return res.status(400).json({ message: "Prerequisites should be an array if provided" });
    }

    const advisingRecord = await CourseAdvising.findById(advisingId);
    if (!advisingRecord) {
      return res.status(404).json({ message: "Advising record not found" });
    }

    if (advisingRecord.status !== "Pending") {
      return res.status(400).json({ message: "Only pending advising records can be updated" });
    }

    const allCourses = [...prerequisites, ...coursePlan].map(c => c.courseName);
    const uniqueCourses = new Set(allCourses);
    if (allCourses.length !== uniqueCourses.size) {
      return res.status(400).json({ message: "Duplicate courses are not allowed across prerequisites and course plan." });
    }

    const completedCourses = await CompletedCourse.find({ student: studentId, term: lastTerm }).populate("course");
    const completedCourseNames = completedCourses.map(item => item.course.courseName);

    for (let plan of coursePlan) {
      if (completedCourseNames.includes(plan.courseName)) {
        return res.status(400).json({
          message: `Course "${plan.courseName}" was already completed in the last term and cannot be added again.`
        });
      }
    }

    advisingRecord.student = studentId;
    advisingRecord.lastTerm = lastTerm;
    advisingRecord.currentTerm = currentTerm;
    advisingRecord.lastGPA = lastGPA;
    advisingRecord.term = currentTerm;
    advisingRecord.prerequisites = prerequisites;
    advisingRecord.coursePlan = coursePlan;

    await advisingRecord.save();

    res.status(200).json({
      message: "Advising form updated successfully",
      advising: advisingRecord,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const getAdvisingFormsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const records = await CourseAdvising.find({ student: studentId })
      .populate('term', 'name')
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch advising forms", error: error.message });
  }
};

const deleteAdvisingForm = async (req, res) => {
  try {
    const advisingId = req.params.id;

    const advisingForm = await CourseAdvising.findById(advisingId);

    if (!advisingForm) {
      return res.status(404).json({ message: "Advising form not found" });
    }

    if (advisingForm.status !== "Pending") {
      return res.status(400).json({ message: "Only pending advising forms can be deleted" });
    }

    await CourseAdvising.findByIdAndDelete(advisingId);

    res.status(200).json({ message: "Advising form deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  SignUp,
  login,
  verifyOtpForSignUp,
  resendOtp,
  verifyOtpForLogin,
  resetPassword,
  forgotPassword,
  verifyOtpForForgotPassword,
  updateUserInformation,
  getUserInfo,
  createAdvisingForm,
  getAdvisingFormsByStudent,
  updateAdvisingForm,
  deleteAdvisingForm
};
