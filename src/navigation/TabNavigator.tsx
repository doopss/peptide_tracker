import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { RootTabParamList } from './types';

import DashboardScreen from '../screens/DashboardScreen';
import DoseLogScreen from '../screens/DoseLogScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabIconName = 'home' | 'add-circle' | 'grid' | 'calendar';

const getTabIcon = (routeName: string, focused: boolean): string => {
  const icons: Record<string, { active: string; inactive: string }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    Log: { active: 'add-circle', inactive: 'add-circle-outline' },
    Library: { active: 'grid', inactive: 'grid-outline' },
    Schedule: { active: 'calendar', inactive: 'calendar-outline' },
  };
  
  const icon = icons[routeName] || icons.Home;
  return focused ? icon.active : icon.inactive;
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIcon(route.name, focused);
          return (
            <Ionicons
              name={iconName as any}
              size={24}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactiveTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Log" 
        component={DoseLogScreen}
        options={{ tabBarLabel: 'Log' }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{ tabBarLabel: 'Library' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{ tabBarLabel: 'Schedule' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});
