import { JSX, ReactNode } from 'react';
import { StatusBar, useColorScheme, ViewStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export const StandardWrapper = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
          showHideTransition="slide"
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
