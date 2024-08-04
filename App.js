// App.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const App = () => {
  const [isMeditating, setIsMeditating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [sound, setSound] = useState(null); // Sound object for the gong
  const [music, setMusic] = useState(null); // Sound object for background music
  const intervalRef = useRef(null); // Reference to the timer interval

  // Function to play a sound file
  const playSound = async (file) => {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  // Function to start the meditation session
  const startMeditation = async () => {
    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Play starting gong sound
    await playSound(require('./assets/gong.mp3'));

    // Start playing background music
    try {
      const { sound: musicSound } = await Audio.Sound.createAsync(
        require('./assets/meditation_music.mp3'), // Correct file path
        { shouldPlay: true, isLooping: true } // Options to autoplay and loop the music
      );
      setMusic(musicSound);
    } catch (error) {
      console.log('Error playing music:', error);
    }

    setIsMeditating(true); // Set meditation state to true

    // Set up countdown timer
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(intervalRef.current); // Stop timer at the end
          playSound('./assets/gong.mp3'); // Play ending gong sound
          if (music) {
            music.stopAsync(); // Stop music
          }
          setIsMeditating(false); // Reset meditation state
          return 600; // Reset timer to 10 minutes
        }
        return prev - 1; // Decrease timer
      });
    }, 1000);
  };

  // Function to restart the meditation session
  const restartMeditation = () => {
    setTimeLeft(600); // Reset the timer
    startMeditation(); // Start the meditation session again
  };

  // Clean up sound objects on component unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync(); // Unload gong sound
      }
      if (music) {
        music.unloadAsync(); // Unload music sound
      }
      clearInterval(intervalRef.current); // Clear interval on unmount
    };
  }, [sound, music]);

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
          <Button title="Restart" onPress={restartMeditation} />
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
