import React from "react";
import "../styles/Button.css";

export const Button = ({ children, onClick, className }) => {
  return (
    <button 
      className={`custom-button ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
