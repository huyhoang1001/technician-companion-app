import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface ValidationErrorProps {
  error?: string | null;
  visible?: boolean;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ 
  error, 
  visible = true 
}) => {
  if (!error || !visible) {
    return null;
  }

  return (
    <Text style={styles.errorText}>
      {error}
    </Text>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 4,
  },
});