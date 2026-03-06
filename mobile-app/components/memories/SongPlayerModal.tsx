import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text } from '../ui/Text';
import { Audio } from 'expo-av';
import { X, Play, Pause, SkipBack, SkipForward, Heart, Share2, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { romanticRoseTheme } from '../../theme/romanticRose';
import { moodConfigs } from './MemoryMoodBadge';

const theme = romanticRoseTheme;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

function formatTime(seconds: number): string {
  const sec = Number(seconds);
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function toDurationSeconds(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseLyricsLines(lyrics: string): string[] {
  if (!lyrics || !lyrics.trim()) return [];
  return lyrics
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export interface SongPlayerMemory {
  _id: string;
  title: string;
  mood?: string;
  generatedSongUrl?: string;
  generatedSongDurationSeconds?: number;
  generatedLyrics?: string;
}

interface SongPlayerModalProps {
  visible: boolean;
  memory: SongPlayerMemory | null;
  onClose: () => void;
}

export function SongPlayerModal({ visible, memory, onClose }: SongPlayerModalProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadAndPlay = useCallback(async (url: string) => {
    try {
      setIsLoading(true);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false },
      );
      soundRef.current = sound;
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis != null && status.durationMillis > 0) {
        setDuration(toDurationSeconds(status.durationMillis / 1000));
      }
      sound.setOnPlaybackStatusUpdate((s) => {
        if (!s.isLoaded) return;
        setPosition(toDurationSeconds(s.positionMillis / 1000));
        if (s.durationMillis != null && s.durationMillis > 0) {
          setDuration(toDurationSeconds(s.durationMillis / 1000));
        }
        if ((s as { didJustFinishAndNotReset?: boolean }).didJustFinishAndNotReset) {
          setIsPlaying(false);
        }
      });
    } catch {
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible || !memory?.generatedSongUrl) return;
    setPosition(0);
    setDuration(toDurationSeconds(memory.generatedSongDurationSeconds));
    loadAndPlay(memory.generatedSongUrl);
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, [visible, memory?._id, memory?.generatedSongUrl]);

  const SEEK_STEP_SEC = 5;

  const togglePlayPause = async () => {
    if (!soundRef.current || isLoading) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeekBack = async () => {
    if (!soundRef.current || isLoading) return;
    const newPos = Math.max(0, position - SEEK_STEP_SEC);
    await soundRef.current.setPositionAsync(newPos * 1000);
    setPosition(newPos);
  };

  const handleSeekForward = async () => {
    if (!soundRef.current || isLoading) return;
    const newPos = Math.min(duration, position + SEEK_STEP_SEC);
    await soundRef.current.setPositionAsync(newPos * 1000);
    setPosition(newPos);
  };

  const handleClose = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    onClose();
  };

  const progressPercent =
    duration > 0 && Number.isFinite(position) && Number.isFinite(duration)
      ? (position / duration) * 100
      : 0;
  const moodConfig = memory?.mood ? moodConfigs[memory.mood] : null;
  const lyricsLines = memory?.generatedLyrics ? parseLyricsLines(memory.generatedLyrics) : [];

  if (!memory) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899', theme.accent]}
            style={styles.header}
          >
            <View style={styles.albumArt}>
              <View style={styles.albumArtInner}>
                <Text style={styles.albumIcon}>♪</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.songInfo}>
            <Text style={styles.title} numberOfLines={1}>{memory.title}</Text>
            <View style={styles.badges}>
              {moodConfig && (
                <View style={[styles.badge, { backgroundColor: moodConfig.badgeBg }]}>
                  <moodConfig.icon size={12} color={moodConfig.iconColor} />
                  <Text style={[styles.badgeText, { color: moodConfig.iconColor }]}>
                    {moodConfig.label}
                  </Text>
                </View>
              )}
              <View style={styles.badgeTime}>
                <Text style={styles.badgeTimeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.lyricsSection}>
            <Text style={styles.lyricsTitle}>Şarkı Sözleri</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {lyricsLines.length > 0 ? (
                lyricsLines.map((line, i) => (
                  <Text key={i} style={styles.lyricsLine}>
                    {line}
                  </Text>
                ))
              ) : (
                <Text style={styles.lyricsPlaceholder}>Şarkı sözü yok</Text>
              )}
            </ScrollView>
          </View>

          <View style={styles.controls}>
            <View style={styles.progressWrap}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            <View style={styles.mainControls}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={handleSeekBack}
                disabled={isLoading}
              >
                <SkipBack size={22} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={togglePlayPause}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={theme.accentGradient}
                  style={styles.playBtnGradient}
                >
                  {isPlaying ? (
                    <Pause size={28} color="white" />
                  ) : (
                    <Play size={28} color="white" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={handleSeekForward}
                disabled={isLoading}
              >
                <SkipForward size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: MODAL_WIDTH,
    maxWidth: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArt: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  albumArtInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumIcon: {
    fontSize: 56,
    color: 'white',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSofter,
  },
  title: {
    fontSize: 22,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
  },
  badgeTime: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.cardSoft,
  },
  badgeTimeText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  lyricsSection: {
    padding: 20,
    height: 400,
    backgroundColor: theme.cardSoft,
  },
  lyricsTitle: {
    fontSize: 14,
    color: theme.textPrimary,
    marginBottom: 12,
  },
  lyricsLine: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  lyricsPlaceholder: {
    fontSize: 13,
    color: theme.textMuted,
  },
  controls: {
    padding: 20,
    backgroundColor: 'white',
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 11,
    color: theme.textMuted,
    minWidth: 36,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.borderSofter,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: 3,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  playBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
