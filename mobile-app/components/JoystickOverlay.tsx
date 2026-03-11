import React, { useRef, useCallback, useState } from 'react'
import { View, StyleSheet, Dimensions, Platform } from 'react-native'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

const JOYSTICK_SIZE = 120
const MOVE_KNOB_SIZE = 50
const LOOK_KNOB_SIZE = 45
const MOVE_MAX = (JOYSTICK_SIZE - MOVE_KNOB_SIZE) / 2
const LOOK_MAX = (JOYSTICK_SIZE - LOOK_KNOB_SIZE) / 2

// Joystick merkezleri (ekran koordinatları)
const MOVE_CENTER = { x: 40 + JOYSTICK_SIZE / 2, y: SCREEN_H - 60 - JOYSTICK_SIZE / 2 }
const LOOK_CENTER = { x: SCREEN_W - 40 - JOYSTICK_SIZE / 2, y: SCREEN_H - 60 - JOYSTICK_SIZE / 2 }
const TOUCH_RADIUS = JOYSTICK_SIZE * 0.85

interface JoystickOverlayProps {
  onMoveChange: (x: number, y: number) => void
  onLookChange: (x: number, y: number) => void
  onTap?: (x: number, y: number) => void
}

type TrackedTouch = {
  side: 'left' | 'right' | 'none'
  startX: number
  startY: number
  moved: boolean
}

function whichJoystick(px: number, py: number): 'left' | 'right' | 'none' {
  const dMove = Math.sqrt((px - MOVE_CENTER.x) ** 2 + (py - MOVE_CENTER.y) ** 2)
  if (dMove <= TOUCH_RADIUS) return 'left'

  const dLook = Math.sqrt((px - LOOK_CENTER.x) ** 2 + (py - LOOK_CENTER.y) ** 2)
  if (dLook <= TOUCH_RADIUS) return 'right'

  return 'none'
}

function clamp(dx: number, dy: number, max: number) {
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist > max) {
    return { cx: (dx / dist) * max, cy: (dy / dist) * max }
  }
  return { cx: dx, cy: dy }
}

const isWeb = Platform.OS === 'web'

