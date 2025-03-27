import React, { useState } from "react";
import AdvisingFormsTab from "./AdvisingFormsTab";
import EditCoursesTab from "./EditCoursesTab";
import AccountRequestsTab from "./AccountRequestsTab";
import "./css/AdminHomePage.css";

const AdminHomePageComponent = () => {
  const [activeTab, setActiveTab] = useState("Edit Courses");

  const renderTab = () => {
    switch (activeTab) {
      case "Advising Forms":
        return <AdvisingFormsTab />;
      case "Edit Courses":
        return <EditCoursesTab />;
      case "Account Requests":
        return <AccountRequestsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-homepage">
      <div className="tab-header">
        <button className={activeTab === "Advising Forms" ? "active" : ""} onClick={() => setActiveTab("Advising Forms")}>
          ADVISING FORMS
        </button>
        <button className={activeTab === "Edit Courses" ? "active" : ""} onClick={() => setActiveTab("Edit Courses")}>
          EDIT COURSES
        </button>
        <button className={activeTab === "Account Requests" ? "active" : ""} onClick={() => setActiveTab("Account Requests")}>
          ACCOUNT REQUESTS
        </button>
      </div>
      <div className="tab-content">{renderTab()}</div>
    </div>
  );
};

export default AdminHomePageComponent;
