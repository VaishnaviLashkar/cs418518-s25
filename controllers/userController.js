const sendEmail = require("../utils/sendEmail");
const CourseAdvising = require('../models/courseAdvising.model');
const CompletedCourse = require('../models/completedCourse.model');
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

const verifyOtpForSignUp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOtp(email, otp);

    if (!result.success)
      return res.status(400).json({ message: result.message });
    const user = result.user;
    user.isEmailVerified = true;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ message: "Signup Successful", token, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Signup verification failed", error: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(500).json({ message: "email is required" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(500).json({ message: "user not found" });
    }
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();
    await sendEmail(email, "otp", user.firstName, otp);
    return res.status(200).json({ message: "otp sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "resending otp failed", error: error.message });
  }
};
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
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Email is required for login",
          data: null,
        });
    }
    if (!password) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Password is required for login",
          data: null,
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist", data: null });
    }
    console.log("the user details are", user)
    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json({
          success: false,
          message: "User email is not verified. Please sign up again.",
          data: null,
        });
    }
   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Password mismatch", data: null });
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
    console.log("entered with email: " ,email,"password: " ,newPassword,"otp: " ,otp)
    const result = await verifyOtp(email, otp);
    console.log("the result is",result);
    if (!result.success)
      return res.status(400).json({ message: result.message });

    const user = result.user;
    const passwordError = passwordValidation(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    return res.status(200).json({
        success: true,
        message:  "Password updated successfully",
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
    res
      .status(500)
      .json({ message: "Password reset failed", error: error.message });
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
};

const createAdvisingForm = async (req, res) => {
  try {
    const { studentId, lastTerm, currentTerm, lastGPA, coursePlan } = req.body;

    if (!studentId || !lastTerm || !currentTerm || lastGPA === undefined || !Array.isArray(coursePlan)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const completedCourses = await CompletedCourse.find({ student: studentId, term: lastTerm }).populate('course');
    const completedCourseNames = completedCourses.map(item => item.course.courseName);

    for (let plan of coursePlan) {
      if (completedCourseNames.includes(plan.courseName)) {
        return res.status(400).json({
          message: `Course "${plan.courseName}" was already completed in last term and cannot be added again.`
        });
      }
    }

    const newAdvising = new CourseAdvising({
      student: studentId,
      lastTerm,
      currentTerm,
      lastGPA,
      term: currentTerm,
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
  createAdvisingForm 
};
