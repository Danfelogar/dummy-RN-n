import { Control, FieldValues, Path } from 'react-hook-form';
import { KeyboardTypeOptions, StyleProp, ViewStyle } from 'react-native';

export interface InputGenericProps<T extends FieldValues> {
  // React Hook Form
  control: Control<T, any>;
  name: Path<T>;
  // TextInput props
  label?: string;
  placeholder?: string;
  mode?: 'flat' | 'outlined';
  keyboardType?: KeyboardTypeOptions;
  autoCorrect?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  // Behavior
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  editable?: boolean;
  // Icons (React Native Paper Icons)
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  // Styling
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  underlineColor?: string;
  activeUnderlineColor?: string;
  outlineColor?: string;
  activeOutlineColor?: string;
  // Callbacks
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}
