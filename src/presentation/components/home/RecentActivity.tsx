import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { JSX } from 'react';

import { PayIn } from '../../../domain';
import {
  BodyText,
  heightFullScreen,
  isIOS,
  LabelText,
  TransactionItem,
  useAppTheme,
  widthFullScreen,
} from '../../../shared';
import { HOME_STRINGS } from '../../screens';

interface RecentActivityProps {
  transactions: PayIn[];
  onSeeAll?: () => void;
}

export const RecentActivity = ({
  transactions,
  onSeeAll,
}: RecentActivityProps): JSX.Element => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BodyText size="large" color={colors.onSurface} style={styles.title}>
          {HOME_STRINGS.recentActivity}
        </BodyText>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <LabelText size="large" color={colors.primary} style={styles.seeAll}>
            {HOME_STRINGS.seeAll}
          </LabelText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={({ item, index }) => (
          <TransactionItem item={item} customKey={index} />
        )}
        keyExtractor={item => item.getId()}
        style={[styles.list, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={3}
        getItemLayout={undefined}
      />
      <View style={[styles.divider]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: widthFullScreen * 0.05,
    marginHorizontal: widthFullScreen * 0.04,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: widthFullScreen * 0.035,
  },
  title: {
    fontWeight: '700',
  },
  seeAll: {
    fontWeight: '600',
  },
  list: {
    height: isIOS() ? heightFullScreen * 0.3 : heightFullScreen * 0.33,
    borderRadius: 16,
    paddingHorizontal: widthFullScreen * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  listContent: {
    paddingVertical: widthFullScreen * 0.02,
  },
  itemContainer: {
    paddingVertical: widthFullScreen * 0.015,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: heightFullScreen * 0.3,
  },
});
