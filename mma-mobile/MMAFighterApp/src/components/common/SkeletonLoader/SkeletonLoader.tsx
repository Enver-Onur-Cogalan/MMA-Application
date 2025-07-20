import React from 'react';
import { StyleSheet, View } from 'react-native';
import SkeletonPlaceHolder from 'react-native-skeleton-placeholder';
import { colors, spacing } from '../../../utils/theme';
import { scale, moderateScale } from '../../../utils/dimensions';

interface SkeletonLoaderProps {
    type: 'list' | 'card' | 'detail';
    itemCount?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    type,
    itemCount = 6
}) => {
    const renderFighterCardSkeleton = () => (
        <SkeletonPlaceHolder
            backgroundColor={colors.dark.surface}
            highlightColor={colors.dark.border}
            speed={1200}
        >
            <View style={styles.skeletonCard}>
                <View style={styles.skeletonAvatar}>
                    <View style={styles.skeletonContent}>
                        <View style={styles.skeletonName} />
                        <View style={styles.skeletonNickname} />
                        <View style={styles.skeletonInfo} />
                        <View style={styles.skeletonRecord} />
                    </View>
                    <View style={styles.skeletonStats}>
                        <View style={styles.skeletonStat} />
                        <View style={styles.skeletonStat} />
                    </View>
                </View>
            </View>
        </SkeletonPlaceHolder>
    );

    const renderDetailSkeleton = () => (
        <SkeletonPlaceHolder
            backgroundColor={colors.dark.surface}
            highlightColor={colors.dark.border}
            speed={1200}
        >
            <View style={styles.detailContainer}>
                <View style={styles.detailHeader}>
                    <View style={styles.detailAvatar} />
                    <View style={styles.detailInfo}>
                        <View style={styles.detailName} />
                        <View style={styles.detailNickname} />
                        <View style={styles.detailRecord} />
                    </View>
                </View>
                <View style={styles.detailStats}>
                    {[...Array(4)].map((_, index) => (
                        <View key={index} style={styles.statCard} />
                    ))}
                </View>
                <View style={styles.detailDescription} />
                <View style={styles.detailDescription} />
            </View>
        </SkeletonPlaceHolder>
    );

    if (type === 'detail') {
        return renderDetailSkeleton();
    }

    return (
        <View style={styles.container}>
            {[...Array(itemCount)].map((_, index) => (
                <View key={index} style={styles.skeletonItem}>
                    {renderFighterCardSkeleton()}
                </View>
            ))}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
    },
    skeletonItem: {
        marginBottom: spacing.md,
    },
    skeletonCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: moderateScale(16),
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    skeletonAvatar: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(30),
        marginRight: spacing.md,
    },
    skeletonContent: {
        flex: 1,
        marginRight: spacing.sm,
    },
    skeletonName: {
        width: '60%',
        height: scale(20),
        borderRadius: scale(4),
        marginBottom: spacing.xs,
    },
    skeletonNickname: {
        width: '40%',
        height: scale(14),
        borderRadius: scale(4),
        marginBottom: spacing.xs,
    },
    skeletonInfo: {
        width: '80%',
        height: scale(14),
        borderRadius: scale(4),
        marginBottom: spacing.xs,
    },
    skeletonRecord: {
        width: '50%',
        height: scale(14),
        borderRadius: scale(4),
    },
    skeletonStats: {
        alignItems: 'center',
    },
    skeletonStat: {
        width: scale(30),
        height: scale(16),
        borderRadius: scale(4),
        marginVertical: spacing.xs / 2,
    },
    //  Detail skeleton styles
    detailContainer: {
        padding: spacing.lg,
    },
    detailHeader: {
        flexDirection: 'row',
        marginBottom: spacing.xl,
    },
    detailAvatar: {
        width: scale(120),
        height: scale(120),
        borderRadius: scale(60),
        marginRight: spacing.lg,
    },
    detailInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    detailName: {
        width: '80%',
        height: scale(28),
        borderRadius: scale(4),
        marginBottom: spacing.sm,
    },
    detailNickname: {
        width: '60%',
        height: scale(18),
        borderRadius: scale(4),
        marginBottom: spacing.sm,
    },
    detailRecord: {
        width: '70%',
        height: scale(16),
        borderRadius: scale(4),
    },
    detailStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    statCard: {
        width: '22%',
        height: scale(80),
        borderRadius: moderateScale(12),
    },
    detailDescription: {
        width: '100%',
        height: scale(16),
        borderRadius: scale(4),
        marginBottom: spacing.sm,
    },
});