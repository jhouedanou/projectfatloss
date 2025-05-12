import React from 'react';
import './Header.css';
import logo from '/playstore.png';

export default function Header() {
  return (
    <header className="app-header">
      <div className="logo-container">
        <img src={logo} alt="Project Fat Loss" className="app-logo" />
      </div>
    </header>
  );
}
