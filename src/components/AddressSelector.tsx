import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { DataService } from '../services/DataService';
import Svg, { Path } from 'react-native-svg';

interface AddressSelectorProps {
    onAddressChange: (address: string, details: any) => void;
    initialAddress?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ onAddressChange, initialAddress }) => {
    // Selection States (IDs)
    const [province, setProvince] = useState<any>(null);
    const [city, setCity] = useState<any>(null);
    const [location, setLocation] = useState<any>(null);
    const [sublocation, setSublocation] = useState<any>(null);
    const [street, setStreet] = useState<any>(null);
    const [propertyType, setPropertyType] = useState<'House' | 'Building' | null>(null);
    const [building, setBuilding] = useState<any>(null);
    const [buildingBlock, setBuildingBlock] = useState<any>(null);
    const [houseNo, setHouseNo] = useState<string>('');
    const [apartmentNo, setApartmentNo] = useState<string>('');

    // Data Lists
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [sublocations, setSublocations] = useState<any[]>([]);
    const [streets, setStreets] = useState<any[]>([]);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [buildingBlocks, setBuildingBlocks] = useState<any[]>([]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState<'Province' | 'City' | 'Location' | 'Sublocation' | 'Street' | 'PropertyType' | 'Building' | 'BuildingBlock' | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        let propertyPart = '';
        if (propertyType === 'House' && houseNo) {
            propertyPart = `House ${houseNo}`;
        } else if (propertyType === 'Building') {
            const bApt = apartmentNo ? `Apt ${apartmentNo}` : '';
            const bBlock = buildingBlock ? buildingBlock.buildingBlockName : '';
            const bName = building ? building.buildingName : '';
            propertyPart = [bApt, bBlock, bName].filter(Boolean).join(', ');
        }

        const addrString = [propertyPart, street?.streetName, sublocation?.sublocationName, location?.locationName, city?.cityName, province?.provinceName]
            .filter(Boolean).join(', ');

        const details = {
            provinceId: province?.provinceId,
            cityId: city?.cityId,
            locationId: location?.locationId,
            sublocationId: sublocation?.sublocationId,
            streetId: street?.streetId,
            propertyType,
            houseNo: propertyType === 'House' ? houseNo : null,
            buildingId: building?.buildingId,
            buildingBlockId: buildingBlock?.buildingBlockId,
            apartmentNo: propertyType === 'Building' ? apartmentNo : null
        };

        if (addrString) {
            onAddressChange(addrString, details);
        }
    }, [province, city, location, sublocation, street, propertyType, building, buildingBlock, houseNo, apartmentNo]);

    const fetchProvinces = async () => {
        try {
            const res = await DataService.getProvinces();
            if (res.success) setProvinces(res.provinces);
        } catch (e) { console.error(e); }
    };

    const fetchCities = async (provId: number) => {
        setLoading(true);
        try {
            const res = await DataService.getCities(provId);
            if (res.success) setCities(res.cities);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchLocations = async (cityId: number) => {
        setLoading(true);
        try {
            const res = await DataService.getLocations(cityId);
            if (res.success) setLocations(res.locations);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchSublocations = async (locId: number) => {
        setLoading(true);
        try {
            const res = await DataService.getSublocations(locId);
            if (res.success) setSublocations(res.sublocations);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchStreets = async (subId: number) => {
        setLoading(true);
        try {
            const res = await DataService.getStreets(subId);
            if (res.success) setStreets(res.streets);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchBuildings = async (streetId: number) => {
        setLoading(true);
        try {
            const res = await DataService.getBuildings(streetId);
            if (res.success) setBuildings(res.buildings);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchBuildingBlocks = async (buildingId: number) => {
        setLoading(true);
        try {
            const res = await DataService.getBuildingBlocks(buildingId);
            if (res.success) setBuildingBlocks(res.buildingBlocks);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const openSelection = (step: 'Province' | 'City' | 'Location' | 'Sublocation' | 'Street' | 'PropertyType' | 'Building' | 'BuildingBlock') => {
        // Reset subsequent selections if needed? Or allow browsing?
        // Usually if you change City, Location clears.
        if (step === 'City' && !province) return;
        if (step === 'Location' && !city) return;
        if (step === 'Sublocation' && !location) return;
        if (step === 'Street' && !sublocation) return;
        if (step === 'PropertyType' && !street) return;
        if (step === 'Building' && propertyType !== 'Building') return;
        if (step === 'BuildingBlock' && !building) return;

        setCurrentStep(step);
        setSearchText('');
        setModalVisible(true);

        // Fetch data if needed (though mostly fetched on previous selection)
        if (step === 'Province' && provinces.length === 0) fetchProvinces();
        if (step === 'City' && cities.length === 0 && province) fetchCities(province.provinceId);
        // ... handled in handleSelect
    };

    const handleSelect = (item: any) => {
        setSearchText(''); // Clear search for next step

        if (currentStep === 'Province') {
            setProvince(item); setCity(null); setLocation(null); setSublocation(null); setStreet(null); setPropertyType(null); setHouseNo(''); setApartmentNo(''); setBuilding(null); setBuildingBlock(null);
            fetchCities(item.provinceId);
            setCurrentStep('City'); // Auto-transition
        } else if (currentStep === 'City') {
            setCity(item); setLocation(null); setSublocation(null); setStreet(null); setPropertyType(null); setHouseNo(''); setApartmentNo(''); setBuilding(null); setBuildingBlock(null);
            fetchLocations(item.cityId);
            setCurrentStep('Location'); // Auto-transition
        } else if (currentStep === 'Location') {
            setLocation(item); setSublocation(null); setStreet(null); setPropertyType(null); setHouseNo(''); setApartmentNo(''); setBuilding(null); setBuildingBlock(null);
            fetchSublocations(item.locationId);
            setCurrentStep('Sublocation'); // Auto-transition
        } else if (currentStep === 'Sublocation') {
            setSublocation(item); setStreet(null); setPropertyType(null); setHouseNo(''); setApartmentNo(''); setBuilding(null); setBuildingBlock(null);
            fetchStreets(item.sublocationId);
            setCurrentStep('Street'); // Auto-transition
        } else if (currentStep === 'Street') {
            setStreet(item); setPropertyType(null); setHouseNo(''); setApartmentNo(''); setBuilding(null); setBuildingBlock(null);
            setCurrentStep('PropertyType');
        } else if (currentStep === 'PropertyType') {
            setPropertyType(item); setHouseNo(''); setApartmentNo(''); setBuilding(null); setBuildingBlock(null);
            if (item === 'Building') {
                fetchBuildings(street.streetId);
                setCurrentStep('Building');
            } else {
                setModalVisible(false); // Close modal, user will type house string inline
            }
        } else if (currentStep === 'Building') {
            setBuilding(item); setBuildingBlock(null); setApartmentNo('');
            fetchBuildingBlocks(item.buildingId);
            setCurrentStep('BuildingBlock');
        } else if (currentStep === 'BuildingBlock') {
            setBuildingBlock(item); setApartmentNo('');
            setModalVisible(false); // Close on final selection
        }
    };

    const getListData = () => {
        if (currentStep === 'PropertyType') return ['House', 'Building'];

        let data = [];
        if (currentStep === 'Province') data = provinces;
        else if (currentStep === 'City') data = cities;
        else if (currentStep === 'Location') data = locations;
        else if (currentStep === 'Sublocation') data = sublocations;
        else if (currentStep === 'Street') data = streets;
        else if (currentStep === 'Building') data = buildings;
        else if (currentStep === 'BuildingBlock') data = buildingBlocks;

        if (searchText) {
            const lower = searchText.toLowerCase();
            return data.filter(d => {
                const name = d.provinceName || d.cityName || d.locationName || d.sublocationName || d.streetName || d.buildingName || d.buildingBlockName;
                return name?.toLowerCase().includes(lower);
            });
        }
        return data;
    };

    const renderItem = ({ item }: any) => {
        const name = currentStep === 'PropertyType' ? item : (item.provinceName || item.cityName || item.locationName || item.sublocationName || item.streetName || item.buildingName || item.buildingBlockName);
        return (
            <TouchableOpacity style={styles.listItem} onPress={() => handleSelect(item)}>
                <Text style={styles.listItemText}>{name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Address</Text>

            <TouchableOpacity style={[styles.selector, !province && styles.disabled]} onPress={() => openSelection('Province')}>
                <Text style={styles.selectorText}>{province ? province.provinceName : 'Select Province'}</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.selector, !province && styles.disabled]} onPress={() => openSelection('City')}>
                <Text style={styles.selectorText}>{city ? city.cityName : 'Select City'}</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.selector, !city && styles.disabled]} onPress={() => openSelection('Location')}>
                <Text style={styles.selectorText}>{location ? location.locationName : 'Select Location'}</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.selector, !location && styles.disabled]} onPress={() => openSelection('Sublocation')}>
                <Text style={styles.selectorText}>{sublocation ? sublocation.sublocationName : 'Select Sublocation'}</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.selector, !sublocation && styles.disabled]} onPress={() => openSelection('Street')}>
                <Text style={styles.selectorText}>{street ? street.streetName : 'Select Street'}</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
            </TouchableOpacity>

            {street && (
                <TouchableOpacity style={styles.selector} onPress={() => openSelection('PropertyType')}>
                    <Text style={styles.selectorText}>{propertyType ? propertyType : 'Select Type (House/Building)'}</Text>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
                </TouchableOpacity>
            )}

            {propertyType === 'Building' && (
                <>
                    <TouchableOpacity style={[styles.selector, !street && styles.disabled]} onPress={() => openSelection('Building')}>
                        <Text style={styles.selectorText}>{building ? building.buildingName : 'Select Building'}</Text>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.selector, !building && styles.disabled]} onPress={() => openSelection('BuildingBlock')}>
                        <Text style={styles.selectorText}>{buildingBlock ? buildingBlock.buildingBlockName : 'Select Building Block'}</Text>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
                    </TouchableOpacity>

                    {buildingBlock && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Apartment Number</Text>
                            <TextInput
                                style={styles.houseInput}
                                placeholder="e.g. Apt 4B, 12"
                                value={apartmentNo}
                                onChangeText={setApartmentNo}
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>
                    )}
                </>
            )}

            {propertyType === 'House' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>House Number</Text>
                    <TextInput
                        style={styles.houseInput}
                        placeholder="e.g. 12A, Plot 4"
                        value={houseNo}
                        onChangeText={setHouseNo}
                        placeholderTextColor="#A0AEC0"
                    />
                </View>
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {currentStep === 'PropertyType' ? 'Type' : currentStep}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                            </TouchableOpacity>
                        </View>

                        {currentStep !== 'PropertyType' && (
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        )}

                        {loading ? (
                            <ActivityIndicator size="large" color="#2D3748" style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={getListData()}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => index.toString()}
                                style={{ maxHeight: 400 }}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4A5568',
        marginBottom: 8,
        marginLeft: 4,
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#EDF2F7',
    },
    selectorText: {
        color: '#2D3748',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        position: 'relative',
        minHeight: 40,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        textAlign: 'center',
    },
    searchInput: {
        backgroundColor: '#F7FAFC',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 15,
    },
    listItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listItemText: {
        fontSize: 16,
        color: '#2D3748',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 10,
    },
    houseInput: {
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#2D3748',
    },
});

export default AddressSelector;
