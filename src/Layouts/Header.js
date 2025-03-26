import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import "./Header.css";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleClickOutside = (event) => {
    if (!dropdownRef.current?.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h2>Advisor</h2>
          </Link>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="nav-btn">
                Login
              </Link>
              <Link to="/signup" className="nav-btn">
                Signup
              </Link>
            </>
          ) : (
            <div className="nav-actions">
              <div className="dropdown" ref={dropdownRef}>
                <button className="dropdown-btn" onClick={toggleDropdown}>
                  <FaUserCircle size={24} /> <IoMdArrowDropdown size={16} />
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-content">
                    <Link to="/profile">Profile</Link>
                    <Link to="/change-password">Change Password</Link>
                    <Link to="/settings">Settings</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
