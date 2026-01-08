import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import { CONFIG } from '../Config';

const { width } = Dimensions.get('window');

const DiscoverScreen = ({ navigation }: any) => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All'); // 'All', 'Skills', 'Location'
    const [users, setUsers] = useState<any[]>([]);
    const [businessProducts, setBusinessProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { userInfo } = React.useContext(AuthContext);

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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Discover</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.filterContainer}>
                {['All', 'Skills', 'Location'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filterType === f && styles.activeFilterChip]}
                        onPress={() => setFilterType(f)}
                    >
                        <Text style={[styles.filterText, filterType === f && styles.activeFilterText]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.searchContainer}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" style={styles.searchIcon}>
                    <Circle cx="11" cy="11" r="8" />
                    <Path d="M21 21L16.65 16.65" />
                </Svg>
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search by ${filterType.toLowerCase()}...`}
                    placeholderTextColor="#A0AEC0"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2D3748" style={{ marginTop: 20 }} />
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>People</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {users.map((item) => (
                                <View key={item.id} style={styles.card}>
                                    <Image source={{ uri: item.profile_pic_url ? `${CONFIG.API_URL}/${item.profile_pic_url}` : 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.cardImage} />
                                    <Text style={styles.cardName}>{item.name}</Text>
                                    <Text style={styles.cardRole}>{item.user_type}</Text>
                                    <TouchableOpacity style={styles.connectButton}>
                                        <Text style={styles.connectButtonText}>Connect</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {users.length === 0 && <Text style={{ color: '#A0AEC0', padding: 20 }}>No users found.</Text>}
                        </ScrollView>
                    </>
                )}

                {/* Business Products */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Business Product</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.gridContainer}>
                    {businessProducts.map((item) => (
                        <View key={item.id} style={styles.productCard}>
                            <Image source={{ uri: item.image }} style={styles.productImage} />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productPrice}>{item.price}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
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
        marginBottom: 25,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 15,
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
    connectButton: {
        backgroundColor: '#2D3748',
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
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
