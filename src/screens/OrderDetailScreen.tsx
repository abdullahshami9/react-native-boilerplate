import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import SocketService from '../services/SocketService';
import { useTheme } from '../theme/useTheme';
import Svg, { Path, Circle, Check } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveImage, getDefaultImageForType } from '../utils/ImageHelper';

const STEPS = [
    { key: 'pending', label: 'Order Placed', desc: 'Your order has been received.' },
    { key: 'accepted', label: 'Confirmed', desc: 'Seller has accepted your order.' },
    { key: 'shipped', label: 'Shipped', desc: 'Your package is on the way.' },
    { key: 'delivered', label: 'Delivered', desc: 'Package has been delivered.' },
    { key: 'completed', label: 'Completed', desc: 'Order transaction completed.' }
];

const OrderDetailScreen = ({ route, navigation }: any) => {
    const { order } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [currentOrder, setCurrentOrder] = useState(order);
    const theme = useTheme();

    useEffect(() => {
        // Connect socket
        SocketService.connect(userInfo.id);

        // Listen for updates
        const offOrder = SocketService.onOrderUpdate((updatedOrder) => {
            if (updatedOrder.id === currentOrder.id) {
                setCurrentOrder(updatedOrder);
            }
        });

        return () => {
            offOrder();
        };
    }, [currentOrder.id]);

    const getCurrentStepIndex = () => {
        if (currentOrder.status === 'cancelled') return -1;
        const index = STEPS.findIndex(s => s.key === currentOrder.status);
        return index === -1 ? 0 : index;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Order #{currentOrder.id}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Order Summary Card */}
                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                     <View style={styles.orderInfoRow}>
                         <Text style={[styles.label, { color: theme.subText }]}>Date</Text>
                         <Text style={[styles.value, { color: theme.text }]}>{new Date(currentOrder.created_at).toLocaleDateString()}</Text>
                     </View>
                     <View style={styles.orderInfoRow}>
                         <Text style={[styles.label, { color: theme.subText }]}>Total Amount</Text>
                         <Text style={[styles.totalValue, { color: theme.text }]}>${currentOrder.total_amount}</Text>
                     </View>
                     <View style={styles.orderInfoRow}>
                         <Text style={[styles.label, { color: theme.subText }]}>Seller</Text>
                         <Text style={[styles.value, { color: theme.text }]}>{currentOrder.seller_name || 'Business'}</Text>
                     </View>
                </View>

                {/* Timeline */}
                <View style={[styles.card, { backgroundColor: theme.cardBg, paddingVertical: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 20, marginBottom: 20 }]}>Order Status</Text>

                    {currentOrder.status === 'cancelled' ? (
                        <View style={{ alignItems: 'center', padding: 20 }}>
                            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2">
                                <Circle cx="12" cy="12" r="10" />
                                <Path d="M15 9l-6 6" />
                                <Path d="M9 9l6 6" />
                            </Svg>
                            <Text style={{ color: '#E53E3E', marginTop: 10, fontWeight: 'bold' }}>Order Cancelled</Text>
                        </View>
                    ) : (
                        <View style={styles.timeline}>
                            {STEPS.map((step, index) => {
                                const isActive = index <= currentStepIndex;
                                const isLast = index === STEPS.length - 1;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <View key={step.key} style={styles.stepRow}>
                                        <View style={styles.stepIndicator}>
                                            <View style={[
                                                styles.circle,
                                                {
                                                    borderColor: isActive ? '#48BB78' : theme.borderColor,
                                                    backgroundColor: isActive ? '#48BB78' : 'transparent'
                                                }
                                            ]}>
                                                {isActive && (
                                                    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                        <Path d="M20 6L9 17l-5-5" />
                                                    </Svg>
                                                )}
                                            </View>
                                            {!isLast && (
                                                <View style={[
                                                    styles.line,
                                                    { backgroundColor: index < currentStepIndex ? '#48BB78' : theme.borderColor }
                                                ]} />
                                            )}
                                        </View>
                                        <View style={[styles.stepContent, { paddingBottom: isLast ? 0 : 30 }]}>
                                            <Text style={[styles.stepLabel, { color: isActive ? theme.text : theme.subText, fontWeight: isCurrent ? 'bold' : '600' }]}>{step.label}</Text>
                                            <Text style={[styles.stepDesc, { color: theme.subText }]}>{step.desc}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Items */}
                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>Items</Text>
                    {(currentOrder.items || []).map((item: any, idx: number) => (
                        <View key={idx} style={[styles.itemRow, { borderBottomColor: theme.borderColor, borderBottomWidth: idx === (currentOrder.items.length - 1) ? 0 : 1 }]}>
                             <Image source={resolveImage(item.image_url || getDefaultImageForType('product', item.product_name))} style={styles.itemImage} />
                             <View style={{ flex: 1, marginLeft: 15 }}>
                                 <Text style={[styles.itemName, { color: theme.text }]}>{item.product_name}</Text>
                                 <Text style={[styles.itemQty, { color: theme.subText }]}>Qty: {item.quantity}</Text>
                             </View>
                             <Text style={[styles.itemPrice, { color: theme.text }]}>${(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    card: { borderRadius: 15, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    orderInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    label: { fontSize: 14 },
    value: { fontSize: 14, fontWeight: '600' },
    totalValue: { fontSize: 16, fontWeight: 'bold', color: '#48BB78' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold' },

    timeline: { paddingHorizontal: 10 },
    stepRow: { flexDirection: 'row' },
    stepIndicator: { alignItems: 'center', marginRight: 15 },
    circle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    line: { width: 2, flex: 1, marginVertical: -2 },
    stepContent: { flex: 1 },
    stepLabel: { fontSize: 16, marginBottom: 4 },
    stepDesc: { fontSize: 12 },

    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    itemImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' },
    itemName: { fontSize: 14, fontWeight: '600' },
    itemQty: { fontSize: 12 },
    itemPrice: { fontSize: 14, fontWeight: 'bold' },
});

export default OrderDetailScreen;
