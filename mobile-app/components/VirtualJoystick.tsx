import React from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 50;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onRelease: () => void;
  gestureRef?: React.MutableRefObject<any>;
  simultaneousRef?: React.MutableRefObject<any>;
}

export function VirtualJoystick({
  onMove,
  onRelease,
  gestureRef,
  simultaneousRef,
}: VirtualJoystickProps) {
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
    left: 40,
    zIndex: 15,
  },
  base: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: "rgba(251,191,36,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(251,191,36,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "rgba(251,191,36,0.25)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.4)",
  },
});