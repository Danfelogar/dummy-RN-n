import { Controller, FieldValues } from 'react-hook-form';
import { TextInput } from 'react-native-paper';
import { InputGenericProps } from './interfaces';

/**
 * Generic input component using React Native Paper + React Hook Form
 *
 * @example
 * <InputGeneric
 *   control={control}
 *   name="email"
 *   label="Email"
 *   placeholder="Enter your email"
 *   keyboardType="email-address"
 *   leftIcon="email"
 * />
 */
export function InputGeneric<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  mode = 'outlined',
  keyboardType = 'default',
  autoCorrect = false,
  autoCapitalize = 'none',
  secureTextEntry = false,
  multiline = false,
  numberOfLines,
  disabled = false,
  editable = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  textColor,
  underlineColor,
  activeUnderlineColor,
  outlineColor = '#E5E7EB',
  activeOutlineColor = '#1E40AF',
  onChangeText,
  onFocus,
  onBlur,
}: InputGenericProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur: rhfOnBlur, value },
        fieldState: { error },
      }) => (
        <TextInput
          label={label}
          placeholder={placeholder}
          value={value || ''}
          onChangeText={text => {
            onChange(text);
            onChangeText?.(text);
          }}
          onFocus={onFocus}
          onBlur={() => {
            rhfOnBlur();
            onBlur?.();
          }}
          mode={mode}
          keyboardType={keyboardType}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          disabled={disabled}
          editable={editable}
          error={!!error}
          left={
            leftIcon ? (
              <TextInput.Icon icon={leftIcon} disabled={disabled} />
            ) : undefined
          }
          right={
            rightIcon ? (
              <TextInput.Icon
                icon={rightIcon}
                onPress={onRightIconPress}
                disabled={disabled}
              />
            ) : undefined
          }
          style={style}
          textColor={textColor}
          underlineColor={underlineColor}
          activeUnderlineColor={activeUnderlineColor}
          outlineColor={outlineColor}
          activeOutlineColor={activeOutlineColor}
        />
      )}
    />
  );
}
