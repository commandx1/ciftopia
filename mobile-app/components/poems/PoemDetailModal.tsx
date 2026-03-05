import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from '../ui/Text';
import { X, Feather, Heart, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PoemDetailModalProps {
  visible: boolean;
  onClose: () => void;
  poem: any;
}

export default function PoemDetailModal({ visible, onClose, poem }: PoemDetailModalProps) {
  if (!poem) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Şiir Detayı</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.tagsRow}>
              {poem.tags?.map((tag: string) => (
                <View key={tag} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.title}>{poem.title}</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Feather size={14} color="#8B5CF6" />
                <Text style={styles.infoText}>{poem.authorId.firstName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={14} color="#8B5CF6" />
                <Text style={styles.infoText}>
                  {format(new Date(poem.createdAt), 'd MMMM yyyy', { locale: tr })}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.poemContent}>{poem.content}</Text>

            <View style={styles.footer}>
              <Heart size={20} color="#F43F5E" fill="#F43F5E" opacity={0.2} />
              <Text style={styles.footerText}>Sevgiyle yazıldı...</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 30,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    color: '#111827',
  },
  closeBtn: {
    padding: 5,
  },
  scrollContent: {
    padding: 25,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  tagBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  tagText: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  title: {
    fontSize: 32,
    color: '#111827',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 25,
  },
  poemContent: {
    fontSize: 20,
    color: '#374151',
    lineHeight: 32,
        textAlign: 'center',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
      },
});
