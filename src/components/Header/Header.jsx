import React from 'react';
import { IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './Header.css';
import logo from '/playstore.png';

export default function Header({ onNotificationSettings }) {
  return (
    <header className="app-header">
      <div className="logo-container">
        <img src={logo} alt="Project Fat Loss" className="app-logo" />
      </div>
      {onNotificationSettings && (
        <div className="header-actions">
          <IconButton 
            onClick={onNotificationSettings}
            color="primary"
            title="Paramètres de notification"
          >
            <NotificationsIcon />
          </IconButton>
        </div>
      )}
    </header>
  );
}
