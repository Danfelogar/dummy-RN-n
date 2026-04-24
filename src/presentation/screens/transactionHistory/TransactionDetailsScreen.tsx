import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, WifiOff } from 'lucide-react-native';
import { Surface, Text } from 'react-native-paper';

import { TRANSACTION_DETAILS_STRINGS } from './transactiondetails.strings';
import {
  BodyText,
  colors,
  heightFullScreen,
  StandardWrapper,
  TitleText,
  widthFullScreen,
} from '../../../shared';
import { BlockchainVerifiedCard, TransactionInfoCard } from '../../components';
import { useTransactionDetails } from '../../hooks';
import { RootStackMainParams } from '../../navigation';

type Props = NativeStackScreenProps<RootStackMainParams, 'DetailsHistory'>;

export const TransactionDetailsScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const { transaction, isFound, dto, isLoading, fromCache } =
    useTransactionDetails(id);

  return (
    <StandardWrapper>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
          accessibilityLabel={
            TRANSACTION_DETAILS_STRINGS.BACK_BUTTON_ACCESSIBILITY
          }
        >
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2.2} />
        </TouchableOpacity>

        <TitleText size="medium" color={colors.onSurface}>
          {TRANSACTION_DETAILS_STRINGS.SCREEN_TITLE}
        </TitleText>

        <View style={styles.backButtonPlaceholder} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <BodyText size="medium" color={colors.onSurfaceVariant}>
            {TRANSACTION_DETAILS_STRINGS.LOADING}
          </BodyText>
        </View>
      ) : !isFound || !transaction || !dto ? (
        <View style={styles.notFound}>
          <BodyText size="large" color={colors.onSurfaceVariant}>
            {TRANSACTION_DETAILS_STRINGS.NOT_FOUND_TITLE}
          </BodyText>
          <BodyText size="medium" color={colors.onSurfaceVariant}>
            {TRANSACTION_DETAILS_STRINGS.NOT_FOUND_SUBTITLE}
          </BodyText>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {fromCache && (
            <Surface style={styles.cacheBanner} elevation={0}>
              <View style={styles.cacheBannerInner}>
                <WifiOff size={18} color={colors.warning} />
                <Text
                  variant="bodySmall"
                  style={{ color: colors.warning, flex: 1 }}
                >
                  {TRANSACTION_DETAILS_STRINGS.CACHE_BANNER}
                </Text>
              </View>
            </Surface>
          )}

          <TransactionInfoCard transaction={transaction} dto={dto} />

          {transaction.getStatus() === 'PROCESSED' && (
            <BlockchainVerifiedCard
              hash={TRANSACTION_DETAILS_STRINGS.BLOCKCHAIN_HASH_MOCK}
              onViewReceipt={() => {}}
            />
          )}
        </ScrollView>
      )}
    </StandardWrapper>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthFullScreen * 0.04,
    paddingTop: widthFullScreen * 0.03,
    paddingBottom: widthFullScreen * 0.03,
  },
  backButton: {
    width: widthFullScreen * 0.1,
    height: widthFullScreen * 0.1,
    borderRadius: widthFullScreen * 0.05,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: widthFullScreen * 0.1,
  },
  scrollContent: {
    paddingHorizontal: widthFullScreen * 0.04,
    paddingBottom: heightFullScreen * 0.05,
    gap: widthFullScreen * 0.04,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: widthFullScreen * 0.02,
    paddingHorizontal: widthFullScreen * 0.08,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: widthFullScreen * 0.03,
  },
  cacheBanner: {
    borderRadius: 12,
    backgroundColor: colors.warningLight ?? '#FFF3CD',
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  cacheBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
