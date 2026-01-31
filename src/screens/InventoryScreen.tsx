import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import { CONFIG } from '../Config';
import CustomAlert from '../components/CustomAlert';
import StandardLoader from '../components/StandardLoader';

const InventoryScreen = ({ navigation }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempStock, setTempStock] = useState('');

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'error' | 'success'>('error');

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#F7FAFC',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#fff',
        inputBg: isDarkMode ? '#2D3748' : '#F7FAFC',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        headerBg: isDarkMode ? '#2D3748' : '#F7FAFC',
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
             if (userInfo?.id) {
                fetchInventory();
            }
        });
        return unsubscribe;
    }, [navigation, userInfo?.id]);

    const fetchInventory = async () => {
        // Only set loading if not refreshing (to avoid double spinner or jarring effect if we want custom loader)
        if (!refreshing) setLoading(true);
        try {
            const res = await DataService.getProducts(userInfo.id);
            if (res.success) {
                setProducts(res.products);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setShowLoader(true);
        await fetchInventory();
        setRefreshing(false);
        setShowLoader(false);
    };

    const handleEditStock = (product: any) => {
        navigation.navigate('AddProduct', { product });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]} onPress={() => navigation.goBack()}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Inventory Management</Text>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]} onPress={() => navigation.navigate('AddProduct')}>
                     <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M12 5v14M5 12h14" />
                     </Svg>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.text} /></View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['transparent']}
                            tintColor="transparent"
                            progressBackgroundColor="transparent"
                        />
                    }
                    renderItem={({ item }) => {
                        const imageUrl = item.image_url
                            ? `${CONFIG.API_URL}/${item.image_url}?t=${new Date().getTime()}`
                            : null;

                        return (
                            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                                {imageUrl ? (
                                    <Image source={{ uri: imageUrl }} style={styles.image} />
                                ) : (
                                    <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]} />
                                )}

                                <View style={styles.info}>
                                    <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                                    <Text style={[styles.price, { color: theme.subText }]}>{item.price} PKR</Text>

                                    <Text style={[styles.stock, item.stock_quantity < 5 ? { color: '#E53E3E', fontWeight: 'bold' } : { color: theme.subText }]}>
                                        Stock: {item.stock_quantity || 0} {item.stock_quantity < 5 ? '(Low)' : ''}
                                    </Text>
                                    {item.wholesale_tiers && JSON.parse(item.wholesale_tiers).length > 0 && (
                                        <Text style={{ color: theme.primary, fontSize: 10, marginTop: 2 }}>Wholesale Available</Text>
                                    )}
                                </View>

                                <TouchableOpacity style={[styles.editButton, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]} onPress={() => handleEditStock(item)}>
                                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" style={{ marginRight: 5 }}>
                                        <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </Svg>
                                    <Text style={[styles.editButtonText, { color: theme.text }]}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: '#A0AEC0' }}>No products found. Add products to start selling.</Text>
                        </View>
                    }
                />
            )}

            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                onDismiss={() => setAlertVisible(false)}
            />

            <StandardLoader visible={showLoader} />
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
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
    },
    backButton: {
        padding: 5,
        backgroundColor: '#EDF2F7',
        borderRadius: 20,
    },
    addButton: {
        padding: 5,
        backgroundColor: '#EDF2F7',
        borderRadius: 20,
    },
    listContent: {
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: '#EDF2F7',
        marginRight: 15,
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: '#EDF2F7',
        marginRight: 15,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    price: {
        fontSize: 14,
        color: '#4A5568',
        marginTop: 2,
    },
    stock: {
        fontSize: 14,
        color: '#718096',
        marginTop: 4,
        fontWeight: '500',
    },
    stockEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    stockLabel: {
        fontSize: 14,
        color: '#718096',
        marginRight: 5,
    },
    stockInput: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 2,
        width: 60,
        marginRight: 10,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#48BB78',
        padding: 5,
        borderRadius: 5,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#EDF2F7',
        borderRadius: 10,
    },
    editButtonText: {
        color: '#2D3748',
        fontSize: 12,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    }
});

export default InventoryScreen;
