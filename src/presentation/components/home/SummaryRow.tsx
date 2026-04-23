import { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BodyText,
  LabelText,
  useAppTheme,
  widthFullScreen,
  colors as staticColors,
  formatAmount,
} from '../../../shared';
import { HOME_STRINGS } from '../../screens';
import { userInformationStorage } from '../../../infrastructure/storage/mmkv';

export const SummaryRow = (): JSX.Element => {
  const { colors } = useAppTheme();
  const userDetails = userInformationStorage(state => state.userDetails);
  return (
    <View style={styles.row}>
      {/* Month Income */}
      <View
        style={[
          styles.card,
          { backgroundColor: staticColors.incomeBackground },
        ]}
      >
        <LabelText size="medium" color={staticColors.incomeText}>
          {HOME_STRINGS.monthIncome}
        </LabelText>
        <BodyText
          size="large"
          color={staticColors.incomeText}
          style={styles.amount}
        >
          {formatAmount(userDetails.month_income, '+')}
        </BodyText>
      </View>

      {/* Spent */}
      <View style={[styles.card, { backgroundColor: colors.surfaceVariant }]}>
        <LabelText size="medium" color={colors.onSurfaceVariant}>
          {HOME_STRINGS.spent}
        </LabelText>
        <BodyText size="large" color={colors.onSurface} style={styles.amount}>
          {formatAmount(userDetails.spent, 'FAILED')}
        </BodyText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: widthFullScreen * 0.04,
    marginTop: widthFullScreen * 0.035,
    gap: widthFullScreen * 0.03,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    padding: widthFullScreen * 0.045,
    gap: widthFullScreen * 0.02,
  },
  amount: {
    fontWeight: '700',
    fontSize: widthFullScreen * 0.055,
  },
});
