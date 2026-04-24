import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ArrowUpRight } from 'lucide-react-native';
import { JSX } from 'react';

import {
  BodyText,
  LabelText,
  widthFullScreen,
  colors as staticColors,
} from '../../../shared';
import { HOME_STRINGS } from '../../screens';


interface ActiveGoalsCardProps {
  savingsCount: number;
  onPress?: () => void;
}

export const ActiveGoalsCard = ({
  savingsCount,
  onPress,
}: ActiveGoalsCardProps): JSX.Element => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: staticColors.goalsBackground }]}
    >
      <View style={styles.content}>
        <BodyText
          size="medium"
          color={staticColors.goalsText}
          style={styles.title}
        >
          {HOME_STRINGS.activeGoals}
        </BodyText>
        <LabelText
          size="large"
          color={staticColors.goalsText}
          style={styles.count}
        >
          {HOME_STRINGS.savingsCount(savingsCount)}
        </LabelText>
      </View>
      <ArrowUpRight
        size={widthFullScreen * 0.065}
        color={staticColors.goalsArrow}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: widthFullScreen * 0.04,
    marginTop: widthFullScreen * 0.035,
    borderRadius: 14,
    padding: widthFullScreen * 0.045,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    gap: widthFullScreen * 0.01,
  },
  title: {
    fontWeight: '600',
  },
  count: {
    fontWeight: '700',
    fontSize: widthFullScreen * 0.048,
  },
  arrow: {
    fontSize: widthFullScreen * 0.065,
    fontWeight: '700',
  },
});
