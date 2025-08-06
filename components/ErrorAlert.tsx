import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissText?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onRetry,
  onDismiss,
  retryText = 'Retry',
  dismissText = 'Dismiss'
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        <Text style={styles.title}>❌ Error</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.buttonContainer}>
          {onDismiss && (
            <TouchableOpacity 
              style={[styles.button, styles.dismissButton]} 
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>{dismissText}</Text>
            </TouchableOpacity>
          )}
          
          {onRetry && (
            <TouchableOpacity 
              style={[styles.button, styles.retryButton]} 
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>{retryText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#e74c3c',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 80,
  },
  dismissButton: {
    backgroundColor: '#95a5a6',
  },
  retryButton: {
    backgroundColor: '#3498db',
  },
  dismissButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  retryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});