import { Peptide } from '../store/useAppStore';

export type RootTabParamList = {
  Home: undefined;
  Log: { selectedPeptide?: Peptide } | undefined;
  Library: undefined;
  Schedule: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
