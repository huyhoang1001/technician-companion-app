import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

export default function ChatbotTab() {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'bot', text: 'Hi! How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);

    // Simulate bot reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString() + '_bot', sender: 'bot', text: 'Thanks! I’ll look into that.' },
      ]);
    }, 1000);

    setInput('');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.message, item.sender === 'user' ? styles.userMsg : styles.botMsg]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🤖 TABI Assistant</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatArea}
      />
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  chatArea: {
    padding: 10,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMsg: {
    backgroundColor: '#74b9ff',
    alignSelf: 'flex-end',
  },
  botMsg: {
    backgroundColor: '#dfe6e9',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    color: '#2d3436',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#b2bec3',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b2bec3',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  sendText: {
    fontSize: 24,
  },
});