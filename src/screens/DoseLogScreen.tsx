import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useAppStore, Peptide } from '../store/useAppStore';
import { RootTabParamList } from '../navigation/types';

type DoseLogRouteProp = RouteProp<RootTabParamList, 'Log'>;
type DoseUnit = 'mcg' | 'mg';

export default function DoseLogScreen() {
  const route = useRoute<DoseLogRouteProp>();
  const navigation = useNavigation();
  
  // Get data from Zustand store
  const { peptides, logDose } = useAppStore();
  
  // Get the passed peptide or default to first one
  const initialPeptide = route.params?.selectedPeptide || peptides[0];
  
  const [selectedPeptide, setSelectedPeptide] = useState<Peptide>(initialPeptide);
  const [dosageAmount, setDosageAmount] = useState(String(initialPeptide.dose));
  const [selectedUnit, setSelectedUnit] = useState<DoseUnit>(initialPeptide.unit);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [showPeptidePicker, setShowPeptidePicker] = useState(false);

  // Update state when route params change (e.g., navigating from different peptide cards)
  useEffect(() => {
    if (route.params?.selectedPeptide) {
      const peptide = route.params.selectedPeptide;
      setSelectedPeptide(peptide);
      setDosageAmount(String(peptide.dose));
      setSelectedUnit(peptide.unit);
      setSelectedPreset('');
    }
  }, [route.params?.selectedPeptide]);

  // Generate presets based on selected peptide's unit
  const getPresets = () => {
    if (selectedUnit === 'mg') {
      return ['1 mg', '2 mg', '5 mg'];
    }
    return ['100 mcg', '200 mcg', '500 mcg'];
  };

  const presets = getPresets();

  // Get abbreviation from name
  const getAbbreviation = (name: string) => {
    if (name === 'BPC-157') return 'BPC';
    if (name === 'TB-500') return 'TB';
    if (name === 'Ipamorelin') return 'IPA';
    return name.substring(0, 3).toUpperCase();
  };

  const handleNumberPress = (num: string) => {
    if (num === '.' && dosageAmount.includes('.')) return;
    if (dosageAmount === '0' && num !== '.') {
      setDosageAmount(num);
    } else {
      setDosageAmount(prev => prev + num);
    }
    setSelectedPreset('');
  };

  const handleDelete = () => {
    setDosageAmount(prev => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
    setSelectedPreset('');
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    const parts = preset.split(' ');
    const value = parts[0];
    const unit = parts[1] as DoseUnit;
    setDosageAmount(value);
    setSelectedUnit(unit);
  };

  const handlePeptideSelect = (peptide: Peptide) => {
    setSelectedPeptide(peptide);
    setDosageAmount(String(peptide.dose));
    setSelectedUnit(peptide.unit);
    setSelectedPreset('');
    setShowPeptidePicker(false);
  };

  const handleConfirm = () => {
    const amount = parseFloat(dosageAmount);
    if (!isNaN(amount) && amount > 0) {
      logDose(selectedPeptide.id, amount);
      // Navigate back to home after logging
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Dose</Text>
        <TouchableOpacity>
          <Text style={styles.todayText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Peptide Selector */}
      <TouchableOpacity 
        style={styles.peptideSelector}
        onPress={() => setShowPeptidePicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.peptideInfo}>
          <View style={[styles.peptideIcon, { borderColor: selectedPeptide.color }]}>
            <Text style={[styles.peptideIconText, { color: selectedPeptide.color }]}>
              {getAbbreviation(selectedPeptide.name)}
            </Text>
          </View>
          <View>
            <Text style={styles.peptideName}>{selectedPeptide.name}</Text>
            <Text style={styles.peptideSchedule}>
              {selectedPeptide.frequency} · {selectedPeptide.dose} {selectedPeptide.unit}
            </Text>
          </View>
        </View>
        <View style={styles.changeButton}>
          <Text style={styles.changeText}>Change</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Dosage Display */}
      <View style={styles.dosageSection}>
        <Text style={styles.dosageLabel}>DOSAGE AMOUNT</Text>
        <View style={styles.dosageDisplay}>
          <Text style={styles.dosageValue}>{dosageAmount}</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, selectedUnit === 'mcg' && styles.unitButtonActive]}
              onPress={() => setSelectedUnit('mcg')}
            >
              <Text style={[styles.unitText, selectedUnit === 'mcg' && styles.unitTextActive]}>mcg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, selectedUnit === 'mg' && styles.unitButtonActive]}
              onPress={() => setSelectedUnit('mg')}
            >
              <Text style={[styles.unitText, selectedUnit === 'mg' && styles.unitTextActive]}>mg</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Presets */}
        <View style={styles.presetContainer}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[styles.presetButton, selectedPreset === preset && styles.presetButtonActive]}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text style={[styles.presetText, selectedPreset === preset && styles.presetTextActive]}>
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', 'del']].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.numberButton}
                onPress={() => num === 'del' ? handleDelete() : handleNumberPress(num)}
              >
                {num === 'del' ? (
                  <Ionicons name="backspace-outline" size={24} color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.numberText}>{num}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Ionicons name="checkmark" size={20} color={COLORS.background} />
        <Text style={styles.confirmText}>Confirm Dose</Text>
      </TouchableOpacity>

      {/* Peptide Picker Modal */}
      <Modal
        visible={showPeptidePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPeptidePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Peptide</Text>
              <TouchableOpacity onPress={() => setShowPeptidePicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={peptides}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalPeptideItem,
                    selectedPeptide.id === item.id && styles.modalPeptideItemSelected
                  ]}
                  onPress={() => handlePeptideSelect(item)}
                >
                  <View style={[styles.modalPeptideIcon, { borderColor: item.color }]}>
                    <Text style={[styles.modalPeptideIconText, { color: item.color }]}>
                      {getAbbreviation(item.name)}
                    </Text>
                  </View>
                  <View style={styles.modalPeptideInfo}>
                    <Text style={styles.modalPeptideName}>{item.name}</Text>
                    <Text style={styles.modalPeptideDose}>
                      {item.dose} {item.unit} · {item.frequency}
                    </Text>
                  </View>
                  {selectedPeptide.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  todayText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  peptideSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  peptideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peptideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  peptideIconText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  peptideName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  peptideSchedule: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  dosageSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  dosageLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  dosageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dosageValue: {
    fontSize: 72,
    fontWeight: '300',
    color: COLORS.textPrimary,
    marginRight: SPACING.lg,
  },
  unitToggle: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
  },
  unitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  unitTextActive: {
    color: COLORS.background,
  },
  presetContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  presetButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(26, 188, 156, 0.1)',
  },
  presetText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: COLORS.primary,
  },
  numberPad: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  numberButton: {
    width: 72,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  numberText: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  confirmText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.background,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '60%',
    paddingBottom: SPACING.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalPeptideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalPeptideItemSelected: {
    backgroundColor: 'rgba(26, 188, 156, 0.1)',
  },
  modalPeptideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modalPeptideIconText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  modalPeptideInfo: {
    flex: 1,
  },
  modalPeptideName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  modalPeptideDose: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
