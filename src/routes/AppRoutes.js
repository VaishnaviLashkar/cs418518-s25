import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpPage from "../pages/SignUpPage"; 
import LoginPage from "../pages/LoginPage"; 
import HomePage from "../pages/HomePage";
import Header from "../Layouts/Header"
import ProfilePage from "../pages/ProfilePage"
import ChangePasswordPage from "../pages/ChangePasswordPage"
import ForgotPasswordPage from "../pages/ForgotPasswordPage"
const AppRoutes = () => {
  return (
    <Router>
      <Header />
      <Routes>
      
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
