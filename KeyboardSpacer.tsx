import React, { FC, useState, useEffect } from 'react';
import {
    Keyboard,
    KeyboardEvent,
    LayoutAnimation,
    View,
    Dimensions,
    Platform,
    StyleSheet,
    EmitterSubscription,
    LayoutAnimationConfig,
    StyleProp,
    ViewStyle,
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        left: 0,
        right: 0,
        bottom: 0,
    },
});

const defaultAnimation: LayoutAnimationConfig = {
    duration: 500,
    create: {
        duration: 300,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 200,
    },
};

interface Props {
    topSpacing?: number;
    onToggle?: (isKeyboardOpened: boolean, keyboardSpace: number) => void;
    style?: StyleProp<ViewStyle>;
}

const voidFunc = () => null;

export const KeyboardSpacer: FC<Props> = ({
    topSpacing = 0,
    onToggle = voidFunc,
    style,
}) => {
    const [state, setState] = useState<{
        keyboardSpace: number;
        isKeyboardOpened: boolean;
    }>({ keyboardSpace: 0, isKeyboardOpened: false });
    const [listeners, setListeners] = useState<EmitterSubscription[]>();

    useEffect(() => {
        const updateListener =
            Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const resetListener =
            Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

        const newListeners = [
            Keyboard.addListener(updateListener, updateKeyboardSpace),
            Keyboard.addListener(resetListener, resetKeyboardSpace),
        ];
        setListeners([...newListeners]);

        return () => {
            if (!listeners) {
                return;
            }
            listeners.forEach((listener) => listener.remove());
        };
    }, []);

    const updateKeyboardSpace = (event: KeyboardEvent) => {
        if (!event.endCoordinates) {
            return;
        }

        let animationConfig = defaultAnimation;
        if (Platform.OS === 'ios') {
            animationConfig = LayoutAnimation.create(
                event.duration,
                LayoutAnimation.Types[event.easing],
                LayoutAnimation.Properties.opacity,
            );
        }
        LayoutAnimation.configureNext(animationConfig);

        const screenHeight = Dimensions.get('window').height;
        const keyboardSpace =
            screenHeight - event.endCoordinates.screenY + topSpacing;
        setState({
            keyboardSpace,
            isKeyboardOpened: true,
        });
        onToggle(true, keyboardSpace);
    };

    const resetKeyboardSpace = (event: KeyboardEvent) => {
        let animationConfig = defaultAnimation;
        if (Platform.OS === 'ios') {
            animationConfig = LayoutAnimation.create(
                event.duration,
                LayoutAnimation.Types[event.easing],
                LayoutAnimation.Properties.opacity,
            );
        }
        LayoutAnimation.configureNext(animationConfig);

        setState({
            keyboardSpace: 0,
            isKeyboardOpened: false,
        });
        onToggle(false, 0);
    };

    return (
        <View
            style={[styles.container, { height: state.keyboardSpace }, style]}
        />
    );
};
