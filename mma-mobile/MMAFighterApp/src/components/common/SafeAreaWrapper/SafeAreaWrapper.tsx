import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../utils/theme';

interface SafeAreaWrapperProps {
    children: React.ReactNode;
    backgroundColor?: string;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
    style?: any;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
    children,
    backgroundColor = colors.dark.background,
    edges = ['top', 'bottom'],
    style,
}) => {
    const insets = useSafeAreaInsets();

    const paddingStyle = {
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
    };

    return (
        <View style={[styles.container, { backgroundColor }, paddingStyle, style]}>
            {Platform.OS === 'android' && (
                <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
            )}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});