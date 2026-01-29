import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Platform, Dimensions, Image, Modal, FlatList } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import RNPrint from 'react-native-print';
import Svg, { Path } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';
import { CONFIG } from '../Config';
import axios from 'axios';
import CustomAlert from '../components/CustomAlert';
import { WebView } from 'react-native-webview';
import { CardTemplates } from '../utils/CardTemplates';
import LocalAssets, { AssetCategories } from '../utils/LocalAssets';
import { resolveImage } from '../utils/ImageHelper';

const { width } = Dimensions.get('window');

const TEMPLATES = [
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

const COLORS = ['#1A202C', '#2D3748', '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#00B5D8', '#805AD5', '#D53F8C'];

export default function BusinessCardEditorScreen({ route, navigation }: any) {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();

    const [selectedTemplate, setSelectedTemplate] = useState('standard');
    const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
    const [selectedColor, setSelectedColor] = useState('#1A202C');

    // Editable Fields
    const [name, setName] = useState(userInfo?.name || '');
    const [role, setRole] = useState(userInfo?.current_job_title || 'Professional');
    const [phone, setPhone] = useState(userInfo?.phone || '');
    const [email, setEmail] = useState(userInfo?.email || '');
    const [address, setAddress] = useState(userInfo?.address || '');

    // Logo State
    const [logoUrl, setLogoUrl] = useState(userInfo?.profile_pic_url ? `${CONFIG.API_URL}/${userInfo.profile_pic_url}` : null);
    const [selectedAssetKey, setSelectedAssetKey] = useState<string | null>(null);
    const [showLogoPicker, setShowLogoPicker] = useState(false);

    const [qrBase64, setQrBase64] = useState('');
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info', onConfirm: undefined as undefined | (() => void) });

    // Flatten assets for picker
    const allAssets = Object.keys(LocalAssets);

    // Generate QR Base64 helper
    const handleQrRef = (c: any) => {
        if (c) {
            c.toDataURL((data: string) => setQrBase64(`<img src="data:image/png;base64,${data}" width="100" height="100"/>`));
        }
    };

    const getLogoUri = () => {
        if (selectedAssetKey) {
            const source = Image.resolveAssetSource(LocalAssets[selectedAssetKey]);
            return source.uri;
        }
        return logoUrl || 'https://via.placeholder.com/50';
    };

    const handleExport = async () => {
        if (!qrBase64) {
            setAlertConfig({ visible: true, title: 'Please wait', message: 'Generating QR Code...', type: 'info', onConfirm: undefined });
            return;
        }

        const data = {
            name,
            role,
            phone,
            email,
            address,
            logo: getLogoUri(),
            qrCode: qrBase64,
            color: selectedColor
        };

        // Save preferences
        try {
            await axios.post(`${CONFIG.API_URL}/api/business/card-settings`, {
                user_id: userInfo?.id,
                card_template: selectedTemplate,
                card_custom_details: { name, role, phone, email, address, color: selectedColor, logoKey: selectedAssetKey }
            });
        } catch (e) {
            console.log('Failed to save preferences');
        }

        const html = (CardTemplates as any)[selectedTemplate](data);

        try {
            await RNPrint.print({ html });
        } catch (error) {
            console.error('Print error:', error);
            // setAlertConfig({ visible: true, title: 'Error', message: 'Failed to export PDF', type: 'error', onConfirm: undefined });
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
                    <View style={[styles.cardPreviewPlaceholder, { backgroundColor: '#EDF2F7', borderColor: theme.navBorder }]}>
                        <WebView
                            key={`${selectedTemplate}-${previewSide}-${selectedColor}-${selectedAssetKey}`}
                            originWhitelist={['*']}
                            source={{
                                html: (() => {
                                    const data = {
                                        name,
                                        role,
                                        phone,
                                        email,
                                        address,
                                        logo: getLogoUri(),
                                        qrCode: qrBase64,
                                        color: selectedColor
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

                                    let finalHtml = html;
                                    if (finalHtml.includes('</head>')) {
                                        finalHtml = finalHtml.replace('</head>', hideStyle + '</head>');
                                    } else {
                                        finalHtml = hideStyle + finalHtml;
                                    }
                                    if (!finalHtml.trim().startsWith('<!DOCTYPE html>')) {
                                        finalHtml = '<!DOCTYPE html>' + finalHtml;
                                    }
                                    return finalHtml;
                                })(),
                                baseUrl: ''
                            }}
                            scalesPageToFit={true}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            style={{ width: '100%', height: '100%', backgroundColor: 'transparent', opacity: 0.99 }}
                            automaticallyAdjustContentInsets={false}
                        />
                    </View>
                    <View style={[styles.toggleRow, { backgroundColor: theme.inputBg }]}>
                        <TouchableOpacity onPress={() => setPreviewSide('front')} style={[styles.toggleBtn, previewSide === 'front' && { backgroundColor: theme.cardBg, shadowColor: theme.text }]}><Text style={previewSide === 'front' ? { fontWeight: 'bold', color: theme.text } : { color: theme.subText }}>Front</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setPreviewSide('back')} style={[styles.toggleBtn, previewSide === 'back' && { backgroundColor: theme.cardBg, shadowColor: theme.text }]}><Text style={previewSide === 'back' ? { fontWeight: 'bold', color: theme.text } : { color: theme.subText }}>Back</Text></TouchableOpacity>
                    </View>
                </View>

                {/* Templates */}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Template</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateList}>
                    {TEMPLATES.map((t) => (
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

                {/* Color Picker */}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Accent Color</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorList}>
                    {COLORS.map((c) => (
                        <TouchableOpacity
                            key={c}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: c },
                                selectedColor === c && styles.colorSelected
                            ]}
                            onPress={() => setSelectedColor(c)}
                        />
                    ))}
                </ScrollView>

                {/* Edit Details */}
                <View style={styles.rowHeader}>
                    <Text style={[styles.sectionHeader, { color: theme.text }]}>Details</Text>
                    <TouchableOpacity onPress={() => setShowLogoPicker(true)}>
                        <Text style={{color: theme.primary, fontWeight: '600'}}>Change Logo</Text>
                    </TouchableOpacity>
                </View>

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

            <Modal visible={showLogoPicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Illustration</Text>
                            <TouchableOpacity onPress={() => setShowLogoPicker(false)}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={allAssets}
                            keyExtractor={(item) => item}
                            numColumns={3}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.logoItem}
                                    onPress={() => {
                                        setSelectedAssetKey(item);
                                        setShowLogoPicker(false);
                                    }}
                                >
                                    <Image source={LocalAssets[item]} style={styles.logoImage} resizeMode="contain" />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

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
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    saveText: { fontWeight: 'bold', fontSize: 16 },
    content: { padding: 20, paddingBottom: 50 },
    previewContainer: { alignItems: 'center', marginBottom: 20 },
    cardPreviewPlaceholder: { width: width * 0.9, aspectRatio: 1.75, borderRadius: 15, borderWidth: 1, borderColor: '#cad5e0', marginBottom: 15, overflow: 'hidden', backgroundColor: '#EDF2F7' },
    toggleRow: { flexDirection: 'row', borderRadius: 20, padding: 3 },
    toggleBtn: { paddingVertical: 6, paddingHorizontal: 20, borderRadius: 18 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
    templateList: { flexDirection: 'row', marginBottom: 20 },
    templateCard: { padding: 15, borderRadius: 10, marginRight: 10, borderWidth: 1, width: 100, alignItems: 'center' },
    templateName: { fontWeight: '600', fontSize: 12, textAlign: 'center' },
    colorList: { flexDirection: 'row', marginBottom: 20 },
    colorCircle: { width: 30, height: 30, borderRadius: 15, marginRight: 15, borderWidth: 2, borderColor: 'transparent' },
    colorSelected: { borderColor: 'white', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 3, elevation: 5 },
    form: { padding: 15, borderRadius: 10 },
    inputLabel: { fontSize: 12, marginBottom: 5 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15 },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', height: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeText: { color: 'red', fontWeight: '600' },
    logoItem: { flex: 1/3, height: 80, padding: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee', margin: 2, borderRadius: 8 },
    logoImage: { width: '100%', height: '100%' }
});
