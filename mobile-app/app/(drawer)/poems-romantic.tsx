import React from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '../../components/ui/Text'
import { ArrowLeft, Heart, Quote, Coffee, HeartCrack, Infinity, Shield } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'

export default function RomanticWordsScreen() {
  const router = useRouter()

  const types = [
    {
      title: '1) Sade ve Günlük',
      desc: 'Küçük anlara odaklanır, gösterişsizdir.',
      icon: <Coffee size={24} color='white' />,
      color: ['#F59E0B', '#D97706'],
      quotes: [
        'Yanındayken her şey daha az yorucu.',
        'Geldiğini duyduğum an ev değişiyor.',
        'Bugün seni düşünmek için özel bir sebebim yoktu.'
      ]
    },
    {
      title: '2) Özlem ve Mesafe',
      desc: 'Yokluğu sakin bir dille anlatır.',
      icon: <HeartCrack size={24} color='white' />,
      color: ['#F43F5E', '#E11D48'],
      quotes: [
        'Yokluğun sessiz değil, eksik.',
        'Mesafe var ama aklımın yeri sabit.',
        'Yanımda olmasan da günümde yerin var.'
      ]
    },
    {
      title: '3) Uzun Süreli İlişkilere Özel',
      desc: 'Bağlılığı anlatır.',
      icon: <Infinity size={24} color='white' />,
      color: ['#8B5CF6', '#7C3AED'],
      quotes: [
        'Sana alışmadım, seni seçmeye devam ediyorum.',
        'Heyecan bitti sanmıştım, meğer derinleşmiş.',
        'Yıllar geçtikçe daha çok güveniyorum.'
      ]
    },
    {
      title: '4) Güven ve Huzur Odaklı',
      desc: 'Aşkı sakinlik üzerinden tanımlar.',
      icon: <Shield size={24} color='white' />,
      color: ['#3B82F6', '#2563EB'],
      quotes: [
        'Yanında savunmam düşüyor.',
        'Sana anlatmadığım bir şey kalmadı.',
        'Dünyayı çözmüyorum ama sen varken durabiliyorum.'
      ]
    }
  ]

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <LinearGradient colors={['#F43F5E', '#E11D48']} style={styles.headerGradient}>
            <TouchableOpacity onPress={() => router.navigate('/poems')} style={styles.backBtn}>
              <ArrowLeft size={24} color='white' />
            </TouchableOpacity>
            <View style={styles.headerIcon}>
              <Quote size={40} color='white' />
            </View>
            <Text style={styles.headerTitle}>Romantik Sözler</Text>
            <Text style={styles.headerSubtitle}>Doğru zamanda, doğru kelimelerle...</Text>
          </LinearGradient>
        </View>

        <View style={styles.introBox}>
          <Text style={styles.introText}>
            Romantik söz; abartılı cümleler değildir. Karşındaki kişiye{' '}
            <Text style={{ color: '#E11D48' }}>görüldüğünü ve düşünüldüğünü</Text> hissettiren, kısa ama yerli yerinde
            ifadelerdir.
          </Text>
        </View>

        {types.map((type, index) => (
          <View key={index} style={styles.card}>
            <LinearGradient
              colors={type.color as any}
              style={styles.cardHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.cardTitleRow}>
                <View style={styles.typeIcon}>{type.icon}</View>
                <View>
                  <Text style={styles.typeTitle}>{type.title}</Text>
                  <Text style={styles.typeSubtitle}>{type.desc}</Text>
                </View>
              </View>
            </LinearGradient>
            <View style={styles.cardBody}>
              {type.quotes.map((quote, qIndex) => (
                <View key={qIndex} style={styles.quoteRow}>
                  <Quote size={16} color={type.color[0]} style={styles.quoteIcon} />
                  <Text style={styles.quoteText}>"{quote}"</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.finalNote}>
          <Heart size={32} color='#F43F5E' fill='#F43F5E' />
          <Text style={styles.finalTitle}>Son Not</Text>
          <Text style={styles.finalText}>Romantik sözlerin gücü edebî olmasında değil, tanıdık gelmesindedir.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    marginBottom: 20
  },
  headerGradient: {
    padding: 30,
    paddingTop: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center'
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    textAlign: 'center'
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5
  },
  introBox: {
    margin: 20,
    padding: 25,
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  introText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    textAlign: 'center'
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: {
    padding: 20
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  typeTitle: {
    fontSize: 18,
    color: 'white'
  },
  typeSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)'
  },
  cardBody: {
    padding: 20,
    gap: 15
  },
  quoteRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 15
  },
  quoteIcon: {
    marginTop: 2
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 22
  },
  finalNote: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFE4E6'
  },
  finalTitle: {
    fontSize: 20,
    color: '#E11D48',
    marginTop: 10,
    marginBottom: 10
  },
  finalText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22
  }
})
