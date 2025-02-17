import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, verifyOtpForLogin } from "../../api/auth";
import './LoginForm.css'
const LoginPage = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const response = await loginUser(formData.email, formData.password);
        
        if (response.success) {
            setShowOtpInput(true);
        } else {
            setErrors({ form: response.message });
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const response = await verifyOtpForLogin({ email: formData.email, otp });

        if (response.success) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("isAdmin", JSON.stringify(response.data.isAdmin));
            navigate("/dashboard");
        } else {
            setErrors({ form: response.message });
        }
        setLoading(false);
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
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <div className="form-group">
                        <label>Enter OTP</label>
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? "Verifying OTP..." : "Verify OTP"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default LoginPage;
