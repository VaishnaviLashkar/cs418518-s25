import React, { useEffect, useState } from "react";
import { getAllCourses, updateCoursePrerequisite } from "../../../api/admin";
import "./css/EditCourses.css";

const EditCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      if (data?.courses) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (courseId, currentValue) => {
    try {
      const updated = await updateCoursePrerequisite(courseId, !currentValue);
      if (updated?.course) {
        setCourses((prev) =>
          prev.map((course) =>
            course._id === courseId ? { ...course, isPrerequisite: !currentValue } : course
          )
        );
      }
    } catch (error) {
      console.error("Error updating prerequisite:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="edit-courses-container">
      <div className="table-wrapper">
        <table className="course-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Course</th>
              <th>Tag as Pre-Requisite</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.level}</td>
                <td>{course.courseName}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={course.isPrerequisite}
                    onChange={() =>
                      handleCheckboxChange(course._id, course.isPrerequisite)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditCourses;
