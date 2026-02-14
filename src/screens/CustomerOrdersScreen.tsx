import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, LayoutAnimation, Platform, UIManager, Modal, TextInput, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import Svg, { Path } from 'react-native-svg';
import StandardLoader from '../components/StandardLoader';
import { useTheme } from '../theme/useTheme';
import EmptyState from '../components/EmptyState';

const CustomerOrdersScreen = ({ navigation }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    // Rating State
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const theme = useTheme();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        if (!refreshing) setLoading(true);
        try {
            const data = await DataService.getCustomerOrders(userInfo.id);
            setOrders(data.orders || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setShowLoader(true);
        await fetchOrders();
        setRefreshing(false);
        setShowLoader(false);
    };

    const handleRateOrder = (orderId: number) => {
        setSelectedOrderId(orderId);
        setRating(0);
        setReview('');
        setRatingModalVisible(true);
    };

    const submitRating = async () => {
        if (!selectedOrderId || rating === 0) {
            Alert.alert("Please select a rating");
            return;
        }
        setShowLoader(true);
        try {
            await DataService.rateOrder(selectedOrderId, rating, review);
            setRatingModalVisible(false);
            fetchOrders(); // Refresh to show updated status
            Alert.alert("Success", "Thank you for your feedback!");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to submit rating");
        } finally {
            setShowLoader(false);
        }
    };

    const renderItem = ({ item }: any) => {
        const dateObj = new Date(item.created_at);
        const statusColor =
            item.status === 'completed' ? '#C6F6D5' :
            item.status === 'cancelled' ? '#FED7D7' :
            item.status === 'accepted' ? '#BEE3F8' :
            item.status === 'out_for_delivery' ? '#FEEBC8' : '#FEFCBF';

        const statusText =
            item.status === 'completed' ? '#22543D' :
            item.status === 'cancelled' ? '#822727' :
            item.status === 'accepted' ? '#2B6CB0' :
            item.status === 'out_for_delivery' ? '#C05621' : '#744210';

        return (
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { order: item })} style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.orderId, { color: theme.subText }]}>Order #{item.id}</Text>
                        <Text style={[styles.customerName, { color: theme.text }]}>{item.seller_name || 'Business'}</Text>
                        <Text style={[styles.dateText, { color: theme.subText }]}>{dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={styles.statusCol}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={[styles.statusText, { color: statusText }]}>
                                {item.status.replace(/_/g, ' ').toUpperCase()}
                            </Text>
                        </View>
                        <Text style={[styles.totalAmount, { color: theme.text }]}>${item.total_amount}</Text>
                    </View>
                </TouchableOpacity>
                {item.status === 'completed' && !item.rating && (
                    <TouchableOpacity
                        style={[styles.rateBtn, { borderTopColor: theme.borderColor }]}
                        onPress={() => handleRateOrder(item.id)}
                    >
                        <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Rate Order</Text>
                    </TouchableOpacity>
                )}
                {item.status === 'completed' && item.rating && (
                     <View style={[styles.rateBtn, { borderTopColor: theme.borderColor }]}>
                        <Text style={{ color: '#F6E05E', fontWeight: 'bold' }}>{'★'.repeat(item.rating)}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.bg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
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
                ListEmptyComponent={<EmptyState type="orders" message="You haven't placed any orders." />}
            />

            <StandardLoader visible={showLoader} />

            <Modal visible={ratingModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Rate Your Experience</Text>

                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Text style={{ fontSize: 32, color: star <= rating ? '#F6E05E' : '#CBD5E0' }}>★</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                            placeholder="Write a review (optional)"
                            placeholderTextColor={theme.subText}
                            multiline
                            value={review}
                            onChangeText={setReview}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setRatingModalVisible(false)} style={styles.modalBtn}>
                                <Text style={{ color: theme.subText }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={submitRating} style={[styles.modalBtn, { backgroundColor: theme.primary }]}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
    backButton: { padding: 5, borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: '600' },
    listContent: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
    headerInfo: { flex: 1 },
    orderId: { fontSize: 14, color: '#A0AEC0', fontWeight: 'bold' },
    customerName: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginVertical: 4 },
    dateText: { fontSize: 13, color: '#718096' },
    statusCol: { alignItems: 'flex-end' },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginBottom: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
    rateBtn: { padding: 12, alignItems: 'center', borderTopWidth: 1 },
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 50 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});

export default CustomerOrdersScreen;
