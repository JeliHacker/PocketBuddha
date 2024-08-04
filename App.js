// App.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

// Main App Component
const App = () => {
  // State for meditation status and timer
  const [isMeditating, setIsMeditating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Reference for interval control
  const intervalRef = useRef(null);

  // Sound object
  const [sound, setSound] = useState();

  // Function to play sound
  const playSound = async (file) => {
    print("playSound");
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/gong.mp3') // Replace with your gong sound file
    );
    setSound(sound);
    await sound.playAsync();
    print("sound.playAysnc()");
  };

  // Function to start meditation
  const startMeditation = async () => {
    // Play starting gong sound
    await playSound('./assets/gong.mp3');

    // Start the meditation timer
    setIsMeditating(true);

    // Start background music
    const { sound: music } = await Audio.Sound.createAsync(
      require('./assets/meditation_music.mp3') // Replace with your music file
    );
    await music.playAsync();
    
    setSound(music);

    // Set up countdown timer
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(intervalRef.current); // Clear interval when time is up
          playSound('./assets/gong.mp3'); // Play ending gong sound
          setIsMeditating(false); // Reset meditation status
          return 600; // Reset timer to 10 minutes
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Function to restart meditation
  const restartMeditation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear existing interval
    }
    setTimeLeft(600); // Reset timer
    startMeditation(); // Start meditation again
  };

  // Clean up sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync(); // Unload sound
      }
    };
  }, [sound]);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render UI components
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
  button: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default App;
