import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Start.css'; // Import CSS file for custom styling
import logo from './background/logo.png';
function Start() {
  const navigate = useNavigate();
  return (
    <div className="loginPage">
      <h1 className="mainTitle">Exam Alteration Helper</h1>
      <div className="loginForm">
      <div className="d-flex justify-content-center">
      <img src={logo} alt="Logo" className="logo" />
      </div>
        <div className="optionsContainer">
          <h2>Login As</h2>
          <div className="options">
            <button
              className="option employeeOption"
              onClick={e => navigate('/employeeLogin')}
            >
              Faculty
            </button>
            <button
              className="option adminOption"
              onClick={e => navigate('/login')}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Start;