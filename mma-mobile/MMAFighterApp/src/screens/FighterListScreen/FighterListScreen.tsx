import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    TextInput,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaWrapper } from '../../components/common/SafeAreaWrapper';
import { ResponsiveText } from '../../components/common/ResponsiveText';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { FighterCard } from '../../components/FighterCard';
import { colors, spacing } from '../../utils/theme';
import { scale, moderateScale } from '../../utils/dimensions';
import { Fighter } from '../../types/fighter';
import { fighterApi } from '../../services/api/fighterApi';

interface FighterListScreenProps {
    navigation?: any;
}

export const FighterListScreen: React.FC<FighterListScreenProps> = ({ navigation }) => {
    const [fighters, setFighters] = useState<Fighter[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFighters, setFilteredFighters] = useState<Fighter[]>([]);
    const [page, setPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Reanimated values
    const headerOpacity = useSharedValue(0);
    const searchOpacity = useSharedValue(0);
    const listOpacity = useSharedValue(0);

    useEffect(() => {
        loadFighters();
    }, []);

    useEffect(() => {
        filterFighters();
    }, [searchQuery, fighters]);

    useEffect(() => {
        if (!loading) {
            // Staggered entrance animations
            headerOpacity.value = withTiming(1, { duration: 600 });
            searchOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
            listOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
        }
    }, [loading]);

    const loadFighters = async (pageNum: number = 1, isRefresh: boolean = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fighterApi.getFighters({
                page: pageNum,
                limit: 20
            });

            // Defensive parsing - backend response: {data: Fighter[], pagination: {...}}
            let fighters: Fighter[] = [];

            if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    fighters = response.data;
                    console.log('🔍 Found fighters in response.data');
                } else if (Array.isArray(response.fighters)) {
                    fighters = response.fighters;
                    console.log('🔍 Found fighters in response.fighters');
                } else if (Array.isArray(response)) {
                    fighters = response;
                    console.log('🔍 Response is directly an array');
                } else {
                    console.warn('⚠️ Unexpected response format:', response);
                    fighters = [];
                }
            } else {
                console.warn('⚠️ Response is not an object:', typeof response);
                fighters = [];
            }

            if (isRefresh || pageNum === 1) {
                console.log('🔄 Setting fighters state - OLD length:', fighters.length);
                setFighters(fighters);
                console.log('🔄 setFighters called with length:', fighters.length);
            } else {
                setFighters(prev => {
                    const newFighters = [...(prev || []), ...fighters];
                    console.log('🔄 Appended result length:', newFighters.length);
                    return newFighters;
                });
            }

            setHasMoreData(
                (response && response.pagination && response.pagination.hasMore) ||
                false
            );
            setPage(pageNum);

        } catch (error: any) {
            console.error('❌ Error loading fighters:', error);

            setFighters([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const filterFighters = () => {
        const currentFighters = fighters || [];
        console.log('🔍 filterFighters called. Input length:', currentFighters.length);

        if (!searchQuery.trim()) {
            console.log('🔍 No search query, setting all fighters. Length:', currentFighters.length);
            setFilteredFighters(currentFighters);
            return;
        }

        const filtered = currentFighters.filter(fighter => {
            if (!fighter || typeof fighter !== 'object') return false;

            const query = searchQuery.toLowerCase();
            const name = (fighter.name || '').toLowerCase();
            const nickname = (fighter.nickname || '').toLowerCase();
            const nationality = (fighter.nationality || '').toLowerCase();
            const weightClass = (fighter.weightClass || '').toLowerCase();

            return name.includes(query) ||
                nickname.includes(query) ||
                nationality.includes(query) ||
                weightClass.includes(query);
        });

        setFilteredFighters(filtered);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadFighters(1, true);
        setRefreshing(false);
    }, []);

    const loadMoreData = useCallback(async () => {
        if (!loadingMore && hasMoreData && !searchQuery) {
            await loadFighters(page + 1);
        }
    }, [loadingMore, hasMoreData, page, searchQuery]);

    const navigateToFighterDetail = (fighter: Fighter) => {
        if (navigation) {
            navigation.navigate('FighterDetail', { fighter });
        }
    };

    // Animated styles
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{
            translateY: (1 - headerOpacity.value) * -20
        }]
    }));

    const searchAnimatedStyle = useAnimatedStyle(() => ({
        opacity: searchOpacity.value,
        transform: [{
            translateY: (1 - searchOpacity.value) * -20
        }]
    }));

    const listAnimatedStyle = useAnimatedStyle(() => ({
        opacity: listOpacity.value,
        transform: [{
            translateY: (1 - listOpacity.value) * 30
        }]
    }));

    const renderFighterCard = ({ item, index }: { item: Fighter; index: number }) => {
        // Defensive check
        if (!item || typeof item !== 'object') {
            console.warn('⚠️ Invalid fighter item:', item);
            return null;
        }

        return (
            <FighterCard
                fighter={item}
                onPress={navigateToFighterDetail}
                index={index}
            />
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon
                name='thumb-down'
                size={32}
                color={colors.dark.text}
            />
            <ResponsiveText variant="h3" style={styles.emptyTitle}>
                No Fighters Found
            </ResponsiveText>
            <ResponsiveText variant="body1" style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 'No fighters available at the moment'}
            </ResponsiveText>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.loadingFooter}>
                <SkeletonLoader type="list" itemCount={3} />
            </View>
        );
    };

    return (
        <SafeAreaWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, headerAnimatedStyle, styles.headerRow]}>
                    <Icon
                        name='sports-mma'
                        size={24}
                        color={colors.primary}
                        style={styles.headerIcon}
                    />
                    <ResponsiveText variant="h1" style={styles.title}>
                        Fighters
                    </ResponsiveText>
                </View>
                <View style={[styles.info, headerAnimatedStyle]}>
                    <ResponsiveText variant="body2" style={styles.subtitle}>
                        {loading ? 'Loading...' : `${filteredFighters.length} fighters`}
                    </ResponsiveText>
                </View>

                {/* Search Bar */}
                {!loading && (
                    <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
                        <Icon
                            name='search'
                            size={18}
                            color={colors.dark.textSecondary}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search fighters..."
                            placeholderTextColor={colors.dark.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </Animated.View>
                )}

                {/* Content */}
                {loading ? (
                    <SkeletonLoader type="list" itemCount={8} />
                ) : (
                    <Animated.View style={[styles.listWrapper, listAnimatedStyle]}>
                        <FlatList
                            data={filteredFighters || []}
                            renderItem={renderFighterCard}
                            keyExtractor={(item, index) => item?.id?.toString() || `fighter-${index}`}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContainer}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={colors.primary}
                                    colors={[colors.primary]}
                                />
                            }
                            ListEmptyComponent={renderEmptyState}
                            onEndReached={loadMoreData}
                            onEndReachedThreshold={0.1}
                            ListFooterComponent={renderFooter}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={10}
                            updateCellsBatchingPeriod={50}
                            initialNumToRender={10}
                            windowSize={21}
                            getItemLayout={(data, index) => (
                                { length: 100, offset: 100 * index, index }
                            )}
                        />
                    </Animated.View>
                )}
            </View>
        </SafeAreaWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: spacing.sm,
        marginTop: scale(2),
    },
    info: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        alignItems: 'center',
    },
    title: {
        color: colors.dark.text,
        fontWeight: '700',
    },
    subtitle: {
        color: colors.dark.textSecondary,
        marginTop: spacing.xs,
    },
    searchContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        backgroundColor: colors.dark.surface,
        borderRadius: moderateScale(12),
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        fontSize: scale(16),
        color: colors.dark.text,
        borderWidth: 1,
        borderColor: colors.dark.border,
        marginLeft: spacing.sm,
        flex: 1,
    },
    listWrapper: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xl * 2,
    },
    emptyTitle: {
        color: colors.dark.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        color: colors.dark.textSecondary,
        textAlign: 'center',
        maxWidth: '80%',
    },
    loadingFooter: {
        paddingVertical: spacing.md,
    },
});