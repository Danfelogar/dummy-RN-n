import { render, fireEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import { InputGeneric } from '../InputGeneric';

const TestWrapper = ({
  onChangeText,
}: {
  onChangeText?: (text: string) => void;
}) => {
  const { control } = useForm({
    defaultValues: { testField: '' },
  });

  return (
    <InputGeneric
      control={control}
      name="testField"
      label="Test Label"
      placeholder="Test Placeholder"
      onChangeText={onChangeText}
    />
  );
};

describe('InputGeneric', () => {
  it('should render correctly', () => {
    const { getByPlaceholderText } = render(<TestWrapper />);
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('should handle text input', () => {
    const { getByPlaceholderText } = render(<TestWrapper />);
    const input = getByPlaceholderText('Test Placeholder');

    fireEvent.changeText(input, 'test value');
    expect(input.props.value).toBe('test value');
  });

  it('should call onChangeText callback', () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = render(
      <TestWrapper onChangeText={mockOnChange} />,
    );
    const input = getByPlaceholderText('Test Placeholder');

    fireEvent.changeText(input, 'test');
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });
});
