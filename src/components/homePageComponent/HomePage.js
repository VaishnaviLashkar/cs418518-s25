import React, { useState, useEffect } from "react";
import { getUsers, approveUser } from "../../api/admin";
import "./HomePage.css";

const HomePageComponent = () => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  console.log(`isAdmin: ${isAdmin}`);
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
  const adminEmail = user?.email || "";

  const [userData, setUserData] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (isAdmin) {
      getAllUsers();
    }
  }, [adminEmail, isAdmin]);

  const getAllUsers = async () => {
    try {
      const users = await getUsers(adminEmail);
      if (users && Array.isArray(users.users)) {
        setUserData(users.users);
      } else {
        setUserData([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUserData([]);
    }
  };

  const handleApprove = async (email) => { 
    try {
      const data = await approveUser(email, false); 
      if (data) {
        setMessage(`User ${email} has been deleted`);
        setMessageType("error");
        getAllUsers();
      }
    } catch (error) {
      setMessage("Error deleting user");
      setMessageType("error");
      console.error("Deletion Error:", error);
    }
  };
  

  if (!isLoggedIn) {
    return <div className = "no-users">Welcome to CS 518 Auth system. Please login to Access all Features</div>;
  }

  if (!isAdmin) {
    return <div className="no-users">Welcome to CS 518 Auth system</div>;
  }

  return (
    <div className="admin-container">
      <h2>Hello Admin</h2>
      {message && <div className={`message ${messageType}`}>{message}</div>}
      <h3>User List</h3>
      <div className="user-grid">
        {Array.isArray(userData) && userData.length > 0 ? (
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
                    <button className="reject-btn" onClick={() => handleApprove(user.email, false)}>
                     Delete User
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
