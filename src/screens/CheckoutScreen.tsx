import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { CONFIG } from '../Config';
import Svg, { Path, Circle } from 'react-native-svg';

const CheckoutScreen = ({ navigation }: any) => {
    const { cartItems, clearCart, removeFromCart } = useContext(CartContext);
    const { userInfo } = useContext(AuthContext);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
    const [loading, setLoading] = useState(false);

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);

        // Group by Seller
        const ordersBySeller: { [key: number]: any[] } = {};
        cartItems.forEach((item: any) => {
            const sellerId = item.user_id;
            if (!ordersBySeller[sellerId]) ordersBySeller[sellerId] = [];
            ordersBySeller[sellerId].push({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            });
        });

        try {
            // Execute orders sequentially (or Promise.all)
            // Note: DataService.createOrder takes (sellerId, items)
            // items is array of {product_id, quantity, price}
            // Also it infers buyer_id from server session if implemented, or we need to pass it?
            // Checking DataService.createOrder: "const response = await axios.post(`${CONFIG.API_URL}/api/orders`, { seller_id: sellerId, items });"
            // And server.js: "const { seller_id, buyer_id, items } = req.body;"
            // Server.js expects buyer_id in body if it's not from session (which we don't use fully server-side session here maybe, or we rely on token)
            // Wait, server.js: "INSERT INTO orders (seller_id, buyer_id, total_amount, status) VALUES (?, ?, ?, "pending")"
            // The buyer_id comes from req.body.
            // I need to update DataService.createOrder to pass buyer_id!

            const buyerId = userInfo.id;

            // Wait, DataService.createOrder in existing code might not accept buyerId.
            // I should check DataService.ts again.
            // If it doesn't, I need to update DataService.ts first or rely on the backend possibly extracting it from token (but the backend code I read uses req.body.buyer_id).

            // Execute all orders
            const orderPromises = Object.keys(ordersBySeller).map(sellerId =>
                DataService.createOrder(parseInt(sellerId), ordersBySeller[parseInt(sellerId)], buyerId)
            );

            await Promise.all(orderPromises);

            Alert.alert('Success', 'Your order has been placed!', [
                { text: 'OK', onPress: () => {
                    clearCart();
                    navigation.navigate('CustomerOrders');
                }}
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.itemCard}>
            <Image source={{ uri: item.image_url ? `${CONFIG.API_URL}/${item.image_url}` : 'https://via.placeholder.com/80' }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price} PKR x {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2">
                    <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                        <Path d="M15 18l-6-6 6-6" />
                    </Svg>
                </TouchableOpacity>
                <Text style={styles.title}>Checkout</Text>
            </View>

            <FlatList
                data={cartItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
            />

            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.paymentSection}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                        <View style={styles.paymentOptions}>
                            <TouchableOpacity
                                style={[styles.option, paymentMethod === 'cod' && styles.selectedOption]}
                                onPress={() => setPaymentMethod('cod')}
                            >
                                <Text style={[styles.optionText, paymentMethod === 'cod' && styles.selectedOptionText]}>Cash on Delivery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.option, paymentMethod === 'online' && styles.selectedOption]}
                                onPress={() => setPaymentMethod('online')}
                            >
                                <Text style={[styles.optionText, paymentMethod === 'online' && styles.selectedOptionText]}>Online Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>{total} PKR</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.placeOrderBtn, loading && { opacity: 0.7 }]}
                        onPress={handlePlaceOrder}
                        disabled={loading}
                    >
                        <Text style={styles.placeOrderText}>{loading ? 'Processing...' : 'Place Order'}</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    selectedOption: { borderColor: '#4A9EFF', backgroundColor: '#EBF8FF' },
    optionText: { color: '#718096', fontWeight: '500' },
    selectedOptionText: { color: '#4A9EFF', fontWeight: 'bold' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
    totalLabel: { fontSize: 18, color: '#2D3748' },
    totalValue: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
    placeOrderBtn: { backgroundColor: '#2D3748', padding: 18, borderRadius: 30, alignItems: 'center' },
    placeOrderText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default CheckoutScreen;
