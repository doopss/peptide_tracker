import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { weekDays, todaysSchedule } from '../data/mockData';

const CalendarStrip = ({ 
  selectedDate, 
  onSelectDate 
}: { 
  selectedDate: number; 
  onSelectDate: (date: number) => void;
}) => {
  return (
    <View style={styles.calendarStrip}>
      {weekDays.map((day) => (
        <TouchableOpacity
          key={day.date}
          style={[
            styles.dayContainer,
            day.date === selectedDate && styles.dayContainerSelected,
          ]}
          onPress={() => onSelectDate(day.date)}
        >
          <Text style={[
            styles.dayName,
            day.date === selectedDate && styles.dayNameSelected,
          ]}>
            {day.day}
          </Text>
          <Text style={[
            styles.dayNumber,
            day.date === selectedDate && styles.dayNumberSelected,
          ]}>
            {day.date}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const UpNextCard = () => {
  return (
    <View style={styles.upNextCard}>
      <View style={styles.upNextHeader}>
        <Text style={styles.upNextLabel}>UP NEXT</Text>
      </View>
      <View style={styles.upNextContent}>
        <View style={styles.upNextLeft}>
          <View style={[styles.peptideIcon, { borderColor: COLORS.recovery }]}>
            <View style={styles.peptideDot} />
          </View>
          <View>
            <Text style={styles.upNextPeptide}>BPC-157 · 250 mcg</Text>
            <Text style={styles.upNextTime}>8:00 PM · Evening dose</Text>
          </View>
        </View>
        <View style={styles.upNextRight}>
          <Text style={styles.countdownTime}>05:57:28</Text>
          <Text style={styles.countdownLabel}>remaining</Text>
        </View>
      </View>
    </View>
  );
};

const ScheduleItem = ({ 
  item, 
  isCompleted 
}: { 
  item: typeof todaysSchedule[0]; 
  isCompleted: boolean;
}) => {
  const timeHour = item.scheduledTime.split(':')[0];
  const timeMin = item.scheduledTime.split(':')[1].split(' ')[0];
  const timePeriod = item.scheduledTime.includes('PM') ? 'PM' : 'AM';

  return (
    <View style={styles.scheduleItem}>
      <View style={styles.scheduleTime}>
        <Text style={styles.scheduleHour}>{timeHour}:{timeMin}</Text>
        <Text style={styles.schedulePeriod}>{timePeriod}</Text>
      </View>
      <View style={styles.scheduleContent}>
        <Text style={styles.schedulePeptide}>{item.peptideName}</Text>
        <Text style={styles.scheduleDose}>{item.dose} {item.unit}</Text>
      </View>
      <View style={[
        styles.scheduleStatus,
        isCompleted && styles.scheduleStatusCompleted,
      ]}>
        {isCompleted && (
          <Ionicons name="checkmark" size={16} color={COLORS.primary} />
        )}
      </View>
    </View>
  );
};

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(12);
  const completedCount = todaysSchedule.filter(d => d.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>March 2026</Text>
        </View>
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Strip */}
        <View style={styles.calendarCard}>
          <CalendarStrip 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
        </View>

        {/* Up Next Card */}
        <UpNextCard />

        {/* Today's Protocol */}
        <View style={styles.protocolHeader}>
          <Text style={styles.protocolTitle}>Today's Protocol</Text>
          <Text style={styles.protocolCount}>{completedCount}/{todaysSchedule.length} done</Text>
        </View>

        <View style={styles.scheduleList}>
          {todaysSchedule.map((item) => (
            <ScheduleItem 
              key={item.id} 
              item={item} 
              isCompleted={item.completed}
            />
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  navButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  calendarCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 40,
  },
  dayContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  dayNameSelected: {
    color: COLORS.background,
  },
  dayNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dayNumberSelected: {
    color: COLORS.background,
  },
  upNextCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  upNextHeader: {
    backgroundColor: 'rgba(26, 188, 156, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  upNextLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  upNextContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  upNextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peptideIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  peptideDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  upNextPeptide: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  upNextTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  upNextRight: {
    alignItems: 'flex-end',
  },
  countdownTime: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  protocolTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  protocolCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  scheduleList: {
    gap: SPACING.md,
  },
  scheduleItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scheduleTime: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    minWidth: 50,
  },
  scheduleHour: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  schedulePeriod: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  scheduleContent: {
    flex: 1,
  },
  schedulePeptide: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  scheduleDose: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  scheduleStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleStatusCompleted: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(26, 188, 156, 0.1)',
  },
});
