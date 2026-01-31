import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, Dimensions, ActivityIndicator, Modal, FlatList } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';
import { useTheme } from '../theme/useTheme';
import LocalAssets from '../utils/LocalAssets';
import { resolveImage } from '../utils/ImageHelper';

const { width } = Dimensions.get('window');

import { CONFIG } from '../Config';


const AddProductScreen = ({ navigation, route }: any) => {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();
    const editingProduct = route.params?.product;

    const [name, setName] = useState(editingProduct?.name || '');
    const [price, setPrice] = useState(editingProduct?.price ? String(editingProduct.price) : '');
    const [description, setDescription] = useState(editingProduct?.description || '');
    const [stock, setStock] = useState(editingProduct?.stock_quantity ? String(editingProduct.stock_quantity) : '');

    // New Product Features
    const [variants, setVariants] = useState<any[]>(editingProduct?.variants ? (typeof editingProduct.variants === 'string' ? JSON.parse(editingProduct.variants) : editingProduct.variants) : []);
    const [deliveryFee, setDeliveryFee] = useState(editingProduct?.delivery_fee ? String(editingProduct.delivery_fee) : '');
    const [isReturnable, setIsReturnable] = useState(editingProduct?.is_returnable !== undefined ? Boolean(editingProduct.is_returnable) : true);
    const [wholesaleTiers, setWholesaleTiers] = useState<any[]>(editingProduct?.wholesale_tiers ? (typeof editingProduct.wholesale_tiers === 'string' ? JSON.parse(editingProduct.wholesale_tiers) : editingProduct.wholesale_tiers) : []);

    // Helper State for adding variants/tiers
    const [newVarSize, setNewVarSize] = useState('');
    const [newVarColor, setNewVarColor] = useState('');
    const [newVarStock, setNewVarStock] = useState('');

    const [newTierMin, setNewTierMin] = useState('');
    const [newTierPrice, setNewTierPrice] = useState('');

    // Image State
    const [image, setImage] = useState<any>(null); // File object for upload
    const [currentImageUrl, setCurrentImageUrl] = useState(editingProduct?.image_url ? `${CONFIG.API_URL}/${editingProduct.image_url}` : null);

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'error' | 'success'>('error');

    const allAssets = Object.keys(LocalAssets);

    const handleGalleryPick = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            setImage(result.assets[0]);
            setCurrentImageUrl(null); // Prioritize new upload
            setShowImageOptions(false);
        }
    };

    const handleAssetPick = (key: string) => {
        setImage(null);
        setCurrentImageUrl(`asset:${key}`);
        setShowImageOptions(false);
    };

    const handleFetchLogs = async () => {
        if (!editingProduct) return;
        try {
            const res = await DataService.getProductLogs(editingProduct.id);
            if (res.success) {
                setLogs(res.logs);
                setShowLogs(!showLogs);
            }
        } catch (e) { console.error(e); }
    };

    const handleAddVariant = () => {
        if (!newVarSize && !newVarColor) return;
        setVariants([...variants, { size: newVarSize, color: newVarColor, stock: newVarStock || '0' }]);
        setNewVarSize('');
        setNewVarColor('');
        setNewVarStock('');
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleAddTier = () => {
        if (!newTierMin || !newTierPrice) return;
        setWholesaleTiers([...wholesaleTiers, { min: newTierMin, price: newTierPrice }]);
        setNewTierMin('');
        setNewTierPrice('');
    };

    const handleRemoveTier = (index: number) => {
        setWholesaleTiers(wholesaleTiers.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!name || !price || !stock) {
            setAlertTitle("Missing Fields");
            setAlertMessage("Please fill in Name, Price, and Stock Quantity.");
            setAlertType("error");
            setAlertVisible(true);
            return;
        }

        setLoading(true);
        try {
            // Determine image URL to save
            // If uploaded (image exists), backend returns new path.
            // If asset selected (currentImageUrl starts with asset:), save that string.
            // If nothing changed, keep old one.

            let finalImageUrl = editingProduct?.image_url || '';
            if (currentImageUrl && currentImageUrl.startsWith('asset:')) {
                finalImageUrl = currentImageUrl;
            }

            const payload = {
                name,
                price: parseFloat(price),
                description,
                stock_quantity: parseInt(stock),
                image_url: finalImageUrl,
                variants,
                delivery_fee: deliveryFee ? parseFloat(deliveryFee) : 0,
                is_returnable: isReturnable,
                wholesale_tiers: wholesaleTiers
            };

            let success = false;
            let productId = editingProduct?.id;

            if (editingProduct) {
                // Edit
                const res = await DataService.updateProduct(editingProduct.id, payload);
                success = res.success;
            } else {
                // Add
                const res = await DataService.addProduct({ user_id: userInfo.id, ...payload });
                success = res.success;
                productId = res.id;
            }

            if (success) {
                // Only upload if a file was selected from gallery
                if (image && productId) {
                    await DataService.uploadProductImage(productId, 0, image);
                }
                setAlertTitle("Success");
                setAlertMessage(editingProduct ? "Product updated successfully!" : "Inventory added successfully!");
                setAlertType("success");
                setAlertVisible(true);
            }
        } catch (error) {
            setAlertTitle("Error");
            setAlertMessage("Failed to save product.");
            setAlertType("error");
            setAlertVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAlertDismiss = () => {
        setAlertVisible(false);
        if (alertType === 'success') {
            navigation.goBack();
        }
    };

    const getPreviewSource = () => {
        if (image) return { uri: image.uri };
        if (currentImageUrl) return resolveImage(currentImageUrl);
        return null;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg, shadowColor: theme.text }]}>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.inputBg }]} onPress={() => navigation.goBack()}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{editingProduct ? 'Edit Product' : 'Add Inventory'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.imagePicker} onPress={() => setShowImageOptions(true)}>
                    {getPreviewSource() ? (
                        <Image source={getPreviewSource()} style={styles.previewImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.placeholder, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                                <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <Circle cx="12" cy="13" r="4" />
                            </Svg>
                            <Text style={[styles.placeholderText, { color: theme.subText }]}>Tap to add/change image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={[styles.label, { color: theme.text }]}>Product Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter product name"
                        placeholderTextColor={theme.subText}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Price (PKR)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={theme.subText}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Stock Quantity</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                        value={stock}
                        onChangeText={setStock}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={theme.subText}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        placeholder="Product description..."
                        placeholderTextColor={theme.subText}
                    />

                    {/* Variants Section */}
                    <Text style={[styles.sectionHeader, { color: theme.text }]}>Product Variants</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                        {variants.map((v, i) => (
                            <View key={i} style={styles.listItem}>
                                <Text style={{ color: theme.text, flex: 1 }}>{v.size} {v.color ? `/ ${v.color}` : ''} (Stock: {v.stock})</Text>
                                <TouchableOpacity onPress={() => handleRemoveVariant(i)}>
                                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                                </TouchableOpacity>
                            </View>
                        ))}
                        <View style={styles.addRow}>
                            <TextInput style={[styles.smallInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Size" placeholderTextColor={theme.subText} value={newVarSize} onChangeText={setNewVarSize} />
                            <TextInput style={[styles.smallInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Color" placeholderTextColor={theme.subText} value={newVarColor} onChangeText={setNewVarColor} />
                            <TextInput style={[styles.smallInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Stock" placeholderTextColor={theme.subText} keyboardType="numeric" value={newVarStock} onChangeText={setNewVarStock} />
                            <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.secondary }]} onPress={handleAddVariant}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Delivery & Returns */}
                    <Text style={[styles.sectionHeader, { color: theme.text }]}>Delivery & Returns</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ color: theme.text }}>Delivery Fee (Leave empty for Free)</Text>
                            <TextInput
                                style={[styles.smallInput, { width: 80, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                                placeholder="0"
                                placeholderTextColor={theme.subText}
                                keyboardType="numeric"
                                value={deliveryFee}
                                onChangeText={setDeliveryFee}
                            />
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} onPress={() => setIsReturnable(!isReturnable)}>
                            <Text style={{ color: theme.text }}>Accept Returns</Text>
                            <View style={{ width: 40, height: 20, borderRadius: 10, backgroundColor: isReturnable ? theme.secondary : theme.inputBorder, justifyContent: 'center', paddingHorizontal: 2 }}>
                                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'white', alignSelf: isReturnable ? 'flex-end' : 'flex-start' }} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Wholesale Tiers */}
                    <Text style={[styles.sectionHeader, { color: theme.text }]}>Wholesale Pricing</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                        {wholesaleTiers.map((t, i) => (
                            <View key={i} style={styles.listItem}>
                                <Text style={{ color: theme.text, flex: 1 }}>Buy {t.min}+ for {t.price} PKR/unit</Text>
                                <TouchableOpacity onPress={() => handleRemoveTier(i)}>
                                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                                </TouchableOpacity>
                            </View>
                        ))}
                        <View style={styles.addRow}>
                            <TextInput style={[styles.smallInput, { flex: 1, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Min Qty" placeholderTextColor={theme.subText} keyboardType="numeric" value={newTierMin} onChangeText={setNewTierMin} />
                            <TextInput style={[styles.smallInput, { flex: 1, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Unit Price" placeholderTextColor={theme.subText} keyboardType="numeric" value={newTierPrice} onChangeText={setNewTierPrice} />
                            <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.secondary }]} onPress={handleAddTier}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.secondary }]} onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>{editingProduct ? 'Save Changes' : 'Add to Inventory'}</Text>
                        )}
                    </TouchableOpacity>

                    {editingProduct && (
                        <View style={{ marginTop: 30 }}>
                            <TouchableOpacity onPress={handleFetchLogs} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: theme.secondary, fontWeight: 'bold' }}>{showLogs ? 'Hide History' : 'View Price/Stock History'}</Text>
                            </TouchableOpacity>
                            {showLogs && (
                                <View style={{ marginTop: 15, backgroundColor: theme.inputBg, padding: 15, borderRadius: 10 }}>
                                    {logs.length === 0 ? <Text style={{ color: theme.subText }}>No history logs found.</Text> :
                                        logs.map((log, i) => (
                                            <View key={i} style={{ marginBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.borderColor, paddingBottom: 5 }}>
                                                <Text style={{ color: theme.text, fontWeight: '600' }}>{new Date(log.change_date).toLocaleDateString()} {new Date(log.change_date).toLocaleTimeString()}</Text>
                                                <Text style={{ color: theme.subText }}>Price: {log.old_price} {'->'} {log.new_price}</Text>
                                            </View>
                                        ))
                                    }
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Image Source Modal */}
            <Modal visible={showImageOptions} transparent animationType="slide" onRequestClose={() => setShowImageOptions(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Image</Text>

                        <TouchableOpacity style={[styles.modalOption, { backgroundColor: theme.inputBg }]} onPress={handleGalleryPick}>
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
            </Modal>

            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                onDismiss={handleAlertDismiss}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        padding: 5,
        borderRadius: 20,
    },
    content: {
        padding: 20,
        paddingBottom: 50
    },
    imagePicker: {
        alignItems: 'center',
        marginBottom: 30,
    },
    previewImage: {
        width: 150,
        height: 150,
        borderRadius: 20,
    },
    placeholder: {
        width: 150,
        height: 150,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 10,
        fontSize: 12,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
    },
    card: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5
    },
    addRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center'
    },
    smallInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        fontSize: 14,
        flex: 1
    },
    addBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        // backgroundColor: 'rgba(0,0,0,0.5)',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
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

export default AddProductScreen;
