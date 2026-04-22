import { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BodyText,
  LabelText,
  TitleText,
  useAppTheme,
  widthFullScreen,
} from '../../../shared';
import { HOME_STRINGS } from '../../screens';
import { Button } from 'react-native-paper';

interface BalanceCardProps {
  balance: string;
  onTopUp?: () => void;
  onSend?: () => void;
}

export const BalanceCard = ({
  balance,
  onTopUp,
  onSend,
}: BalanceCardProps): JSX.Element => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <BodyText size="medium" color={colors.onSurfaceVariant}>
          {HOME_STRINGS.availableBalance}
        </BodyText>
        <View
          style={[
            styles.walletIcon,
            { backgroundColor: colors.primaryContainer },
          ]}
        >
          <BodyText size="medium" color={colors.primary}>
            💳
          </BodyText>
        </View>
      </View>

      <TitleText
        size="large"
        style={styles.balanceAmount}
        color={colors.onSurface}
      >
        {balance}
      </TitleText>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={onTopUp}
          style={styles.paperBtn}
          labelStyle={styles.paperBtnLabel}
          icon="plus"
          textColor={colors.onPrimary}
          contentStyle={styles.paperBtnContent}
        >
          <LabelText
            size="large"
            color={colors.onPrimary}
            style={styles.btnText}
          >
            {HOME_STRINGS.topUp}
          </LabelText>
        </Button>

        <Button
          mode="outlined"
          onPress={onSend}
          style={styles.paperBtn}
          labelStyle={styles.paperBtnLabel}
          icon="send"
          textColor={colors.onSurface}
          contentStyle={styles.paperBtnContent}
        >
          <LabelText
            size="large"
            color={colors.onSurface}
            style={styles.btnText}
          >
            {HOME_STRINGS.send}
          </LabelText>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: widthFullScreen * 0.04,
    marginTop: widthFullScreen * 0.04,
    borderRadius: 16,
    padding: widthFullScreen * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletIcon: {
    width: widthFullScreen * 0.11,
    height: widthFullScreen * 0.11,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceAmount: {
    marginTop: widthFullScreen * 0.02,
    marginBottom: widthFullScreen * 0.045,
    fontSize: widthFullScreen * 0.072,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: widthFullScreen * 0.03,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: widthFullScreen * 0.033,
    borderRadius: 50,
    alignItems: 'center',
  },
  btnOutline: {
    flex: 1,
    paddingVertical: widthFullScreen * 0.033,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '600',
  },
  paperBtn: {
    flex: 1,
    borderRadius: 50,
  },
  paperBtnContent: {
    paddingVertical: 0,
  },
  paperBtnLabel: {
    fontWeight: '600',
    fontSize: widthFullScreen * 0.038,
  },
});
