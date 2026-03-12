import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { peptideLibrary } from '../data/mockData';
import { PeptideCategory } from '../types';

const categories: ('All' | PeptideCategory)[] = ['All', 'Growth', 'Recovery', 'Cognitive', 'Metabolic', 'Longevity'];

const getCategoryColor = (category: PeptideCategory) => {
  switch (category) {
    case 'Recovery': return COLORS.recovery;
    case 'Metabolic': return COLORS.metabolic;
    case 'Growth': return COLORS.growth;
    case 'Cognitive': return COLORS.cognitive;
    case 'Longevity': return COLORS.longevity;
    default: return COLORS.primary;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return COLORS.activeBadge;
    case 'paused': return COLORS.pausedBadge;
    default: return COLORS.inactiveBadge;
  }
};

const PeptideCard = ({ peptide }: { peptide: typeof peptideLibrary[0] }) => {
  const categoryColor = getCategoryColor(peptide.category);
  const statusColor = getStatusColor(peptide.status);

  return (
    <View style={styles.peptideCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.peptideIcon, { borderColor: categoryColor }]}>
          <Text style={[styles.peptideIconText, { color: categoryColor }]}>
            {peptide.abbreviation}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {peptide.status.charAt(0).toUpperCase() + peptide.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.peptideName}>{peptide.name}</Text>
      <Text style={styles.peptideDescription} numberOfLines={2}>
        {peptide.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={[styles.categoryTag, { backgroundColor: `${categoryColor}20` }]}>
          <Text style={[styles.categoryTagText, { color: categoryColor }]}>
            {peptide.category}
          </Text>
        </View>
        <View style={styles.halfLifeContainer}>
          <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.halfLifeText}>{peptide.halfLife}</Text>
        </View>
      </View>

      <Text style={styles.statusLabel}>
        {peptide.status === 'active' ? 'Established' : peptide.status === 'paused' ? 'Paused' : 'Emerging'}
      </Text>
    </View>
  );
};

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | PeptideCategory>('All');

  const filteredPeptides = peptideLibrary.filter((peptide) => {
    const matchesSearch = peptide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         peptide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || peptide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.subtitle}>{peptideLibrary.length} peptides</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search peptides..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Peptide Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredPeptides.map((peptide) => (
            <PeptideCard key={peptide.id} peptide={peptide} />
          ))}
        </View>
        
        {/* Made with Badge */}
        <View style={styles.madeWithContainer}>
          <Ionicons name="sparkles" size={14} color={COLORS.primary} />
          <Text style={styles.madeWithText}>Made with Replit</Text>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  categoriesContainer: {
    maxHeight: 44,
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryButtonTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  peptideCard: {
    width: '48%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  peptideIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peptideIconText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.background,
  },
  peptideName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  peptideDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryTagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  halfLifeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  halfLifeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  statusLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  madeWithContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  madeWithText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
