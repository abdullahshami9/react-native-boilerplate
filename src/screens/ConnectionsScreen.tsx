import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const ConnectionsScreen = () => {
    const connections = [
        { id: 1, name: 'Aamisons', role: 'Skilled Individual', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 2, name: 'Name Smith', role: 'User Photo', image: 'https://randomuser.me/api/portraits/men/44.jpg' },
        { id: 3, name: 'Dartin Scare', role: 'Skilled Individual', image: 'https://randomuser.me/api/portraits/men/85.jpg' },
        { id: 4, name: 'Justin Mare', role: 'Skilled Individual', image: 'https://randomuser.me/api/portraits/men/22.jpg' },
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
                <Text style={styles.headerTitle}>Connection</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" style={styles.searchIcon}>
                    <Circle cx="11" cy="11" r="8" />
                    <Path d="M21 21L16.65 16.65" />
                </Svg>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#A0AEC0"
                />
            </View>

            <FlatList
                data={connections}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.image }} style={styles.avatar} />
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.role}>{item.role}</Text>
                        </View>
                        <TouchableOpacity style={styles.connectButton}>
                            <Text style={styles.connectButtonText}>Connect</Text>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        marginHorizontal: 20,
        marginBottom: 20,
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
    listContent: {
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff', // Or transparent as per designs? Design looks like list items on white/grey bg
        // Actually design has list items with avatars
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
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
    role: {
        fontSize: 14,
        color: '#718096',
    },
    connectButton: {
        backgroundColor: '#2D3748',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ConnectionsScreen;
