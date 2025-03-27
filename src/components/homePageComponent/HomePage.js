import React, { useEffect } from "react";
import { getUsers } from "../../api/admin";
import StudentHomePageComponent from "./studentHomepage/StudentHomepage";
import AdminHomePageComponent from "./adminHomepage/AdminHomePageComponent";
import "./css/HomePage.css";

const HomePageComponent = () => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (isAdmin) {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};
      getUsers(user?.email || "");
    }
  }, [isAdmin]);

  if (!isLoggedIn) {
    return (
      <div className="no-users">
        Welcome to CS 518 Auth system. Please login to access all features.
      </div>
    );
  }

  if (!isAdmin) {
    return <StudentHomePageComponent />;
  }

  return <AdminHomePageComponent />;
};

export default HomePageComponent;
