import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';

import {
  AppToast,
  NavigationMain,
  PortalProvider,
  theme,
  useOfflineQueueProcessor,
} from './src';

function App() {
  useOfflineQueueProcessor();

  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <PortalProvider>
          <NavigationMain />
        </PortalProvider>
        <AppToast />
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
