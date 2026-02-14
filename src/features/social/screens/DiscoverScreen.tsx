import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DataService } from '../../../services/DataService';
import { AuthContext } from '../../../context/AuthContext';
import AnimatedSearchHeader from '../../../components/AnimatedSearchHeader';
import { useTheme } from '../../../theme/useTheme';
import { resolveImage, getDefaultImageForType } from '../../../utils/ImageHelper';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import Img from '../../../shared/components/Img';
import SkeletonLoader from '../../../shared/components/SkeletonLoader';
import AnimatedButton from '../../../shared/components/AnimatedButton';
import FadeInList from '../../../shared/components/FadeInList';

const { width } = Dimensions.get('window');

const UserSkeleton = () => (
    <View style={[styles.card, styles.gridCard, { borderColor: '#E2E8F0' }]}>
        <SkeletonLoader width={60} height={60} borderRadius={30} style={{ marginBottom: 10 }} />
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 4 }} />
        <SkeletonLoader width="50%" height={12} style={{ marginBottom: 10 }} />
        <View style={{ flexDirection: 'row', gap: 5, width: '100%' }}>
            <SkeletonLoader width="48%" height={32} borderRadius={20} />
            <SkeletonLoader width="48%" height={32} borderRadius={20} />
        </View>
    </View>
);

const DiscoverScreen = ({ navigation }: any) => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All'); // 'All', 'Skills', 'Location'
    const { userInfo, isDarkMode } = React.useContext(AuthContext);
    const theme = useTheme();

    // Infinite Query for Users (Main Feed)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ['users', search, filterType],
        queryFn: async ({ pageParam = 0 }) => {
            // Note: DataService needs to be updated to support cursor pagination for users
            // For now, we are simulating or assuming backend support will come in next step or using limit
            // Current DataService.discoverUsers doesn't take cursor/limit args explicitly in signature
            // Updating call signature here assuming DataService update
            return await DataService.discoverUsers(search, userInfo?.id || 0, filterType, pageParam as number);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });

    const flattenedUsers = data?.pages.flatMap(page => page.users || []) || [];

    const renderItem = ({ item, index }: any) => (
        <FadeInList index={index % 10} style={{ flex: 1 }}>
            <View style={[styles.card, styles.gridCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <Img source={resolveImage(item.profile_pic_url || getDefaultImageForType(item.user_type === 'business' ? 'business' : 'customer'))} style={styles.cardImage} />
                <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.cardRole, { color: theme.subText }]}>{item.user_type}</Text>
                <View style={styles.actionButtons}>
                    <AnimatedButton style={[styles.connectButton, { backgroundColor: isDarkMode ? '#4A5568' : '#2D3748' }]}>
                        <Text style={styles.connectButtonText}>Connect</Text>
                    </AnimatedButton>
                    <AnimatedButton
                        style={[styles.messageButton, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]}
                        onPress={async () => {
                            try {
                                const res = await DataService.initiateChat(userInfo.id, item.id);
                                if (res.success) {
                                    navigation.navigate('Chat', { chatId: res.chatId, otherUser: { id: item.id, name: item.name, pic: item.profile_pic_url } });
                                }
                            } catch (e) {
                                console.error("Chat Error", e);
                            }
                        }}
                    >
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>
                    </AnimatedButton>
                </View>
            </View>
        </FadeInList>
    );

    const renderHeader = () => (
        <View>
            {/* Filter Chips */}
            <View style={[styles.filterContainer, { marginTop: 10 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['All', 'Skills', 'Location'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filterType === f && styles.activeFilterChip, { backgroundColor: filterType === f ? '#2D3748' : (isDarkMode ? '#4A5568' : '#EDF2F7') }]}
                            onPress={() => setFilterType(f)}
                        >
                            <Text style={[styles.filterText, filterType === f && styles.activeFilterText, { color: filterType === f ? '#fff' : theme.subText }]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 10, marginLeft: 20 }]}>People</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <AnimatedSearchHeader
                title="Discover"
                onBack={() => navigation.goBack()}
                onSearch={() => { }}
                onChangeText={setSearch}
                placeholder={filterType === 'All' ? "Search..." : "Type to search..."}
                initialValue={search}
            />

            {isLoading ? (
                <View style={{ flex: 1, paddingHorizontal: 15 }}>
                    <View style={styles.filterContainer}>
                        {['All', 'Skills', 'Location'].map((f) => (
                            <View key={f} style={[styles.filterChip, { backgroundColor: '#EDF2F7' }]}>
                                <Text style={styles.filterText}>{f}</Text>
                            </View>
                        ))}
                    </View>
                    <FlashList
                        data={[1, 2, 3, 4, 5, 6]}
                        renderItem={() => <UserSkeleton />}
                        estimatedItemSize={200}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <FlashList
                        data={flattenedUsers}
                        renderItem={renderItem}
                        estimatedItemSize={200}
                        numColumns={2}
                        ListHeaderComponent={renderHeader}
                        contentContainerStyle={styles.listContent}
                        onEndReached={() => {
                            if (hasNextPage) fetchNextPage();
                        }}
                        onEndReachedThreshold={0.5}
                        onRefresh={refetch}
                        refreshing={isLoading}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: theme.subText }}>No users found.</Text>}
                        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={theme.text} /> : <View style={{ height: 100 }} />}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 15,
        alignItems: 'center',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#EDF2F7',
        borderRadius: 20,
        marginRight: 10,
    },
    activeFilterChip: {
        backgroundColor: '#2D3748',
    },
    filterText: {
        color: '#718096',
        fontSize: 14,
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#fff',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        margin: 5,
    },
    gridCard: {
        flex: 1,
        marginBottom: 15
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardRole: {
        fontSize: 12,
        marginBottom: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 5
    },
    connectButton: {
        backgroundColor: '#2D3748',
        paddingVertical: 8,
        flex: 1,
        borderRadius: 20,
        alignItems: 'center',
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    messageButton: {
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EDF2F7'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
});

export default DiscoverScreen;
