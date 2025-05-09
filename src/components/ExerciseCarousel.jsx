import React, { useState, useEffect } from 'react';
import { IconButton, Box, Fade } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './ExerciseCarousel.css';

const ExerciseCarousel = ({ exercises, fatBurnerMode }) => {
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

  const getCurrentExercises = () => {
    const startIndex = currentPage * exercisesPerPage;
    return exercises
      .slice(startIndex, startIndex + exercisesPerPage)
      .map((exo, i) => ({
        ...exo,
        nextExercise:
          startIndex + i === exercises.length - 1
            ? null
            : exercises[startIndex + i + 1],
      }));
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <div className="exercise-carousel">
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
              <div
                className={`carousel-item ${isAnimating ? 'animating' : ''}`}
                key={i}
              >
                <div className="exo-header">
                  <span className="exo-title">{exo.name}</span>
                  <span className="exo-series">
                    {fatBurnerMode
                      ? `${Math.max(1, Math.floor(parseInt(exo.sets) / 2))} séries`
                      : exo.sets}
                  </span>
                </div>
                <div className="exo-equip">Équipement: {exo.equip}</div>
                <div className="exo-desc">{exo.desc}</div>
                {exo.nextExercise && (
                  <div className="next-preview">
                    Prochain : {exo.nextExercise.name}
                  </div>
                )}
              </div>
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
        {Array(totalPages)
          .fill()
          .map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${
                index === currentPage ? 'active' : ''
              }`}
              onClick={() => !isAnimating && setCurrentPage(index)}
              disabled={isAnimating}
              aria-label={`Page ${index + 1}`}
            />
          ))}
      </div>
    </div>
  );
};

export default ExerciseCarousel;