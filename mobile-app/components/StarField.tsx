import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber/native";
import { Color, BackSide, DataTexture, RGBAFormat, UnsignedByteType } from "three";

const SIZE = 64;
function createStarTexture() {
  const data = new Uint8Array(SIZE * SIZE * 4);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = cx - 2;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = (y * SIZE + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      if (dist >= 1) {
        data[i + 3] = 0;
      } else {
        const falloff = 1 - dist * dist;
        data[i + 3] = Math.round(255 * falloff);
      }
    }
  }
  const tex = new DataTexture(data, SIZE, SIZE, RGBAFormat, UnsignedByteType);
  tex.needsUpdate = true;
  return tex;
}

const starTexture = createStarTexture();

export function StarField({ count = 3000 }: { count?: number }) {
  const pointsRef = useRef<any>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 600;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 600;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 600;
    }
    return [pos];
  }, [count]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.00005;
      pointsRef.current.rotation.x += 0.00003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={starTexture}
        size={1.5}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.9}
        alphaTest={0.02}
        depthWrite={false}
      />
    </points>
  );
}

export function NebulaCloud() {
  const groupRef = useRef<any>(null);

  const clouds = useMemo(() => {
    const items = [];
    for (let i = 0; i < 12; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 300,
          (Math.random() - 0.5) * 300,
          (Math.random() - 0.5) * 300,
        ] as [number, number, number],
        scale: Math.random() * 40 + 20,
        color: new Color().setHSL(Math.random() * 0.15 + 0.7, 0.6, 0.15),
        opacity: Math.random() * 0.08 + 0.02,
      });
    }
    return items;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.00008;
    }
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.position}>
          <sphereGeometry args={[cloud.scale, 12, 12]} />
          <meshBasicMaterial
            color={cloud.color}
            transparent
            opacity={cloud.opacity}
            depthWrite={false}
            side={BackSide}
          />
        </mesh>
      ))}
    </group>
  );
}
