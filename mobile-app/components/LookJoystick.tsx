import React from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 45;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

interface LookJoystickProps {
  onMove: (x: number, y: number) => void;
  onRelease: () => void;
  gestureRef?: React.MutableRefObject<any>;
  simultaneousRef?: React.MutableRefObject<any>;
}

export function LookJoystick({
  onMove,
  onRelease,
  gestureRef,
  simultaneousRef,
}: LookJoystickProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  let pan = Gesture.Pan()
    .onUpdate((e) => {
      let dx = e.translationX;
      let dy = e.translationY;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_DISTANCE) {
        dx = (dx / dist) * MAX_DISTANCE;
        dy = (dy / dist) * MAX_DISTANCE;
      }

      translateX.value = dx;
      translateY.value = dy;

      runOnJS(onMove)(dx / MAX_DISTANCE, dy / MAX_DISTANCE);
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      runOnJS(onRelease)();
    });

  // Ref'leri bağla - simultaneous gesture için
  if (gestureRef) {
    pan = pan.withRef(gestureRef);
  }
  if (simultaneousRef) {
    pan = pan.simultaneousWithExternalGesture(simultaneousRef);
  }

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View style={styles.base}>
          {/* Arrows */}
          <View style={[styles.arrow, styles.arrowUp]}>
            <ChevronUp size={20} color="rgba(251,191,36,0.3)" />
          </View>
          <View style={[styles.arrow, styles.arrowDown]}>
            <ChevronDown size={20} color="rgba(251,191,36,0.3)" />
          </View>
          <View style={[styles.arrow, styles.arrowLeft]}>
            <ChevronLeft size={20} color="rgba(251,191,36,0.3)" />
          </View>
          <View style={[styles.arrow, styles.arrowRight]}>
            <ChevronRight size={20} color="rgba(251,191,36,0.3)" />
          </View>

          {/* Center Knob */}
          <Animated.View style={[styles.knob, knobStyle]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    right: 40,
    zIndex: 15,
  },
  base: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: "rgba(251,191,36,0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(251,191,36,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "rgba(251,191,36,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(251,191,36,0.4)",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  arrow: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowUp: { top: 4 },
  arrowDown: { bottom: 4 },
  arrowLeft: { left: 4 },
  arrowRight: { right: 4 },
});