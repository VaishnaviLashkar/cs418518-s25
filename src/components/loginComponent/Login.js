import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  verifyOtpForLogin,
  resendOtp,
  validatePassword
} from "../../api/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import "./LoginForm.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSwitchToSignUp = () => {
    navigate("/signup");
  };

  const onSwitchToResetPassword = () => {
    navigate("/forgot-password");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrors({ form: passwordError });
      return;
    }

    if (!recaptchaToken) {
      setErrors({ form: "Please complete the reCAPTCHA verification." });
      return;
    }

    setLoading(true);
    const response = await loginUser(formData.email, formData.password, recaptchaToken);
    if (response.success) {
      setShowOtpInput(true);
      setErrors({});
    } else {
      setErrors({ form: response.message });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await verifyOtpForLogin({
      email: formData.email,
      otp,
    });

    if (response && response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("isAdmin", JSON.stringify(response.data.user.isAdmin));
      navigate("/dashboard");
    } else {
      setErrors({ form: response.message || "OTP verification failed" });
    }
    setLoading(false);
  };
  const handleResendOtp = async () => {
    if (!formData.email || resendLoading) return;
  
    setResendLoading(true);
    setResendMessage(null);
    setErrors({});
  
    try {
      const response = await resendOtp(formData.email);
  
      if (response?.success) {
        setResendMessage("OTP resent successfully. Check your email.");
      } else {
        setResendMessage(response.message || "Failed to resend OTP.");
      }
    } catch (error) {
      setResendMessage("Something went wrong while resending OTP.");
    }
  
    setTimeout(() => {
      setResendMessage(null);
      setResendLoading(false);
    }, 3000);
  };
  
  return (
    <div className="auth-container">
      <h2>Login</h2>
      {errors.form && <div className="error">{errors.form}</div>}

      {!showOtpInput ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
          </div>

          <div className="form-group">
            <ReCAPTCHA
              sitekey="6LceXhcrAAAAAN1lFj9TQf0FxV_vmMsVb0vja-YW"
              onChange={handleRecaptchaChange}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="switch-link">
            Forgot Password?{" "}
            <span onClick={onSwitchToResetPassword}>Click here</span>
          </p>

          <p className="switch-link">
            Don't have an account?{" "}
            <span onClick={onSwitchToSignUp}>Signup here</span>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="otp-container">
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
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
    </div>
  );
};

export default LoginPage;
