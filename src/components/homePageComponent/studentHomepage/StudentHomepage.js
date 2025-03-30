import React, { useState } from "react";
import AdvisingHistory from "./AdvisingHistory";
import CreateAdvisingForm from "./CreateAdvisingForm";
import "../css/StudentHomepage.css";

const StudentHomePageComponent = () => {
  const [activeTab, setActiveTab] = useState("STATUS");
  const [editData, setEditData] = useState(null);

  return (
    <div className="student-container">
      <div className="tab-bar">
        <span
          className={`tab ${activeTab === "STATUS" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("STATUS");
            setEditData(null);
          }}
        >
          STATUS
        </span>
        <span
          className={`tab ${activeTab === "CREATE" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("CREATE");
            setEditData(null);
          }}
        >
          CREATE
        </span>
      </div>

      {activeTab === "STATUS" && (
        <AdvisingHistory
          onEdit={(record) => {
            setEditData(record);
            setActiveTab("CREATE");
          }}
        />
      )}
      {activeTab === "CREATE" && (
        <CreateAdvisingForm
          initialData={editData}
          isEdit={!!editData}
          onSuccess={() => {
            setActiveTab("STATUS");
            setEditData(null);
          }}
          onClose={() => {
            setActiveTab("STATUS");
            setEditData(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentHomePageComponent;
