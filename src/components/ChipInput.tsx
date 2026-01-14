import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChipInputProps {
  chips: string[];
  onAddChip: (chip: string) => void;
  onRemoveChip: (chip: string) => void;
  placeholder?: string;
}

const ChipInput: React.FC<ChipInputProps> = ({ chips, onAddChip, onRemoveChip, placeholder = "Add a skill..." }) => {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim().length > 0) {
        if (!chips.includes(text.trim())) {
            onAddChip(text.trim());
        }
        setText('');
    }
  };

  return (
    <View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chipContainer}>
        {chips.map((chip, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{chip}</Text>
            <TouchableOpacity onPress={() => onRemoveChip(chip)} style={styles.removeButton}>
              <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6L18 18" stroke="#718096" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
  },
  addButton: {
      padding: 8,
  },
  addButtonText: {
      color: '#4A5568',
      fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: 14,
    color: '#4A5568',
    marginRight: 6,
  },
  removeButton: {
    padding: 2,
  },
});

export default ChipInput;
