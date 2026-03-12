import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={48} color={COLORS.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Pre-configured empty states for common scenarios
export const EmptyPeptides: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState
    icon="flask-outline"
    title="No Peptides Yet"
    message="Add your first peptide to start tracking your protocol"
    actionLabel="Add Peptide"
    onAction={onAdd}
  />
);

export const EmptyLogs: React.FC<{ onLog: () => void }> = ({ onLog }) => (
  <EmptyState
    icon="calendar-outline"
    title="No Doses Logged"
    message="Start logging your doses to track adherence"
    actionLabel="Log Dose"
    onAction={onLog}
  />
);

export const EmptyLibrary: React.FC<{ onSearch?: () => void }> = ({ onSearch }) => (
  <EmptyState
    icon="search-outline"
    title="No Peptides Found"
    message="Try adjusting your search or filters"
    actionLabel={onSearch ? "Clear Filters" : undefined}
    onAction={onSearch}
  />
);

export const EmptySchedule: React.FC = () => (
  <EmptyState
    icon="time-outline"
    title="No Upcoming Doses"
    message="Your schedule is clear for now"
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  actionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
});
