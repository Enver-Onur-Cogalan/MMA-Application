import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ResponsiveText } from '../common/ResponsiveText';
import { colors, spacing } from '../../utils/theme';
import { scale, moderateScale } from '../../utils/dimensions';
import { Fighter } from '../../types/fighter';

interface FighterCardProps {
    fighter: Fighter,
    onPress: (fighter: Fighter) => void;
    index?: number;
}

export const FighterCard: React.FC<FighterCardProps> = ({
    fighter,
    onPress,
    index = 0
}) => {
    // Reanimated shared values
    const translateY = useSharedValue(50);
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    // Trigger entrance animation
    useEffect(() => {
        const delay = index * 100; // Staggered animation

        translateY.value = withDelay(delay, withSpring(0, {
            damping: 15,
            stiffness: 100,
        }));

        scale.value = withDelay(delay, withSpring(1, {
            damping: 12,
            stiffness: 150,
        }));

        opacity.value = withDelay(delay, withTiming(1, {
            duration: 600,
        }));
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { scale: scale.value },
            ],
            opacity: opacity.value,
        };
    });

    // Press animation
    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = () => {
        // Haptic feedback effect
        scale.value = withSpring(0.98, undefined, () => {
            scale.value = withSpring(1);
        });
        onPress(fighter);
    };

    if (!fighter) {
        return null;
    }


    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {/* Tag badge */}
            <View style={styles.tagBadge}>
                <Icon
                    name='military-tech'
                    size={18}
                    color={colors.primary}
                />
                <ResponsiveText variant='caption' style={styles.tagText}>
                    Fighter
                </ResponsiveText>
            </View>
            <TouchableOpacity
                style={styles.card}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{
                            uri: fighter.photoUrl || 'https://via.placeholder.com/60'
                        }}
                        style={styles.avatar}
                        defaultSource={{ uri: 'https://via.placeholder.com/60' }}
                    />
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: fighter.isActive ? colors.success : colors.danger }
                    ]} />
                </View>

                <View style={styles.fighterInfo}>
                    <View style={styles.nameContainer}>
                        <ResponsiveText variant='h3' style={styles.fighterName}>
                            {fighter.name}
                        </ResponsiveText>
                        {fighter.nickname && (
                            <ResponsiveText variant='caption' style={styles.nickname}>
                                "{fighter.nickname}"
                            </ResponsiveText>
                        )}
                    </View>

                    <View style={styles.infoRow}>
                        <ResponsiveText variant='body2' style={styles.infoText}>
                            {fighter.nationality || 'Unknown'} • {fighter.weightClass}
                        </ResponsiveText>
                    </View>

                    <View style={styles.recordContainer}>
                        <View style={styles.recordBadge}>
                            <ResponsiveText variant='caption' style={styles.recordText}>
                                {fighter.wins}-{fighter.losses}-{fighter.draws}
                            </ResponsiveText>
                        </View>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <ResponsiveText variant='h4' style={styles.statNumber}>
                            {fighter.wins}
                        </ResponsiveText>
                        <ResponsiveText variant='caption' style={styles.statLabel}>
                            Wins
                        </ResponsiveText>
                    </View>
                    <View style={styles.statItem}>
                        <ResponsiveText variant='h4' style={styles.statNumber}>
                            {fighter.losses}
                        </ResponsiveText>
                        <ResponsiveText variant='caption' style={styles.statLabel}>
                            Losses
                        </ResponsiveText>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};


const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.sm,
    },
    card: {
        backgroundColor: colors.dark.surface,
        borderRadius: moderateScale(16),
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
        shadowColor: colors.dark.background,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: spacing.md,
    },
    avatar: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(30),
        backgroundColor: colors.dark.border,
    },
    statusBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: scale(12),
        height: scale(12),
        borderRadius: scale(6),
        borderWidth: 2,
        borderColor: colors.dark.surface,
    },
    fighterInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    nameContainer: {
        marginBottom: spacing.xs,
    },
    fighterName: {
        color: colors.dark.text,
        fontWeight: '600',
    },
    nickname: {
        color: colors.dark.textSecondary,
        fontStyle: 'italic',
        marginTop: 2,
    },
    infoRow: {
        marginBottom: spacing.xs,
    },
    infoText: {
        color: colors.dark.textSecondary,
    },
    recordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    recordBadge: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: moderateScale(8),
    },
    recordText: {
        color: colors.primary,
        fontWeight: '600',
    },
    age: {
        color: colors.dark.textSecondary,
        fontSize: scale(12),
    },
    statsContainer: {
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        marginVertical: spacing.xs / 2,
    },
    statNumber: {
        color: colors.primary,
        fontWeight: '700',
    },
    statLabel: {
        color: colors.dark.textSecondary,
        fontSize: scale(10),
    },
    tagBadge: {
        position: 'absolute',
        top: spacing.xs,
        left: spacing.xs,
        backgroundColor: colors.dark.background,
        borderRadius: moderateScale(8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs / 2,
        borderWidth: 1,
        borderColor: colors.dark.border,
        zIndex: 1,
    },
    tagText: {
        color: colors.primary,
        marginLeft: spacing.xs / 2,
        fontWeight: '600',
        fontSize: scale(10),
    }
});