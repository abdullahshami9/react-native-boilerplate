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
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

const BusinessCardEditorScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();
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
        { id: 'tech_terminal', name: 'Tech Terminal' },
        { id: 'mechanic_tool', name: 'Mechanic Tool' },
        { id: 'split_card', name: 'Split Card' },
        { id: 'finger_play', name: 'Finger Play' },
        { id: 'chart_graph', name: 'Growth Graph' },
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
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Hidden QR Generator */}
            <View style={{ position: 'absolute', opacity: 0, zIndex: -1 }}>
                <QRCode
                    value={`raabtaa://user/${userInfo?.id}`}
                    size={100}
                    getRef={handleQrRef}
                />
            </View>

            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2"><Path d="M15 18l-6-6 6-6" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Design Business Card</Text>
                <TouchableOpacity onPress={handleExport}>
                    <Text style={[styles.saveText, { color: theme.primary }]}>Export</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Preview Area */}
                <View style={styles.previewContainer}>
                    <Text style={[styles.label, { color: theme.subText }]}>Preview ({previewSide === 'front' ? 'Front' : 'Back'})</Text>
                    <View style={[styles.cardPreviewPlaceholder, { backgroundColor: '#EDF2F7', borderColor: theme.navBorder }]}>
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
                    <View style={[styles.toggleRow, { backgroundColor: theme.inputBg }]}>
                        <TouchableOpacity onPress={() => setPreviewSide('front')} style={[styles.toggleBtn, previewSide === 'front' && { backgroundColor: theme.cardBg, shadowColor: theme.text }]}><Text style={previewSide === 'front' ? { fontWeight: 'bold', color: theme.text } : { color: theme.subText }}>Front</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setPreviewSide('back')} style={[styles.toggleBtn, previewSide === 'back' && { backgroundColor: theme.cardBg, shadowColor: theme.text }]}><Text style={previewSide === 'back' ? { fontWeight: 'bold', color: theme.text } : { color: theme.subText }}>Back</Text></TouchableOpacity>
                    </View>
                </View>

                {/* Templates */}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Choose Template</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateList}>
                    {templates.map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            style={[
                                styles.templateCard,
                                { backgroundColor: theme.cardBg, borderColor: theme.navBorder },
                                selectedTemplate === t.id && { borderColor: theme.primary, backgroundColor: theme.authBg }
                            ]}
                            onPress={() => setSelectedTemplate(t.id)}
                        >
                            <Text style={[styles.templateName, { color: theme.subText }, selectedTemplate === t.id && { color: theme.primary }]}>{t.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Edit Details */}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Customize Details</Text>
                <View style={[styles.form, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.inputLabel, { color: theme.subText }]}>Name</Text>
                    <TextInput style={[styles.input, { borderColor: theme.navBorder, color: theme.text }]} value={name} onChangeText={setName} placeholderTextColor={theme.subText} />

                    <Text style={[styles.inputLabel, { color: theme.subText }]}>Role / Title</Text>
                    <TextInput style={[styles.input, { borderColor: theme.navBorder, color: theme.text }]} value={role} onChangeText={setRole} placeholderTextColor={theme.subText} />

                    <Text style={[styles.inputLabel, { color: theme.subText }]}>Phone</Text>
                    <TextInput style={[styles.input, { borderColor: theme.navBorder, color: theme.text }]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={theme.subText} />

                    <Text style={[styles.inputLabel, { color: theme.subText }]}>Email</Text>
                    <TextInput style={[styles.input, { borderColor: theme.navBorder, color: theme.text }]} value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor={theme.subText} />

                    <Text style={[styles.inputLabel, { color: theme.subText }]}>Address / Tagline</Text>
                    <TextInput style={[styles.input, { borderColor: theme.navBorder, color: theme.text }]} value={address} onChangeText={setAddress} placeholderTextColor={theme.subText} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    saveText: { fontWeight: 'bold', fontSize: 16 },
    content: { padding: 20, paddingBottom: 50 },
    previewContainer: { alignItems: 'center', marginBottom: 20 },
    label: { marginBottom: 10, fontWeight: '600' },
    cardPreviewPlaceholder: { width: 300, height: 170, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    toggleRow: { flexDirection: 'row', borderRadius: 20, padding: 3 },
    toggleBtn: { paddingVertical: 6, paddingHorizontal: 20, borderRadius: 18 },
    activeToggle: { shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }, // Used conditionally inline now
    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
    templateList: { flexDirection: 'row', marginBottom: 20 },
    templateCard: { padding: 15, borderRadius: 10, marginRight: 10, borderWidth: 1, width: 100, alignItems: 'center' },
    templateName: { fontWeight: '600' },
    form: { padding: 15, borderRadius: 10 },
    inputLabel: { fontSize: 12, marginBottom: 5 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15 }
});

export default BusinessCardEditorScreen;
