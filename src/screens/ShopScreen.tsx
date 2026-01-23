import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { CONFIG } from '../Config';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

const ShopScreen = ({ navigation }: any) => {
    const { userInfo: user, isDarkMode } = React.useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Products');
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        fetchData();
    }, [activeTab, search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'Products') {
                const res = await DataService.discoverProducts(search);
                if (res.success && Array.isArray(res.products)) {
                    setProducts(res.products);
                } else {
                    setProducts([]);
                }
            } else {
                const res = await DataService.discoverServices(search);
                if (res.success && Array.isArray(res.services)) {
                    setServices(res.services);
                } else {
                    setServices([]);
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.bg }]}>
                <Text style={{ position: 'absolute', top: 15, left: 20, zIndex: 10, fontSize: 14, fontWeight: 'bold', color: theme.text }}>Junr</Text>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]} onPress={() => navigation.goBack()}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Shop</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" style={styles.searchIcon}>
                    <Circle cx="11" cy="11" r="8" />
                    <Path d="M21 21L16.65 16.65" />
                </Svg>
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder={`Search ${activeTab}...`}
                    placeholderTextColor="#A0AEC0"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>


            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: theme.bg, borderBottomColor: theme.borderColor }]}>
                <TouchableOpacity onPress={() => setActiveTab('Products')} style={[styles.tab, activeTab === 'Products' && [styles.activeTab, { borderBottomColor: theme.text }]]}>
                    <Text style={[styles.tabText, { color: activeTab === 'Products' ? theme.text : theme.subText }]}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Services')} style={[styles.tab, activeTab === 'Services' && [styles.activeTab, { borderBottomColor: theme.text }]]}>
                    <Text style={[styles.tabText, { color: activeTab === 'Services' ? theme.text : theme.subText }]}>Services</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.text} />
                </View>
            ) : (
                <PageWrapper contentContainerStyle={styles.scrollContent} onRefresh={fetchData}>
                    <View style={styles.gridContainer}>
                        {activeTab === 'Products' ? (
                            products.map((item) => (
                                <TouchableOpacity key={item.id} style={[styles.productCard, { backgroundColor: theme.cardBg }]} onPress={() => (navigation as any).navigate('ProductDetails', { product: item })}>
                                    <View style={[styles.imageContainer, { backgroundColor: isDarkMode ? '#4A5568' : '#E2E8F0' }]}>
                                        <Image source={{ uri: item.image_url ? `${CONFIG.API_URL}/${item.image_url}` : 'https://via.placeholder.com/150' }} style={styles.productImage} />
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
                                        <Text style={[styles.productPrice, { color: theme.subText }]}>{item.price} PKR</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            services.map((item) => (
                                <TouchableOpacity key={item.id} style={[styles.productCard, { backgroundColor: theme.cardBg }]} onPress={() => (navigation as any).navigate('ServiceDetails', { service: item })}>
                                    <View style={[styles.imageContainer, { backgroundColor: isDarkMode ? '#4A5568' : '#E2E8F0' }]}>
                                        <Image source={{ uri: item.image_url ? `${CONFIG.API_URL}/${item.image_url}` : 'https://via.placeholder.com/150' }} style={styles.productImage} />
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
                                        <Text style={[styles.productPrice, { color: theme.subText }]}>{item.price} PKR • {item.duration_mins}m</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                        {((activeTab === 'Products' && products.length === 0) || (activeTab === 'Services' && services.length === 0)) && (
                            <Text style={{ width: '100%', textAlign: 'center', marginTop: 50, color: '#A0AEC0' }}>No results found.</Text>
                        )}
                    </View>
                </PageWrapper>
            )}

            {/* Floating Action Buttons - Only for Business Users */}
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
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3748',
    },
    headerRight: {
        flexDirection: 'row',
    },
    backButton: {
        padding: 5,
        backgroundColor: '#EDF2F7',
        borderRadius: 20,
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
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#2D3748',
        fontSize: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
        backgroundColor: '#F7FAFC', // Sticky feel
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#2D3748',
    },
    tabText: {
        fontSize: 16,
        color: '#A0AEC0',
    },
    activeTabText: {
        color: '#2D3748',
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Fab space
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: (width - 50) / 2,
        backgroundColor: '#F7FAFC',
        borderRadius: 15,
        marginBottom: 20,
    },
    imageContainer: {
        height: 150,
        backgroundColor: '#E2E8F0', // Placeholder color if image fails
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 10,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productInfo: {
        paddingHorizontal: 5,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    productPrice: {
        fontSize: 14,
        color: '#718096',
        marginTop: 4,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 90, // Above bottom tabs
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 15,
    },
    fabSecondary: {
        backgroundColor: '#2D3748',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 5,
    },
    fabSecondaryText: {
        color: '#fff',
        fontWeight: '600',
    }
});

export default ShopScreen;
