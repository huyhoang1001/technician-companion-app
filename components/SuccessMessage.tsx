import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SuccessMessageProps {
  message?: string;
  onContinue?: () => void;
  continueText?: string;
  showFileKey?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message = 'Form submitted successfully!',
  onContinue,
  continueText = 'Continue',
  showFileKey
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.successBox}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>Success!</Text>
        <Text style={styles.message}>{message}</Text>
        
        {showFileKey && (
          <View style={styles.fileKeyContainer}>
            <Text style={styles.fileKeyLabel}>File ID:</Text>
            <Text style={styles.fileKey}>{showFileKey}</Text>
          </View>
        )}
        
        <Text style={styles.thankYou}>Thank you! TABI loves you 💜</Text>
        
        {onContinue && (
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={onContinue}
          >
            <Text style={styles.continueButtonText}>{continueText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6d3fa8', // Purple background like original
    padding: 20,
  },
  successBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  fileKeyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  fileKeyLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fileKey: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
    opacity: 0.9,
  },
  thankYou: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  continueButtonText: {
    color: '#6d3fa8',
    fontSize: 16,
    fontWeight: 'bold',
  },
});