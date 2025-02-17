import React, { useState, useEffect } from "react";
import { getUsers, approveUser } from "../../api/admin";
import "./HomePage.css";

const HomePageComponent = () => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const isAdmin = Boolean(localStorage.getItem("isAdmin"));
  const user = JSON.parse(localStorage.getItem("user"));
  const adminEmail = user?.email;

  const [userData, setUserData] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 

  const getAllUsers = async () => {
    try {
      const users = await getUsers(adminEmail);
      setUserData(users.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [adminEmail]);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const handleApprove = async (email, approveStatus) => {
    try {
      const data = await approveUser(email, approveStatus);
      if (data) {
        setMessage(`User ${email} has been ${approveStatus ? "approved" : "rejected"}`);
        setMessageType(approveStatus ? "success" : "error");
        getAllUsers();
        setTimeout(() => {
          getAllUsers();
        }, 10000);
      }
    } catch (error) {
      setMessage("Error updating user status");
      setMessageType("error");
      console.error("Approval Error:", error);
    }
  };

  if (!isAdmin && isLoggedIn) {
    return <div>Welcome to CS 518 Auth system</div>;
  }

  return (
    <div className="admin-container">
      <h2>Hello Admin</h2>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      <h3>User List</h3>
      <div className="user-grid">
        {userData.length > 0 ? (
          userData.map((user) => (
            <div key={user.email || user.id} className="user-card">
              <h4 className="user-name">
                {`${user.firstName} ${user.lastName}`}
              </h4>
              <p className="user-email">{user.email}</p>
              <div className="user-actions">
                {user.isApproved ? (
                  <span className="approved-badge">Approved</span>
                ) : (
                  <div className="action-buttons">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(user.email, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleApprove(user.email, false)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-users">No users found</p>
        )}
      </div>
    </div>
  );
};

export default HomePageComponent;
