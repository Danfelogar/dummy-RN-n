import { StyleSheet, Text, View } from 'react-native';
import { colors, StandardWrapper } from '../../../shared';

export const HomeScreen = () => {
  return (
    <StandardWrapper>
      <View style={styles.container}>
        <Text>HomeScreen</Text>
      </View>
    </StandardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
