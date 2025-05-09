import React, { useState } from 'react';
import './YouTubeButton.css';

const YouTubeButton = ({ exerciseName }) => {
  const handleSearch = () => {
    const searchQuery = encodeURIComponent(`exercice ${exerciseName} tutoriel`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
  };

  return (
    <button className="youtube-btn" onClick={handleSearch}>
      <img 
        src="/icons/youtube.svg" 
        alt="YouTube" 
        width="24" 
        height="24"
      />
      Voir tutoriel
    </button>
  );
};

export default YouTubeButton;