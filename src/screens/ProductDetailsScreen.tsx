import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </Svg>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                            <Circle cx="18" cy="5" r="3" />
                            <Circle cx="6" cy="12" r="3" />
                            <Circle cx="18" cy="19" r="3" />
                            <Path d="M8.59 13.51l6.83 3.98" />
                            <Path d="M15.41 6.51l-6.82 3.98" />
                        </Svg>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1571781348782-95c0a1e067e5?fit=crop&w=400&h=400' }} style={styles.image} />
                    {/* Dots indicator manually for now */}
                    <View style={styles.dotsContainer}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>Product</Text>
                    <Text style={styles.price}>$2.00</Text>

                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                    </Text>

                    <TouchableOpacity style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
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
        paddingBottom: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    content: {
        paddingBottom: 20,
    },
    imageContainer: {
        width: width,
        height: 400,
        backgroundColor: '#EDF2F7',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 5,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: '#fff',
    },
    infoContainer: {
        padding: 20,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 5,
    },
    price: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 20,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#718096',
        lineHeight: 22,
        marginBottom: 30,
    },
    buyButton: {
        backgroundColor: '#2D3748',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#2D3748',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductDetailsScreen;
