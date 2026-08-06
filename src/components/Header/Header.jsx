import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Box,
  Typography
} from '@mui/material';
import { ArrowLeft, Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import './Header.css';
import { getAssetPath } from '../../utils/paths';

export default function Header({ onNotificationSettings, onBack, user, onAccountClick, darkTheme, onToggleTheme }) {
  const title = onBack ? 'Programme' : 'Project Fat Loss';
  const subtitle = onBack ? 'Retour a la vue semaine' : 'Coach entrainement';

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      className="pfl-header"
    >
      <Toolbar className="pfl-header-toolbar" disableGutters>
        <Box className="pfl-header-brand">
          {onBack ? (
            <IconButton
              onClick={onBack}
              size="small"
              className="pfl-header-icon"
              aria-label="Retour au programme"
            >
              <ArrowLeft size={19} strokeWidth={2.4} />
            </IconButton>
          ) : (
            <Box 
              className="pfl-header-logo"
            >
              <img 
                src={getAssetPath('/logo.png')} 
                alt="Project Fat Loss" 
              />
            </Box>
          )}

          <Box className="pfl-header-copy">
            <Typography component="p" className="pfl-header-title">
              {title}
            </Typography>
            <Typography component="p" className="pfl-header-subtitle">
              {subtitle}
            </Typography>
          </Box>
        </Box>

        <Box className="pfl-header-actions">
          {onToggleTheme && (
            <IconButton
              onClick={onToggleTheme}
              size="small"
              className="pfl-header-icon"
              aria-label={darkTheme ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {darkTheme ? <Sun size={19} strokeWidth={2.25} /> : <Moon size={19} strokeWidth={2.25} />}
            </IconButton>
          )}
          {onNotificationSettings && (
            <IconButton
              onClick={onNotificationSettings}
              size="small"
              className="pfl-header-icon"
              aria-label="Parametres de notification"
            >
              <Bell size={19} strokeWidth={2.25} />
            </IconButton>
          )}
          {onAccountClick && (
            <IconButton
              onClick={onAccountClick}
              size="small"
              className={`pfl-header-icon${user ? ' pfl-header-icon--auth' : ''}`}
              aria-label={user ? 'Se deconnecter' : 'Se connecter'}
            >
              {user ? <LogOut size={19} strokeWidth={2.25} /> : <User size={19} strokeWidth={2.25} />}
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
