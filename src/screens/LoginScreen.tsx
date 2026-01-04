import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, StatusBar as RNStatusBar, ScrollView } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import LoggerService from '../services/LoggerService';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, biometricLogin } = useContext(AuthContext);

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
        LoggerService.info('showAlert called', { title, message, type }, 'LoginScreen');
        setAlertConfig({ visible: true, title, message, type });
        LoggerService.info('Alert config set to visible', undefined, 'LoginScreen');
    };

    const hideAlert = () => {
        setAlertConfig({ ...alertConfig, visible: false });
    };

    const validateEmail = (email: string) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert('Error', 'Please enter email and password', 'error');
            return;
        }
        if (!validateEmail(email)) {
            showAlert('Error', 'Please enter a valid email address', 'error');
            return;
        }

        try {
            await login(email, password);
            // Navigation handled by App.tsx based strictly on token state
        } catch (error: any) {
            showAlert('Login Failed', error.message || 'Invalid credentials', 'error');
        }
    };

    const handleGoogleLogin = () => {
        LoggerService.info('Google login clicked', undefined, 'LoginScreen');
    };

    const rnBiometrics = new ReactNativeBiometrics();
    const [biometryType, setBiometryType] = useState<string | undefined>(undefined);

    React.useEffect(() => {
        rnBiometrics.isSensorAvailable()
            .then((resultObject) => {
                const { available, biometryType } = resultObject;

                if (available && biometryType === BiometryTypes.Biometrics) {
                    setBiometryType(biometryType);
                } else if (available && biometryType === BiometryTypes.TouchID) {
                    setBiometryType(biometryType);
                } else if (available && biometryType === BiometryTypes.FaceID) {
                    setBiometryType(biometryType);
                }
            })
            .catch(() => {
                LoggerService.info('biometrics failed or unavailable', undefined, 'LoginScreen');
            });
    }, []);

    const handleBiometricLogin = async () => {
        try {
            LoggerService.info('Starting biometric authentication...', undefined, 'LoginScreen');
            const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' });
            LoggerService.info('Biometric prompt result:', { success }, 'LoginScreen');

            if (success) {
                try {
                    LoggerService.info('Calling biometricLogin...', undefined, 'LoginScreen');
                    await biometricLogin();
                    LoggerService.info('BiometricLogin completed successfully!', undefined, 'LoginScreen');
                    // Don't show success alert - navigation will happen automatically when userToken is set
                } catch (error: any) {
                    // Handle specific error messages from backend
                    LoggerService.error('BiometricLogin error caught:', error, 'LoginScreen');
                    LoggerService.error('Error message:', { message: error.message }, 'LoginScreen');
                    const errorMessage = error.message || 'Biometric authentication failed';

                    // Check if it's a device not recognized error
                    if (errorMessage.includes('Device not recognized')) {
                        LoggerService.info('SHOWING DEVICE NOT RECOGNIZED ALERT', undefined, 'LoginScreen');
                        showAlert('Device Not Recognized', errorMessage, 'info');
                    } else {
                        LoggerService.info('SHOWING AUTHENTICATION FAILED ALERT', undefined, 'LoginScreen');
                        showAlert('Authentication Failed', errorMessage, 'error');
                    }
                }
            } else {
                LoggerService.info('SHOWING CANCELLED ALERT', undefined, 'LoginScreen');
                showAlert('Error', 'Biometric authentication cancelled', 'error');
            }
        } catch (error) {
            LoggerService.error('Biometric prompt error:', error, 'LoginScreen');
            LoggerService.info('SHOWING PROMPT FAILED ALERT', undefined, 'LoginScreen');
            showAlert('Error', 'Biometric authentication failed', 'error');
        }
    };

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
                        <Text style={styles.welcomeText}>Hey,{'\n'}Welcome{'\n'}Back</Text>
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

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => LoggerService.info('Forgot password clicked', undefined, 'LoginScreen')}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button Row */}
                        <View style={styles.loginRow}>
                            <TouchableOpacity style={[styles.loginButton, { flex: 1 }]} onPress={handleLogin}>
                                <Text style={styles.loginButtonText}>Login</Text>
                            </TouchableOpacity>

                            {biometryType && (
                                <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
                                    <Svg width="40" height="40" viewBox="0 0 32 32" fill="#FFFFFF">
                                        <Path d="M5.796 6.587c2.483-2.099 5.629-3.486 9.084-3.812l0.066-0.005c4.263 0 8.188 1.446 11.312 3.874l-0.042-0.031c0.121 0.087 0.271 0.138 0.434 0.138 0.415 0 0.751-0.336 0.751-0.751 0-0.251-0.123-0.473-0.312-0.609l-0.002-0.002c-3.327-2.569-7.556-4.118-12.147-4.118-0.028 0-0.055 0-0.083 0h0.004c-3.847 0.349-7.287 1.856-10.029 4.166l0.027-0.022c-0.174 0.139-0.284 0.35-0.284 0.587 0 0.414 0.336 0.75 0.75 0.75 0.178 0 0.342-0.062 0.471-0.166l-0.001 0.001zM28.555 11.495c-4.166-4.572-8.404-6.891-12.602-6.891h-0.044c-4.184 0.017-8.378 2.336-12.468 6.895-0.119 0.132-0.192 0.308-0.192 0.501 0 0.414 0.336 0.75 0.75 0.75 0.222 0 0.421-0.096 0.558-0.249l0.001-0.001c3.794-4.23 7.615-6.382 11.356-6.396 3.796-0.025 7.647 2.139 11.53 6.4 0.138 0.151 0.335 0.245 0.555 0.245 0.414 0 0.75-0.336 0.75-0.75 0-0.195-0.074-0.372-0.196-0.505l0.001 0.001zM22.68 27.684c-1.684-0.444-3.106-1.387-4.139-2.657l-0.011-0.014c-1.034-1.355-1.692-3.047-1.792-4.887l-0.001-0.023c-0.048-0.381-0.37-0.672-0.759-0.672-0.022 0-0.043 0.001-0.065 0.003l0.003-0c-0.381 0.040-0.675 0.358-0.675 0.746 0 0.027 0.001 0.053 0.004 0.079l-0-0.003c0.137 2.165 0.912 4.126 2.136 5.724l-0.018-0.025c1.245 1.532 2.94 2.654 4.882 3.169l0.065 0.015c0.056 0.015 0.12 0.023 0.185 0.023h0c0.414-0 0.75-0.336 0.75-0.75 0-0.348-0.237-0.641-0.559-0.725l-0.005-0.001zM20.094 9.35c-1.252-0.502-2.703-0.793-4.222-0.793-0.586 0-1.162 0.043-1.725 0.127l0.064-0.008c-2.143 0.362-4.029 1.268-5.569 2.571l0.017-0.014c-2.242 1.836-3.847 4.374-4.482 7.275l-0.016 0.086c-0.093 0.436-0.166 0.871-0.228 1.369-0.029 0.323-0.046 0.7-0.046 1.080 0 2.965 1.012 5.694 2.709 7.86l-0.021-0.028c0.139 0.172 0.349 0.281 0.585 0.281 0.414 0 0.75-0.336 0.75-0.75 0-0.178-0.062-0.342-0.166-0.47l0.001 0.001c-1.473-1.869-2.363-4.257-2.363-6.854 0-0.348 0.016-0.692 0.047-1.032l-0.003 0.044q0.076-0.601 0.201-1.182c0.578-2.645 2.001-4.892 3.966-6.501l0.020-0.016c1.324-1.122 2.963-1.912 4.767-2.222l0.060-0.008c0.429-0.064 0.923-0.1 1.426-0.1 1.33 0 2.6 0.255 3.764 0.718l-0.069-0.024c3.107 1.2 5.481 3.696 6.492 6.807l0.022 0.077c0.549 1.778 0.705 4.901-0.43 6.142-0.348 0.34-0.823 0.549-1.348 0.549-0.219 0-0.43-0.037-0.626-0.104l0.014 0.004c-0.743-0.197-1.382-0.57-1.893-1.073l0.001 0.001c-0.376-0.309-0.674-0.699-0.869-1.144l-0.008-0.020c-0.108-0.36-0.171-0.774-0.171-1.202 0-0.031 0-0.061 0.001-0.092l-0 0.005c0-0.009 0-0.019 0-0.029 0-0.555-0.076-1.093-0.217-1.603l0.010 0.042c-0.527-1.406-1.684-2.466-3.118-2.849l-0.032-0.007c-0.463-0.172-0.997-0.272-1.555-0.272-0.344 0-0.679 0.038-1.001 0.11l0.030-0.006c-0.913 0.269-1.685 0.784-2.262 1.469l-0.006 0.007c-0.679 0.705-1.167 1.597-1.38 2.592l-0.006 0.035c-0.008 0.137-0.013 0.297-0.013 0.458 0 2.243 0.889 4.278 2.333 5.773l-0.002-0.002c1.365 1.634 2.84 3.086 4.444 4.385l0.060 0.047c0.13 0.113 0.301 0.181 0.489 0.181 0.414 0 0.75-0.336 0.75-0.75 0-0.231-0.104-0.437-0.268-0.575l-0.001-0.001c-1.586-1.282-2.993-2.664-4.257-4.17l-0.038-0.047c-1.249-1.225-2.024-2.93-2.024-4.816 0-0.075 0.001-0.15 0.004-0.224l-0 0.011c0.168-0.742 0.528-1.383 1.024-1.889l-0.001 0.001c0.389-0.476 0.907-0.833 1.499-1.022l0.023-0.006c0.181-0.037 0.389-0.059 0.602-0.059 0.394 0 0.771 0.073 1.119 0.206l-0.021-0.007c0.993 0.249 1.786 0.941 2.17 1.847l0.008 0.021c0.090 0.346 0.141 0.744 0.141 1.154 0 0.018-0 0.036-0 0.054l0-0.003c-0 0.019-0 0.042-0 0.064 0 0.602 0.096 1.182 0.273 1.725l-0.011-0.039c0.287 0.702 0.722 1.291 1.269 1.752l0.007 0.006c0.699 0.676 1.574 1.174 2.549 1.421l0.039 0.008c0.285 0.087 0.612 0.137 0.951 0.137 0.956 0 1.819-0.399 2.431-1.040l0.001-0.001c1.689-1.846 1.359-5.639 0.756-7.596-1.175-3.631-3.878-6.475-7.332-7.815l-0.084-0.029zM9.269 20.688c0.052-2.064 1.027-3.89 2.526-5.088l0.013-0.010c0.574-0.489 1.234-0.901 1.95-1.208l0.050-0.019c0.8-0.349 1.732-0.552 2.712-0.552 1.095 0 2.131 0.254 3.053 0.705l-0.041-0.018c2.115 1.295 3.505 3.594 3.505 6.217 0 0.112-0.003 0.224-0.008 0.335l0.001-0.016c0.020 0.399 0.348 0.715 0.75 0.715 0.415 0 0.751-0.336 0.751-0.751 0-0.011-0-0.021-0.001-0.032l0 0.002c0.006-0.117 0.009-0.254 0.009-0.392 0-3.165-1.727-5.926-4.29-7.394l-0.042-0.022c-1.078-0.535-2.347-0.848-3.69-0.848-1.187 0-2.317 0.245-3.342 0.686l0.055-0.021c-0.915 0.389-1.703 0.88-2.401 1.475l0.013-0.011c-1.823 1.479-2.999 3.694-3.073 6.186l-0 0.012c0.125 3.937 1.87 7.444 4.586 9.893l0.012 0.011c0.134 0.128 0.317 0.207 0.518 0.207 0.414 0 0.75-0.336 0.75-0.75 0-0.213-0.089-0.406-0.232-0.543l-0-0c-2.434-2.174-3.998-5.277-4.134-8.746l-0.001-0.023z"></Path>
                                    </Svg>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <Text style={styles.dividerText}>or continue with</Text>
                        </View>

                        {/* Google Button */}
                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                            <Svg width="20" height="20" viewBox="0 0 24 24">
                                <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </Svg>
                            <Text style={styles.googleButtonText}>Google</Text>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.signupLink}>Sign up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Bottom Indicator Removed */}
            </ScrollView >

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={hideAlert}
            />
        </View >
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
        marginBottom: 40,
    },
    welcomeText: {
        fontSize: 36,
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    forgotPasswordText: {
        color: '#4A5568',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
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
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
    biometricButton: {
        backgroundColor: '#4A5568',
        borderRadius: 50,
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A5568',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
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
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    signupText: {
        color: '#718096',
        fontSize: 14,
    },
    signupLink: {
        color: '#4A5568',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

});

export default LoginScreen;
