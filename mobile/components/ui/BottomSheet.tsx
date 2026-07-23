import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
} from 'react-native';
import { colors, borderRadius, spacing } from '../../lib/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 25,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          translateY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 25,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: SCREEN_HEIGHT * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
