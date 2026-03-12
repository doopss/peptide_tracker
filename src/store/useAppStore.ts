import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Peptide {
  id: string;
  name: string;
  dose: number;
  unit: 'mcg' | 'mg' | 'IU';
  frequency: string;
  category: 'Recovery' | 'Growth' | 'Metabolic' | 'Cognitive' | 'Longevity';
  color: string;
  isActive: boolean;
}

export interface DoseLog {
  id: string;
  peptideId: string;
  amount: number;
  timestamp: string; // ISO string for serialization
  notes?: string;
}

export interface AppSettings {
  defaultUnit: 'mcg' | 'mg' | 'IU';
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm format
  hapticsEnabled: boolean;
}

interface AppState {
  // State
  peptides: Peptide[];
  logs: DoseLog[];
  settings: AppSettings;
  isHydrated: boolean;
  
  // Actions
  addPeptide: (peptide: Omit<Peptide, 'id'>) => void;
  updatePeptide: (id: string, updates: Partial<Peptide>) => void;
  deletePeptide: (id: string) => void;
  togglePeptideActive: (id: string) => void;
  logDose: (peptideId: string, amount: number, notes?: string) => void;
  deleteLog: (logId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setHydrated: (hydrated: boolean) => void;
  exportData: () => { peptides: Peptide[]; logs: DoseLog[] };
  importData: (data: { peptides: Peptide[]; logs: DoseLog[] }) => void;
  
  // Computed / Getters
  getTodaysLogs: () => DoseLog[];
  getLogsForPeptide: (peptideId: string) => DoseLog[];
  getAdherenceRate: (days?: number) => number;
  getPeptideStats: (peptideId: string) => { totalDoses: number; lastTaken: Date | null; adherence7Day: number };
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to check if date is today
const isToday = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Helper to check if date is within last N days
const isWithinDays = (dateString: string, days: number) => {
  const date = new Date(dateString);
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= pastDate && date <= now;
};

// Create dates for sample logs (past week)
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(8, 0, 0, 0);
  return date.toISOString();
};

// Sample peptides
const samplePeptides: Peptide[] = [
  {
    id: 'pep_1',
    name: 'BPC-157',
    dose: 200,
    unit: 'mcg',
    frequency: 'Twice daily',
    category: 'Recovery',
    color: '#E74C3C',
    isActive: true,
  },
  {
    id: 'pep_2',
    name: 'TB-500',
    dose: 2,
    unit: 'mg',
    frequency: 'Twice weekly',
    category: 'Recovery',
    color: '#9B59B6',
    isActive: true,
  },
  {
    id: 'pep_3',
    name: 'Ipamorelin',
    dose: 100,
    unit: 'mcg',
    frequency: 'Once daily',
    category: 'Growth',
    color: '#3498DB',
    isActive: true,
  },
];

// Sample logs from past week (for adherence calculation)
const sampleLogs: DoseLog[] = [
  // Today
  { id: 'log_1', peptideId: 'pep_1', amount: 200, timestamp: daysAgo(0) },
  // Yesterday
  { id: 'log_2', peptideId: 'pep_1', amount: 200, timestamp: daysAgo(1) },
  { id: 'log_3', peptideId: 'pep_3', amount: 100, timestamp: daysAgo(1) },
  // 3 days ago
  { id: 'log_4', peptideId: 'pep_1', amount: 200, timestamp: daysAgo(3) },
  { id: 'log_5', peptideId: 'pep_2', amount: 2, timestamp: daysAgo(3) },
  // 5 days ago
  { id: 'log_6', peptideId: 'pep_1', amount: 200, timestamp: daysAgo(5) },
];

const defaultSettings: AppSettings = {
  defaultUnit: 'mcg',
  notificationsEnabled: true,
  reminderTime: '08:00',
  hapticsEnabled: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      peptides: samplePeptides,
      logs: sampleLogs,
      settings: defaultSettings,
      isHydrated: false,

      // Add a new peptide
      addPeptide: (peptide) => {
        const newPeptide: Peptide = {
          ...peptide,
          id: generateId(),
          isActive: true,
        };
        set((state) => ({
          peptides: [...state.peptides, newPeptide],
        }));
      },

      // Update an existing peptide
      updatePeptide: (id, updates) => {
        set((state) => ({
          peptides: state.peptides.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      // Delete a peptide
      deletePeptide: (id) => {
        set((state) => ({
          peptides: state.peptides.filter((p) => p.id !== id),
          logs: state.logs.filter((l) => l.peptideId !== id),
        }));
      },

      // Toggle peptide active status
      togglePeptideActive: (id) => {
        set((state) => ({
          peptides: state.peptides.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        }));
      },

      // Log a dose
      logDose: (peptideId, amount, notes) => {
        if (amount <= 0 || isNaN(amount)) {
          console.error('Invalid dose amount:', amount);
          return;
        }
        
        const newLog: DoseLog = {
          id: generateId(),
          peptideId,
          amount,
          timestamp: new Date().toISOString(),
          notes,
        };
        set((state) => ({
          logs: [...state.logs, newLog],
        }));
      },

      // Delete a log
      deleteLog: (logId) => {
        set((state) => ({
          logs: state.logs.filter((l) => l.id !== logId),
        }));
      },

      // Update settings
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // Set hydrated status
      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },

      // Export all data
      exportData: () => {
        const { peptides, logs } = get();
        return { peptides, logs };
      },

      // Import data
      importData: (data) => {
        set({
          peptides: data.peptides,
          logs: data.logs,
        });
      },

      // Get today's logs
      getTodaysLogs: () => {
        const { logs } = get();
        return logs.filter((log) => isToday(log.timestamp));
      },

      // Get logs for a specific peptide
      getLogsForPeptide: (peptideId) => {
        const { logs } = get();
        return logs
          .filter((log) => log.peptideId === peptideId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      // Calculate adherence rate for given days (default 7)
      getAdherenceRate: (days = 7) => {
        const { peptides, logs } = get();
        
        // Only count active peptides
        const activePeptides = peptides.filter((p) => p.isActive);
        
        // Get logs from last N days
        const recentLogs = logs.filter((log) => 
          isWithinDays(log.timestamp, days)
        );

        // Calculate expected doses per peptide based on frequency
        const getExpectedDoses = (frequency: string, days: number): number => {
          const daily = frequency.toLowerCase().includes('daily');
          const twice = frequency.toLowerCase().includes('twice');
          const weekly = frequency.toLowerCase().includes('weekly');
          
          if (daily && twice) return (days / 7) * 14; // Twice daily
          if (daily) return days; // Once daily
          if (weekly && twice) return (days / 7) * 2; // Twice weekly
          if (weekly) return days / 7; // Once weekly
          return days; // Default to daily
        };

        // Total expected doses
        const totalExpected = activePeptides.reduce(
          (sum, p) => sum + getExpectedDoses(p.frequency, days),
          0
        );

        // Actual doses logged (only for active peptides)
        const totalActual = recentLogs.filter(
          (log) => activePeptides.some((p) => p.id === log.peptideId)
        ).length;

        // Calculate percentage (cap at 100%)
        if (totalExpected === 0) return 0;
        const rate = Math.min((totalActual / totalExpected) * 100, 100);
        
        return Math.round(rate);
      },

      // Get stats for a specific peptide
      getPeptideStats: (peptideId) => {
        const { logs } = get();
        const peptideLogs = logs.filter((l) => l.peptideId === peptideId);
        
        const totalDoses = peptideLogs.length;
        const lastTaken = peptideLogs.length > 0 
          ? new Date(peptideLogs[peptideLogs.length - 1].timestamp)
          : null;
        
        // Calculate 7-day adherence for this peptide
        const recentLogs = peptideLogs.filter((l) => 
          isWithinDays(l.timestamp, 7)
        );
        
        // Get peptide to check frequency
        const peptide = get().peptides.find((p) => p.id === peptideId);
        let expected = 7; // Default daily
        if (peptide) {
          const freq = peptide.frequency.toLowerCase();
          if (freq.includes('twice daily')) expected = 14;
          else if (freq.includes('twice weekly')) expected = 2;
          else if (freq.includes('weekly')) expected = 1;
        }
        
        const adherence7Day = expected > 0 
          ? Math.min((recentLogs.length / expected) * 100, 100)
          : 0;

        return { totalDoses, lastTaken, adherence7Day: Math.round(adherence7Day) };
      },
    }),
    {
      name: 'peptide-tracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Hook to check if store is hydrated
export const useStoreHydrated = () => {
  return useAppStore((state) => state.isHydrated);
};
