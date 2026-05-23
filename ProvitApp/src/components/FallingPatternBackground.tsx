import React, {
  useEffect,
  useRef,
} from 'react';

import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

const { width, height } =
  Dimensions.get('window');

interface Props {
  color?: string;
}

export const FallingPatternBackground: React.FC<
  Props
> = ({
  color = '#2563eb',
}) => {
  const particleCount = 75;

  const particles = useRef(
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      length: 80 + Math.random() * 180, // Random vertical length
      width: Math.random() > 0.8 ? 2 : 1, // Slight mix of thin and thick lines
      opacity: 0.1 + Math.random() * 0.3,
      duration: 3000 + Math.random() * 7000,
      delay: Math.random() * 5000,
    }))
  ).current;

  const animations =
    useRef(
      particles.map(
        () =>
          new Animated.Value(
            -height
          )
      )
    ).current;

  useEffect(() => {
    animations.forEach(
      (anim, index) => {
        const p = particles[index];
        
        Animated.loop(
          Animated.timing(
            anim,
            {
              toValue:
                height +
                300,

              duration:
                p.duration,

              delay: 
                p.delay,

              useNativeDriver: true,
            }
          )
        ).start();
      }
    );
  }, []);

  return (
    <View
      pointerEvents="none"
      style={
        StyleSheet.absoluteFill
      }
    >
      {particles.map((p, index) => (
        <Animated.View
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: 0,
            width: p.width,
            height: p.length,
            backgroundColor: color,
            opacity: p.opacity,
            transform: [
              {
                translateY: animations[index]
              }
            ]
          }}
        />
      ))}

      {/* OVERLAY */}
      <View
        style={
          styles.overlay
        }
      />

      {/* VIGNETTE */}
      <View
        style={
          styles.vignette
        }
      />
    </View>
  );
};

const styles =
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFill,

      backgroundColor:
        'rgba(0,0,0,0.55)',
    },

    vignette: {
      ...StyleSheet.absoluteFill,

      backgroundColor:
        'transparent',

      borderRadius: 999,

      shadowColor:
        '#000',

      shadowOpacity: 0.9,

      shadowRadius: 80,
    },
  });