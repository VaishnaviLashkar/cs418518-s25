import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpPage from "../pages/SignUpPage"; 
import LoginPage from "../pages/LoginPage"; 
import HomePage from "../pages/HomePage";
import Header from "../Layouts/Header"
const AppRoutes = () => {
  return (
    <Router>
      <Header />
      <Routes>
      
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
