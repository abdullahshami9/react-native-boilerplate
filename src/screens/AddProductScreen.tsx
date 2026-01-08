import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

const AddProductScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'error' | 'success'>('error');

    const handleChooseImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            setImage(result.assets[0]);
        }
    };

    const handleAddProduct = async () => {
        if (!name || !price || !stock) {
            setAlertTitle("Missing Fields");
            setAlertMessage("Please fill in Name, Price, and Stock Quantity.");
            setAlertType("error");
            setAlertVisible(true);
            return;
        }

        setLoading(true);
        try {
            const res = await DataService.addProduct({
                user_id: userInfo.id,
                name,
                price: parseFloat(price),
                description,
                stock_quantity: parseInt(stock),
                image_url: '' // Will upload separately
            });

            if (res.success) {
                if (image) {
                    await DataService.uploadProductImage(res.id, 0, image);
                }
                setAlertTitle("Success");
                setAlertMessage("Inventory added successfully!");
                setAlertType("success");
                setAlertVisible(true);
            }
        } catch (error) {
            setAlertTitle("Error");
            setAlertMessage("Failed to add product.");
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Inventory</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.imagePicker} onPress={handleChooseImage}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                                <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <Circle cx="12" cy="13" r="4" />
                            </Svg>
                            <Text style={styles.placeholderText}>Tap to add image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={styles.label}>Product Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter product name" />

                    <Text style={styles.label}>Price (PKR)</Text>
                    <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" />

                    <Text style={styles.label}>Stock Quantity</Text>
                    <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />

                    <Text style={styles.label}>Description</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholder="Product description..." />

                    <TouchableOpacity style={styles.submitButton} onPress={handleAddProduct} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Add to Inventory</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        elevation: 2,
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
    content: {
        padding: 20,
    },
    imagePicker: {
        alignItems: 'center',
        marginBottom: 30,
    },
    previewImage: {
        width: 150,
        height: 150,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
    },
    placeholder: {
        width: 150,
        height: 150,
        borderRadius: 20,
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 10,
        color: '#A0AEC0',
        fontSize: 12,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#2D3748',
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#2D3748',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#2D3748',
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
});

export default AddProductScreen;
