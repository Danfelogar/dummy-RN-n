import { Animated, StyleSheet } from 'react-native';

import { FC, ReactNode, useRef, useEffect } from 'react';

import { Portal } from './Portal';
import { heightFullScreen, widthFullScreen } from '../../utils';

interface Props {
  visibility: boolean;
  dismissable?: boolean;
  handleDismiss: () => void;
  children: ReactNode;
}

export const Modal: FC<Props> = ({
  visibility,
  handleDismiss,
  children,
  dismissable = true,
}) => {
  const maxHeight = heightFullScreen - heightFullScreen * 0.3;
  const maxWidth = '85%';

  const backgroundColor = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    handleAnimated();
     
  }, [visibility]);

  const handleAnimated = () => {
    Animated.parallel([
      Animated.timing(backgroundColor, {
        toValue: visibility ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: visibility ? 1 : 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const backgroundColorStyle = {
    backgroundColor: backgroundColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)'],
    }),
    width: widthFullScreen,
    height: heightFullScreen,
  };

  const translateStyle = {
    transform: [
      {
        translateY: translateY.interpolate({
          inputRange: [0, 1],
          outputRange: [heightFullScreen, 0],
          extrapolate: 'clamp',
        }),
      },
      {
        scale: translateY.interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 1.5, 1],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  return (
    <Portal name="generic-modal">
      {/* Animated background overlay */}
      <Animated.View
        pointerEvents={visibility ? 'auto' : 'none'}
        onTouchStart={dismissable ? handleDismiss : undefined}
        style={[styles.container, backgroundColorStyle]}
      />
      {/* Animated modal content */}
      <Animated.View
        style={[
          styles.modal,
          { maxHeight: maxHeight, width: maxWidth },
          translateStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 0,
  },
  modal: {
    height: 'auto',
    position: 'absolute',
    zIndex: 10,
    borderRadius: 2,
  },
});
