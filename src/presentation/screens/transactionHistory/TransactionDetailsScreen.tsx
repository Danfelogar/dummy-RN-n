import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { RootStackMainParams } from '../../navigation';
import { useTransactionDetails } from '../../hooks';
import {
  BodyText,
  colors,
  heightFullScreen,
  StandardWrapper,
  TitleText,
  widthFullScreen,
} from '../../../shared';
import { TRANSACTION_DETAILS_STRINGS } from './transactiondetails.strings';
import { BlockchainVerifiedCard, TransactionInfoCard } from '../../components';

type Props = NativeStackScreenProps<RootStackMainParams, 'DetailsHistory'>;

export const TransactionDetailsScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const { transaction, isFound, dto } = useTransactionDetails(id);

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

      {!isFound || !transaction || !dto ? (
        // Not-found state
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
});
