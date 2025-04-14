import React, { useState } from "react";
import { forgotPassword, verifyOtpForForgotPassword, resendOtp, validatePassword } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      if (response?.message?.toLowerCase().includes("otp")) {
        setMessage("OTP has been sent to your email.");
        setStep(2);
      } else {
        setError(response.message || "Failed to send OTP.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (!email || resendLoading) return;

    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await resendOtp(email);
      if (response?.success) {
        setMessage("OTP resent successfully.");
      } else {
        setError(response.message || "Failed to resend OTP.");
      }
    } catch {
      setError("Something went wrong while resending OTP.");
    }

    setTimeout(() => {
      setResendLoading(false);
    }, 3000);
  };

  const handleVerifyOtpAndResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOtpForForgotPassword(email, otp, newPassword);
      if (response?.data?.token && response?.data?.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("isAdmin", JSON.stringify(response.data.user.isAdmin || false));

        setMessage("Password reset successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else if (response?.success && !response?.data) {
        setMessage(response.message || "Password updated, but not logged in.");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(response?.message || "Reset failed.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtpAndResetPassword}>
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="button" className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group password-group">
            <label>Re-enter New Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Reset Password"}
          </button>

          <p className="resend-otp-text">
            Didn’t receive the OTP?{" "}
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
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
