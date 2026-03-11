import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { Text } from '../ui/Text'
import { TextInput } from '../ui/TextInput'
import { CustomModal } from '../ui/Modal'
import { saveMood } from '../../api/mood'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/ToastProvider'
import { useSegments } from 'expo-router'

const MOOD_TYPES = [
  { emoji: '😍', label: 'Harika' },
  { emoji: '😊', label: 'İyi' },
  { emoji: '🥰', label: 'Aşık' },
  { emoji: '🤩', label: 'Heyecanlı' },
  { emoji: '🎉', label: 'Mutlu' },
  { emoji: '😐', label: 'Eh İşte' },
  { emoji: '😴', label: 'Yorgun' },
  { emoji: '😔', label: 'Üzgün' },
  { emoji: '😤', label: 'Kızgın' }
]

const STORAGE_PREFIX = 'moodPromptLastDate'

export default function DailyMoodPrompt() {
  const { user, updateUser } = useAuth()
  const { show } = useToast()
  const segments = useSegments()
  const [visible, setVisible] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const todayKey = useMemo(() => {
    if (!user?._id) return null
    return `${STORAGE_PREFIX}:${user._id}`
  }, [user?._id])

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const shouldCheck = useMemo(() => {
    return Boolean(user?._id && user?.accessToken && segments[0] === '(drawer)')
  }, [user?._id, user?.accessToken, segments])

  useEffect(() => {
    if (!shouldCheck || !todayKey) return
    let cancelled = false
    const run = async () => {
      try {
        const lastMoodAt = user?.lastMoodAt ? format(new Date(user.lastMoodAt), 'yyyy-MM-dd') : null
        if (lastMoodAt === todayStr) {
          await AsyncStorage.setItem(todayKey, todayStr)
          return
        }
        const stored = await AsyncStorage.getItem(todayKey)
        if (cancelled) return
        if (stored !== todayStr) {
          setVisible(true)
        }
      } catch {
        if (!cancelled) setVisible(true)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [shouldCheck, todayKey, todayStr, user?.lastMoodAt])

  useEffect(() => {
    if (!visible) return
    setSelectedEmoji(null)
    setNote('')
  }, [visible])

  const markShownForToday = useCallback(async () => {
    if (!todayKey) return
    await AsyncStorage.setItem(todayKey, todayStr)
  }, [todayKey, todayStr])

  const closePrompt = useCallback(async () => {
    await markShownForToday()
    setVisible(false)
  }, [markShownForToday])

  const handleSave = useCallback(async () => {
    if (!selectedEmoji) {
      show({ type: 'error', title: 'Ruh hali', message: 'Lütfen bir seçenek seçin.' })
      return
    }
    if (!user?.accessToken) return

    setSaving(true)
    try {
      await saveMood(
        {
          emoji: selectedEmoji,
          note: note.trim(),
          date: todayStr
        },
        user.accessToken
      )
      await markShownForToday()
      updateUser?.({ lastMoodAt: new Date().toISOString() })
      setVisible(false)
      show({ type: 'success', title: 'Teşekkürler', message: 'Ruh halin kaydedildi.' })
    } catch (error: any) {
      show({ type: 'error', title: 'Hata', message: error?.message || 'Kaydedilemedi.' })
    } finally {
      setSaving(false)
    }
  }, [markShownForToday, note, selectedEmoji, show, todayStr, user?.accessToken])

  return (
    <CustomModal
      visible={visible}
      onClose={closePrompt}
      title='Bugün hoş geldin 💞'
      subtitle='Bugün nasıl hissediyorsun?'
      maxHeight='88%'
    >
      <View style={styles.body}>
        <View style={styles.moodGrid}>
          {MOOD_TYPES.map(item => {
            const isSelected = selectedEmoji === item.emoji
            return (
              <TouchableOpacity
                key={item.emoji}
                style={[styles.moodItem, isSelected && styles.moodItemSelected]}
                onPress={() => setSelectedEmoji(item.emoji)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>{item.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.noteBlock}>
          <Text style={styles.noteTitle}>Not bırakmak ister misin? (isteğe bağlı)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder='Kısaca paylaş...'
            style={styles.noteInput}
            multiline
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={closePrompt} disabled={saving}>
            <Text style={styles.skipText}>Şimdi değil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color='#fff' /> : <Text style={styles.saveText}>Kaydet</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  )
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  moodItem: {
    width: '30%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  moodItemSelected: {
    backgroundColor: '#FFF1F2',
    borderColor: '#EC4899'
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  moodLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  moodLabelSelected: {
    color: '#BE185D'
  },
  noteBlock: {
    marginTop: 20
  },
  noteTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8
  },
  noteInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    color: '#111827'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center'
  },
  skipText: {
    color: '#6B7280'
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#EC4899',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center'
  },
  saveText: {
    color: '#fff'
  }
})
