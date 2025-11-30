import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * ARRAY of animal image file paths (transparent PNGs).
*/
const animalImages = ["/deer.png", "/fox.png", "/owl.png"];
const cameraSound = 'camera_click.mp3';

/**
 * Helper to get a random index, trying to avoid repeating
 * the same animal twice in a row.
 */
function getRandomIndex(max, exclude) {
  let idx = Math.floor(Math.random() * max);
  if (max > 1 && idx === exclude) {
    idx = (idx + 1) % max;
  }
  return idx;
}

function App() {
  // SCORE STATE
  const [score, setScore] = useState(0);

  // ROUND STATE 
  const [round, setRound] = useState(1);

  // Which animal image are we using this round?
  const [animalIndex, setAnimalIndex] = useState(() =>
    Math.floor(Math.random() * animalImages.length)
  );

  // Horizontal position of the animal (in % from the left)
  const [position, setPosition] = useState(-20); // start off left side

  // To prevent multiple scores per round 
  const [hasTakenPhotoThisRound, setHasTakenPhotoThisRound] = useState(false);

  // For sound effect
  const cameraSoundRef = useRef(null);

  /**
   * useEffect #1
   * Load the camera sound once when the component mounts.
   */
  useEffect(() => {
    cameraSoundRef.current = new Audio("/camera_click.mp3");
  }, []);

  /**
   * useEffect #2
   * Move the animal across the screen.
   *
   * Every time the "round" changes, we restart this effect,
   * which resets the interval.
   */
  useEffect(() => {
    const speed = 0.3; // how much the position changes each tick (in %)
    const intervalMs = 16; // ~60 frames per second

    const intervalId = setInterval(() => {
      setPosition((prev) => prev + speed);
    }, intervalMs);

    // CLEANUP: clear the interval when the component unmounts
    // or before re-running this effect.
    return () => clearInterval(intervalId);
  }, [round]);

  /**
   * useEffect #3
   * Watch the position. When the animal goes past the right side,
   * we count that as a completed round and start a new one.
   */
  useEffect(() => {
    if (position >= 100) {
      // Completed a walk across the screen -> new round
      setRound((prev) => prev + 1);
      setPosition(-20); // reset to left side
      setHasTakenPhotoThisRound(false);
      setAnimalIndex((prevIndex) =>
        getRandomIndex(animalImages.length, prevIndex)
      );
    }
  }, [position]);

  /**
   * Called when the player clicks the camera button.
   */
  const handleTakePhoto = () => {
    // Play camera sound
    if (cameraSoundRef.current) {
      cameraSoundRef.current.currentTime = 0;
      cameraSoundRef.current.play();
    }

    // Award a point ONLY once per round and only if the animal is visible
    if (!hasTakenPhotoThisRound && position > 0 && position < 90) {
      setScore((prev) => prev + 1);
      setHasTakenPhotoThisRound(true);
    }
  };

  const currentAnimal = animalImages[animalIndex];

  return (
    <div className="game-root">
      <div className="game-overlay">
        <header className="game-header">
          <h1>Wildlife Photo Shoot</h1>
          <div className="game-stats">
            {/* rounds completed = current round - 1 */}
            <span>Score: {score}</span>
            <span>Rounds: {round - 1}</span>
          </div>
        </header>

        <main className="game-area">
          <div className="animal-track">
            <img
              src={currentAnimal}
              alt="Animal walking"
              className="animal"
              style={{ left: `${position}%` }}
            />
          </div>
        </main>

        <footer className="controls">
          <button onClick={handleTakePhoto} className="camera-button">
            Take Picture 
          </button>
          <p className="hint">
            A round is counted whenever the animal walks from left to right
            across the screen. Try to take a picture while it&apos;s visible!
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;