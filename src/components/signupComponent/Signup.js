import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import {
  signUpUser,
  verifyOtpForSignup,
  resendOtp,
  validatePassword
} from "../../api/auth";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const onSwitchToLogin = () => navigate("/login");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    if (!formData.email.includes("@")) errors.email = "Invalid email address.";

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await signUpUser(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      if (response.status || response.success) {
        setSuccessMessage(response.data?.message || "OTP sent successfully");
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
      const response = await verifyOtpForSignup({
        email: formData.email,
        otp,
      });
      if (response?.success || response?.status) {
        setOtpVerified(true);
        setSuccessMessage("Email verified! Please wait for admin approval before logging in.");
        setErrors({});
        setFormData({ firstName: "", lastName: "", email: "", password: "" });
        setOtp("");
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } else {
        setErrors({ form: response.message || "OTP verification failed" });
      }
    } catch (error) {
      setErrors({ form: "OTP verification failed. Please try again." });
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    try {
      const response = await resendOtp(formData.email);
      if (response?.success || response?.message?.toLowerCase().includes("otp sent")) {
        setResendMessage("OTP resent successfully. Please check your email.");
      } else {
        setResendMessage(response.message || "Failed to resend OTP.");
      }
    } catch (error) {
      setResendMessage("Something went wrong. Please try again.");
    }
    setTimeout(() => {
      setResendMessage(null);
      setResendLoading(false);
    }, 3000);
  };

  useEffect(() => {
    if (successMessage || errors.form) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrors({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errors.form]);

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>

      {otpVerified ? (
        <div className="success-screen">
          <p className="success-text-only">{successMessage}</p>
        </div>
      ) : (
        <>
          {errors.form && <div className="error-text">{errors.form}</div>}

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
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-group password-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="eye-icon"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
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
            <form onSubmit={handleVerifyOtp} className="signup-form">
              <div className="input-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>

              <p className="resend-otp-text" style={{ marginTop: "10px" }}>
                Didn’t receive the code?{" "}
                <span
                  className="resend-otp-link"
                  onClick={handleResendOtp}
                  style={{
                    cursor: resendLoading ? "not-allowed" : "pointer",
                    color: "#007bff",
                  }}
                >
                  {resendLoading ? "Resending..." : "Resend OTP"}
                </span>
              </p>

              {resendMessage && (
                <div className="info-text" style={{ marginTop: "5px" }}>
                  {resendMessage}
                </div>
              )}
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Signup;
