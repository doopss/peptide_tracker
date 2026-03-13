import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Share,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { useHapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  showArrow?: boolean;
  destructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  onToggle,
  showArrow = false,
  destructive = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, destructive && styles.destructiveIcon]}>
        <Ionicons
          name={icon as any}
          size={20}
          color={destructive ? COLORS.danger : COLORS.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, destructive && styles.destructiveText]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: `${COLORS.primary}50` }}
          thumbColor={value ? COLORS.primary : COLORS.textMuted}
        />
      )}
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen() {
  const navigation = useNavigation();
  const haptics = useHapticFeedback();
  const { showToast } = useToast();
  
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    peptides, 
    logs,
    deletePeptide,
  } = useAppStore();

  const [showClearDialog, setShowClearDialog] = React.useState(false);

  const handleExport = async () => {
    haptics.medium();
    try {
      const data = exportData();
      const jsonString = JSON.stringify(data, null, 2);
      
      const result = await Share.share({
        message: jsonString,
        title: 'Peptide Tracker Data Export',
      });

      if (result.action === Share.sharedAction) {
        showToast('Data exported successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleClearData = () => {
    haptics.heavy();
    setShowClearDialog(true);
  };

  const confirmClearData = () => {
    // Delete all peptides (which also deletes logs)
    peptides.forEach(peptide => {
      deletePeptide(peptide.id);
    });
    
    setShowClearDialog(false);
    showToast('All data cleared', 'success');
    haptics.success();
  };

  const appVersion = '1.0.0';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Reminders for upcoming doses"
            value={settings.notificationsEnabled}
            onToggle={(value) => {
              haptics.light();
              updateSettings({ notificationsEnabled: value });
              showToast(value ? 'Notifications enabled' : 'Notifications disabled', 'info');
            }}
          />
          <SettingItem
            icon="hand-left-outline"
            title="Haptic Feedback"
            subtitle="Vibration on interactions"
            value={settings.hapticsEnabled}
            onToggle={(value) => {
              updateSettings({ hapticsEnabled: value });
              showToast(value ? 'Haptics enabled' : 'Haptics disabled', 'info');
            }}
          />
        </View>

        {/* Units Section */}
        <SectionHeader title="Default Units" />
        <View style={styles.section}>
          <SettingItem
            icon="scale-outline"
            title="Default Unit"
            subtitle={settings.defaultUnit.toUpperCase()}
            showArrow
            onPress={() => {
              haptics.selection();
              // Could navigate to unit picker
              const units: Array<'mcg' | 'mg' | 'IU'> = ['mcg', 'mg', 'IU'];
              const currentIndex = units.indexOf(settings.defaultUnit);
              const nextUnit = units[(currentIndex + 1) % units.length];
              updateSettings({ defaultUnit: nextUnit });
              showToast(`Default unit set to ${nextUnit.toUpperCase()}`, 'success');
            }}
          />
        </View>

        {/* Data Section */}
        <SectionHeader title="Data Management" />
        <View style={styles.section}>
          <SettingItem
            icon="download-outline"
            title="Export Data"
            subtitle={`${peptides.length} peptides, ${logs.length} logs`}
            showArrow
            onPress={handleExport}
          />
          <SettingItem
            icon="trash-outline"
            title="Clear All Data"
            subtitle="Permanently delete all peptides and logs"
            destructive
            onPress={handleClearData}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingItem
            icon="information-circle-outline"
            title="Version"
            subtitle={appVersion}
          />
          <SettingItem
            icon="heart-outline"
            title="Made with care"
            subtitle="For tracking peptide protocols safely"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Peptide Tracker v{appVersion}
          </Text>
          <Text style={styles.footerSubtext}>
            Track responsibly. Consult healthcare professionals.
          </Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showClearDialog}
        title="Clear All Data?"
        message="This will permanently delete all your peptides and dose logs. This action cannot be undone."
        confirmLabel="Clear Data"
        cancelLabel="Cancel"
        onConfirm={confirmClearData}
        onCancel={() => setShowClearDialog(false)}
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
  sectionHeader: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  destructiveIcon: {
    backgroundColor: `${COLORS.danger}20`,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  destructiveText: {
    color: COLORS.danger,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
