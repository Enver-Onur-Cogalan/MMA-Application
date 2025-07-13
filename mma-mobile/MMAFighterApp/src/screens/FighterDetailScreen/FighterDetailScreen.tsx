import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaWrapper } from '../../components/common/SafeAreaWrapper';
import { ResponsiveText } from '../../components/common/ResponsiveText';

export const FighterDetailScreen: React.FC = () => {
    return (
        <SafeAreaWrapper>
            <View style={styles.container}>
                <ResponsiveText variant='h1'>Fighter Detail</ResponsiveText>
                <ResponsiveText variant='body1'>Coming Soon...</ResponsiveText>
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