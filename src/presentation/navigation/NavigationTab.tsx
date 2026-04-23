import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, TrendingUp, History } from 'lucide-react-native';

import { BottomTabsParams } from './navigations';
import {
  HomeScreen,
  PayInScreen,
  TransactionHistoryScreen,
} from '../../presentation';
import { heightFullScreen, useAppTheme, widthFullScreen } from '../../shared';

const tabIconSize = Math.min(widthFullScreen * 0.12, 32);

const Tab = createBottomTabNavigator<BottomTabsParams>();

export const NavigationTab = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: colors.surface,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          height: heightFullScreen * 0.1,
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingTop: heightFullScreen * 0.01,
        },
        tabBarItemStyle: {
          marginBottom: 8,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={tabIconSize} color={color} />,
        }}
      />
      <Tab.Screen
        name="PayIn"
        component={PayInScreen}
        options={{
          tabBarLabel: 'Pay In',
          tabBarIcon: ({ color }) => (
            <TrendingUp size={tabIconSize} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => (
            <History size={tabIconSize} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
