import { RefreshCw, WifiOff } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme';
import { TRANSACTION_HISTORY_STRINGS } from '../../presentation';
import { widthFullScreen } from '../utils';

interface OfflineBannerProps {
  onRefresh: () => void;
}

export const OfflineBanner = ({ onRefresh }: OfflineBannerProps) => (
  <View style={styles.offlineBanner}>
    <WifiOff size={16} color={colors.warning} />
    <Text variant="bodySmall" style={styles.offlineBannerText}>
      {TRANSACTION_HISTORY_STRINGS.OFFLINE_BANNER_BODY}
    </Text>
    <TouchableOpacity
      onPress={onRefresh}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <RefreshCw size={16} color={colors.warning} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningLight ?? '#FFF3CD',
    paddingHorizontal: widthFullScreen * 0.04,
    paddingVertical: 8,
    marginHorizontal: widthFullScreen * 0.04,
    marginTop: widthFullScreen * 0.03,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  offlineBannerText: {
    flex: 1,
    color: colors.warning,
    fontWeight: '500',
  },
});
