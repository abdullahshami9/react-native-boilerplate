import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import RNPrint from 'react-native-print';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../context/AuthContext';
import { CardTemplates } from '../utils/CardTemplates';
import Svg, { Path } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { CONFIG } from '../Config';
import axios from 'axios';

const { width } = Dimensions.get('window');

const BusinessCardEditorScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [selectedTemplate, setSelectedTemplate] = useState('standard');
    const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

    // Editable Fields
    const [name, setName] = useState(userInfo?.name || '');
    const [role, setRole] = useState(userInfo?.current_job_title || 'Professional');
    const [phone, setPhone] = useState(userInfo?.phone || '');
    const [email, setEmail] = useState(userInfo?.email || '');
    const [address, setAddress] = useState(userInfo?.address || '');

    const [qrBase64, setQrBase64] = useState('');

    useEffect(() => {
        // Load saved preferences if available
        if (userInfo?.id) {
            DataService.getProfile(userInfo.id).then(res => {
                if (res.business && res.business.card_template) {
                    setSelectedTemplate(res.business.card_template);
                }
                if (res.business && res.business.card_custom_details) {
                    try {
                        const savedDetails = JSON.parse(res.business.card_custom_details);
                        setName(savedDetails.name || userInfo.name);
                        setRole(savedDetails.role || userInfo.current_job_title);
                        setPhone(savedDetails.phone || userInfo.phone);
                        setEmail(savedDetails.email || userInfo.email);
                        setAddress(savedDetails.address || userInfo.address);
                    } catch (e) {
                        console.log('Error parsing saved details', e);
                    }
                }
            });
        }
    }, []);

    // Generate QR Base64 helper
    const handleQrRef = (c: any) => {
        if (c) {
            c.toDataURL((data: string) => setQrBase64(`<img src="data:image/png;base64,${data}" width="100" height="100"/>`));
        }
    };

    const templates = [
        { id: 'standard', name: 'Standard' },
        { id: 'broker', name: 'Broker' },
        { id: 'bakery', name: 'Bakery' },
        { id: 'dentist', name: 'Dentist' },
    ];

    const handleExport = async () => {
        if (!qrBase64) {
            Alert.alert('Please wait', 'Generating QR Code...');
            return;
        }

        const data = {
            name,
            role,
            phone,
            email,
            address,
            logo: userInfo.profile_pic_url ? `${CONFIG.API_URL}/${userInfo.profile_pic_url}` : 'https://via.placeholder.com/50',
            qrCode: qrBase64
        };

        // Save preferences
        try {
            await axios.post(`${CONFIG.API_URL}/api/business/card-settings`, {
                user_id: userInfo.id,
                card_template: selectedTemplate,
                card_custom_details: { name, role, phone, email, address }
            });
        } catch (e) {
            console.log('Failed to save preferences');
        }

        const html = (CardTemplates as any)[selectedTemplate](data);

        try {
            await RNPrint.print({ html });
        } catch (error) {
            console.error('Print error:', error);
            Alert.alert('Error', 'Failed to export PDF');
        }
    };

    return (
        <View style={styles.container}>
            {/* Hidden QR Generator */}
            <View style={{ position: 'absolute', opacity: 0, zIndex: -1 }}>
                <QRCode
                    value={`raabtaa://user/${userInfo?.id}`}
                    size={100}
                    getRef={handleQrRef}
                />
            </View>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><Path d="M15 18l-6-6 6-6" /></Svg>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Design Business Card</Text>
                <TouchableOpacity onPress={handleExport}>
                    <Text style={styles.saveText}>Export</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Preview Area */}
                <View style={styles.previewContainer}>
                    <Text style={styles.label}>Preview ({previewSide === 'front' ? 'Front' : 'Back'})</Text>
                    <View style={styles.cardPreviewPlaceholder}>
                        <WebView
                            originWhitelist={['*']}
                            source={{
                                html: (() => {
                                    const data = {
                                        name,
                                        role,
                                        phone,
                                        email,
                                        address,
                                        logo: userInfo.profile_pic_url ? `${CONFIG.API_URL}/${userInfo.profile_pic_url}` : 'https://via.placeholder.com/50',
                                        qrCode: qrBase64
                                    };
                                    let html = (CardTemplates as any)[selectedTemplate](data);
                                    // Inject styles to show only the selected side and fit the container
                                    // Card is 350x200. Container is 300x170.
                                    // We need to scale it down slightly but fill the view.
                                    // 300/350 = 0.85. 
                                    // We will use zoom property or scale transform on the body/page.
                                    const hideStyle = previewSide === 'front'
                                        ? `
                                            <meta name="viewport" content="width=420, user-scalable=no" />
                                            <style>
                                                .page:nth-of-type(2) { display: none !important; } 
                                                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: transparent; }
                                                .page { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; } 
                                            </style>`
                                        : `
                                            <meta name="viewport" content="width=420, user-scalable=no" />
                                            <style>
                                                .page:nth-of-type(1) { display: none !important; } 
                                                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: transparent; }
                                                .page { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; } 
                                            </style>`;
                                    return html + hideStyle;
                                })()
                            }}
                            style={{ width: 300, height: 170, backgroundColor: 'transparent' }}
                            scrollEnabled={false}
                        />
                    </View>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity onPress={() => setPreviewSide('front')} style={[styles.toggleBtn, previewSide === 'front' && styles.activeToggle]}><Text style={previewSide === 'front' ? styles.activeText : styles.inactiveText}>Front</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setPreviewSide('back')} style={[styles.toggleBtn, previewSide === 'back' && styles.activeToggle]}><Text style={previewSide === 'back' ? styles.activeText : styles.inactiveText}>Back</Text></TouchableOpacity>
                    </View>
                </View>

                {/* Templates */}
                <Text style={styles.sectionHeader}>Choose Template</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateList}>
                    {templates.map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            style={[styles.templateCard, selectedTemplate === t.id && styles.selectedTemplate]}
                            onPress={() => setSelectedTemplate(t.id)}
                        >
                            <Text style={[styles.templateName, selectedTemplate === t.id && { color: '#4A9EFF' }]}>{t.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Edit Details */}
                <Text style={styles.sectionHeader}>Customize Details</Text>
                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} />

                    <Text style={styles.inputLabel}>Role / Title</Text>
                    <TextInput style={styles.input} value={role} onChangeText={setRole} />

                    <Text style={styles.inputLabel}>Phone</Text>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

                    <Text style={styles.inputLabel}>Address / Tagline</Text>
                    <TextInput style={styles.input} value={address} onChangeText={setAddress} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
    saveText: { color: '#4A9EFF', fontWeight: 'bold', fontSize: 16 },
    content: { padding: 20, paddingBottom: 50 },
    previewContainer: { alignItems: 'center', marginBottom: 20 },
    label: { marginBottom: 10, color: '#718096', fontWeight: '600' },
    cardPreviewPlaceholder: { width: 300, height: 170, backgroundColor: '#EDF2F7', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    toggleRow: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 20, padding: 3 },
    toggleBtn: { paddingVertical: 6, paddingHorizontal: 20, borderRadius: 18 },
    activeToggle: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    activeText: { fontWeight: 'bold', color: '#2D3748' },
    inactiveText: { color: '#718096' },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 10, marginTop: 10 },
    templateList: { flexDirection: 'row', marginBottom: 20 },
    templateCard: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0', width: 100, alignItems: 'center' },
    selectedTemplate: { borderColor: '#4A9EFF', backgroundColor: '#EBF8FF' },
    templateName: { fontWeight: '600', color: '#4A5568' },
    form: { backgroundColor: '#fff', padding: 15, borderRadius: 10 },
    inputLabel: { fontSize: 12, color: '#718096', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, marginBottom: 15, color: '#2D3748' }
});

export default BusinessCardEditorScreen;
