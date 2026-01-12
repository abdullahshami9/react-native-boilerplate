import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { CONFIG } from '../Config';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const STEPS = ['Introduction', 'Industry', 'Socials', 'Payments', 'Location'];

export default function BusinessOnboardingScreen({ navigation }: any) {
  const { userInfo } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [category, setCategory] = useState('');
  const [socials, setSocials] = useState<{platform: string, url: string}[]>([]);
  const [payments, setPayments] = useState<{provider: string, account_number: string, account_title: string}[]>([]);
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: '' });

  // Temporary state for inputs
  const [tempLink, setTempLink] = useState('');
  const [tempPlatform, setTempPlatform] = useState('Facebook');
  const [tempPaymentProvider, setTempPaymentProvider] = useState('NayaPay');
  const [tempAccountNum, setTempAccountNum] = useState('');
  const [tempAccountTitle, setTempAccountTitle] = useState('');

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSocial = () => {
    if (tempLink) {
      setSocials([...socials, { platform: tempPlatform, url: tempLink }]);
      setTempLink('');
    }
  };

  const addPayment = () => {
    if (tempAccountNum && tempAccountTitle) {
      setPayments([...payments, { provider: tempPaymentProvider, account_number: tempAccountNum, account_title: tempAccountTitle }]);
      setTempAccountNum('');
      setTempAccountTitle('');
    }
  };

  const submitOnboarding = async () => {
    try {
      const payload = {
        user_id: userInfo.id,
        description,
        industry,
        category,
        location_lat: location.lat,
        location_lng: location.lng,
        address: location.address,
        payment_methods: payments,
        socials: socials
      };

      await axios.post(`${CONFIG.API_URL}/api/business/onboarding`, payload);
      Alert.alert("Success", "Business Profile Setup Complete!", [
          { text: "OK", onPress: () => navigation.replace('Home') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save details. Please try again.");
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <View key={index} style={styles.stepWrapper}>
             <View style={[styles.stepDot, index <= currentStep && styles.activeDot]} />
             {index < STEPS.length - 1 && <View style={[styles.stepLine, index < currentStep && styles.activeLine]} />}
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0: // Introduction
        return (
          <View>
            <Text style={styles.title}>Describe your Business</Text>
            <Text style={styles.subtitle}>Tell your customers what you do in a few sentences.</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="e.g. We provide high quality electrical services..."
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        );
      case 1: // Industry
        return (
          <View>
             <Text style={styles.title}>Industry & Category</Text>
             <Text style={styles.label}>Parent Industry</Text>
             <TextInput style={styles.input} placeholder="e.g. Retail, Services, Food" value={industry} onChangeText={setIndustry} />
             <Text style={styles.label}>Category</Text>
             <TextInput style={styles.input} placeholder="e.g. Clothing, Clinic, Restaurant" value={category} onChangeText={setCategory} />
          </View>
        );
      case 2: // Socials
        return (
           <View>
             <Text style={styles.title}>Social Media Links</Text>
             <Text style={styles.subtitle}>Connect your social presence.</Text>

             <View style={styles.row}>
                <TextInput style={[styles.input, {flex: 1}]} placeholder="Platform (e.g. Instagram)" value={tempPlatform} onChangeText={setTempPlatform} />
             </View>
             <View style={styles.row}>
                <TextInput style={[styles.input, {flex: 1}]} placeholder="URL" value={tempLink} onChangeText={setTempLink} />
                <TouchableOpacity style={styles.addButton} onPress={addSocial}>
                   <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
             </View>

             <View style={styles.listContainer}>
                {socials.map((s, i) => (
                   <View key={i} style={styles.listItem}>
                      <Text style={styles.listItemText}>{s.platform}: {s.url}</Text>
                   </View>
                ))}
             </View>
           </View>
        );
      case 3: // Payments
         return (
            <View>
              <Text style={styles.title}>Payment Methods</Text>
              <Text style={styles.subtitle}>How do you want to receive payments?</Text>

              <TextInput style={styles.input} placeholder="Provider (NayaPay, EasyPaisa, Bank)" value={tempPaymentProvider} onChangeText={setTempPaymentProvider} />
              <TextInput style={styles.input} placeholder="Account Number / IBAN" value={tempAccountNum} onChangeText={setTempAccountNum} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="Account Title" value={tempAccountTitle} onChangeText={setTempAccountTitle} />

              <TouchableOpacity style={styles.actionButton} onPress={addPayment}>
                  <Text style={styles.actionButtonText}>Add Payment Method</Text>
              </TouchableOpacity>

              <View style={styles.listContainer}>
                  {payments.map((p, i) => (
                      <View key={i} style={styles.listItem}>
                          <Text style={styles.listItemText}>{p.provider} - {p.account_number} ({p.account_title})</Text>
                      </View>
                  ))}
              </View>
            </View>
         );
      case 4: // Location
          return (
             <View>
                 <Text style={styles.title}>Physical Location</Text>
                 <Text style={styles.subtitle}>Where is your business located?</Text>
                 <TextInput
                    style={styles.input}
                    placeholder="Full Address"
                    value={location.address}
                    onChangeText={(t) => setLocation({...location, address: t})}
                 />
                 <Text style={styles.note}>
                    * Google Maps integration will allow pinning location in future updates.
                    For now, please provide a detailed address.
                 </Text>
             </View>
          );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.header}>
          <Text style={styles.headerTitle}>Setup Business Profile</Text>
       </View>

       {renderProgressBar()}

       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderContent()}
        </ScrollView>
       </KeyboardAvoidingView>

       <View style={styles.footer}>
          {currentStep > 0 && (
             <TouchableOpacity style={[styles.navButton, styles.backButton]} onPress={prevStep}>
                 <Text style={styles.backButtonText}>Back</Text>
             </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={nextStep}>
              <Text style={styles.nextButtonText}>{currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}</Text>
          </TouchableOpacity>
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  stepWrapper: {
     flexDirection: 'row',
     alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  activeDot: {
    backgroundColor: '#007BFF', // Google Blue-ish
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: '#007BFF',
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5f6368',
    marginBottom: 20,
  },
  label: {
     fontSize: 14,
     fontWeight: '600',
     color: '#333',
     marginTop: 10,
     marginBottom: 5,
  },
  input: {
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
     backgroundColor: '#007BFF',
     paddingHorizontal: 15,
     paddingVertical: 12,
     borderRadius: 8,
     marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#34A853',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    marginTop: 10,
  },
  listItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listItemText: {
    color: '#333',
  },
  note: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  backButton: {
    backgroundColor: '#f1f3f4',
  },
  backButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#1a73e8',
    marginLeft: 'auto',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
