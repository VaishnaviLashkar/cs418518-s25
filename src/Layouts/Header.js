import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token") !== null;
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h2>Vyosomatrix</h2>
          </Link>
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          {isLoggedIn ? (
            <>
            
              <button className="nav-btn" onClick={handleLogout}>
                Logout
              </button>
              <Link to="/profile" className="nav-btn">
                <FaUser /> Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn">
                Login
              </Link>
              <Link to="/signup" className="nav-btn">
                Signup
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
