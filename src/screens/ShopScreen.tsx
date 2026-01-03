import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const ShopScreen = () => {
    const [activeTab, setActiveTab] = useState('Products');

    const products = [
        { id: 1, name: 'Product', price: '$78.00', image: 'https://images.unsplash.com/photo-1571781348782-95c0a1e067e5?fit=crop&w=200&h=200' },
        { id: 2, name: 'Product', price: '$30.00', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?fit=crop&w=200&h=200' },
        { id: 3, name: 'Product', price: '$78.00', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?fit=crop&w=200&h=200' },
        { id: 4, name: 'Product', price: '$30.00', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?fit=crop&w=200&h=200' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shop</Text>
                <View style={styles.headerRight}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2" style={{ marginRight: 15 }}>
                        <Path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                    </Svg>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                        <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <Path d="M3 6h18" />
                        <Path d="M16 10a4 4 0 0 1-8 0" />
                    </Svg>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setActiveTab('Products')} style={[styles.tab, activeTab === 'Products' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'Products' && styles.activeTabText]}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Business')} style={[styles.tab, activeTab === 'Business' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'Business' && styles.activeTabText]}>Business</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {products.map((item) => (
                        <View key={item.id} style={styles.productCard}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.image }} style={styles.productImage} />
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productPrice}>{item.price}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Buttons */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.fabSecondary}>
                    <Text style={styles.fabSecondaryText}>Add Product</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fabSecondary}>
                    <Text style={styles.fabSecondaryText}>Manage Inventory</Text>
                </TouchableOpacity>
            </View>
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
