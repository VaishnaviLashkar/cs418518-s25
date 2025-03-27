import React, { useState } from "react";
import AdvisingHistory from "./AdvisingHistory";
import CreateAdvisingForm from "./CreateAdvisingForm";
import "../css/StudentHomepage.css" ;

const StudentHomePageComponent = () => {
  const [activeTab, setActiveTab] = useState("STATUS");

  return (
    <div className="student-container">
      <div className="tab-bar">
        <span className={`tab ${activeTab === "STATUS" ? "active" : ""}`} onClick={() => setActiveTab("STATUS")}>
          STATUS
        </span>
        <span className={`tab ${activeTab === "CREATE" ? "active" : ""}`} onClick={() => setActiveTab("CREATE")}>
          CREATE
        </span>
      </div>

      {activeTab === "STATUS" ? <AdvisingHistory /> : <CreateAdvisingForm />}
    </div>
  );
};

export default StudentHomePageComponent;
