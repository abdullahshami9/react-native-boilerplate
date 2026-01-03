import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const InventoryScreen = () => {
    const products = [
        { id: 1, name: 'Product 1', stock: 20, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?fit=crop&w=100&h=100' },
        { id: 2, name: 'Product 2', stock: 20, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fit=crop&w=100&h=100' },
        { id: 3, name: 'Product 3', stock: 5, image: 'https://images.unsplash.com/photo-1571781348782-95c0a1e067e5?fit=crop&w=100&h=100' },
        { id: 4, name: 'Product 4', stock: 1, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?fit=crop&w=100&h=100' },
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
                <Text style={styles.headerTitle}>Inventory Management</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.stock}>Stock: {item.stock}</Text>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2" style={{ marginRight: 5 }}>
                                <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </Svg>
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
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
    listContent: {
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff', // White cards
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
        width: 50,
        height: 50,
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
    stock: {
        fontSize: 14,
        color: '#718096',
        marginTop: 2,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    editButtonText: {
        color: '#2D3748',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default InventoryScreen;
