import React from "react";
import "./css/Modal.css";

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-backdrop">
    <div className="modal-content">
      <button className="modal-close-btn" onClick={onClose}>×</button>
      {children}
    </div>
  </div>
  
  );
};

export default Modal;
