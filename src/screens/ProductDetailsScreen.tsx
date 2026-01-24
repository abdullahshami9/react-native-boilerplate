import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, StatusBar, Share } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { CartContext } from '../context/CartContext';
import { CONFIG } from '../Config';
import MiniToast, { MiniToastRef } from '../components/MiniToast';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ navigation, route }: any) => {
    const { product } = route.params || {};
    const { addToCart } = React.useContext(CartContext);
    const toastRef = useRef<MiniToastRef>(null);

    const handleAddToCart = () => {
        addToCart(product);
        toastRef.current?.show('Added to cart');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${product.name} for ${product.price} PKR on Raabtaa!`,
                url: product.image_url ? `${CONFIG.API_URL}/${product.image_url}` : undefined,
                title: product.name
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (!product) return null;
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
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
                    <Image source={{ uri: product.image_url ? `${CONFIG.API_URL}/${product.image_url}` : 'https://via.placeholder.com/400' }} style={styles.image} />
                    {/* Dots indicator manually for now */}
                    <View style={styles.dotsContainer}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.price}>{product.price} PKR</Text>

                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {product.description || 'No description available.'}
                    </Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.buyButton} onPress={handleAddToCart}>
                            <Text style={styles.buyButtonText}>Add to Cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
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
            </ScrollView>
            <MiniToast ref={toastRef} />
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
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    buyButton: {
        flex: 1,
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
    shareButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ProductDetailsScreen;
