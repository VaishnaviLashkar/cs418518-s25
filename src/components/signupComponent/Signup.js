import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { signUpUser, verifyOtpForSignup } from "../../api/auth";

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

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
    if (formData.password.length < 6) errors.password = "Password must be at least 6 characters.";
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
      console.log("the response from signup",response)
      if (response) {
        setSuccessMessage("Account successfully verified! You can now log in.");
        setErrors({});
        setFormData({ firstName: "", lastName: "", email: "", password: "" });
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("isAdmin", JSON.stringify(response.user.isAdmin));
        navigate("/dashboard");
      } else {
        setErrors({ form: response.message });
      }
    } catch (error) {
      setErrors({ form: "OTP verification failed. Please try again." });
    }
    setLoading(false);
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
      {successMessage && <div className="success-text">{successMessage}</div>}
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
            {errors.email && <span className="error-text">{errors.email}</span>}
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
        <form onSubmit={handleVerifyOtp}>
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
        </form>
      )}
    </div>
  );
};

export default Signup;
