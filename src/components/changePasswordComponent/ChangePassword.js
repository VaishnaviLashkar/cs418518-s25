import React, { useState } from 'react';
import { resetPassword }  from "../../api/auth";
import { useNavigate } from 'react-router-dom';
import "./ChangePassword.css";
const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
  const [successMessage, setSuccessMessage] = useState();
  const[errorMessage, setErrorMessage] = useState();    
  const navigate =useNavigate();
  const handleInputChange = (field, value) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const onSwitchToResetPassword =() =>{
    navigate("/forgot-password");
  }
  const handleSubmit = async() => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }
    try{ 
        const response = await resetPassword(user.email, passwords.newPassword, passwords.confirmNewPassword);
        if(response.success) {
            setSuccessMessage(response.message);
            navigate('/dashboard');
        }else{
            setErrorMessage(response.message);
        }
    }catch (error) {
        console.error("Error resetting User Password", error);
      }
    
  };

  return (
    <div className="password-container">
      <p>
        <strong>Enter your Password:</strong>
        {errorMessage && (<div className="error">{errorMessage}</div>)}
        {successMessage && (<div className="success">{successMessage}</div>)}
        <input 
          type="password"
          value={passwords.currentPassword}
          onChange={(e) => handleInputChange('currentPassword', e.target.value)} 
          placeholder="Current Password"
        />
      </p>

      <p>
        <strong>New Password:</strong>
        <input 
          type="password"
          value={passwords.newPassword}
          onChange={(e) => handleInputChange('newPassword', e.target.value)} 
          placeholder="New Password"
        />
      </p>

      <p>
        <strong>Re-Enter New Password:</strong>
        <input 
          type="password"
          value={passwords.confirmNewPassword}
          onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)} 
          placeholder="Confirm New Password"
        />
      </p>

      <button onClick={handleSubmit}>Change Password</button>

      <p className="switch-link">
           Forgot Password?{" "}
            <span onClick={onSwitchToResetPassword}>click here</span>
          </p>
    </div>
  );
};

export default ChangePassword;
