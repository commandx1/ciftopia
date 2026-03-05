import React, { useMemo, useState, useRef, useCallback, useEffect, Fragment } from 'react'
import { View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Canvas, useFrame, useThree } from '@react-three/fiber/native'
import { Vector3, Vector2, Euler, Raycaster } from 'three'
import { SpaceObject } from '../../components/SpaceObject'
import { StarField, NebulaCloud } from '../../components/StarField'
import { JoystickOverlay } from '../../components/JoystickOverlay'
import { SpaceExplorerModal } from '../../components/space/SpaceExplorerModal'
import { SpaceIntroAnimation } from '../../components/space/SpaceIntroAnimation'
import { Text } from '../../components/ui/Text'
import { ArrowLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'
import { Audio } from 'expo-av'
import { dashboardApi } from '../../api/dashboard'
import { useAuth } from '../../context/AuthContext'
import { getSpaceAsset, SpaceItemType } from '../../constants/space-assets'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

interface SpaceItem {
  id: string
  type: SpaceItemType
  level: number
  position: [number, number, number]
  imageUrl: any
  size: number
  rotationSpeed: number
  /** Z ekseninde başlangıç rotasyonu (radyan). UFO ters görünüyorsa Math.PI */
  rotationOffsetZ?: number
  floatSpeed: number
  floatAmplitude: number
}

function generateRandomPosition(range: number, minDistance = 15): [number, number, number] {
  return [
    (Math.random() - 0.5) * range + (Math.random() > 0.5 ? minDistance : -minDistance),
    (Math.random() - 0.5) * range,
    (Math.random() - 0.5) * range + (Math.random() > 0.5 ? minDistance : -minDistance)
  ]
}

function TouchLookControls({ lookInput }: { lookInput: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree()
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'))
  const sensitivity = 0.01

  useFrame(() => {
    const { x, y } = lookInput.current
    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
      euler.current.setFromQuaternion(camera.quaternion)
      euler.current.y -= x * sensitivity
      euler.current.x -= y * sensitivity
      euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x))
      camera.quaternion.setFromEuler(euler.current)
    }
  })

  return null
}

const MIN_BOUNDARY = 200
const MAX_BOUNDARY = 360
/** Nesne sayısına sqrt ile bağlı büyüme: aşırı büyüme olmaz, yoğunluk makul kalır */
const BOUNDARY_SQRT_SCALE = 48

function MovementControls({
  moveInput,
  boundary
}: {
  moveInput: React.MutableRefObject<{ x: number; y: number }>
  boundary: number
}) {
  const { camera } = useThree()
  const velocity = useRef(new Vector3())
  const speed = 0.1
  const dampingFactor = 0.92

  useFrame(() => {
    const direction = new Vector3()
    const right = new Vector3()
    const up = new Vector3(0, 1, 0)

    camera.getWorldDirection(direction)
    right.crossVectors(direction, up).normalize()

    const accel = new Vector3()
    const { x, y } = moveInput.current

    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
      accel.add(direction.clone().multiplyScalar(-y * speed))
      accel.add(right.clone().multiplyScalar(x * speed))
    }

    velocity.current.add(accel)
    velocity.current.multiplyScalar(dampingFactor)

    const nextPosition = camera.position.clone().add(velocity.current)

    if (Math.abs(nextPosition.x) > boundary) {
      velocity.current.x = 0
      nextPosition.x = Math.sign(nextPosition.x) * boundary
    }
    if (Math.abs(nextPosition.y) > boundary) {
      velocity.current.y = 0
      nextPosition.y = Math.sign(nextPosition.y) * boundary
    }
    if (Math.abs(nextPosition.z) > boundary) {
      velocity.current.z = 0
      nextPosition.z = Math.sign(nextPosition.z) * boundary
    }

    camera.position.copy(nextPosition)
  })

  return null
}

