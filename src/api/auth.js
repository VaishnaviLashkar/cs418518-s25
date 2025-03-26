import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

export const loginUser = async (email, password) => {

    try {
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
            email,
            password
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Login request failed", data: null };
    }
};
export const verifyOtpForLogin = async (otpData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/verifyOtpForLogin`, otpData);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "OTP verification failed", data: null };
    }
};
export const signUpUser = async (firstName,lastName,email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/signup`, {
            firstName,
            lastName,
            email,
            password
        });
        console.log("the response from sign up returned is",response)
        return response;
    } catch (error) {
        return error.response?.data || { success: false, message: "Signup request failed", data: null };
    }
};
export const verifyOtpForSignup = async (otpData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/verifyOtpForSignup`, otpData);
        console.log("the response returned is",response)
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "OTP verification failed", data: null };
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/forgotPassword`,{
            email: email
        });
        console.log("the response returned is",response)
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "OTP verification failed", data: null };
    }
};
export const verifyOtpForForgotPassword = async (email, otp, newPassword) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/verifyOtpForForgotPassword`, {
            email,
            otp,
            newPassword
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Response from backend:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in OTP verification:", error.response?.data || error.message);
        return error.response?.data || { success: false, message: "OTP verification failed", data: null };
    }
};
export const resetPassword = async (email, password, newPassword) => {
    console.log("the email received for sending reset password request", email);
    try {
        const response = await axios.post(`${API_BASE_URL}/users/resetPassword`, {
            email,
            password,
            newPassword,
        });

        return response;
    } catch (error) {
        return error.response || { success: false, message: "Password reset failed", data: null };
    }
};