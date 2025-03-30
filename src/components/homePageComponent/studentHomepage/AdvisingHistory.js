import React, { useEffect, useState } from "react";
import { getStudentAdvisingForms } from "../../../api/user";
import CreateAdvisingForm from "./CreateAdvisingForm";
import Modal from "../Modal"; 
import "../css/AdvisingHistory.css";

const AdvisingHistory = () => {
  const [advisingRecords, setAdvisingRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.userId;

  const fetchAdvisingRecords = async () => {
    if (!studentId) return;
    const data = await getStudentAdvisingForms(studentId);
    setAdvisingRecords(data || []);
  };

  useEffect(() => {
    fetchAdvisingRecords();
  }, [studentId]);

  return (
    <div className="history-card">
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Term</th>
            <th>Status</th>
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
                <td>
                  {record.status === "Pending" ? (
                    <button onClick={() => setSelectedRecord(record)} className="edit-btn">Edit</button>
                  ) : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="no-records">No records to display</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedRecord && (
        <Modal onClose={() => setSelectedRecord(null)}>
          <CreateAdvisingForm
            initialData={selectedRecord}
            isEdit={true}
            onClose={() => setSelectedRecord(null)}
            onSuccess={fetchAdvisingRecords}
          />
        </Modal>
      )}
    </div>
  );
};

export default AdvisingHistory;
