import React, { useEffect, useState } from "react";
import {
  createAdvisingForm,
  getAllTerms,
  getCourseLevels,
  getCoursesByLevel,
} from "../../../api/user";
import "../css/StudentHomepage.css";

const CreateAdvisingForm = () => {
  const [lastTerm, setLastTerm] = useState("");
  const [currentTerm, setCurrentTerm] = useState("");
  const [lastGPA, setLastGPA] = useState("");
  const [coursePlan, setCoursePlan] = useState([{ level: "", courseName: "" }]);
  const [terms, setTerms] = useState([]);
  const [levels, setLevels] = useState([]);
  const [coursesByLevel, setCoursesByLevel] = useState({});
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.userId;

  useEffect(() => {
    fetchTerms();
    fetchLevels();
  }, []);

  const fetchTerms = async () => {
    const allTerms = await getAllTerms();
    setTerms(allTerms);
  };

  const fetchLevels = async () => {
    const res = await getCourseLevels();
    setLevels(res);
  };

  const fetchCoursesForLevel = async (level) => {
    if (coursesByLevel[level]) return;
    const courseList = await getCoursesByLevel(level);
    setCoursesByLevel((prev) => ({ ...prev, [level]: courseList }));
  };

  const handleCourseChange = async (index, field, value) => {
    const updatedPlan = [...coursePlan];
    updatedPlan[index][field] = value;

    if (field === "level") {
      await fetchCoursesForLevel(value);
      updatedPlan[index]["courseName"] = "";
    }

    setCoursePlan(updatedPlan);
  };

  const addCourseRow = () => {
    setCoursePlan([...coursePlan, { level: "", courseName: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lastTerm || !currentTerm || lastGPA === "") {
      setMessage("Last Term, Current Term, and GPA are required.");
      return;
    }

    if (lastTerm === currentTerm) {
      setMessage("Last Term and Current Term cannot be the same.");
      return;
    }

    const lastTermObj = terms.find((t) => t._id === lastTerm);
    const currentTermObj = terms.find((t) => t._id === currentTerm);

    if (
      lastTermObj &&
      currentTermObj &&
      new Date(lastTermObj.startDate) >= new Date(currentTermObj.startDate)
    ) {
      setMessage("Last Term must be before Current Term.");
      return;
    }

    const courseNames = coursePlan.map((c) => c.courseName);
    const uniqueCourseNames = new Set(courseNames);
    if (courseNames.length !== uniqueCourseNames.size) {
      setMessage("Duplicate courses are not allowed.");
      return;
    }

    const payload = {
      studentId,
      lastTerm,
      currentTerm,
      lastGPA: parseFloat(lastGPA),
      coursePlan,
    };

    const result = await createAdvisingForm(payload);

    if (result?.advising) {
      setMessage("Advising form submitted successfully.");
      setLastTerm("");
      setCurrentTerm("");
      setLastGPA("");
      setCoursePlan([{ level: "", courseName: "" }]);
    } else {
      setMessage(result?.message || "Submission failed.");
    }
  };

  return (
    <div className="create-advising-container">
      <h2>Create Course Advising</h2>
      {message && (
        <p className={`message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="advising-form">
        <div className="term-row">
          <div>
            <label>Last Term:</label>
            <select value={lastTerm} onChange={(e) => setLastTerm(e.target.value)}>
              <option value="">Select</option>
              {terms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Last GPA:</label>
            <input
              type="text"
              inputMode="decimal"
              pattern="^[0-3](\.\d{1,2})?$|^4(\.0{1,2})?$"
              placeholder="e.g. 3.75"
              title="Enter GPA between 0.00 and 4.00 (up to 2 decimal places)"
              value={lastGPA}
              onChange={(e) => {
                const value = e.target.value;
                if (/^(\d{0,1}(\.\d{0,2})?|4(\.0{0,2})?)?$/.test(value)) {
                  setLastGPA(value);
                }
              }}
              required
            />
          </div>

          <div>
            <label>Current Term:</label>
            <select value={currentTerm} onChange={(e) => setCurrentTerm(e.target.value)}>
              <option value="">Select</option>
              {terms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h3>Planned Courses</h3>
        {coursePlan.map((course, idx) => (
          <div key={idx} className="course-row">
            <select
              value={course.level}
              onChange={(e) => handleCourseChange(idx, "level", e.target.value)}
            >
              <option value="">Select Level</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            <select
              value={course.courseName}
              onChange={(e) => handleCourseChange(idx, "courseName", e.target.value)}
              disabled={!course.level}
            >
              <option value="">Select Course</option>
              {(coursesByLevel[course.level] || []).map((c) => (
                <option key={c._id} value={c.courseName}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button type="button" onClick={addCourseRow}>
          Add Course
        </button>

        <br />
        <button type="submit">Submit Advising Form</button>
      </form>
    </div>
  );
};

export default CreateAdvisingForm;
