export interface Peptide {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  category: PeptideCategory;
  defaultDose: number;
  doseUnit: 'mcg' | 'mg';
  frequency: string;
  halfLife: string;
  status: 'active' | 'inactive' | 'paused';
}

export type PeptideCategory = 'Growth' | 'Recovery' | 'Cognitive' | 'Metabolic' | 'Longevity';

export interface UserPeptide extends Peptide {
  customDose?: number;
  scheduledTimes: string[];
  nextDose?: string;
  lastLogged?: string;
}

export interface DoseLog {
  id: string;
  peptideId: string;
  peptideName: string;
  dose: number;
  unit: 'mcg' | 'mg';
  loggedAt: Date;
  scheduledTime?: string;
  notes?: string;
}

export interface ScheduledDose {
  id: string;
  peptideId: string;
  peptideName: string;
  dose: number;
  unit: 'mcg' | 'mg';
  scheduledTime: string;
  completed: boolean;
  completedAt?: Date;
}

export interface DaySchedule {
  date: Date;
  doses: ScheduledDose[];
}
