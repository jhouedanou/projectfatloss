import React, { useState } from 'react';
import { Button } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import './YouTubeButton.css';

function YouTubeButton({ exercise, exerciseName }) {
  // Accepte soit exerciseName (string), soit exercise (objet)
  const name = exerciseName || (exercise && exercise.name);
  const [showModal, setShowModal] = useState(false);
  if (!name) return null;
  const searchQuery = encodeURIComponent(`exercice ${name} tutoriel`);
  const embedUrl = `https://www.youtube.com/embed?listType=search&list=${searchQuery}`;
  const searchPageUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

  const handleYouTubeOpen = () => {
    // Ouvrir dans une popup au lieu d'un nouvel onglet
    const popup = window.open(
      searchPageUrl, 
      'youtube_popup',
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    // Focus sur la popup si elle est bloquée
    if (popup) {
      popup.focus();
    }
  };

  return (
    <>
      {/* <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<YouTubeIcon />}
        onClick={() => setShowModal(true)}
      >
        Tutoriel
      </Button> */}
      <Button
        variant="outlined"
        color="error"
        size="medium"
        sx={{ 
          borderColor: 'rgba(240, 61, 50, 0.3)', 
          color: '#fff', 
          borderRadius: '12px',
          background: 'rgba(240, 61, 50, 0.05)',
          textTransform: 'uppercase',
          fontWeight: 800,
          fontSize: '0.75rem',
          letterSpacing: '0.5px',
          padding: '8px 16px',
          '&:hover': { 
            borderColor: '#F03D32', 
            backgroundColor: '#F03D32',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(240, 61, 50, 0.3)',
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.25s ease'
        }}
        startIcon={<YouTubeIcon sx={{ fontSize: '22px !important', color: '#F03D32' }} />}
        onClick={handleYouTubeOpen}
      >
        Tutoriel
      </Button>
      {showModal && (
        <div className="youtube-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="youtube-modal" onClick={e => e.stopPropagation()}>
            <div className="youtube-modal-header">
              <span>Tutoriels pour "{name}"</span>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="youtube-modal-body">
              <iframe
                src={embedUrl}
                title={`Tutoriels pour ${name}`}
                width="100%"
                height="400"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default YouTubeButton;