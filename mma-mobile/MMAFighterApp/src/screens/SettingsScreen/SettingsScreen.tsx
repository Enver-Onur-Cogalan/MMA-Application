import { StyleSheet, View } from 'react-native'
import React from 'react'
import { SafeAreaWrapper } from '../../components/common/SafeAreaWrapper';
import { ResponsiveText } from '../../components/common/ResponsiveText';

export const SettingsScreen: React.FC = () => {
    return (
        <SafeAreaWrapper>
            <View style={styles.container}>
                <ResponsiveText variant='h1'>Settings</ResponsiveText>
                <ResponsiveText variant='body1'>ComingSoon</ResponsiveText>
            </View>
        </SafeAreaWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});