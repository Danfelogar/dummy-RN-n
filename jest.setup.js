global.__DEV__ = true;

jest.mock(
  '@env',
  () => ({
    FEE_RATE_FRONTEND: 0.035,
    MIN_FEE_FRONTEND: 0.35,
    MMKV_ENCRYPTION_KEY: 'mock-encryption-key',
  }),
  { virtual: true },
);

jest.mock('react-native', () => {
  const React = require('react');

  const mockComponent = name => {
    const component = props => React.createElement(name, props, props.children);
    component.displayName = name;
    return component;
  };

  const AnimatedValue = {
    setValue: jest.fn(),
    interpolate: jest.fn(() => ({ inputRange: [], outputRange: [] })),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };

  return {
    Platform: {
      OS: 'ios',
      select: jest.fn(obj => obj.ios ?? obj.default),
    },
    StyleSheet: {
      create: jest.fn(s => s),
      flatten: jest.fn(s => s),
      hairlineWidth: 1,
      absoluteFill: {},
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667, scale: 2, fontScale: 1 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Animated: {
      Value: jest.fn(() => AnimatedValue),
      timing: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
      createAnimatedComponent: jest.fn(component => component),
      View: mockComponent('Animated.View'),
      Text: mockComponent('Animated.Text'),
      Image: mockComponent('Animated.Image'),
    },
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TextInput: mockComponent('TextInput'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    TouchableHighlight: mockComponent('TouchableHighlight'),
    TouchableWithoutFeedback: mockComponent('TouchableWithoutFeedback'),
    Pressable: mockComponent('Pressable'),
    ScrollView: mockComponent('ScrollView'),
    FlatList: mockComponent('FlatList'),
    Modal: mockComponent('Modal'),
    Image: mockComponent('Image'),
    ActivityIndicator: mockComponent('ActivityIndicator'),
    KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
    SafeAreaView: mockComponent('SafeAreaView'),
    I18nManager: { isRTL: false },
    AccessibilityInfo: { fetch: jest.fn(() => Promise.resolve(false)) },
    NativeModules: {},
    NativeEventEmitter: jest.fn(() => ({
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
  };
});

jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TextInput, TouchableOpacity } = require('react-native');

  const mockComponent = name => {
    const component = props =>
      React.createElement(name, props, props?.children);
    component.displayName = name;
    return component;
  };

  return {
    Provider: ({ children }) => children,
    DefaultTheme: {},
    DarkTheme: {},
    MD3LightTheme: {
      colors: {
        primary: '#6200ee',
        onSurface: '#000',
        onSurfaceDisabled: '#999',
        surface: '#fff',
        background: '#fff',
      },
    },
    MD3DarkTheme: {},
    useTheme: () => ({
      colors: {
        primary: '#6200ee',
        onSurface: '#000',
        onSurfaceDisabled: '#999',
        surface: '#fff',
        background: '#fff',
      },
    }),
    TextInput: Object.assign(
      ({ value, onChangeText, onBlur, onFocus, placeholder, ...props }) =>
        React.createElement(TextInput, {
          value,
          onChangeText,
          onBlur,
          onFocus,
          placeholder,
          testID: props.testID ?? 'paper-text-input',
          ...props,
        }),
      {
        Icon: ({ icon, onPress }) =>
          React.createElement(View, { testID: `icon-${icon}`, onPress }),
      },
    ),
    Button: ({ children, onPress, ...props }) =>
      React.createElement(
        TouchableOpacity,
        { onPress, ...props },
        React.createElement(Text, {}, children),
      ),
    Card: Object.assign(mockComponent('Card'), {
      Content: mockComponent('Card.Content'),
      Title: mockComponent('Card.Title'),
      Actions: mockComponent('Card.Actions'),
    }),
    IconButton: mockComponent('IconButton'),
    FAB: mockComponent('FAB'),
    Portal: ({ children }) => children,
    Dialog: Object.assign(mockComponent('Dialog'), {
      Title: mockComponent('Dialog.Title'),
      Content: mockComponent('Dialog.Content'),
      Actions: mockComponent('Dialog.Actions'),
    }),
    Appbar: {
      Header: mockComponent('Appbar.Header'),
      Content: mockComponent('Appbar.Content'),
    },
    List: {
      Item: mockComponent('List.Item'),
      Icon: ({ icon }) => React.createElement(Text, {}, icon),
    },
    Paragraph: mockComponent('Paragraph'),
    Title: mockComponent('Title'),
    Snackbar: mockComponent('Snackbar'),
    ActivityIndicator: mockComponent('ActivityIndicator'),
    Divider: mockComponent('Divider'),
    Surface: mockComponent('Surface'),
    Chip: mockComponent('Chip'),
    HelperText: mockComponent('HelperText'),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  const mockIcon = name => {
    const Icon = props =>
      React.createElement(View, { testID: `icon-${name}`, ...props });
    Icon.displayName = name;
    return Icon;
  };

  return new Proxy(
    {},
    {
      get: (_, key) => mockIcon(key),
    },
  );
});
