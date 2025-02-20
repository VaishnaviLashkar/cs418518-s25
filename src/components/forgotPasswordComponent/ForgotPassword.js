import React, { useState } from "react";
import { forgotPassword, verifyOtpForForgotPassword } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
  const navigate = useNavigate();
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await forgotPassword(email);
      if (response) {
        setMessage("OTP has been sent to your email.");
        setStep(2);
      } else {
        setError(response.message || "Failed to send OTP. Try again.");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
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

    try {
        const response = await verifyOtpForForgotPassword(email, otp, newPassword);
        
        console.log("Full Backend Response:", response); // Log the entire response
        
        if (response.data) {
            console.log("the response in forgot password is", response.data);
            
            // Ensure response.data contains the expected token & user
            if (response.data.token && response.data.user) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
    
                // Check the user object before storing isAdmin
                console.log("User object:", response.data.user);
                if (response.data.user.isAdmin !== undefined) {
                    localStorage.setItem("isAdmin", JSON.stringify(response.data.user.isAdmin));
                } else {
                    console.warn("isAdmin property missing in response");
                }
    
                console.log("crossed the localStorage"); // Check if this logs
                setMessage("Password reset successfully! Redirecting to login...");
    
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            } else {
                setError("Invalid response structure. Missing token or user data.");
            }
        } else {
            setError(response.message || "Failed to reset password. Try again.");
        }
    } catch (err) {
        console.error("Error resetting password:", err);
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
            <input type="email" name="email" placeholder="Enter your email" value={email} onChange={handleEmailChange} required />
          </div>
          <button type="submit" disabled={loading}>{loading ? "Sending OTP..." : "Send OTP"}</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtpAndResetPassword}>
          <div className="form-group">
            <label>Enter OTP</label>
            <input type="text" name="otp" placeholder="Enter OTP" value={otp} onChange={handleOtpChange} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" name="newPassword" placeholder="Enter new password" value={newPassword} onChange={handleNewPasswordChange} required />
          </div>
          <div className="form-group">
            <label>Re-enter New Password</label>
            <input type="password" name="confirmPassword" placeholder="Re-enter new password" value={confirmPassword} onChange={handleConfirmPasswordChange} required />
          </div>
          <button type="submit" disabled={loading}>{loading ? "Verifying OTP & Resetting..." : "Verify & Reset Password"}</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
