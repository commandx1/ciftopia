import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber/native'
import { DoubleSide, Texture, Quaternion, Euler } from 'three'
import { loadAsync } from 'expo-three'

interface SpaceObjectProps {
  objectId: string
  position: [number, number, number]
  imageUrl: any
  size: number
  rotationSpeed?: number
  /** Z ekseninde başlangıç açısı (radyan). Örn. UFO için Math.PI ile ters çevirme. */
  rotationOffsetZ?: number
  floatSpeed?: number
  floatAmplitude?: number
}

export function SpaceObject({
  objectId,
  position,
  imageUrl,
  size,
  rotationSpeed = 0.2,
  rotationOffsetZ = 0,
  floatSpeed = 0.5,
  floatAmplitude = 0.3,
}: SpaceObjectProps) {
  const meshRef = useRef<any>(null)
  const [texture, setTexture] = useState<any | null>(null)
  const quatOffsetZ = useMemo(
    () => (rotationOffsetZ !== 0 ? new Quaternion().setFromEuler(new Euler(0, 0, rotationOffsetZ)) : null),
    [rotationOffsetZ]
  )
  const initialY = useMemo(() => position[1], [position])
  const phaseOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  useEffect(() => {
    let isMounted = true
    const loadTexture = async () => {
      try {
        const tex = await loadAsync(imageUrl)
        if (isMounted) {
          if (tex instanceof Texture) {
            tex.flipY = false
          }
          setTexture(tex)
        }
      } catch (err) {
        console.error('3D Doku yükleme hatası:', err)
      }
    }
    loadTexture()
    return () => {
      isMounted = false
    }
  }, [imageUrl])

  useFrame((state: any) => {
    if (meshRef.current && texture) {
      meshRef.current.quaternion.copy(state.camera.quaternion)
      if (quatOffsetZ) meshRef.current.quaternion.multiply(quatOffsetZ)
      meshRef.current.rotateZ(rotationSpeed * 0.01)

      meshRef.current.position.y =
        initialY + Math.sin(state.clock.elapsedTime * floatSpeed + phaseOffset) * floatAmplitude
    }
  })

  if (!texture) return null

  return (
    <mesh ref={meshRef} position={position} userData={{ objectId }}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.05} side={DoubleSide} depthWrite={false} />
    </mesh>
  )
}