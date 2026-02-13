import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { DataService } from '../../../services/DataService';
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

const ProductSkeleton = () => (
    <View style={styles.productCard}>
        <SkeletonLoader height={140} width="100%" borderRadius={12} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
        <View style={{ padding: 10, gap: 5 }}>
            <SkeletonLoader height={16} width="80%" />
            <SkeletonLoader height={14} width="40%" />
        </View>
    </View>
);

const ShopScreen = ({ navigation }: any) => {
    const { userInfo: user, isDarkMode } = React.useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Products');
    const [search, setSearch] = useState('');
    const theme = useTheme();

    useEffect(() => {
        const routeParams = (navigation as any).route?.params;
        if (routeParams?.screen === 'Services' || routeParams?.tab === 'Services') {
            setActiveTab('Services');
        }
    }, [(navigation as any).route?.params]);

    // React Query for Infinite Scroll (Products)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ['products', search, activeTab],
        queryFn: async ({ pageParam = 0 }) => {
            if (activeTab === 'Products') {
                return await DataService.discoverProducts(search, pageParam as number, 10);
            } else {
                // Services might not support pagination yet in backend, or use same pattern
                // For MVP, if backend services/discover supports cursor, use it.
                // Assuming it falls back to non-paginated if cursor not handled, or I update backend.
                // I didn't explicitly update services/discover in server.js to use cursor (only products).
                // So I will stick to standard fetch for services or just load all (mock pagination).
                // Actually, I'll just return all as one page for services to avoid breaking.
                // Or better, assume similar API structure.
                const res = await DataService.discoverServices(search);
                // Wrap in paginated structure
                return { products: res.services || [], nextCursor: null };
            }
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });

    const flattenedData = data?.pages.flatMap(page => page.products || []) || [];

    const renderItem = ({ item, index }: any) => (
        <FadeInList index={index % 10} style={{ flex: 1 }}>
            <AnimatedButton
                style={[styles.productCard, { backgroundColor: theme.cardBg }]}
                onPress={() => (navigation as any).navigate(activeTab === 'Products' ? 'ProductDetails' : 'ServiceDetails', activeTab === 'Products' ? { product: item } : { service: item })}
            >
                <View style={[styles.imageContainer, { backgroundColor: isDarkMode ? '#4A5568' : '#E2E8F0' }]}>
                    <Img
                        source={resolveImage(item.image_url || getDefaultImageForType(activeTab === 'Products' ? 'product' : 'service', item.name))}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.productPrice, { color: theme.subText }]}>
                        {item.price} PKR {activeTab === 'Services' ? `• ${item.duration_mins}m` : ''}
                    </Text>
                </View>
            </AnimatedButton>
        </FadeInList>
    );

    const renderFooter = () => {
        if (isFetchingNextPage) {
            return <ActivityIndicator size="small" color={theme.text} style={{ marginVertical: 20 }} />;
        }
        return <View style={{ height: 100 }} />; // Padding for FAB
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <AnimatedSearchHeader
                title="Shop"
                onBack={() => navigation.goBack()}
                onSearch={() => { }}
                onChangeText={setSearch}
                placeholder={`Search ${activeTab}...`}
                initialValue={search}
            />

            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: theme.bg, borderBottomColor: theme.borderColor }]}>
                <TouchableOpacity onPress={() => setActiveTab('Products')} style={[styles.tab, activeTab === 'Products' && [styles.activeTab, { borderBottomColor: theme.text }]]}>
                    <Text style={[styles.tabText, { color: activeTab === 'Products' ? theme.text : theme.subText }]}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Services')} style={[styles.tab, activeTab === 'Services' && [styles.activeTab, { borderBottomColor: theme.text }]]}>
                    <Text style={[styles.tabText, { color: activeTab === 'Services' ? theme.text : theme.subText }]}>Services</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.listContainer}>
                    <FlashList
                        data={[1, 2, 3, 4, 5, 6]}
                        renderItem={() => <ProductSkeleton />}
                        estimatedItemSize={220}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            ) : (
                <View style={styles.listContainer}>
                    <FlashList
                        data={flattenedData}
                        renderItem={renderItem}
                        estimatedItemSize={220}
                        numColumns={2}
                        onEndReached={() => {
                            if (hasNextPage) fetchNextPage();
                        }}
                        onEndReachedThreshold={0.5}
                        contentContainerStyle={styles.listContent}
                        ListFooterComponent={renderFooter}
                        onRefresh={refetch}
                        refreshing={isLoading}
                    />
                </View>
            )}

            {/* FAB */}
            {user?.user_type === 'business' && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity style={styles.fabSecondary} onPress={() => (navigation as any).navigate('AddProduct')}>
                        <Text style={styles.fabSecondaryText}>Add Product</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fabSecondary} onPress={() => (navigation as any).navigate('Inventory')}>
                        <Text style={styles.fabSecondaryText}>Manage Inventory</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 10,
        borderBottomWidth: 1,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        width: '100%',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    productCard: {
        flex: 1,
        margin: 5,
        borderRadius: 12,
        paddingBottom: 10,
        overflow: 'hidden',
        height: 220,
    },
    imageContainer: {
        height: 140,
        width: '100%',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        padding: 8,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 12,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 15,
    },
    fabSecondary: {
        backgroundColor: '#2D3748',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        elevation: 4,
    },
    fabSecondaryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    }
});

export default ShopScreen;
