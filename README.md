# Peptide Tracker

A React Native mobile app for tracking peptide dosing protocols with adherence monitoring.

## Features

### Core Functionality
- **Dashboard**: View adherence ring, daily peptide list, and quick stats
- **Dose Logging**: Intuitive number pad for logging doses with unit toggle
- **Peptide Library**: Search and browse peptides by category
- **Peptide Details**: Full history, statistics, and protocol management per peptide
- **Stats & Analytics**: Visualize adherence trends with charts and insights
- **Settings**: Notifications, haptics, data export, and app preferences

### Technical Highlights
- **Persistent Storage**: AsyncStorage with Zustand for offline-first data
- **Haptic Feedback**: Customizable vibration patterns for interactions
- **Toast Notifications**: Non-intrusive user feedback
- **Error Boundaries**: Graceful error handling with recovery options
- **Input Validation**: Smart dose validation with user-friendly errors
- **Pull-to-Refresh**: Dashboard data refresh gesture
- **Confirm Dialogs**: Destructive action protection

## Screenshots

*(Screenshots to be added)*

## Tech Stack

- **Framework**: React Native with Expo
- **State Management**: Zustand with persistence middleware
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Styling**: StyleSheet with design system constants
- **Storage**: AsyncStorage for local data persistence
- **Haptics**: Expo Haptics for tactile feedback

## Installation

```bash
# Clone the repository
git clone https://github.com/doopss/peptide_tracker.git
cd peptide_tracker

# Install dependencies
npm install

# Start the development server
npm start
```

## Development Branches

- `main` - Production-ready code
- `feature/codebase-improvements` - Infrastructure & persistence
- `feature/ux-enhancements` - Haptics, validation, feedback
- `feature/new-screens` - Settings, Stats, PeptideDetail screens

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ConfirmDialog.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   └── Toast.tsx
├── constants/        # Theme & design system
│   └── theme.ts
├── navigation/       # Navigation configuration
│   ├── TabNavigator.tsx
│   └── types.ts
├── screens/          # Screen components
│   ├── DashboardScreen.tsx
│   ├── DoseLogScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── PeptideDetailScreen.tsx
│   ├── ScheduleScreen.tsx
│   ├── SettingsScreen.tsx
│   └── StatsScreen.tsx
├── store/            # State management
│   └── useAppStore.ts
└── utils/            # Utility functions
    └── haptics.ts
```

## Features Breakdown

### Dashboard Screen
- Real-time adherence calculation (7-day rolling)
- Today's peptide cards with logged status
- 7-day streak counter
- Total doses counter
- Pull-to-refresh functionality
- Quick navigation to dose logging

### Dose Log Screen
- Custom numeric keypad
- Peptide selector with modal
- Unit toggle (mcg/mg/IU)
- Preset dose buttons
- Input validation (prevent 0, negative, excessive doses)
- Haptic feedback on key press
- Success/error toast notifications

### Peptide Detail Screen
- Peptide info card with status badge
- Tab switcher: History / Stats
- Full dose history with delete option
- Individual peptide statistics
- Protocol information display
- Pause/Activate toggle
- Delete peptide with confirmation
- Quick log dose button

### Stats Screen
- Time range selector (7/30/90 days)
- Circular adherence progress indicator
- Quick stats cards (doses, active protocols, streak)
- Activity bar chart
- Peptide breakdown by dose count
- Dynamic insights based on adherence

### Settings Screen
- Notifications toggle
- Haptic feedback toggle
- Default unit selector
- Data export (Share sheet)
- Clear all data with confirmation
- App version info

### Library Screen
- Peptide grid display
- Category filter pills
- Search functionality
- Status badges (Active/Paused/Inactive)

## Data Model

### Peptide
```typescript
{
  id: string;
  name: string;
  dose: number;
  unit: 'mcg' | 'mg' | 'IU';
  frequency: string;
  category: 'Recovery' | 'Growth' | 'Metabolic' | 'Cognitive' | 'Longevity';
  color: string;
  isActive: boolean;
}
```

### Dose Log
```typescript
{
  id: string;
  peptideId: string;
  amount: number;
  timestamp: string; // ISO format
  notes?: string;
}
```

### Settings
```typescript
{
  defaultUnit: 'mcg' | 'mg' | 'IU';
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm
  hapticsEnabled: boolean;
}
```

## Future Enhancements

- [ ] Calendar view for schedule visualization
- [ ] Push notification reminders
- [ ] Export to CSV/PDF
- [ ] Multiple user profiles
- [ ] Cloud sync
- [ ] Dark/Light theme toggle
- [ ] Biometric authentication
- [ ] Widget support

## License

MIT

## Author

Built with React Native and Expo
