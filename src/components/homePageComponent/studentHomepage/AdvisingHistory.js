import React, { useEffect, useState } from "react";

const AdvisingHistory = () => {
  const [advisingRecords, setAdvisingRecords] = useState([]);

  useEffect(() => {
    // Replace with actual API call
    const data = [
      { date: "2024-03-03", term: "Fall 2024", status: "Pending" },
      { date: "2023-10-05", term: "Spring 2024", status: "Approved" },
      { date: "2023-10-01", term: "Spring 2024", status: "Rejected" },
    ];
    setAdvisingRecords(data);
  }, []);

  return (
    <div className="history-card">
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Term</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {advisingRecords.length > 0 ? (
            advisingRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.date}</td>
                <td>{record.term}</td>
                <td>{record.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="no-records">No records to display</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdvisingHistory;
