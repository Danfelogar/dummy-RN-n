import { StyleSheet, View } from 'react-native';

import { JSX } from 'react';

import { PayinStatus } from '../../../domain';
import { LabelText, widthFullScreen } from '../../../shared';
import { colors as staticColors } from '../../../shared/theme/colors';

interface StatusBadgeProps {
  status: PayinStatus;
}

const STATUS_CONFIG: Record<
  PayinStatus,
  { bg: string; text: string; label: string }
> = {
  PROCESSED: {
    bg: staticColors.statusProcessedBg,
    text: staticColors.statusProcessedText,
    label: 'PROCESSED',
  },
  FAILED: {
    bg: staticColors.statusFailedBg,
    text: staticColors.statusFailedText,
    label: 'FAILED',
  },
  VALIDATED: {
    bg: staticColors.statusValidatedBg,
    text: staticColors.statusValidatedText,
    label: 'VALIDATED',
  },
  CREATED: {
    bg: staticColors.statusCreatedBg,
    text: staticColors.statusCreatedText,
    label: 'CREATED',
  },
};

export const StatusBadge = ({ status }: StatusBadgeProps): JSX.Element => {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <LabelText size="small" color={config.text} style={styles.label}>
        {config.label}
      </LabelText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: widthFullScreen * 0.02,
    paddingVertical: widthFullScreen * 0.008,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
    fontSize: widthFullScreen * 0.025,
    letterSpacing: 0.5,
  },
});
