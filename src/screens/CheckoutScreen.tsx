import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { CONFIG } from '../Config';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';
import CustomAlert from '../components/CustomAlert';

const CheckoutScreen = ({ navigation }: any) => {
    const { cartItems, clearCart, removeFromCart } = useContext(CartContext);
    const { userInfo } = useContext(AuthContext);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info', onConfirm: undefined as undefined | (() => void) });

    const validItems = cartItems.filter((item: any) => item.user_id !== userInfo.id);
    const total = validItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const handlePlaceOrder = async () => {
        if (validItems.length === 0) {
            setAlertConfig({ visible: true, title: 'Cart Empty', message: 'No valid items to checkout.', type: 'info', onConfirm: undefined });
            return;
        }
        setLoading(true);

        // Group by Seller
        const ordersBySeller: { [key: number]: any[] } = {};
        validItems.forEach((item: any) => {
            const sellerId = item.user_id;
            if (!ordersBySeller[sellerId]) ordersBySeller[sellerId] = [];
            ordersBySeller[sellerId].push({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            });
        });

        try {
            const buyerId = userInfo.id;

            // Execute all orders
            const orderPromises = Object.keys(ordersBySeller).map(sellerId =>
                DataService.createOrder(parseInt(sellerId), ordersBySeller[parseInt(sellerId)], buyerId, paymentMethod)
            );

            await Promise.all(orderPromises);

            setAlertConfig({
                visible: true,
                title: 'Success',
                message: 'Your order has been placed!',
                type: 'success',
                onConfirm: () => {
                    clearCart();
                    navigation.navigate('CustomerOrders');
                }
            });
        } catch (error) {
            console.error(error);
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to place order. Please try again.', type: 'error', onConfirm: undefined });
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={[styles.itemCard, { backgroundColor: theme.cardBg }]}>
            <Image source={{ uri: item.image_url ? `${CONFIG.API_URL}/${item.image_url}` : 'https://via.placeholder.com/80' }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: theme.subText }]}>{item.price} PKR x {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2">
                    <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '600', color: theme.text }}>My Cart</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={validItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subText }]}>Your cart is empty.</Text>}
            />

            {validItems.length > 0 && (
                <View style={[styles.footer, { backgroundColor: theme.cardBg, borderTopColor: theme.borderColor }]}>
                    <View style={styles.paymentSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
                        <View style={styles.paymentOptions}>
                            <TouchableOpacity
                                style={[styles.option, { borderColor: theme.borderColor }, paymentMethod === 'cod' && { borderColor: theme.primary, backgroundColor: theme.inputBg }]}
                                onPress={() => setPaymentMethod('cod')}
                            >
                                <Text style={[styles.optionText, { color: theme.subText }, paymentMethod === 'cod' && { color: theme.primary, fontWeight: 'bold' }]}>Cash on Delivery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.option, { borderColor: theme.borderColor }, paymentMethod === 'online' && { borderColor: theme.primary, backgroundColor: theme.inputBg }]}
                                onPress={() => setPaymentMethod('online')}
                            >
                                <Text style={[styles.optionText, { color: theme.subText }, paymentMethod === 'online' && { color: theme.primary, fontWeight: 'bold' }]}>Online Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: theme.text }]}>Total:</Text>
                        <Text style={[styles.totalValue, { color: theme.text }]}>{total} PKR</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.placeOrderBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                        onPress={handlePlaceOrder}
                        disabled={loading}
                    >
                        <Text style={styles.placeOrderText}>{loading ? 'Processing...' : 'Place Order'}</Text>
                    </TouchableOpacity>
                </View>
            )}

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff', elevation: 2 },
    backBtn: { marginRight: 15 },
    title: { fontSize: 20, fontWeight: 'bold' },
    list: { padding: 20 },
    itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 10, alignItems: 'center' },
    itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemName: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
    itemPrice: { color: '#718096', marginTop: 4 },
    removeBtn: { padding: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#A0AEC0' },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    paymentSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#2D3748' },
    paymentOptions: { flexDirection: 'row', gap: 10 },
    option: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E0', alignItems: 'center' },
    optionText: { color: '#718096', fontWeight: '500' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
    totalLabel: { fontSize: 18, color: '#2D3748' },
    totalValue: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
    placeOrderBtn: { backgroundColor: '#2D3748', padding: 18, borderRadius: 30, alignItems: 'center' },
    placeOrderText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default CheckoutScreen;