export function JoystickOverlay({ onMoveChange, onLookChange, onTap }: JoystickOverlayProps) {
  const touchMap = useRef<Map<number, TrackedTouch>>(new Map())
  const moveKnobRef = useRef<View>(null)
  const lookKnobRef = useRef<View>(null)
  const [moveOffset, setMoveOffset] = useState({ x: 0, y: 0 })
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 })

  const updateKnob = useCallback(
    (side: 'left' | 'right', dx: number, dy: number) => {
      if (side === 'left') {
        const { cx, cy } = clamp(dx, dy, MOVE_MAX)
        if (isWeb) {
          setMoveOffset({ x: cx, y: cy })
        } else {
          moveKnobRef.current?.setNativeProps?.({
            style: { transform: [{ translateX: cx }, { translateY: cy }] }
          })
        }
        onMoveChange(cx / MOVE_MAX, cy / MOVE_MAX)
      } else {
        const { cx, cy } = clamp(dx, dy, LOOK_MAX)
        if (isWeb) {
          setLookOffset({ x: cx, y: cy })
        } else {
          lookKnobRef.current?.setNativeProps?.({
            style: { transform: [{ translateX: cx }, { translateY: cy }] }
          })
        }
        onLookChange(cx / LOOK_MAX, cy / LOOK_MAX)
      }
    },
    [onMoveChange, onLookChange]
  )

  const resetKnob = useCallback(
    (side: 'left' | 'right') => {
      if (side === 'left') {
        if (isWeb) {
          setMoveOffset({ x: 0, y: 0 })
        } else {
          moveKnobRef.current?.setNativeProps?.({
            style: { transform: [{ translateX: 0 }, { translateY: 0 }] }
          })
        }
        onMoveChange(0, 0)
      } else {
        if (isWeb) {
          setLookOffset({ x: 0, y: 0 })
        } else {
          lookKnobRef.current?.setNativeProps?.({
            style: { transform: [{ translateX: 0 }, { translateY: 0 }] }
          })
        }
        onLookChange(0, 0)
      }
    },
    [onMoveChange, onLookChange]
  )

  const handleTouchStart = useCallback((e: any) => {
    const touches = e.nativeEvent.changedTouches || [e.nativeEvent]
    for (let i = 0; i < touches.length; i++) {
      const t = touches[i]
      const id = t.identifier ?? 0
      if (!touchMap.current.has(id)) {
        touchMap.current.set(id, {
          side: whichJoystick(t.pageX, t.pageY),
          startX: t.pageX,
          startY: t.pageY,
          moved: false
        })
      }
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: any) => {
      const touches = e.nativeEvent.touches || [e.nativeEvent]
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i]
        const info = touchMap.current.get(t.identifier ?? 0)
        if (info && info.side !== 'none') {
          const dx = t.pageX - info.startX
          const dy = t.pageY - info.startY
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) info.moved = true
          updateKnob(info.side, dx, dy)
        }
      }
    },
    [updateKnob]
  )

  const handleTouchEnd = useCallback(
    (e: any) => {
      const ended = e.nativeEvent.changedTouches || [e.nativeEvent]
      for (let i = 0; i < ended.length; i++) {
        const t = ended[i]
        const id = t.identifier ?? 0
        const info = touchMap.current.get(id)
        if (info) {
          if (info.side !== 'none') {
            resetKnob(info.side)
          } else if (!info.moved && onTap) {
            // Joystick dışına dokunuldu ve hareket etmedi = tap
            onTap(t.pageX, t.pageY)
          }
          touchMap.current.delete(id)
        }
      }
    },
    [resetKnob, onTap]
  )

  return (
    <View
      style={styles.overlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Sol Joystick (Hareket) */}
      <View style={styles.moveContainer} pointerEvents='none'>
        <View style={styles.moveBase}>
          <View ref={moveKnobRef} style={styles.moveKnob} />
        </View>
      </View>

      {/* Sağ Joystick (Bakış) */}
      <View style={styles.lookContainer} pointerEvents='none'>
        <View style={styles.lookBase}>
          <View style={[styles.arrow, styles.arrowUp]}>
            <ChevronUp size={20} color='rgba(251,191,36,0.3)' />
          </View>
          <View style={[styles.arrow, styles.arrowDown]}>
            <ChevronDown size={20} color='rgba(251,191,36,0.3)' />
          </View>
          <View style={[styles.arrow, styles.arrowLeft]}>
            <ChevronLeft size={20} color='rgba(251,191,36,0.3)' />
          </View>
          <View style={[styles.arrow, styles.arrowRight]}>
            <ChevronRight size={20} color='rgba(251,191,36,0.3)' />
          </View>
          <View ref={lookKnobRef} style={styles.lookKnob} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15
  },
  moveContainer: {
    position: 'absolute',
    bottom: 60,
    left: 40
  },
  moveBase: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(251,191,36,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  moveKnob: {
    width: MOVE_KNOB_SIZE,
    height: MOVE_KNOB_SIZE,
    borderRadius: MOVE_KNOB_SIZE / 2,
    backgroundColor: 'rgba(251,191,36,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)'
  },
  lookContainer: {
    position: 'absolute',
    bottom: 60,
    right: 40
  },
  lookBase: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(251,191,36,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(251,191,36,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  lookKnob: {
    width: LOOK_KNOB_SIZE,
    height: LOOK_KNOB_SIZE,
    borderRadius: LOOK_KNOB_SIZE / 2,
    backgroundColor: 'rgba(251,191,36,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(251,191,36,0.4)',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5
  },
  arrow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowUp: { top: 4 },
  arrowDown: { bottom: 4 },
  arrowLeft: { left: 4 },
  arrowRight: { right: 4 }
})
