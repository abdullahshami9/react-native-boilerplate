import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import { CONFIG } from '../Config';
import PageWrapper from '../components/PageWrapper';
import AnimatedSearchHeader from '../components/AnimatedSearchHeader';
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

const DiscoverScreen = ({ navigation }: any) => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All'); // 'All', 'Skills', 'Location'
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [businessProducts, setBusinessProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { userInfo, isDarkMode } = React.useContext(AuthContext);
    const theme = useTheme();

    React.useEffect(() => {
        fetchData();
    }, [search]); // Debounce usually recommended, but keeping simple

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, productsRes] = await Promise.all([
                DataService.discoverUsers(search, userInfo?.id || 0),
                DataService.discoverProducts(search)
            ]);

            if (usersRes.success) {
                setUsers(usersRes.users);
            }
            if (productsRes.success) {
                setBusinessProducts(productsRes.products);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>

            <AnimatedSearchHeader
                title="Discover"
                onBack={() => navigation.goBack()}
                onSearch={() => {}}
                onChangeText={setSearch}
                placeholder={filterType === 'All' ? "Search..." : "Type to search..."}
                initialValue={search}
            />

            {/* Filter Chips - Simplified placement */}
            <View style={[styles.filterContainer, { marginTop: 10 }]}>
                <View style={styles.filterContainer}>
                    {['All', 'Skills', 'Location'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filterType === f && styles.activeFilterChip, { backgroundColor: filterType === f ? '#2D3748' : (isDarkMode ? '#4A5568' : '#EDF2F7') }]}
                            onPress={() => {
                                setFilterType(f);
                                // Optional: setIsSearchFocused(false);
                            }}
                        >
                            <Text style={[styles.filterText, filterType === f && styles.activeFilterText, { color: filterType === f ? '#fff' : theme.subText }]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => setIsSearchFocused(false)} style={{ marginLeft: 'auto' }}>
                        <Text style={{ color: '#A0AEC0' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}

            <PageWrapper
                contentContainerStyle={styles.scrollContent}
                onRefresh={fetchData}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={theme.text} style={{ marginTop: 20 }} />
                ) : (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>People</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {users.map((item) => (
                                <View key={item.id} style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                                    <Image source={{ uri: item.profile_pic_url ? `${CONFIG.API_URL}/${item.profile_pic_url}` : 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.cardImage} />
                                    <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
                                    <Text style={[styles.cardRole, { color: theme.subText }]}>{item.user_type}</Text>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity style={[styles.connectButton, { backgroundColor: isDarkMode ? '#4A5568' : '#2D3748' }]}>
                                            <Text style={styles.connectButtonText}>Connect</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
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
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                            {users.length === 0 && <Text style={{ color: '#A0AEC0', padding: 20 }}>No users found.</Text>}
                        </ScrollView>
                    </>
                )}

                {/* Business Products */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Business Product</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.gridContainer}>
                    {businessProducts.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.productCard, { backgroundColor: theme.cardBg }]}
                            onPress={() => navigation.navigate('ProductDetails', { product: item })}
                        >
                            <Image source={{ uri: item.image_url ? `${CONFIG.API_URL}/${item.image_url}` : 'https://via.placeholder.com/150' }} style={styles.productImage} />
                            <View style={styles.productInfo}>
                                <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[styles.productPrice, { color: theme.subText }]}>{item.price}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </PageWrapper>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#F7FAFC',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
    },
    backButton: {
        padding: 5,
        backgroundColor: '#EDF2F7',
        borderRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for bottom tab
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inBarChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D3748',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 10,
    },
    inBarChipText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
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
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#2D3748',
        fontSize: 16,
    },
    horizontalScroll: {
        marginBottom: 30,
        overflow: 'visible',
    },
    card: {
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EDF2F7',
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
        color: '#2D3748',
        marginBottom: 4,
    },
    cardRole: {
        fontSize: 12,
        color: '#718096',
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
    },
    seeAllText: {
        color: '#4A9EFF',
        fontSize: 14,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: (width - 50) / 2,
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#EDF2F7',
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        color: '#718096',
    },
});

export default DiscoverScreen;
