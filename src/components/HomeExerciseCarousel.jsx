import React, { useState } from 'react';
import { Box, IconButton, Fade, Card, CardContent, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import YouTubeButton from './YouTubeButton';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import './ExerciseCarousel.css';

const HomeExerciseCarousel = ({ exercises }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const exercisesPerPage = 3;
  const totalPages = Math.ceil(exercises.length / exercisesPerPage);

  const handlePrevPage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextPage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  React.useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const getCurrentExercises = () => {
    const startIndex = currentPage * exercisesPerPage;
    return exercises.slice(startIndex, startIndex + exercisesPerPage);
  };

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return <div>Aucun exercice pour ce jour.</div>;
  }

  return (
    <div className="exercise-carousel home-carousel">
      <Box display="flex" alignItems="center" className="carousel-container">
        <IconButton 
          onClick={handlePrevPage}
          className="carousel-arrow prev"
          disabled={isAnimating}
          aria-label="Exercices précédents"
        >
          <ArrowBackIcon />
        </IconButton>

        <Fade in={!isAnimating} timeout={300}>
          <div className="carousel-items">
            {getCurrentExercises().map((exo, i) => (
              <Card className={`carousel-item${isAnimating ? ' animating' : ''}`} key={i}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <FitnessCenterIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">{exo.name}</Typography>
                  </Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {exo.sets}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    {exo.equip}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {exo.desc}
                  </Typography>
                  <YouTubeButton exercise={exo} />
                </CardContent>
              </Card>
            ))}
          </div>
        </Fade>

        <IconButton 
          onClick={handleNextPage}
          className="carousel-arrow next"
          disabled={isAnimating}
          aria-label="Exercices suivants"
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>
      <div className="carousel-dots">
        {Array(totalPages).fill().map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentPage ? 'active' : ''}`}
            onClick={() => !isAnimating && setCurrentPage(index)}
            disabled={isAnimating}
            aria-label={`Page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeExerciseCarousel;
