import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataService } from '../../services/DataService';
import CustomAlert from '../../components/CustomAlert';
import { launchImageLibrary } from 'react-native-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';
import { CONFIG } from '../../Config';
import LocalAssets from '../../utils/LocalAssets';
import { resolveImage } from '../../utils/ImageHelper';

const ManageServicesScreen = ({ navigation }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [bookingType, setBookingType] = useState('duration'); // 'duration' or 'day_night'
    const [image, setImage] = useState<any>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const allAssets = Object.keys(LocalAssets);

    // Alert State
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' });

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#F7FAFC',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#fff',
        inputBg: isDarkMode ? '#2D3748' : '#fff',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        headerBg: isDarkMode ? '#2D3748' : '#fff',
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const data = await DataService.getServices(userInfo.id);
            setServices(data.services || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
        if (result.assets && result.assets.length > 0) {
            setImage(result.assets[0]);
            setShowImageOptions(false);
        }
    };

    const handleAssetPick = (key: string) => {
        setImage({ uri: `asset:${key}` }); // Store as uri for preview, handle in save
        setShowImageOptions(false);
    };

    const handleAddService = async () => {
        if (!name || !price || !duration) {
            setAlertConfig({ visible: true, title: 'Error', message: 'Please fill required fields', type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            const rules = bookingType === 'day_night'
                ? { type: 'day_night', slots: ['Day', 'Night'] }
                : { type: 'duration', duration_mins: parseInt(duration) };

            // Handle Image URL
            // If it's an asset string, we save it directly in the DB column.
            // If it's a file, we upload it after saving.
            let finalImageUrl = '';
            if (image && image.uri && image.uri.startsWith('asset:')) {
                finalImageUrl = image.uri;
            }

            const serviceData = {
                name,
                category,
                description,
                price: parseFloat(price),
                duration_mins: parseInt(duration) || 0,
                booking_rules: rules,
                user_id: userInfo.id,
                image_url: finalImageUrl
            };

            if (editingId) {
                // Update Service
                // If we have an asset image, we include it in the update body
                await DataService.updateService(editingId, serviceData);

                // If it's a file upload (not asset), do that separately
                if (image && image.uri && !image.uri.startsWith('asset:')) {
                    await DataService.uploadServiceImage(editingId, image);
                }
                setAlertConfig({ visible: true, title: 'Success', message: 'Service updated successfully', type: 'success' });
            } else {
                // Add Service
                const response = await DataService.addService(serviceData);

                if (response.success && image && !image.uri.startsWith('asset:')) {
                    await DataService.uploadServiceImage(response.id, image);
                }
                setAlertConfig({ visible: true, title: 'Success', message: 'Service added successfully', type: 'success' });
            }

            setModalVisible(false);
            resetForm();
            fetchServices();
        } catch (error: any) {
            setAlertConfig({ visible: true, title: 'Error', message: error.message || 'Failed to save service', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditService = (item: any) => {
        setEditingId(item.id);
        setName(item.name);
        setCategory(item.category || '');
        setDescription(item.description || '');
        setPrice(String(item.price));
        setDuration(String(item.duration_mins));
        // Parse rules
        let rules = item.booking_rules;
        if (typeof rules === 'string') {
            try { rules = JSON.parse(rules); } catch (e) { }
        }
        setBookingType(rules?.type || 'duration');
        setImage(null);
        // If existing has image, we might want to show it?
        // The modal uses 'image' state for preview. If null, it shows placeholder.
        // We can set image state to existing url for preview if we want, or just leave null to show current on record.
        // But the previous code didn't set image state on edit, so the preview would be empty until new one picked.
        // We will keep it consistent: only show PREVIEW if new image selected.
        setModalVisible(true);
    };

    const handleDeleteService = async (id: number) => {
        try {
            await DataService.deleteService(id);
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to delete service', type: 'error' });
        }
    };

    const resetForm = () => {
        setName('');
        setCategory('');
        setDescription('');
        setPrice('');
        setDuration('');
        setBookingType('duration');
        setImage(null);
        setEditingId(null);
    };

    const renderItem = ({ item }: any) => (
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Image
                source={resolveImage(item.image_url)}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                <Text style={styles.cardPrice}>${item.price}</Text>
                <View style={styles.metaRow}>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                        <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <Path d="M12 6v6l4 2" />
                    </Svg>
                    <Text style={[styles.metaText, { color: theme.subText }]}>{item.duration_mins} mins</Text>
                </View>
                <Text style={[styles.cardDesc, { color: theme.subText }]} numberOfLines={2}>{item.description}</Text>
            </View>
            <View style={{ gap: 10 }}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditService(item)}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A9EFF" strokeWidth="2">
                        <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </Svg>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteService(item.id)}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2">
                        <Path d="M3 6h18" />
                        <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </Svg>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            <View style={[styles.header, { backgroundColor: theme.headerBg, borderColor: theme.borderColor }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Services</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>+ Add Service</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.text} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={services}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subText }]}>No services added yet.</Text>}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
                    <View style={[styles.modalHeader, { backgroundColor: theme.headerBg, borderColor: theme.borderColor }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Service</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.formContainer}>
                        <TouchableOpacity style={styles.imagePicker} onPress={() => setShowImageOptions(true)}>
                            {image ? (
                                <Image source={image.uri.startsWith('asset:') ? resolveImage(image.uri) : { uri: image.uri }} style={styles.previewImage} />
                            ) : (
                                <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? '#2D3748' : '#E2E8F0' }]}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2" style={{ marginBottom: 10 }}>
                                            <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <Circle cx="12" cy="13" r="4" />
                                        </Svg>
                                        <Text style={[styles.imagePlaceholderText, { color: theme.subText }]}>Tap to add/change image</Text>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: theme.text }]}>Service Name</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]} value={name} onChangeText={setName} placeholder="e.g. Home Cleaning" placeholderTextColor={theme.subText} />

                        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]} value={category} onChangeText={setCategory} placeholder="e.g. Plumbing, Education" placeholderTextColor={theme.subText} />

                        <Text style={[styles.label, { color: theme.text }]}>Price ($)</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="50" placeholderTextColor={theme.subText} />

                        <Text style={[styles.label, { color: theme.text }]}>Booking Type</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 10, gap: 10 }}>
                            <TouchableOpacity
                                style={{ padding: 10, backgroundColor: bookingType === 'duration' ? theme.text : theme.inputBg, borderRadius: 8, borderWidth: 1, borderColor: theme.borderColor }}
                                onPress={() => setBookingType('duration')}
                            >
                                <Text style={{ color: bookingType === 'duration' ? theme.bg : theme.text }}>Duration Based</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ padding: 10, backgroundColor: bookingType === 'day_night' ? theme.text : theme.inputBg, borderRadius: 8, borderWidth: 1, borderColor: theme.borderColor }}
                                onPress={() => setBookingType('day_night')}
                            >
                                <Text style={{ color: bookingType === 'day_night' ? theme.bg : theme.text }}>Day/Night Slots</Text>
                            </TouchableOpacity>
                        </View>

                        {bookingType === 'duration' && (
                            <>
                                <Text style={[styles.label, { color: theme.text }]}>Duration (Minutes)</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="60" placeholderTextColor={theme.subText} />
                            </>
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                        <TextInput style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]} value={description} onChangeText={setDescription} multiline placeholder="Describe your service..." placeholderTextColor={theme.subText} />

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.disabledButton]}
                            onPress={handleAddService}
                            disabled={submitting}
                        >
                            <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Create Service'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Image Source Modal */}
            <Modal visible={showImageOptions} transparent animationType="slide" onRequestClose={() => setShowImageOptions(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Image</Text>

                        <TouchableOpacity style={[styles.modalOption, { backgroundColor: theme.inputBg }]} onPress={handleImagePick}>
                            <Text style={{ color: theme.text, fontWeight: '600' }}>Upload from Gallery</Text>
                        </TouchableOpacity>

                        <Text style={{ color: theme.subText, marginTop: 15, marginBottom: 10, textAlign: 'center' }}>Or choose from our collection:</Text>

                        <View style={{ height: 300 }}>
                            <FlatList
                                data={allAssets}
                                keyExtractor={(item) => item}
                                numColumns={3}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.assetItem}
                                        onPress={() => handleAssetPick(item)}
                                    >
                                        <Image source={LocalAssets[item]} style={styles.assetImage} resizeMode="contain" />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <TouchableOpacity style={{ marginTop: 15, padding: 10, alignItems: 'center' }} onPress={() => setShowImageOptions(false)}>
                            <Text style={{ color: theme.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >
        </View >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
    addButton: { backgroundColor: '#2D3748', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    addButtonText: { color: 'white', fontWeight: '600' },
    listContent: { padding: 20 },
    card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#E2E8F0' },
    cardContent: { flex: 1, marginLeft: 12 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748' },
    cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#38A169', marginTop: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    metaText: { fontSize: 14, color: '#718096', marginLeft: 4 },
    cardDesc: { fontSize: 14, color: '#A0AEC0', marginTop: 4 },
    deleteButton: { padding: 8 },
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 50 },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#F7FAFC' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    closeText: { fontSize: 16, color: '#E53E3E' },
    formContainer: { padding: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    imagePicker: { alignItems: 'center', marginBottom: 10 },
    previewImage: { width: '100%', height: 200, borderRadius: 12 },
    imagePlaceholder: { width: '100%', height: 150, backgroundColor: '#E2E8F0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    imagePlaceholderText: { color: '#718096', fontWeight: '500' },
    submitButton: { backgroundColor: '#2D3748', padding: 16, borderRadius: 30, marginTop: 30, alignItems: 'center' },
    disabledButton: { opacity: 0.7 },
    submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    editButton: { padding: 8 },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%'
    },
    modalOption: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10
    },
    assetItem: {
        flex: 1 / 3,
        height: 80,
        padding: 5,
        margin: 2,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    assetImage: {
        width: '100%',
        height: '100%'
    }
});

export default ManageServicesScreen;
