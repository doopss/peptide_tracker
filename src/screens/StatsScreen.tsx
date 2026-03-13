import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { useHapticFeedback } from '../utils/haptics';
import { EmptyLogs } from '../components/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeRange = '7d' | '30d' | '90d';

// Simple bar chart component
const BarChart: React.FC<{ 
  data: { label: string; value: number; maxValue: number }[];
}> = ({ data }) => {
  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barRow}>
          <Text style={styles.barLabel}>{item.label}</Text>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.barFill, 
                { 
                  width: `${Math.max((item.value / item.maxValue) * 100, 5)}%`,
                  backgroundColor: item.value > 0 ? COLORS.primary : COLORS.border,
                }
              ]} 
            />
          </View>
          <Text style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

// Circular progress indicator
const CircularProgress: React.FC<{ percentage: number; size?: number }> = ({ 
  percentage, 
  size = 120 
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.circularProgress, { width: size, height: size }]}>
      <View style={styles.progressBackground} />
      <View 
        style={[
          styles.progressFill,
          { 
            width: size, 
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.primary,
          }
        ]}
      />
      <View style={styles.progressContent}>
        <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
        <Text style={styles.progressLabel}>Adherence</Text>
      </View>
    </View>
  );
};

// Stat card component
const QuickStat: React.FC<{
  icon: string;
  value: string;
  label: string;
  color?: string;
}> = ({ icon, value, label, color = COLORS.primary }) => (
  <View style={styles.quickStat}>
    <View style={[styles.quickStatIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.quickStatValue}>{value}</Text>
    <Text style={styles.quickStatLabel}>{label}</Text>
  </View>
);

export default function StatsScreen() {
  const navigation = useNavigation();
  const haptics = useHapticFeedback();
  const { peptides, logs, getAdherenceRate } = useAppStore();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // Calculate stats based on time range
  const stats = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const adherence = getAdherenceRate(days);
    
    // Get logs in time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const logsInRange = logs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );

    // Daily breakdown for chart
    const dailyData: { [key: string]: number } = {};
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('en-US', { weekday: 'narrow' });
      dailyData[key] = 0;
    }

    logsInRange.forEach(log => {
      const date = new Date(log.timestamp);
      const key = date.toLocaleDateString('en-US', { weekday: 'narrow' });
      if (dailyData[key] !== undefined) {
        dailyData[key]++;
      }
    });

    const chartData = Object.entries(dailyData).map(([label, value]) => ({
      label,
      value,
      maxValue: Math.max(...Object.values(dailyData), 1),
    }));

    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasLog = logs.some(log => {
        const logDate = new Date(log.timestamp);
        return (
          logDate.getDate() === checkDate.getDate() &&
          logDate.getMonth() === checkDate.getMonth() &&
          logDate.getFullYear() === checkDate.getFullYear()
        );
      });
      
      if (hasLog || i === 0) {
        if (hasLog) currentStreak++;
      } else {
        break;
      }
    }

    return {
      adherence,
      totalDoses: logsInRange.length,
      activePeptides: peptides.filter(p => p.isActive).length,
      currentStreak,
      chartData,
    };
  }, [logs, peptides, timeRange, getAdherenceRate]);

  if (logs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>
        <EmptyLogs onLog={() => navigation.navigate('Log' as never)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => {
                haptics.light();
                setTimeRange(range);
              }}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Adherence Ring */}
        <View style={styles.adherenceSection}>
          <CircularProgress percentage={stats.adherence} />
          <Text style={styles.adherenceSubtitle}>
            {stats.adherence >= 80 
              ? 'Excellent adherence!' 
              : stats.adherence >= 50 
                ? 'Good progress, keep it up!' 
                : 'Let\'s build that consistency!'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <QuickStat
            icon="flask-outline"
            value={String(stats.totalDoses)}
            label="Doses Taken"
          />
          <QuickStat
            icon="medical-outline"
            value={String(stats.activePeptides)}
            label="Active Protocols"
          />
          <QuickStat
            icon="flame-outline"
            value={String(stats.currentStreak)}
            label="Day Streak"
            color={COLORS.warning}
          />
        </View>

        {/* Activity Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.chartCard}>
            <BarChart data={stats.chartData} />
          </View>
        </View>

        {/* Peptide Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>By Peptide</Text>
          {peptides.filter(p => p.isActive).map((peptide) => {
            const peptideLogs = logs.filter(l => l.peptideId === peptide.id);
            const recentLogs = peptideLogs.filter(l => {
              const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
              const cutoff = new Date();
              cutoff.setDate(cutoff.getDate() - days);
              return new Date(l.timestamp) >= cutoff;
            });
            
            return (
              <View key={peptide.id} style={styles.peptideRow}>
                <View style={styles.peptideLeft}>
                  <View style={[styles.peptideDot, { backgroundColor: peptide.color }]} />
                  <Text style={styles.peptideName}>{peptide.name}</Text>
                </View>
                <Text style={styles.peptideCount}>{recentLogs.length} doses</Text>
              </View>
            );
          })}
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <Ionicons name="bulb-outline" size={24} color={COLORS.warning} />
            <Text style={styles.insightText}>
              {stats.adherence >= 80 
                ? 'You\'re crushing it! Your consistency is paying off.'
                : stats.currentStreak >= 3
                  ? `You're on a ${stats.currentStreak}-day streak! Keep the momentum going.`
                  : 'Try logging doses at the same time each day to build a habit.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  timeRangeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  timeRangeTextActive: {
    color: COLORS.background,
  },
  adherenceSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  circularProgress: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: COLORS.border,
  },
  progressFill: {
    position: 'absolute',
    borderRadius: 60,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  adherenceSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  quickStat: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickStatValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  chartSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  chartCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  chartContainer: {
    gap: SPACING.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  barLabel: {
    width: 20,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    width: 24,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  breakdownSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  peptideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  peptideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peptideDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  peptideName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  peptideCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  insightsSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  insightText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
});
