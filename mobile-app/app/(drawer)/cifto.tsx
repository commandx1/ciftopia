import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Send } from 'lucide-react-native'
import Markdown from 'react-native-markdown-display'
import { Text } from '../../components/ui/Text'
import { TextInput } from '../../components/ui/TextInput'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/ToastProvider'
import { useAppSocket } from '../../context/AppSocketContext'
import { ciftoApi, CiftoConversation, CiftoMessage } from '../../api/cifto'

const quickPrompts = [
  'Bugün daha iyi anlaşmak için ne yapabiliriz?',
  'Tartışmalarda aynı hataya düşüyoruz, nasıl kırarız?',
  'Sevgi dilimi partnerime daha iyi nasıl gösterebilirim?',
  'Son zamanlarda uzaklaştık, nasıl yeniden yakınlaşırız?'
]

const markdownStyles = StyleSheet.create({
  body: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: 'IndieFlower',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8
  },
  strong: {
    color: '#111827',
    fontSize: 17
  },
  em: {
    color: '#111827',
  },
  list_item: {
    color: '#111827'
  }
})

function MessageBubble({ message }: { message: CiftoMessage }) {
  const isUser = message.role === 'user'
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{message.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{message.content || '...'}</Markdown>
        )}
      </View>
    </View>
  )
}

function EmptyState({ onPromptPress }: { onPromptPress: (text: string) => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Çifto</Text>
      <Text style={styles.emptySubtitle}>İlişkinizi güçlendirmek için buradayım</Text>
      <View style={styles.emptyCard}>
        <Text style={styles.emptyCardTitle}>Bir şey yaz ve başlayalım</Text>
        <Text style={styles.emptyCardBody}>
          İletişim, çatışma yönetimi, yakınlık ve güven üzerine birlikte çalışabiliriz.
        </Text>
        <View style={styles.promptList}>
          {quickPrompts.map(prompt => (
            <TouchableOpacity key={prompt} style={styles.promptChip} onPress={() => onPromptPress(prompt)}>
              <Text style={styles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

export default function CiftoScreen() {
  const { user } = useAuth()
  const { show } = useToast()
  const { socket } = useAppSocket()
  const [conversation, setConversation] = useState<CiftoConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState<{ streamId: string; content: string; createdAt: string } | null>(null)
  const listRef = useRef<FlatList<CiftoMessage>>(null)

  const messages = useMemo(() => conversation?.messages || [], [conversation])
  const isEmpty = !messages.length
  const displayMessages = useMemo(() => {
    if (!streaming) return messages
    return [
      ...messages,
      {
        role: 'assistant' as const,
        content: streaming.content,
        createdAt: streaming.createdAt
      }
    ]
  }, [messages, streaming])

  const loadConversation = useCallback(async () => {
    if (!user?.accessToken) return
    setLoading(true)
    const res = await ciftoApi.getConversation(user.accessToken)
    if (res.success) {
      setConversation(res.data)
      setStreaming(null)
    } else {
      show({ type: 'error', title: 'Hata', message: res.message || 'Çifto yüklenemedi.' })
    }
    setLoading(false)
  }, [show, user?.accessToken])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  useEffect(() => {
    if (!displayMessages.length) return
    const timeout = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    return () => clearTimeout(timeout)
  }, [displayMessages.length])

  const handleContentSizeChange = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true })
  }, [])

  useEffect(() => {
    if (!socket) return

    const onChunk = (payload: { streamId: string; delta: string }) => {
      setStreaming(prev => {
        if (!prev || prev.streamId !== payload.streamId) return prev
        return { ...prev, content: prev.content + payload.delta }
      })
    }

    const onDone = (payload: { streamId: string; message: string }) => {
      setStreaming(prev => (prev?.streamId === payload.streamId ? null : prev))
      setConversation(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { role: 'assistant', content: payload.message, createdAt: new Date().toISOString() }
          ]
        }
      })
    }

    const onError = (payload: { streamId: string; message: string }) => {
      if (!streaming || streaming.streamId !== payload.streamId) return
      show({ type: 'error', title: 'Çifto', message: payload.message || 'Yanıt üretilemedi.' })
    }

    socket.on('cifto:chunk', onChunk)
    socket.on('cifto:done', onDone)
    socket.on('cifto:error', onError)

    return () => {
      socket.off('cifto:chunk', onChunk)
      socket.off('cifto:done', onDone)
      socket.off('cifto:error', onError)
    }
  }, [socket, show, streaming])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !user?.accessToken || sending || streaming) return
    setInput('')
    setSending(true)

    const optimisticMessage: CiftoMessage = {
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    }

    setConversation(prev => {
      if (!prev) return { _id: 'local', userId: user._id, messages: [optimisticMessage], createdAt: '', updatedAt: '' }
      return { ...prev, messages: [...(prev.messages || []), optimisticMessage] }
    })

    const res = await ciftoApi.sendMessage(text, user.accessToken)
    if (res.success) {
      setConversation(res.data.conversation)
      setStreaming({ streamId: res.data.streamId, content: '', createdAt: new Date().toISOString() })
    } else {
      show({ type: 'error', title: 'Hata', message: res.message || 'Mesaj gönderilemedi.' })
      setConversation(prev => {
        if (!prev) return prev
        return { ...prev, messages: prev.messages.filter((msg, idx) => idx !== prev.messages.length - 1) }
      })
    }
    setSending(false)
  }, [input, sending, show, user?.accessToken, user?._id, streaming])

  const handlePromptPress = useCallback((text: string) => {
    setInput(text)
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <LinearGradient colors={['#FFE4EC', '#FFFFFF']} style={styles.container}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color='#EC4899' />
            </View>
          ) : isEmpty ? (
            <EmptyState onPromptPress={handlePromptPress} />
          ) : (
            <FlatList
              ref={listRef}
              data={displayMessages}
              keyExtractor={(_, index) => `${index}`}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={handleContentSizeChange}
            />
          )}

          <View style={styles.inputBar}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder='Çifto’ya yaz...'
              style={styles.input}
              multiline
            />
            <TouchableOpacity style={[styles.sendButton, sending && styles.sendButtonDisabled]} onPress={handleSend}>
              {sending ? <ActivityIndicator color='#fff' /> : <Send size={20} color='#fff' />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24
  },
  bubbleRow: {
    marginBottom: 12
  },
  bubbleRowUser: {
    alignItems: 'flex-end'
  },
  bubbleRowAssistant: {
    alignItems: 'flex-start'
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16
  },
  bubbleUser: {
    backgroundColor: '#EC4899',
    borderTopRightRadius: 4
  },
  bubbleAssistant: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 4
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21
  },
  bubbleTextUser: {
    color: '#fff'
  },
  bubbleTextAssistant: {
    color: '#111827'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    color: '#111827'
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899'
  },
  sendButtonDisabled: {
    opacity: 0.6
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 34,
    color: '#111827',
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  emptyCardTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8
  },
  emptyCardBody: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16
  },
  promptList: {
    gap: 10
  },
  promptChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    backgroundColor: '#FFF1F2'
  },
  promptChipText: {
    color: '#9D174D',
    fontSize: 13
  }
})
