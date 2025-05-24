import React, { useState } from 'react';
import { Button } from '@mui/material';
import { YouTube as YouTubeIcon } from '@mui/icons-material';
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
        size="small"
        sx={{ ml: 1 }}
        startIcon={<YouTubeIcon />}
        onClick={handleYouTubeOpen}
      >
        Voir sur YouTube
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