// ---- Tap → Raycast ile obje seçimi ----
function TapRaycaster({
  tapPos,
  onHit
}: {
  tapPos: React.MutableRefObject<{ x: number; y: number } | null>
  onHit: (objectId: string) => void
}) {
  const { camera, scene } = useThree()
  const raycaster = useRef(new Raycaster())
  const pointer = useRef(new Vector2())

  useFrame(() => {
    if (!tapPos.current) return

    const { x, y } = tapPos.current
    tapPos.current = null // Tek seferlik işle

    // Ekran koordinatlarını NDC'ye çevir (-1 ile 1 arası)
    pointer.current.x = (x / SCREEN_W) * 2 - 1
    pointer.current.y = -(y / SCREEN_H) * 2 + 1

    raycaster.current.setFromCamera(pointer.current, camera)

    // Scene'deki tüm mesh'leri tara
    const intersects = raycaster.current.intersectObjects(scene.children, true)

    for (const hit of intersects) {
      let obj = hit.object
      while (obj) {
        if (obj.userData?.objectId) {
          runOnJS(onHit)(obj.userData.objectId)
          return
        }
        obj = obj.parent as any
      }
    }
  })

  return null
}

function SpaceScene({
  objects,
  lookInput,
  moveInput,
  tapPos,
  onSelect,
  boundary
}: {
  objects: SpaceItem[]
  lookInput: React.MutableRefObject<{ x: number; y: number }>
  moveInput: React.MutableRefObject<{ x: number; y: number }>
  tapPos: React.MutableRefObject<{ x: number; y: number } | null>
  onSelect: (item: SpaceItem) => void
  boundary: number
}) {
  const objectMap = useMemo(() => {
    const m = new Map<string, SpaceItem>()
    objects.forEach(o => m.set(o.id, o))
    return m
  }, [objects])

  const handleRaycastHit = useCallback(
    (objectId: string) => {
      const item = objectMap.get(objectId)
      if (item) onSelect(item)
    },
    [objectMap, onSelect]
  )

  const fogFar = Math.max(500, boundary * 2)

  return (
    <>
      <color attach='background' args={['#020010']} />
      <fog attach='fog' args={['#020010', 150, fogFar]} />

      <ambientLight intensity={0.8} />
      <pointLight position={[100, 100, 100]} intensity={1.5} color='#ffd700' />

      <NebulaCloud />

      {objects.map(obj => (
        <Fragment key={obj.id}>
          <StarField count={100} />
          <SpaceObject
            objectId={obj.id}
            position={obj.position}
            imageUrl={obj.imageUrl}
            size={obj.size}
            rotationSpeed={obj.rotationSpeed}
            rotationOffsetZ={obj.rotationOffsetZ}
            floatSpeed={obj.floatSpeed}
            floatAmplitude={obj.floatAmplitude}
          />
        </Fragment>
      ))}

      <TouchLookControls lookInput={lookInput} />
      <MovementControls moveInput={moveInput} boundary={boundary} />
      <TapRaycaster tapPos={tapPos} onHit={handleRaycastHit} />
    </>
  )
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size='large' color='#fbbf24' />
      <Text style={styles.loadingText}>Uzay Verileri Çekiliyor...</Text>
    </View>
  )
}

