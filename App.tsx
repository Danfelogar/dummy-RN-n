import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';

import { NavigationMain, PortalProvider, theme } from './src';

function App() {
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <PortalProvider>
          <NavigationMain />
        </PortalProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
