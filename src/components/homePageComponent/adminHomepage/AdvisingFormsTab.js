import React, { useEffect, useState } from "react";
import {
  getAllCourseAdvisingForms,
  updateAdvisingFormStatus,
} from "../../../api/admin";
import "./css/AdvisingFormsTab.css";

const AdvisingFormsTab = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchForms();

    const intervalId = setInterval(() => {
      fetchForms();
    }, 30000);

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

  const handleStatusUpdate = async (status) => {
    if (!selectedForm?._id) return;
    const result = await updateAdvisingFormStatus(
      selectedForm._id,
      status,
      notes
    );
    if (result?.form) {
      alert(`Form ${status} successfully`);
      setSelectedForm(null);
      setNotes("");
      fetchForms();
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="advising-tab-container">
      <h2>Advising Forms</h2>

      {selectedForm && (
        <div className="advising-details">
          <div className="advising-box-row">
            <div className="advising-box">
              <h3>Viewing</h3>
              <p>
                <strong>Sheet ID:</strong> {selectedForm._id}
              </p>
              <p>
                <strong>Date Submitted:</strong> {formatDate(selectedForm.date)}
              </p>
              <p>
                <strong>Student ID:</strong>{" "}
                {selectedForm.student?._id || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {selectedForm.student?.email || "N/A"}
              </p>
            </div>

            <div className="advising-box">
              <h3>Header</h3>
              <p>
                <strong>Last Term:</strong>{" "}
                {selectedForm.lastTerm?.name || "N/A"}
              </p>
              <p>
                <strong>GPA:</strong> {selectedForm.lastGPA}
              </p>
              <p>
                <strong>Current Term:</strong>{" "}
                {selectedForm.currentTerm?.name || "N/A"}
              </p>
            </div>

            <div className="advising-box">
              <h3>Prerequisites</h3>
              {selectedForm.prerequisites?.map((c, idx) => (
                <p key={idx}>{c.courseName}</p>
              ))}
            </div>

            <div className="advising-box">
              <h3>Courses</h3>
              {selectedForm.coursePlan?.map((c, idx) => (
                <p key={idx}>{c.courseName}</p>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="notes-input"
          />

          {selectedForm.status === "Pending" && (
            <div className="action-buttons">
              <button
                className="accept-btn"
                onClick={() => handleStatusUpdate("Approved")}
              >
                ACCEPT
              </button>
              <button
                className="reject-btn"
                onClick={() => handleStatusUpdate("Rejected")}
              >
                REJECT
              </button>
            </div>
          )}
        </div>
      )}

      <table className="advising-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Term</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form._id}>
              <td>{form.student?.firstName || "N/A"}</td>
              <td>{form.student?.lastName || "N/A"}</td>
              <td>{form.student?.email || "N/A"}</td>
              <td>{formatDate(form.date)}</td>
              <td>{form.currentTerm?.name || "N/A"}</td>
              <td>{form.status}</td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => {
                    setSelectedForm(form);
                    setNotes(form.notes || "");
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdvisingFormsTab;
