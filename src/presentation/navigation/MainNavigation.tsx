import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackMainParams } from './navigations';
import { NavigationTab } from './NavigationTab';
import { TransactionDetailsScreen } from '../../presentation';

const Stack = createNativeStackNavigator<RootStackMainParams>();

export const NavigationMain = () => {
  return (
    <View testID="main-navigator-wrapper" style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="BottomTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="BottomTabs" component={NavigationTab} />
        <Stack.Screen
          name="DetailsHistory"
          component={TransactionDetailsScreen}
        />
      </Stack.Navigator>
    </View>
  );
};
