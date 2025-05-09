import React, { useState, useEffect } from 'react';
import { IconButton, Box, Fade, Card, CardContent, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import './ExerciseCarousel.css';

const HomeCarousel = ({ days, current, setCurrent, fatBurnerMode }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const daysPerPage = 3;
  const totalPages = Math.ceil(days.length / daysPerPage);
  const [currentPage, setCurrentPage] = useState(Math.floor(current / daysPerPage));

  useEffect(() => {
    setCurrentPage(Math.floor(current / daysPerPage));
  }, [current]);

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

  const getCurrentDays = () => {
    const startIndex = currentPage * daysPerPage;
    return days.slice(startIndex, startIndex + daysPerPage);
  };

  return (
    <div className="exercise-carousel home-carousel">
      <Box display="flex" alignItems="center" className="carousel-container">
        <IconButton 
          onClick={handlePrevPage}
          className="carousel-arrow prev"
          disabled={isAnimating}
          aria-label="Jours précédents"
        >
          <ArrowBackIcon />
        </IconButton>

        <Fade in={!isAnimating} timeout={300}>
          <div className="carousel-items">
            {getCurrentDays().map((day, i) => {
              const dayIndex = currentPage * daysPerPage + i;
              const isActive = dayIndex === current;
              return (
                <Card
                  key={i}
                  className={`carousel-item ${isAnimating ? 'animating' : ''} ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrent(dayIndex)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    '&:hover': {
                      transform: isActive ? 'scale(1.05)' : 'scale(1.02)'
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <FitnessCenterIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Jour {dayIndex + 1}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {day.title}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {day.exercises.length} exercices
                    </Typography>
                    {fatBurnerMode && (
                      <Box
                        mt={1}
                        p={0.5}
                        bgcolor="error.main"
                        color="white"
                        borderRadius={1}
                        textAlign="center"
                      >
                        Mode Fat Burner
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Fade>

        <IconButton 
          onClick={handleNextPage}
          className="carousel-arrow next"
          disabled={isAnimating}
          aria-label="Jours suivants"
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

export default HomeCarousel;