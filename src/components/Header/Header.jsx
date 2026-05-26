import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Box,
  Typography
} from '@mui/material';
import { ArrowLeft, Bell } from 'lucide-react';
import './Header.css';
import { getAssetPath } from '../../utils/paths';

export default function Header({ onNotificationSettings, onBack }) {
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}
