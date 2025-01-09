import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function ChatScreen() {
  const [frameIndex, setFrameIndex] = useState(0);

  // Array of idle frames
  const frames = [
    require('../../assets/characters/MaleAdventurer/idle/frame2.png'),
    require('../../assets/characters/MaleAdventurer/idle/frame4.png'),
    require('../../assets/characters/MaleAdventurer/idle/frame5.png'),  
  ];

  // Idle animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prevIndex) => (prevIndex + 1) % frames.length);
    }, 300); // Change frame every 300ms
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={frames[frameIndex]}
        style={styles.character}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  character: {
    width: 150,
    height: 150,
  },
});
