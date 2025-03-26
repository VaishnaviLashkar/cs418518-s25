import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

export const getUserInfo = async(email) =>{
    console.log("entered get user info  with email: " + email)
    try{
        const response = await axios.get(`${API_BASE_URL}/users/getUserInfo`,{
            params: { email }
        });
        console.log("the response from get user info is", response.data);
        return response.data;
    }catch (error) {
        return error.response?.data || { success: false, message: "Unable to fetch user data", data: null };
    }
}
export const updateUserInformation = async(userData) =>{
    try{
        const response  = await axios.post(`${API_BASE_URL}/users/updateUserInformation`,{
            email:userData.email,
            firstName:userData.firstName,
            lastName:userData.lastName
        });
        return response.data;
    }catch(error){
        return error.response?.data ||{success:false, message:"Unable to update the user information",data:null};
    }
}