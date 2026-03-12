import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useAppStore, Peptide } from '../store/useAppStore';
import { RootTabParamList } from '../navigation/types';
import { useHapticFeedback } from '../utils/haptics';
import { EmptyPeptides, EmptyLogs } from '../components/EmptyState';

type DashboardNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

// Adherence Ring Component
const AdherenceRing = ({ percentage }: { percentage: number }) => {
  return (
    <View style={styles.ringContainer}>
      <View style={styles.ringOuter}>
        <View style={styles.ringProgress}>
          <View style={styles.ringInner}>
            <Text style={styles.ringPercentage}>{percentage}%</Text>
            <Text style={styles.ringLabel}>ADHERENCE</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Stats Card Component
const StatsCard = ({ totalLogs }: { totalLogs: number }) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Text style={styles.fireEmoji}>🔥</Text>
        </View>
        <Text style={styles.statValue}>7</Text>
        <Text style={styles.statLabel}>day{'\n'}streak</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.dosesValue}>{totalLogs}</Text>
        <Text style={styles.dosesLabel}>doses taken</Text>
      </View>
    </View>
  );
};

// Peptide Card Component
interface PeptideCardProps {
  peptide: Peptide;
  isLogged: boolean;
  onPress: () => void;
}

const PeptideCard = ({ peptide, isLogged, onPress }: PeptideCardProps) => {
  // Get abbreviation from name (first 3 letters or custom logic)
  const getAbbreviation = (name: string) => {
    if (name === 'BPC-157') return 'BPC';
    if (name === 'TB-500') return 'TB';
    if (name === 'Ipamorelin') return 'IPA';
    return name.substring(0, 3).toUpperCase();
  };

  return (
    <TouchableOpacity style={styles.peptideCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.peptideLeft}>
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
          <Text style={styles.peptideNext}>Tap to log dose</Text>
        </View>
      </View>
      <View style={styles.peptideRight}>
        {isLogged ? (
          <View style={styles.loggedBadge}>
            <Ionicons name="checkmark" size={18} color={COLORS.primary} />
            <Text style={styles.loggedText}>LOGGED</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const haptics = useHapticFeedback();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Get data from Zustand store
  const { peptides, logs, getAdherenceRate, getTodaysLogs } = useAppStore();
  
  // Calculate adherence from store
  const adherenceRate = getAdherenceRate();
  const todaysLogs = getTodaysLogs();
  const totalLogs = logs.length;

  // Check if a peptide has been logged today
  const isPeptideLoggedToday = (peptideId: string) => {
    return todaysLogs.some(log => log.peptideId === peptideId);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    haptics.light();
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [haptics]);

  // Navigate to Log screen with selected peptide
  const handlePeptidePress = (peptide: Peptide) => {
    haptics.selection();
    navigation.navigate('Log', { selectedPeptide: peptide });
  };

  // Navigate to Log screen without pre-selection
  const handleLogDosePress = () => {
    haptics.medium();
    navigation.navigate('Log');
  };

  // Navigate to Library to add peptide
  const handleAddPeptide = () => {
    haptics.medium();
    navigation.navigate('Library');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, Alex</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <AdherenceRing percentage={adherenceRate} />
          <StatsCard totalLogs={totalLogs} />
        </View>

        {/* My Peptides Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Peptides</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Library')}>
            <Text style={styles.manageText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {/* Peptide List */}
        {peptides.length === 0 ? (
          <EmptyPeptides onAdd={handleAddPeptide} />
        ) : (
          <View style={styles.peptideList}>
            {peptides.filter(p => p.isActive).map((peptide) => (
              <PeptideCard 
                key={peptide.id} 
                peptide={peptide} 
                isLogged={isPeptideLoggedToday(peptide.id)}
                onPress={() => handlePeptidePress(peptide)}
              />
            ))}
          </View>
        )}

        {/* Log Dose Button */}
        <TouchableOpacity style={styles.logDoseButton} onPress={handleLogDosePress}>
          <Ionicons name="add-circle" size={24} color={COLORS.background} />
          <Text style={styles.logDoseText}>Log Dose</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  ringContainer: {
    marginRight: SPACING.xl,
  },
  ringOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    padding: 6,
  },
  ringProgress: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    alignItems: 'center',
  },
  ringPercentage: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ringLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 4,
  },
  fireEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  dosesValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dosesLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  manageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  peptideList: {
    gap: SPACING.md,
  },
  peptideCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  peptideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  peptideIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  peptideIconText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  peptideInfo: {
    flex: 1,
  },
  peptideName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  peptideDose: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  peptideNext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  peptideRight: {
    marginLeft: SPACING.md,
  },
  loggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loggedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  logDoseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  logDoseText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.background,
  },
});
