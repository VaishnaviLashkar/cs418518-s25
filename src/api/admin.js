import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

export const getUsers = async (email) => {
    console.log("entred with " + email)

    try {
        const response = await axios.get(`${API_BASE_URL}/admin/getAllUsers`, {
            params: { email }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "cannot get users", data: null };
    }
};
export const approveUser = async(email,isApprove) =>{
    try{
        const response = await axios.post(`${API_BASE_URL}/admin/approveUser`,{
            email: email,
            isApprove: isApprove,
        })
        return response.data;
    }catch (error) {
        return error.response?.data || { success: false, message: "Cannot Approve User", data: null };
    }
}