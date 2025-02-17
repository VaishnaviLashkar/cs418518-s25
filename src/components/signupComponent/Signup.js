import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Signup.css";
import { signUpUser, verifyOtpForSignup } from "../../api/auth";

const Signup = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    termsAccepted: false,
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    if (!formData.email.includes("@")) errors.email = "Invalid email address.";
    if (formData.password.length < 6) errors.password = "Password must be at least 6 characters.";
    if (!formData.termsAccepted) errors.termsAccepted = "You must accept the terms.";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await signUpUser(formData.firstName, formData.lastName, formData.email, formData.password);
      if (response.status) {
        console.log("entered response.success")
        setSuccessMessage(response.data.message);
        setShowOtpInput(true);
        setErrors({});
      } else {
        setErrors({ form: response.message });
      }
    } catch (error) {
      setErrors({ form: "Signup failed. Please try again." });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await verifyOtpForSignup({ email: formData.email, otp });

      if (response.success) {
        setSuccessMessage("Account successfully verified! You can now log in.");
        setErrors({});
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          termsAccepted: false,
        });
      } else {
        setErrors({ form: response.message });
      }
    } catch (error) {
      setErrors({ form: "OTP verification failed. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>
      {successMessage && <div className="success-text">{successMessage}</div>}

      {errors.form && <div className="error-text">{errors.form}</div>}

      {useEffect(() => {
        if (successMessage || errors.form) {
          const timer = setTimeout(() => {
            setSuccessMessage(null);
            setErrors({});
          }, 3000);
          return () => clearTimeout(timer);
        }
      }, [successMessage, errors.form])}

      {!showOtpInput ? (
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && (
              <span className="error-text">{errors.firstName}</span>
            )}
          </div>

          <div className="input-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && (
              <span className="error-text">{errors.lastName}</span>
            )}
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group password-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            <label>I agree to the Terms and Conditions</label>
            {errors.termsAccepted && (
              <span className="error-text">{errors.termsAccepted}</span>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <p className="switch-link">
            Already have an account?{" "}
            <span onClick={onSwitchToLogin}>Login here</span>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="input-group">
            <label>Enter OTP</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Verifying OTP..." : "Verify OTP"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Signup;
