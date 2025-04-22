import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCourseAdvisingForms } from "../../../api/admin";
import "./css/AdvisingFormsTab.css";

const AdvisingFormsTab = () => {
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
    const intervalId = setInterval(() => {
      fetchForms();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchForms = async () => {
    const result = await getAllCourseAdvisingForms();
    setForms(result || []);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return isNaN(date) ? "N/A" : date.toISOString().split("T")[0];
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="advising-tab-container">
      <h2>Advising Forms</h2>

      <table className="advising-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Term</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => {
            const firstName = form.student?.firstName || "";
            const lastName = form.student?.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim() || "N/A";

            return (
              <tr key={form._id}>
                <td>{fullName}</td>
                <td>{form.student?.email || "N/A"}</td>
                <td>{formatDate(form.date)}</td>
                <td>{form.currentTerm?.name || "N/A"}</td>
                <td>{form.status}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/admin/advising-form/${form._id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdvisingFormsTab;
