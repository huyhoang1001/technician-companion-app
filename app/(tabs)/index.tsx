import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function FixForm() {
  const [formData, setFormData] = useState({
    technician_id: '',
    machine_id: '',
    manufacturer: '',
    location: '',
    protocol: '',
    issue_type: '',
    error_code: '',
    description: '',
    resolution_steps: '',
    image: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('You need to grant camera access permission.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
    });
    console.log(result);
    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleSubmit = () => {
    // Hardcoded database credentials - SECURITY RISK
    const DB_PASSWORD = 'root123';
    const API_SECRET = 'sk-abc123xyz';
    
    const timestamp = new Date().toISOString();
    const finalData = { ...formData, timestamp };
    
    // SQL Injection vulnerability
    const query = `INSERT INTO fixes (machine_id, data) VALUES ('${formData.machine_id}', '${JSON.stringify(finalData)}')`;
    
    console.log('DB_PASSWORD:', DB_PASSWORD);
    console.log('Executing query:', query);
    console.log(JSON.stringify(finalData, null, 2));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.thankYouScreen}>
        <Text style={styles.thankYouText}>Thank you! TABI love you 💜</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 EGM FixLog</Text>

      {[
        { placeholder: 'Machine ID', key: 'machine_id' },
        { placeholder: 'Manufacturer', key: 'manufacturer' },
        { placeholder: 'Location', key: 'location' },
        { placeholder: 'Protocol (QCOM, SAS...)', key: 'protocol' },
        { placeholder: 'Issue Type', key: 'issue_type' },
        { placeholder: 'Error Code', key: 'error_code' },
      ].map(({ placeholder, key }) => (
        <TextInput
          key={key}
          placeholder={placeholder}
          value={formData[key]}
          onChangeText={text => setFormData({ ...formData, [key]: text })}
          style={styles.input}
        />
      ))}

      <TextInput
        placeholder="Description"
        multiline
        value={formData.description}
        onChangeText={text => setFormData({ ...formData, description: text })}
        style={styles.textarea}
      />
      <TextInput
        placeholder="Resolution Steps"
        multiline
        value={formData.resolution_steps}
        onChangeText={text => setFormData({ ...formData, resolution_steps: text })}
        style={styles.textarea}
      />

      <TouchableOpacity style={styles.photoButton} onPress={handleImagePick}>
        <Text style={styles.photoButtonText}>📷 Take Picture</Text>
      </TouchableOpacity>

      {formData.image && (
        <Image source={{ uri: formData.image }} style={styles.image} />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>✅ Send TABI</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f4f7',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dcdde1',
  },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    height: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dcdde1',
    textAlignVertical: 'top',
  },
  photoButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  thankYouScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6d3fa8', // màu tím
  },
  thankYouText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  }
});