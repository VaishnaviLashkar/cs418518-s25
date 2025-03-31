import React, { useEffect, useState } from "react";
import { getUsers, approveUser } from "../../../api/admin";
import "./css/AccountRequestsTab.css";

const AccountRequestsTab = () => {
  const [users, setUsers] = useState([]);
  const [loadingUserId, setLoadingUserId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const adminEmail = user?.email;

  useEffect(() => {
    if (isAdmin && adminEmail) {
      fetchAllUsers();

      const interval = setInterval(() => {
        fetchAllUsers();
      }, 30000); 

      return () => clearInterval(interval);
    }
  }, [isAdmin, adminEmail]);

  const fetchAllUsers = async () => {
    if (!isAdmin || !adminEmail) return;
    const response = await getUsers(adminEmail);
    if (response && Array.isArray(response.users)) {
      setUsers(response.users);
    } else {
      setUsers([]);
    }
  };

  const handleApproval = async (email, isApprove) => {
    setLoadingUserId(email);
    const result = await approveUser(email, isApprove);
    if (result?.success) {
      alert(`${isApprove ? "Approved" : "Rejected"} user: ${email}`);
      fetchAllUsers(); // Refresh the list after approval
    } else {
      alert("Error: " + result?.message);
    }
    setLoadingUserId(null);
  };

  return (
    <div className="account-requests-container">
      <h2>Account Requests</h2>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Email Verified</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.isEmailVerified ? "Yes" : "No"}</td>
                <td>{u.isApproved ? "Yes" : "No"}</td>
                <td>
                  {!u.isApproved ? (
                    <>
                      <button
                        onClick={() => handleApproval(u.email, true)}
                        disabled={loadingUserId === u.email}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(u.email, false)}
                        disabled={loadingUserId === u.email}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="approved-label">Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AccountRequestsTab;
