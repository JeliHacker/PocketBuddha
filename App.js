import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const App = () => {
  const [isMeditating, setIsMeditating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const intervalRef = useRef(null); // Reference to the timer interval

  // Initialize sound objects as null
  const gongSoundRef = useRef(null); // Ref for the gong sound
  const musicSoundRef = useRef(null); // Ref for the background music

  // Function to load and play a sound file
  const playSound = async (filePath, isLooping = false) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        filePath,
        { shouldPlay: true, isLooping }
      );
      await sound.playAsync();
      return sound;
    } catch (error) {
      console.log('Error playing sound:', error);
      return null;
    }
  };

  // Function to start the meditation session
  const startMeditation = async () => {
    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Play starting gong sound
    gongSoundRef.current = await playSound(require('./assets/gong.mp3'));
    
    // Start playing background music
    musicSoundRef.current = await playSound(require('./assets/meditation_music.mp3'), true);

    setIsMeditating(true); // Set meditation state to true
    setIsPaused(false); // Ensure the meditation is not paused

    // Set up countdown timer
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(intervalRef.current); // Stop timer at the end
          handleMeditationEnd(); // Handle meditation end logic
          return 600; // Reset timer to 10 minutes
        }
        return prev - 1; // Decrease timer
      });
    }, 1000);
  };

  // Function to handle the end of meditation
  const handleMeditationEnd = async () => {
    // Play ending gong sound
    await playSound(require('./assets/gong.mp3'));

    // Stop music if it's playing
    if (musicSoundRef.current) {
      try {
        await musicSoundRef.current.stopAsync();
        await musicSoundRef.current.unloadAsync();
      } catch (error) {
        console.log('Error stopping music:', error);
      }
      musicSoundRef.current = null; // Reset the music state
    }

    // Reset meditation state
    setIsMeditating(false);
    setIsPaused(false); // Ensure paused state is reset
  };

  // Function to restart the meditation session
  const restartMeditation = () => {
    setTimeLeft(600); // Reset the timer
    startMeditation(); // Start the meditation session again
  };

  // Function to pause the meditation session
  const pauseMeditation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Stop the timer
    }
    if (musicSoundRef.current) {
      musicSoundRef.current.pauseAsync(); // Pause the music
    }
    setIsPaused(true); // Set paused state to true
  };

  // Function to resume the meditation session
  const resumeMeditation = () => {
    setIsPaused(false); // Reset paused state

    // Resume playing background music
    if (musicSoundRef.current) {
      musicSoundRef.current.playAsync();
    }

    // Resume countdown timer
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(intervalRef.current); // Stop timer at the end
          handleMeditationEnd(); // Handle meditation end logic
          return 600; // Reset timer to 10 minutes
        }
        return prev - 1; // Decrease timer
      });
    }, 1000);
  };

  // Clean up sound objects on component unmount
  useEffect(() => {
    return () => {
      if (gongSoundRef.current) {
        gongSoundRef.current.unloadAsync(); // Unload gong sound
      }
      if (musicSoundRef.current) {
        musicSoundRef.current.unloadAsync(); // Unload music sound
      }
      clearInterval(intervalRef.current); // Clear interval on unmount
    };
  }, []);

  // Format the timer for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render the UI components
  return (
    <View style={styles.container}>
      {!isMeditating ? (
        <Button title="Start" onPress={startMeditation} />
      ) : (
        <>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          {!isPaused ? (
            <Button title="Pause" onPress={pauseMeditation} />
          ) : (
            <>
              <Button title="Resume" onPress={resumeMeditation} />
              <Button title="Restart" onPress={restartMeditation} />
            </>
          )}
        </>
      )}
    </View>
  );
};

// Styles for the app
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  timer: {
    fontSize: 48,
    marginVertical: 20,
    color: '#333',
  },
});

export default App;
