import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';

import { NavigationMain, theme } from './src';

function App() {
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <NavigationMain />
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
