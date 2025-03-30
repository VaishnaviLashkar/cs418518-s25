import React, { useEffect, useRef, useState } from "react";
import {
  createAdvisingForm,
  updateAdvisingForm,
  getAllTerms,
  getCourseLevels,
  getCoursesByLevel,
  getAllCourseLevels,
  getAllCoursesByLevel
} from "../../../api/user";
import "../css/CreateAdvisingForm.css";

const CreateAdvisingForm = ({ initialData = null, isEdit = false, onClose, onSuccess }) => {
  const [lastTerm, setLastTerm] = useState(initialData?.lastTerm || "");
  const [currentTerm, setCurrentTerm] = useState(initialData?.currentTerm || "");
  const [lastGPA, setLastGPA] = useState(initialData?.lastGPA || "");
  const [prerequisites, setPrerequisites] = useState(initialData?.prerequisites || [{ level: "", courseName: "" }]);
  const [plannedCourses, setPlannedCourses] = useState(initialData?.coursePlan || [{ level: "", courseName: "" }]);

  const [terms, setTerms] = useState([]);
  const [preLevels, setPreLevels] = useState([]);
  const [plannedLevels, setPlannedLevels] = useState([]);
  const [preCoursesByLevel, setPreCoursesByLevel] = useState({});
  const [plannedCoursesByLevel, setPlannedCoursesByLevel] = useState({});
  const [message, setMessage] = useState("");
  const [status] = useState(initialData?.status || "Pending");

  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.userId;
  const messageRef = useRef(null);
  const isLocked = status === "Approved" || status === "Rejected";

  useEffect(() => {
    fetchTerms();
    fetchPreLevels();
    fetchPlannedLevels();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const allLevels = new Set([
        ...(initialData?.coursePlan || []).map(c => c.level),
        ...(initialData?.prerequisites || []).map(c => c.level),
      ]);
      allLevels.forEach((lvl) => {
        if (lvl) {
          fetchCoursesForLevel(lvl, "prerequisites");
          fetchCoursesForLevel(lvl, "plannedCourses");
        }
      });
    }
  }, [isEdit, initialData]);

  const fetchTerms = async () => {
    const res = await getAllTerms();
    setTerms(res);
  };

  const fetchPreLevels = async () => {
    const levels = await getCourseLevels();
    setPreLevels(levels);
  };

  const fetchPlannedLevels = async () => {
    const levels = await getAllCourseLevels();
    setPlannedLevels(levels);
  };

  const fetchCoursesForLevel = async (level, section) => {
    if (!level) return;

    if (section === "prerequisites" && !preCoursesByLevel[level]) {
      const res = await getCoursesByLevel(level);
      setPreCoursesByLevel(prev => ({ ...prev, [level]: res }));
    }

    if (section === "plannedCourses" && !plannedCoursesByLevel[level]) {
      const res = await getAllCoursesByLevel(level);
      setPlannedCoursesByLevel(prev => ({ ...prev, [level]: res }));
    }
  };

  const handleCourseChange = async (section, index, field, value) => {
    const list = section === "prerequisites" ? [...prerequisites] : [...plannedCourses];
    list[index][field] = value;

    if (field === "level") {
      await fetchCoursesForLevel(value, section);
      list[index]["courseName"] = "";
    }

    section === "prerequisites" ? setPrerequisites(list) : setPlannedCourses(list);
  };

  const addCourseRow = (section) => {
    const updated = section === "prerequisites" ? [...prerequisites] : [...plannedCourses];
    updated.push({ level: "", courseName: "" });
    section === "prerequisites" ? setPrerequisites(updated) : setPlannedCourses(updated);
  };

  const removeCourseRow = (section, index) => {
    const updated = section === "prerequisites" ? [...prerequisites] : [...plannedCourses];
    updated.splice(index, 1);
    section === "prerequisites" ? setPrerequisites(updated) : setPlannedCourses(updated);
  };

  const showError = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lastTerm || !currentTerm || lastGPA === "") return showError("Last Term, Current Term, and GPA are required.");
    if (lastTerm === currentTerm) return showError("Last Term and Current Term cannot be the same.");

    const lastTermObj = terms.find((t) => t._id === lastTerm);
    const currentTermObj = terms.find((t) => t._id === currentTerm);

    if (lastTermObj && currentTermObj && new Date(lastTermObj.startDate) >= new Date(currentTermObj.startDate)) {
      return showError("Last Term must be before Current Term.");
    }

    const allCourses = [...prerequisites, ...plannedCourses].map((c) => c.courseName);
    const uniqueCourseNames = new Set(allCourses);
    if (allCourses.length !== uniqueCourseNames.size) {
      return showError("Duplicate courses are not allowed across sections.");
    }

    const payload = {
      studentId,
      lastTerm,
      currentTerm,
      lastGPA: parseFloat(lastGPA),
      prerequisites,
      coursePlan: plannedCourses,
    };

    const result = isEdit && initialData?._id
      ? await updateAdvisingForm(initialData._id, payload)
      : await createAdvisingForm(payload);

    if (result?.advising) {
      setMessage("Advising form submitted successfully.");
      onSuccess?.();
      onClose?.();
    } else {
      showError(result?.message || "Submission failed.");
    }
  };

  const renderCourseSection = (sectionName, data) => {
    const isPrereq = sectionName === "prerequisites";
    const sectionData = data.length > 0 ? data : [{ level: "", courseName: "" }];
    const levels = isPrereq ? preLevels : plannedLevels;
    const courseMap = isPrereq ? preCoursesByLevel : plannedCoursesByLevel;

    return sectionData.map((course, idx) => (
      <div key={`${sectionName}-${idx}`} className="advising-course-row">
        <select
          value={course.level}
          onChange={(e) => handleCourseChange(sectionName, idx, "level", e.target.value)}
          className="advising-select"
          disabled={isLocked}
        >
          <option value="">Select Level</option>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>

        <select
          value={course.courseName}
          onChange={(e) => handleCourseChange(sectionName, idx, "courseName", e.target.value)}
          disabled={!course.level || isLocked}
          className="advising-select"
        >
          <option value="">Select Course</option>
          {(courseMap[course.level] || []).map((c) => (
            <option key={c._id} value={c.courseName}>{c.courseName}</option>
          ))}
        </select>

        {!isLocked && (
          <div className="advising-action-buttons">
            {sectionData.length > 1 && (
              <button type="button" onClick={() => removeCourseRow(sectionName, idx)} className="advising-remove-btn">Remove</button>
            )}
            {idx === sectionData.length - 1 && (
              <button type="button" onClick={() => addCourseRow(sectionName)} className="advising-add-btn">Add</button>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="advising-container">
      <h2 className="advising-title">{isEdit ? "Edit Advising Form" : "Create Course Advising"}</h2>
      {message && (
        <p ref={messageRef} className={`advising-message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="advising-form">
        <div className="advising-term-section">
          <div className="advising-field">
            <label>Last Term:</label>
            <select value={lastTerm} onChange={(e) => setLastTerm(e.target.value)} disabled={isLocked}>
              <option value="">Select</option>
              {terms.map((term) => (
                <option key={term._id} value={term._id}>{term.name}</option>
              ))}
            </select>
          </div>

          <div className="advising-field">
            <label>Last GPA:</label>
            <input
              type="text"
              value={lastGPA}
              onChange={(e) => {
                const val = e.target.value;
                if (/^(\d{0,1}(\.\d{0,2})?|4(\.0{0,2})?)?$/.test(val)) setLastGPA(val);
              }}
              disabled={isLocked}
              required
            />
          </div>

          <div className="advising-field">
            <label>Current Term:</label>
            <select value={currentTerm} onChange={(e) => setCurrentTerm(e.target.value)} disabled={isLocked}>
              <option value="">Select</option>
              {terms.map((term) => (
                <option key={term._id} value={term._id}>{term.name}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="advising-subtitle">Prerequisite Courses</h3>
        {renderCourseSection("prerequisites", prerequisites)}

        <h3 className="advising-subtitle">Planned Courses</h3>
        {renderCourseSection("plannedCourses", plannedCourses)}

        {!isLocked && (
          <button type="submit" className="advising-submit-btn">
            {isEdit ? "Update" : "Submit"} Advising Form
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} className="advising-cancel-btn">
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default CreateAdvisingForm;
