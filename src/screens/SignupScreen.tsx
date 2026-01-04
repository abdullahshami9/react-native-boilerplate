import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, StatusBar as RNStatusBar, ScrollView, Alert } from 'react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

import CustomAlert from '../components/CustomAlert';

const SignupScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register, login } = useContext(AuthContext);

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'error' | 'success' | 'info';
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'error',
    });

    const showAlert = (title: string, message: string, type: 'error' | 'success' | 'info' = 'error') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    const hideAlert = () => {
        setAlertConfig({ ...alertConfig, visible: false });
    };

    const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
    const validatePhone = (phone: string) => /^[0-9]+$/.test(phone);

    const handleSignUp = async () => {
        if (!email || !password || !phone) {
            showAlert('Error', 'Please fill all fields', 'error');
            return;
        }
        if (!validateEmail(email)) {
            showAlert('Error', 'Please enter a valid email address', 'error');
            return;
        }
        if (!validatePhone(phone)) {
            showAlert('Error', 'Please enter a valid phone number (digits only)', 'error');
            return;
        }
        if (password.length < 6) {
            showAlert('Error', 'Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            const result = await register('User', email, password, phone, userType);
            if (result.success) {
                // Auto-login the user after successful registration
                console.log('Registration successful, auto-logging in...');
                await login(email, password);
                // Navigation will happen automatically when userToken is set
            }
        } catch (error: any) {
            showAlert('Registration Failed', error.message || 'Something went wrong', 'error');
        }
    };

    const handleGoogleSignUp = () => {
        console.log('Google sign up clicked');
    };

    const [userType, setUserType] = useState<'individual' | 'business'>('individual');

    return (
        <View style={styles.container}>
            <RNStatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path d="M15 18L9 12L15 6" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Welcome Text */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeText}>Let's get{'\n'}started</Text>
                    </View>

                    {/* User Type Selection */}
                    <View style={styles.userTypeContainer}>
                        <TouchableOpacity
                            style={[styles.userTypeButton, userType === 'individual' && styles.userTypeActive]}
                            onPress={() => setUserType('individual')}
                        >
                            <Text style={[styles.userTypeText, userType === 'individual' && styles.userTypeActiveText]}>Personal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.userTypeButton, userType === 'business' && styles.userTypeActive]}
                            onPress={() => setUserType('business')}
                        >
                            <Text style={[styles.userTypeText, userType === 'business' && styles.userTypeActiveText]}>Business</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <Rect x="3" y="5" width="18" height="14" rx="2" stroke="#A0AEC0" strokeWidth="2" />
                                    <Path d="M3 7L12 13L21 7" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" />
                                </Svg>
                            </View>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Enter your email"
                                placeholderTextColor="#A0AEC0"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Phone Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <Rect x="6" y="2" width="12" height="20" rx="2" stroke="#A0AEC0" strokeWidth="2" />
                                    <Line x1="6" y1="18" x2="18" y2="18" stroke="#A0AEC0" strokeWidth="2" />
                                </Svg>
                            </View>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Enter your phone no"
                                placeholderTextColor="#A0AEC0"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <Rect x="5" y="11" width="14" height="10" rx="2" stroke="#A0AEC0" strokeWidth="2" />
                                    <Path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" />
                                    <Circle cx="12" cy="16" r="1.5" fill="#A0AEC0" />
                                </Svg>
                            </View>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Enter your password"
                                placeholderTextColor="#A0AEC0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                {showPassword ? (
                                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#A0AEC0" strokeWidth="2" />
                                        <Circle cx="12" cy="12" r="3" stroke="#A0AEC0" strokeWidth="2" />
                                    </Svg>
                                ) : (
                                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <Path d="M3 3L21 21M10.5 10.5C9.57 11.43 9.57 12.57 10.5 13.5M10.5 10.5L13.5 13.5M10.5 10.5C11.43 9.57 12.57 9.57 13.5 10.5M13.5 13.5C14.43 12.57 14.43 11.43 13.5 10.5M9.9 4.24C10.56 4.09 11.27 4 12 4C19 4 22 12 22 12C22 12 21.27 13.58 19.74 15.24M6.61 6.61C4.62 8.07 3.14 10.39 2 12C2 12 5 19 12 19C13.65 19 15.08 18.57 16.38 17.93" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" />
                                    </Svg>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
                            <Text style={styles.signupButtonText}>Sign up</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <Text style={styles.dividerText}>or continue with</Text>
                        </View>

                        {/* Google Button */}
                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
                            <Svg width="20" height="20" viewBox="0 0 24 24">
                                <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </Svg>
                            <Text style={styles.googleButtonText}>Google</Text>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Bottom Indicator Removed */}
            </ScrollView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={hideAlert}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8EEF3',
    },

    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    content: {
        paddingTop: 80,
        paddingHorizontal: 30,
        paddingBottom: 30,
        flex: 1,
    },
    welcomeSection: {
        marginBottom: 20,
    },
    userTypeContainer: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 25,
        padding: 4,
        marginBottom: 30,
    },
    userTypeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 22,
    },
    userTypeActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#718096',
    },
    userTypeActiveText: {
        color: '#2D3748',
    },
    welcomeText: {
        fontSize: 36, // Slightly smaller than Login for "Let's get started" or keep same? Design had similar
        fontWeight: '700',
        color: '#4A5568',
        lineHeight: 44,
    },
    formSection: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(160, 174, 192, 0.3)',
        borderRadius: 50,
        paddingHorizontal: 20,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    inputField: {
        flex: 1,
        fontSize: 15,
        color: '#4A5568',
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    signupButton: {
        backgroundColor: '#4A5568',
        borderRadius: 50,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#4A5568',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    signupButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerText: {
        color: '#718096',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(160, 174, 192, 0.3)',
        borderRadius: 50,
        paddingVertical: 16,
        gap: 12,
    },
    googleButtonText: {
        color: '#4A5568',
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    loginText: {
        color: '#718096',
        fontSize: 14,
    },
    loginLink: {
        color: '#4A5568',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

});

export default SignupScreen;