export default function SpaceExplorerScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SpaceItem | null>(null)
  const [spaceData, setSpaceData] = useState<any>(null)

  const lookInput = useRef({ x: 0, y: 0 })
  const moveInput = useRef({ x: 0, y: 0 })
  const tapPos = useRef<{ x: number; y: number } | null>(null)
  const spaceSound = useRef<Audio.Sound | null>(null)

  useFocusEffect(
    useCallback(() => {
      let mounted = true
      const playSpaceMusic = async () => {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            playThroughEarpieceAndroid: false,
          })
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/mp3/space-music-1.mp3'),
            { isLooping: true }
          )
          if (mounted) {
            spaceSound.current = sound
            await sound.playAsync()
          } else {
            await sound.unloadAsync()
          }
        } catch (e) {
          // Müzik yüklenemezse sessizce geç
        }
      }
      playSpaceMusic()
      return () => {
        mounted = false
        spaceSound.current?.unloadAsync().catch(() => {})
        spaceSound.current = null
      }
    }, [])
  )

  const fetchSpaceStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await dashboardApi.getSpaceStats(user?.accessToken)
      setSpaceData(data)
    } catch (error) {
      console.error('Uzay verisi çekme hatası:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.accessToken])

  useEffect(() => {
    fetchSpaceStats()
  }, [fetchSpaceStats])

  const handleSelect = useCallback((item: SpaceItem) => {
    setSelectedItem(item)
    setModalVisible(true)
  }, [])

  const handleMoveChange = useCallback((x: number, y: number) => {
    moveInput.current = { x, y }
  }, [])

  const handleLookChange = useCallback((x: number, y: number) => {
    lookInput.current = { x, y }
  }, [])

  const handleTap = useCallback((x: number, y: number) => {
    tapPos.current = { x, y }
  }, [])

  const spaceBoundary = useMemo(() => {
    if (!spaceData) return MIN_BOUNDARY
    const count = (d: { fullItems: number; remainder: number }) => d.fullItems + (d.remainder > 0 ? 1 : 0)
    const totalObjects =
      count(spaceData.poems) +
      count(spaceData.memories) +
      count(spaceData.albums) +
      count(spaceData.questions) +
      count(spaceData.bucketList) +
      count(spaceData.timeCapsules ?? { fullItems: 0, remainder: 0 })
    const boundary = MIN_BOUNDARY + BOUNDARY_SQRT_SCALE * Math.sqrt(Math.max(0, totalObjects))
    return Math.min(MAX_BOUNDARY, Math.max(MIN_BOUNDARY, boundary))
  }, [spaceData])

  const spaceObjects = useMemo<SpaceItem[]>(() => {
    if (!spaceData) return []

    const items: SpaceItem[] = []
    const placementRange = spaceBoundary * 0.82

    const addObjects = (
      type: SpaceItemType,
      levels: { fullItems: number; remainder: number },
      baseSize: number,
      rotationOffsetZ?: number
    ) => {
      const common = (level: number, id: string, sz: number) => ({
        id,
        type,
        level,
        position: generateRandomPosition(placementRange),
        imageUrl: getSpaceAsset(type, level),
        size: sz,
        rotationSpeed: Math.random() * 0.3 + 0.1,
        ...(rotationOffsetZ != null && { rotationOffsetZ }),
        floatSpeed: Math.random() * 0.4 + 0.2,
        floatAmplitude: Math.random() * 0.8 + 0.2
      })
      for (let i = 0; i < levels.fullItems; i++) {
        items.push(common(15, `${type}-full-${i}`, baseSize + Math.random() * 2))
      }
      if (levels.remainder > 0) {
        items.push(
          common(
            levels.remainder,
            `${type}-remainder`,
            baseSize * (0.5 + (levels.remainder / 15) * 0.5) + Math.random() * 1
          )
        )
      }
    }

    addObjects('star', spaceData.poems, 6)
    addObjects('planet_a', spaceData.memories, 12)
    addObjects('planet_b', spaceData.albums, 15)
    addObjects('planet_c', spaceData.questions, 10)
    addObjects('comet', spaceData.bucketList, 8)
    addObjects('ufo', spaceData.timeCapsules ?? { fullItems: 0, remainder: 0 }, 9, Math.PI)

    return items
  }, [spaceData, spaceBoundary])

  const getModalTitle = (item: SpaceItem | null) => {
    if (!item) return ''
    switch (item.type) {
      case 'star':
        return 'Gelecek Şiirleri'
      case 'planet_a':
        return 'Aşk Anıları'
      case 'planet_b':
        return 'Ortak Galeri'
      case 'planet_c':
        return 'Günlük Sorular'
      case 'comet':
        return 'Bucket List'
      case 'ufo':
        return 'Zaman Kapsülleri'
      default:
        return 'Uzay Nesnesi'
    }
  }

  const getModalDescription = (item: SpaceItem | null) => {
    if (!item) return ''
    const levelText = `Seviye: ${item.level}/15`
    switch (item.type) {
      case 'star':
        return `${levelText}\nŞiirleriniz uzayda birer yıldız gibi parlıyor. Toplam ${spaceData.poems.fullItems * 15 + spaceData.poems.remainder} şiir eklediniz.`
      case 'planet_a':
        return `${levelText}\nBiriktirdiğiniz anılar bir gezegene dönüştü. Toplam ${spaceData.memories.fullItems * 15 + spaceData.memories.remainder} anınız var.`
      case 'planet_b':
        return `${levelText}\nFotoğraflarınız uzaydaki galaksileri oluşturuyor. Toplam ${spaceData.albums.fullItems * 15 + spaceData.albums.remainder} albümünüz var.`
      case 'planet_c':
        return `${levelText}\nHer cevapladığınız soru uzayda yeni bir dünya açıyor.`
      case 'comet':
        return `${levelText}\nHayalleriniz uzayda kuyruklu yıldızlar gibi süzülüyor.`
      case 'ufo':
        return `${levelText}\nZaman kapsülleriniz uzayda UFO'lar gibi geziyor. Toplam ${(spaceData?.timeCapsules?.fullItems ?? 0) * 15 + (spaceData?.timeCapsules?.remainder ?? 0)} kapsülünüz var.`
      default:
        return levelText
    }
  }

  const getGoToPageRoute = (item: SpaceItem | null): string | null => {
    if (!item) return null
    switch (item.type) {
      case 'star':
        return '/poems'
      case 'planet_a':
        return '/memories'
      case 'planet_b':
        return '/gallery'
      case 'planet_c':
        return '/daily-question'
      case 'comet':
        return '/bucket-list'
      case 'ufo':
        return '/time-capsule'
      default:
        return null
    }
  }

  const getGoToPageLabel = (item: SpaceItem | null): string => {
    if (!item) return ''
    switch (item.type) {
      case 'star':
        return 'Şiir Defterine Git'
      case 'planet_a':
        return 'Anılarımıza Git'
      case 'planet_b':
        return 'Galeriye Git'
      case 'planet_c':
        return 'Günün Sorusuna Git'
      case 'comet':
        return 'Hayallerimize Git'
      case 'ufo':
        return 'Zaman Kapsüllerine Git'
      default:
        return 'Sayfaya Git'
    }
  }

  const handleGoToPage = useCallback(() => {
    const route = getGoToPageRoute(selectedItem)
    setModalVisible(false)
    if (route) router.push(route as any)
  }, [selectedItem])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {loading && <LoadingScreen />}

        {showIntro && <SpaceIntroAnimation onComplete={() => setShowIntro(false)} />}

        <View style={styles.canvasContainer}>
          <Canvas
            camera={{ position: [0, 0, 30], fov: 75, near: 0.1, far: 1000 }}
            gl={{ antialias: true }}
            onCreated={() => !loading && setLoading(false)}
            style={styles.canvas}
          >
            <SpaceScene
              objects={spaceObjects}
              lookInput={lookInput}
              moveInput={moveInput}
              tapPos={tapPos}
              onSelect={handleSelect}
              boundary={spaceBoundary}
            />
          </Canvas>
        </View>

        <SpaceExplorerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={getModalTitle(selectedItem)}
          description={getModalDescription(selectedItem)}
          iconType={selectedItem?.type}
          level={selectedItem?.level ?? 0}
          goToPageLabel={getGoToPageLabel(selectedItem) || undefined}
          onGoToPage={handleGoToPage}
        />

        {/* HUD - Başlık */}
        <View style={styles.header} pointerEvents='box-none'>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color='#fde68a' />
          </TouchableOpacity>
          <Text style={styles.title}>UZAY KEŞFİ</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Crosshair */}
        <View style={styles.crosshair} pointerEvents='none'>
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
          <View style={styles.crosshairDot} />
        </View>

        {/* Joystick overlay - multi-touch + tap desteği */}
        <JoystickOverlay onMoveChange={handleMoveChange} onLookChange={handleLookChange} onTap={handleTap} />

        {/* Alt bilgi */}
        <View style={styles.infoBar} pointerEvents='none'>
          <Text style={styles.infoText}>Sol Joystick: Hareket | Sağ Joystick: Bakış</Text>
        </View>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020010'
  },
  canvasContainer: {
    ...StyleSheet.absoluteFillObject
  },
  canvas: {
    ...StyleSheet.absoluteFillObject
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: '#020010',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 16,
    color: '#fde68a',
    fontSize: 18,
    letterSpacing: 4,
    opacity: 0.8
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 20
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    color: '#fde68a',
    fontSize: 24,
    letterSpacing: 8,
    textShadowColor: 'rgba(251,191,36,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20
  },
  crosshair: {
    position: 'absolute',
    top: SCREEN_H / 2 - 12,
    left: SCREEN_W / 2 - 12,
    width: 24,
    height: 24,
    zIndex: 10
  },
  crosshairH: {
    position: 'absolute',
    top: 12,
    left: 0,
    width: 24,
    height: 1,
    backgroundColor: 'rgba(251,191,36,0.4)'
  },
  crosshairV: {
    position: 'absolute',
    top: 0,
    left: 12,
    width: 1,
    height: 24,
    backgroundColor: 'rgba(251,191,36,0.4)'
  },
  crosshairDot: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(251,191,36,0.6)'
  },
  infoBar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10
  },
  infoText: {
    color: 'rgba(251,191,36,0.5)',
    fontSize: 11,
    letterSpacing: 1,
    backgroundColor: 'rgba(2,0,16,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.15)',
    overflow: 'hidden'
  }
})
