import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAllCourseAdvisingForms,
  updateAdvisingFormStatus,
} from "../../../api/admin";
import "./css/AdvisingFormsTab.css";

const AdvisingFormView = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForm = async () => {
      const allForms = await getAllCourseAdvisingForms();
      const selected = allForms?.find((f) => f._id === id);
      if (selected) {
        setForm(selected);
        setNotes(selected.notes || "");
      }
    };
    fetchForm();
  }, [id]);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return isNaN(date) ? "N/A" : date.toISOString().split("T")[0];
    } catch {
      return "N/A";
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!form?._id) return;
    if (!notes.trim()) {
        alert("Please provide feedback notes before proceeding.");
        return;
    }
    setLoading(true);
    const result = await updateAdvisingFormStatus(form._id, status, notes);
    setLoading(false);

    if (result?.form) {
      alert(`Form ${status} successfully`);
      navigate(-1);
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  if (!form) return <div className="advising-tab-container"><p>Loading form...</p></div>;

  return (
    <div className="advising-tab-container">
      <h2>Viewing Advising Form</h2>

      <div className="advising-details">
        <div className="advising-box-row">
          <div className="advising-box">
            <h3>Viewing</h3>
            <p><strong>Sheet ID:</strong> {form._id}</p>
            <p><strong>Date Submitted:</strong> {formatDate(form.date)}</p>
            <p><strong>Student ID:</strong> {form.student?._id || "N/A"}</p>
            <p><strong>Email:</strong> {form.student?.email || "N/A"}</p>
          </div>

          <div className="advising-box">
            <h3>Header</h3>
            <p><strong>Last Term:</strong> {form.lastTerm?.name || "N/A"}</p>
            <p><strong>GPA:</strong> {form.lastGPA}</p>
            <p><strong>Current Term:</strong> {form.currentTerm?.name || "N/A"}</p>
          </div>

          <div className="advising-box">
            <h3>Prerequisites</h3>
            {form.prerequisites?.map((c, idx) => (
              <p key={idx}>{c.courseName}</p>
            ))}
          </div>

          <div className="advising-box">
            <h3>Courses</h3>
            {form.coursePlan?.map((c, idx) => (
              <p key={idx}>{c.courseName}</p>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Add your feedback here"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="notes-input"
          disabled={form.status !== "Pending"}
        />

        {form.status === "Pending" && (
          <div className="action-buttons">
            <button
              className="accept-btn"
              onClick={() => handleStatusUpdate("Approved")}
              disabled={loading}
            >
              {loading ? "Approving..." : "ACCEPT"}
            </button>
            <button
              className="rejection-btn"
              onClick={() => handleStatusUpdate("Rejected")}
              disabled={loading}
            >
              {loading ? "Rejecting..." : "REJECT"}
            </button>
          </div>
        )}

        <button className="view-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default AdvisingFormView;
