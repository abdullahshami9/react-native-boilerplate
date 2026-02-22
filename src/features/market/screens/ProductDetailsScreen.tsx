import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, StatusBar, Share } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { CartContext } from '../../../context/CartContext';
import { CONFIG } from '../../../Config';
import MiniToast, { MiniToastRef } from '../../../components/MiniToast';

const { width } = Dimensions.get('window');

import { AuthContext } from '../../../context/AuthContext';
import CustomAlert from '../../../components/CustomAlert';

// ...

const ProductDetailsScreen = ({ navigation, route }: any) => {
    const { product } = route.params || {};
    const { addToCart } = React.useContext(CartContext);
    const { userInfo, upgradeGuest } = React.useContext(AuthContext);
    const toastRef = useRef<MiniToastRef>(null);

    const [alertConfig, setAlertConfig] = React.useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'error' | 'success' | 'info',
        onConfirm: undefined as undefined | (() => void)
    });

    // Variants handling
    const variants = product?.variants ? (typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants) : [];
    const [selectedVariant, setSelectedVariant] = React.useState<any>(null);

    // Addons handling
    const addons = product?.addons ? (typeof product.addons === 'string' ? JSON.parse(product.addons) : product.addons) : [];
    const [selectedAddons, setSelectedAddons] = React.useState<any[]>([]);

    const isOwner = userInfo?.id === product?.user_id;

    // Calculate total unit price
    const basePrice = parseFloat(product.price);
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price), 0);
    const totalPrice = basePrice + addonsPrice;

    const toggleAddon = (addon: any) => {
        if (selectedAddons.find(a => a.name === addon.name)) {
            setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
        } else {
            setSelectedAddons([...selectedAddons, addon]);
        }
    };

    const handleAddToCart = () => {
        if (userInfo?.user_type === 'Guest') {
            setAlertConfig({
                visible: true,
                title: "Complete Profile Required",
                message: "You need a full Personal profile to buy products. Would you like to complete it now?",
                type: 'info',
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                    upgradeGuest();
                }
            });
            return;
        }

        if (isOwner) {
            toastRef.current?.show('You cannot buy your own product');
            return;
        }
        if (variants.length > 0 && !selectedVariant) {
            toastRef.current?.show('Please select a variant (Size/Color)');
            return;
        }

        // We pass the UPDATED price to addToCart, or we let Cart calculate it.
        // CartContext uses product.price. Let's override it or store metadata.
        // It's safer to pass the computed price as the product price for the cart item.
        const cartItem = {
            ...product,
            price: totalPrice,
            original_price: basePrice, // Keep track
            selected_addons: selectedAddons
        };

        addToCart(cartItem, selectedVariant);
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
                    <Text style={styles.price}>{totalPrice} PKR {product.unit ? `/ ${product.unit}` : ''}</Text>

                    {/* Variant Selector */}
                    {variants.length > 0 && (
                        <View style={styles.variantContainer}>
                            <Text style={styles.variantTitle}>Select Option:</Text>
                            <View style={styles.variantList}>
                                {variants.map((v: any, index: number) => {
                                    const isSelected = selectedVariant === v;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.variantChip, isSelected && styles.variantChipSelected]}
                                            onPress={() => setSelectedVariant(v)}
                                        >
                                            <Text style={[styles.variantText, isSelected && styles.variantTextSelected]}>
                                                {v.size || ''} {v.color ? `/ ${v.color}` : ''}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            {selectedVariant && (
                                <Text style={{ marginTop: 5, color: '#718096' }}>
                                    Stock: {selectedVariant.stock || 'N/A'}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Addons Selector */}
                    {addons.length > 0 && (
                        <View style={styles.variantContainer}>
                            <Text style={styles.variantTitle}>Add-ons:</Text>
                            <View style={styles.variantList}>
                                {addons.map((addon: any, index: number) => {
                                    const isSelected = selectedAddons.find(a => a.name === addon.name);
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.variantChip, isSelected && styles.variantChipSelected]}
                                            onPress={() => toggleAddon(addon)}
                                        >
                                            <Text style={[styles.variantText, isSelected && styles.variantTextSelected]}>
                                                {addon.name} (+{addon.price})
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {product.description || 'No description available.'}
                    </Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.buyButton, isOwner && { backgroundColor: '#A0AEC0' }]}
                            onPress={handleAddToCart}
                            disabled={isOwner}
                        >
                            <Text style={styles.buyButtonText}>{isOwner ? 'Your Product' : 'Add to Cart'}</Text>
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
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
                confirmText="Upgrade"
                cancelText="Cancel"
            />
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
    variantContainer: {
        marginBottom: 20,
    },
    variantTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 10,
    },
    variantList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    variantChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CBD5E0',
        backgroundColor: '#fff',
    },
    variantChipSelected: {
        borderColor: '#2D3748',
        backgroundColor: '#2D3748',
    },
    variantText: {
        fontSize: 14,
        color: '#4A5568',
    },
    variantTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
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
