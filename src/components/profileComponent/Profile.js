import React, { useState, useEffect } from 'react';
import { getUserInfo, updateUserInformation } from "../../api/user";
import { FaUserCircle } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editName, setEditName] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleUpdateClick = () => {
    setOriginalData(userData); 
    setEditName(true);
  };

  const handleCancelClick = () => {
    setUserData(originalData); 
    setEditName(false);
  };

  const handleSave = async () => {
    try {
      const response = await updateUserInformation(userData);
      if (response && response.user) {
        setUserData(response.user);
        setEditName(false);
        console.log("Profile updated successfully:", response.user);
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user && user.email) {
        const response = await getUserInfo(user.email);
        if (response && response.user) {
          setUserData(response.user);
        } else {
          setError("User data not found");
        }
      } else {
        setError("No user found in local storage");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {loading ? (
        <p>Loading user profile...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : userData ? (
        <div className="profile-card">
          {editName ? (
            <div className="edit-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancelClick}>Cancel</button>
            </div>
          ) : (
            <div className="update-profile">
              <button onClick={handleUpdateClick}>Update Profile</button>
            </div>
          )}

          <div className="profile-icon">
            <FaUserCircle size={150} color="#4CAF50" />
          </div>

          <div className="profile-details">
            {editName ? (
              <div>
                <p>
                  <strong>First Name:</strong>
                  <input 
                    type="text" 
                    value={userData.firstName} 
                    onChange={(e) => handleInputChange('firstName', e.target.value)} 
                  />
                </p>
                <p>
                  <strong>Last Name:</strong>
                  <input 
                    type="text" 
                    value={userData.lastName} 
                    onChange={(e) => handleInputChange('lastName', e.target.value)} 
                  />
                </p>
                <p><strong>Email:</strong> {userData.email}</p>
              </div>
            ) : (
              <div>
                <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                <p><strong>Email:</strong> {userData.email}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default Profile;
