import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text';
import { ArrowLeft, Info, Eye, Search, Link as LinkIcon, Volume2, Minimize2, PenSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function PoemTipsScreen() {
  const router = useRouter();

  const techniques = [
    {
      id: 1,
      title: '1. Somut İmgeler Kullan',
      subtitle: 'Show, Don\'t Tell',
      icon: <Eye size={24} color="white" />,
      color: ['#8B5CF6', '#EC4899'],
      why: 'Soyut duyguyu somut bir görüntüyle hissettirir; okuyucu zihninde sahne kurar.',
      how: '"Özledim" yazmak yerine: "Yastığın sol yanındaki gömlek hâlâ senin kokunu taşır"',
    },
    {
      id: 2,
      title: '2. Spesifiklik / Detay',
      subtitle: 'Gerçeklik Hissi',
      icon: <Search size={24} color="white" />,
      color: ['#F43F5E', '#FB7185'],
      why: 'Genel ifadeler unutulur; spesifik detaylar akılda kalır ve inanırlığı artırır.',
      how: '"Çiçek" yerine "köşedeki mor manolya" gibi spesifik seç.',
    },
    {
      id: 3,
      title: '3. Metafor ve Benzetme',
      subtitle: 'Derin Anlam',
      icon: <LinkIcon size={24} color="white" />,
      color: ['#6366F1', '#8B5CF6'],
      why: 'Bir duyguya yeni bir ilişki kurar, anlamı derinleştirir.',
      how: '"Sessizlik bir cezve gibi tıkalı"',
    },
    {
      id: 4,
      title: '4. Sesten Yararlan',
      subtitle: 'Müzikalite',
      icon: <Volume2 size={24} color="white" />,
      color: ['#3B82F6', '#06B6D4'],
      why: 'Sözcüklerin sesi ritim ve duyguyu güçlendirir; müzikalite katar.',
      how: 'Aliterasyon ve asonans tekniklerini dene.',
    },
    {
      id: 5,
      title: '5. Azla Çok Anlatma',
      subtitle: 'Ekonomi',
      icon: <Minimize2 size={24} color="white" />,
      color: ['#EF4444', '#F97316'],
      why: 'Fazla kelime duyguyu dağıtır; keskin, kısa dize daha kalıcıdır.',
      how: 'Taslaktan sonra %20-40 kelime silmeyi dene.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.headerGradient}
          >
            <TouchableOpacity onPress={() => router.navigate('/poems')} style={styles.backBtn}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerIcon}>
              <PenSquare size={40} color="white" />
            </View>
            <Text style={styles.headerTitle}>Şiir Yazma İpuçları</Text>
            <Text style={styles.headerSubtitle}>Duygularınızı en güzel şekilde ifade edin.</Text>
          </LinearGradient>
        </View>

        <View style={styles.introBox}>
          <View style={styles.introHeader}>
            <Info size={20} color="#F59E0B" />
            <Text style={styles.introTitle}>Başlamadan Önce</Text>
          </View>
          <Text style={styles.introText}>
            İyi şiir yazmak bir yetenek değil, öğrenilebilir bir beceridir. Bu teknikleri deneyerek gelişebilirsiniz.
          </Text>
        </View>

        {techniques.map((tech) => (
          <View key={tech.id} style={styles.card}>
            <LinearGradient
              colors={tech.color as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardHeader}
            >
              <View style={styles.cardTitleRow}>
                <View style={styles.techIcon}>{tech.icon}</View>
                <View>
                  <Text style={styles.techTitle}>{tech.title}</Text>
                  <Text style={styles.techSubtitle}>{tech.subtitle}</Text>
                </View>
              </View>
            </LinearGradient>
            <View style={styles.cardBody}>
              <Text style={styles.sectionLabel}>❓ Neden İşe Yarar?</Text>
              <Text style={styles.sectionText}>{tech.why}</Text>
              
              <View style={styles.howBox}>
                <Text style={styles.sectionLabel}>💡 Nasıl Uygulanır?</Text>
                <Text style={styles.howText}>{tech.how}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 30,
    paddingTop: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  introBox: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  introTitle: {
    fontSize: 18,
    color: '#111827',
  },
  introText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
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
    elevation: 2,
  },
  cardHeader: {
    padding: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  techIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  techTitle: {
    fontSize: 18,
    color: 'white',
  },
  techSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 15,
  },
  howBox: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  howText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
});
