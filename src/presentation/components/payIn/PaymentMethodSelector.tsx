import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { CreditCard, Banknote, Coins } from 'lucide-react-native';
import { PaymentMethod } from '../../../domain';
import { PAY_IN_STRINGS } from '../../screens';
import { colors } from '../../../shared';

const PAYMENT_OPTIONS = [
  {
    value: 'CARD',
    label: PAY_IN_STRINGS.PAYMENT_METHOD_CARD,
    Icon: CreditCard,
  },
  {
    value: 'BANK_TRANSFER',
    label: PAY_IN_STRINGS.PAYMENT_METHOD_BANK_TRANSFER,
    Icon: Banknote,
  },
  {
    value: 'CASH',
    label: PAY_IN_STRINGS.PAYMENT_METHOD_CASH,
    Icon: Coins,
  },
];

interface PaymentMethodSelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export const PaymentMethodSelector = <T extends FieldValues>({
  control,
  name,
}: PaymentMethodSelectorProps<T>) => {
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View>
          <Text
            variant="labelLarge"
            style={[styles.label, { color: theme.colors.onSurface }]}
          >
            {PAY_IN_STRINGS.PAYMENT_METHOD_LABEL}
          </Text>

          <View style={styles.optionsContainer}>
            {PAYMENT_OPTIONS.map(option => {
              const isSelected = value === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
                  onPress={() => onChange(option.value)}
                  style={[
                    styles.option,
                    {
                      borderColor: isSelected ? colors.primary : colors.outline,
                      backgroundColor: isSelected
                        ? colors.primaryLight
                        : colors.surface,
                    },
                  ]}
                >
                  <option.Icon
                    size={28}
                    color={isSelected ? colors.primary : colors.neutral}
                  />
                  <Text
                    variant="labelMedium"
                    style={{
                      color: isSelected ? colors.primary : colors.onSurface,
                      marginTop: 6,
                      fontWeight: isSelected ? '700' : '400',
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error && (
            <Text variant="bodySmall" style={styles.errorText}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  errorText: {
    color: colors.error,
    marginTop: 6,
    marginLeft: 2,
  },
});
