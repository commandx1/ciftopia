import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Text } from '../ui/Text';
import { romanticRoseTheme } from '../../theme/romanticRose';
import { LinearGradient } from 'expo-linear-gradient';
import { moodConfigs } from './MemoryMoodBadge';
import type { MemoryForStory } from '../../api/memories';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BookMarked, Lightbulb, ListChecks, X } from 'lucide-react-native';

const theme = romanticRoseTheme;
const MIN_SELECT = 2;
const MAX_SELECT = 8;
const MEMORY_PLACEHOLDER = require('../../assets/memory-placeholder.png');

interface CreateStoryModalProps {
  visible: boolean;
  onClose: () => void;
  memories: MemoryForStory[];
  loadingList: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCreateStory: () => void;
  creating: boolean;
}

export function CreateStoryModal({
  visible,
  onClose,
  memories,
  loadingList,
  selectedIds,
  onToggle,
  onCreateStory,
  creating,
}: CreateStoryModalProps) {
  const count = selectedIds.length;
  const canCreate = count >= MIN_SELECT && count <= MAX_SELECT && !creating;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#EC4899']}
            style={styles.header}
          >
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIconWrap}>
                  <BookMarked size={24} color="white" />
                </View>
                <View>
                  <Text style={styles.title}>Hikayeni Oluştur</Text>
                  <Text style={styles.subtitle}>Anılarından özel bir hikaye yaz</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
                <X size={22} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.tipBox}>
            <Lightbulb size={18} color="#8B5CF6" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Nasıl çalışır?</Text>
              <Text style={styles.tipText}>
                Seçtiğiniz anılar kullanılarak yapay zeka size özel bir aşk hikayesi yazacak. En az {MIN_SELECT}, en fazla {MAX_SELECT} anı seçebilirsiniz.
              </Text>
            </View>
          </View>

          <View style={styles.listHeader}>
            <View style={styles.listTitleRow}>
              <ListChecks size={18} color={theme.accent} />
              <Text style={styles.listTitle}>Anıları Seç</Text>
            </View>
            <Text style={styles.countText}>{count} / {MAX_SELECT}</Text>
          </View>

          {loadingList ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={styles.loadingText}>Anılar yükleniyor...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {memories.length === 0 ? (
                <Text style={styles.emptyText}>Henüz anı bulunmuyor. Önce anı ekleyin.</Text>
              ) : (
                memories.map((mem) => {
                  const isSelected = selectedIds.includes(mem._id);
                  const config = moodConfigs[mem.mood] || moodConfigs.romantic;
                  const thumb = mem.photos?.[0]?.url;
                  const dateStr = mem.date
                    ? format(new Date(mem.date), 'd MMMM yyyy', { locale: tr })
                    : '';
                  
                  return (
                    <TouchableOpacity
                      key={mem._id}
                      activeOpacity={0.8}
                      style={[styles.memoryRow, isSelected && styles.memoryRowSelected]}
                      onPress={() => onToggle(mem._id)}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Image
                        source={thumb ? { uri: thumb } : MEMORY_PLACEHOLDER}
                        style={styles.thumb}
                      />
                      <View style={styles.memoryInfo}>
                        <Text style={styles.memoryTitle} numberOfLines={1}>{mem.title}</Text>
                        {dateStr ? (
                          <Text style={styles.memoryDate}>{dateStr}</Text>
                        ) : null}
                        <View style={[styles.moodBadge, { backgroundColor: config.badgeBg }]}>
                          <config.icon size={12} color={config.iconColor} />
                          <Text style={[styles.moodText, { color: config.iconColor }]}>
                            {config.label}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onCreateStory}
              disabled={!canCreate}
              style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={canCreate ? ['#6366F1', '#8B5CF6', '#EC4899'] : ['#9CA3AF', '#9CA3AF']}
                style={styles.createBtnGradient}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createBtnText}>Hikayemi Oluştur</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.footerHint}>En az {MIN_SELECT} anı seçmelisiniz</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    padding: 20,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    color: 'white',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 13,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listTitle: {
    fontSize: 16,
    color: theme.textPrimary,
  },
  countText: {
    fontSize: 14,
    color: '#6366F1',
  },
  scroll: {
    maxHeight: 320,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  loadingWrap: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.textSecondary,
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: 14,
  },
  memoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.cardSoft,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  memoryRowSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: theme.borderSofter,
  },
  thumbPlaceholder: {},
  memoryInfo: {
    flex: 1,
    minWidth: 0,
  },
  memoryTitle: {
    fontSize: 15,
    color: theme.textPrimary,
  },
  memoryDate: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
    gap: 4,
  },
  moodText: {
    fontSize: 11,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.borderSofter,
  },
  createBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  createBtnDisabled: {
    opacity: 0.7,
  },
  createBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: 'white',
    fontSize: 16,
  },
  footerHint: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },
});
