import { JSX } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors as staticColors } from '../../../shared/theme/colors';
import { BodyText, LabelText, widthFullScreen } from '../../../shared';
import { HOME_STRINGS } from '../../screens';

interface PayInSnackbarProps {
  visible: boolean;
  onView?: () => void;
}

export const PayInSnackbar = ({
  visible,
  onView,
}: PayInSnackbarProps): JSX.Element | null => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.snackbar}>
      <View style={styles.left}>
        <View style={styles.checkCircle}>
          <LabelText size="medium" color={staticColors.onPrimary}>
            ✓
          </LabelText>
        </View>
        <View style={styles.textBlock}>
          <BodyText
            size="small"
            color={staticColors.snackbarText}
            style={styles.msg}
          >
            {HOME_STRINGS.payInSubmittedSuccess}
          </BodyText>
          <LabelText size="small" color={staticColors.snackbarText}>
            {HOME_STRINGS.tapToView}
          </LabelText>
        </View>
      </View>
      <TouchableOpacity onPress={onView} activeOpacity={0.7}>
        <LabelText
          size="large"
          color={staticColors.snackbarAction}
          style={styles.action}
        >
          {HOME_STRINGS.view}
        </LabelText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    bottom: widthFullScreen * 0.04,
    left: widthFullScreen * 0.04,
    right: widthFullScreen * 0.04,
    backgroundColor: staticColors.snackbarBackground,
    borderRadius: 14,
    padding: widthFullScreen * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthFullScreen * 0.03,
    flex: 1,
  },
  checkCircle: {
    width: widthFullScreen * 0.09,
    height: widthFullScreen * 0.09,
    borderRadius: widthFullScreen * 0.045,
    backgroundColor: staticColors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
  },
  msg: {
    fontWeight: '600',
  },
  action: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
