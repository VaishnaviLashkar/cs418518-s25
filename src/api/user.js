import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

// ---------------------- User APIs ----------------------

export const getUserInfo = async (email) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/getUserInfo`, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to fetch user data",
        data: null,
      }
    );
  }
};

export const updateUserInformation = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/updateUserInformation`, {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to update user information",
        data: null,
      }
    );
  }
};



export const createAdvisingForm = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/createForm`, data);
    return response.data;
  } catch (error) {
    return error.response?.data || { message: "Failed to create advising form" };
  }
};

export const updateAdvisingForm = async (advisingId, payload) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/users/updateAdvisingForm/${advisingId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating advising form:", error.response?.data?.message || error.message);
    return {
      message: "Failed to update advising form"
    };
  }
};

export const getAllTerms = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/getAllTerms`);
    return response.data.terms;
  } catch (error) {
    console.error("Error fetching terms:", error);
    return [];
  }
};



export const getCourseLevels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/getCourseLevels`);
    return response.data.levels;
  } catch (error) {
    console.error("Error fetching course levels:", error);
    return [];
  }
};

export const getCoursesByLevel = async (level) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/getCourseByLevel/${level}`);
    return response.data.courses;
  } catch (error) {
    console.error(`Error fetching courses for level ${level}:`, error);
    return [];
  }
};

export const getAllCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/getAllCourses`);
    return response.data.courses;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return [];
  }
};
export const getStudentAdvisingForms = async (studentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/getStudentForms/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching advising forms:", error.response?.data?.message || error.message);
    return [];
  }
};
