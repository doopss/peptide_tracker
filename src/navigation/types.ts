import { Peptide } from '../store/useAppStore';

// Tab Navigator Types
export type RootTabParamList = {
  Home: undefined;
  Log: { selectedPeptide?: Peptide } | undefined;
  Library: undefined;
  Schedule: undefined;
  Stats: undefined;
  Settings: undefined;
};

// Stack Navigator Types
export type RootStackParamList = {
  MainTabs: undefined;
  PeptideDetail: { peptideId: string };
};

// Navigation prop types for screens
export type PeptideDetailParams = {
  peptideId: string;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
