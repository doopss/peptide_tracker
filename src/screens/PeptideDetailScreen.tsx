import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useAppStore, Peptide } from '../store/useAppStore';
import { useHapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyLogs } from '../components/EmptyState';

// Extended navigation type for peptide detail
type RootStackParamList = {
  PeptideDetail: { peptideId: string };
};

type PeptideDetailRouteProp = RouteProp<RootStackParamList, 'PeptideDetail'>;

// Stat Card Component
const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  subtitle?: string;
  icon: string;
}> = ({ title, value, subtitle, icon }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Ionicons name={icon as any} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

// Log Item Component
const LogItem: React.FC<{
  date: string;
  amount: number;
  unit: string;
  onDelete?: () => void;
}> = ({ date, amount, unit, onDelete }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.logItem}>
      <View style={styles.logLeft}>
        <View style={styles.logDot} />
        <View>
          <Text style={styles.logDate}>{formattedDate}</Text>
          <Text style={styles.logAmount}>{amount} {unit}</Text>
        </View>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function PeptideDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<PeptideDetailRouteProp>();
  const haptics = useHapticFeedback();
  const { showToast } = useToast();
  
  const { 
    peptides, 
    logs, 
    getLogsForPeptide, 
    getPeptideStats,
    deletePeptide,
    togglePeptideActive,
    deleteLog,
  } = useAppStore();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');

  // Get peptide from route params
  const peptideId = route.params?.peptideId;
  const peptide = peptides.find((p) => p.id === peptideId);

  if (!peptide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>Peptide not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const peptideLogs = getLogsForPeptide(peptide.id);
  const stats = getPeptideStats(peptide.id);

  const handleToggleActive = () => {
    haptics.medium();
    togglePeptideActive(peptide.id);
    showToast(
      peptide.isActive ? 'Peptide paused' : 'Peptide activated',
      'success'
    );
  };

  const handleDelete = () => {
    haptics.heavy();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deletePeptide(peptide.id);
    setShowDeleteDialog(false);
    showToast('Peptide deleted', 'success');
    haptics.success();
    navigation.goBack();
  };

  const handleDeleteLog = (logId: string) => {
    haptics.light();
    deleteLog(logId);
    showToast('Log entry deleted', 'info');
  };

  // Get abbreviation
  const getAbbreviation = (name: string) => {
    if (name === 'BPC-157') return 'BPC';
    if (name === 'TB-500') return 'TB';
    if (name === 'Ipamorelin') return 'IPA';
    return name.substring(0, 3).toUpperCase();
  };

  // Format last taken date
  const lastTakenText = stats.lastTaken 
    ? new Date(stats.lastTaken).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Never';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Peptide Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Peptide Header Card */}
        <View style={styles.peptideCard}>
          <View style={[styles.peptideIcon, { borderColor: peptide.color }]}>
            <Text style={[styles.peptideIconText, { color: peptide.color }]}>
              {getAbbreviation(peptide.name)}
            </Text>
          </View>
          <View style={styles.peptideInfo}>
            <Text style={styles.peptideName}>{peptide.name}</Text>
            <Text style={styles.peptideDose}>
              {peptide.dose} {peptide.unit} · {peptide.frequency}
            </Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: peptide.isActive ? COLORS.success : COLORS.textMuted 
            }]}>
              <Text style={styles.statusText}>
                {peptide.isActive ? 'Active' : 'Paused'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => {
              haptics.light();
              setActiveTab('history');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
            onPress={() => {
              haptics.light();
              setActiveTab('stats');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'history' ? (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Dose History</Text>
            {peptideLogs.length === 0 ? (
              <EmptyLogs onLog={() => navigation.navigate('Log' as never)} />
            ) : (
              <View style={styles.logsList}>
                {peptideLogs.map((log, index) => (
                  <LogItem
                    key={log.id}
                    date={log.timestamp}
                    amount={log.amount}
                    unit={peptide.unit}
                    onDelete={() => handleDeleteLog(log.id)}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Doses"
                value={String(stats.totalDoses)}
                subtitle="All time"
                icon="flask-outline"
              />
              <StatCard
                title="7-Day Adherence"
                value={`${stats.adherence7Day}%`}
                subtitle="Last week"
                icon="trending-up-outline"
              />
              <StatCard
                title="Last Taken"
                value={lastTakenText}
                subtitle={stats.lastTaken ? 'Date' : 'No doses yet'}
                icon="calendar-outline"
              />
              <StatCard
                title="Category"
                value={peptide.category}
                subtitle="Type"
                icon="grid-outline"
              />
            </View>

            {/* Protocol Info */}
            <View style={styles.protocolSection}>
              <Text style={styles.sectionTitle}>Protocol</Text>
              <View style={styles.protocolCard}>
                <View style={styles.protocolRow}>
                  <Text style={styles.protocolLabel}>Standard Dose</Text>
                  <Text style={styles.protocolValue}>
                    {peptide.dose} {peptide.unit}
                  </Text>
                </View>
                <View style={styles.protocolRow}>
                  <Text style={styles.protocolLabel}>Frequency</Text>
                  <Text style={styles.protocolValue}>{peptide.frequency}</Text>
                </View>
                <View style={styles.protocolRow}>
                  <Text style={styles.protocolLabel}>Category</Text>
                  <Text style={styles.protocolValue}>{peptide.category}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.logButton]}
            onPress={() => navigation.navigate('Log' as never, { selectedPeptide: peptide } as never)}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.background} />
            <Text style={styles.logButtonText}>Log Dose</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.toggleButton, { 
              backgroundColor: peptide.isActive ? `${COLORS.warning}20` : `${COLORS.success}20` 
            }]}
            onPress={handleToggleActive}
          >
            <Ionicons 
              name={peptide.isActive ? 'pause' : 'play'} 
              size={20} 
              color={peptide.isActive ? COLORS.warning : COLORS.success} 
            />
            <Text style={[styles.toggleButtonText, { 
              color: peptide.isActive ? COLORS.warning : COLORS.success 
            }]}>
              {peptide.isActive ? 'Pause' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Peptide?"
        message={`This will permanently delete ${peptide.name} and all its dose history. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  peptideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  peptideIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  peptideIconText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  peptideInfo: {
    flex: 1,
  },
  peptideName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  peptideDose: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.background,
  },
  contentSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  logsList: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  logDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  logAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  protocolSection: {
    marginBottom: SPACING.xl,
  },
  protocolCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  protocolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  protocolLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  protocolValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    marginTop: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  logButton: {
    backgroundColor: COLORS.primary,
  },
  logButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
