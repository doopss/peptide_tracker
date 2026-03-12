import { create } from 'zustand';

// Types
export interface Peptide {
  id: string;
  name: string;
  dose: number;
  unit: 'mcg' | 'mg';
  frequency: string;
  category: 'Recovery' | 'Growth' | 'Metabolic' | 'Cognitive' | 'Longevity';
  color: string;
}

export interface DoseLog {
  id: string;
  peptideId: string;
  amount: number;
  timestamp: Date;
}

interface AppState {
  // State
  peptides: Peptide[];
  logs: DoseLog[];
  
  // Actions
  addPeptide: (peptide: Omit<Peptide, 'id'>) => void;
  logDose: (peptideId: string, amount: number) => void;
  
  // Computed / Getters
  getTodaysLogs: () => DoseLog[];
  getAdherenceRate: () => number;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to check if date is today
const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Helper to check if date is within last N days
const isWithinDays = (date: Date, days: number) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= pastDate && date <= now;
};

// Create dates for sample logs (past week)
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(8, 0, 0, 0);
  return date;
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
  },
  {
    id: 'pep_2',
    name: 'TB-500',
    dose: 2,
    unit: 'mg',
    frequency: 'Twice weekly',
    category: 'Recovery',
    color: '#9B59B6',
  },
  {
    id: 'pep_3',
    name: 'Ipamorelin',
    dose: 100,
    unit: 'mcg',
    frequency: 'Once daily',
    category: 'Growth',
    color: '#3498DB',
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

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state with sample data
  peptides: samplePeptides,
  logs: sampleLogs,

  // Add a new peptide
  addPeptide: (peptide) => {
    const newPeptide: Peptide = {
      ...peptide,
      id: generateId(),
    };
    set((state) => ({
      peptides: [...state.peptides, newPeptide],
    }));
  },

  // Log a dose
  logDose: (peptideId, amount) => {
    const newLog: DoseLog = {
      id: generateId(),
      peptideId,
      amount,
      timestamp: new Date(),
    };
    set((state) => ({
      logs: [...state.logs, newLog],
    }));
  },

  // Get today's logs
  getTodaysLogs: () => {
    const { logs } = get();
    return logs.filter((log) => isToday(new Date(log.timestamp)));
  },

  // Calculate 7-day adherence rate
  // Adherence = (actual doses logged / expected doses) * 100
  getAdherenceRate: () => {
    const { peptides, logs } = get();
    
    // Get logs from last 7 days
    const recentLogs = logs.filter((log) => 
      isWithinDays(new Date(log.timestamp), 7)
    );

    // Calculate expected doses per peptide based on frequency
    const getExpectedDosesPerWeek = (frequency: string): number => {
      switch (frequency.toLowerCase()) {
        case 'twice daily':
          return 14;
        case 'once daily':
          return 7;
        case 'twice weekly':
          return 2;
        case 'once weekly':
          return 1;
        default:
          return 7;
      }
    };

    // Total expected doses in 7 days
    const totalExpected = peptides.reduce(
      (sum, p) => sum + getExpectedDosesPerWeek(p.frequency),
      0
    );

    // Actual doses logged
    const totalActual = recentLogs.length;

    // Calculate percentage (cap at 100%)
    if (totalExpected === 0) return 0;
    const rate = Math.min((totalActual / totalExpected) * 100, 100);
    
    return Math.round(rate);
  },
}));
