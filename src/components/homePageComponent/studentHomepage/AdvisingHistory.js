import React, { useEffect, useState } from "react";
import { getStudentAdvisingForms } from "../../../api/user";
import "../css/AdvisingHistory.css";

const AdvisingHistory = ({ onEdit }) => {
  const [advisingRecords, setAdvisingRecords] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.userId;

  const fetchAdvisingRecords = async () => {
    if (!studentId) return;
    const data = await getStudentAdvisingForms(studentId);
    setAdvisingRecords(data || []);
  };

  useEffect(() => {
    if (!studentId) return;

    let isMounted = true;

    const fetchAndUpdate = async () => {
      const data = await getStudentAdvisingForms(studentId);
      if (isMounted) {
        setAdvisingRecords(data || []);
      }
    };

    fetchAndUpdate(); 

    const intervalId = setInterval(fetchAndUpdate, 10000); 

    return () => {
      isMounted = false;
      clearInterval(intervalId); 
    };
  }, [studentId]);

  return (
    <div className="history-card">
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Term</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {advisingRecords.length > 0 ? (
            advisingRecords.map((record, index) => (
              <tr key={index}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.term?.name || "N/A"}</td>
                <td>{record.status}</td>
                <td className="text-center">{record.notes || "-"}</td>
                <td className="text-center">
                  <button
                    onClick={() => onEdit(record)}
                    className={
                      record.status === "Pending" ? "edit-btn" : "view-btn"
                    }
                  >
                    {record.status === "Pending" ? "Edit" : "View"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-records">
                No records to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdvisingHistory;
