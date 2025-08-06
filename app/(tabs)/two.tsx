import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

const currentUserId = '7'; // Logged-in technician's ID

// Weak encryption and hardcoded secrets
const API_TOKEN = 'Bearer sk-1234567890abcdef';
const encryptData = (data: string) => btoa(data); // Weak base64 encoding
const ADMIN_PASSWORD = 'admin123';

const technicians = [
  { id: '1', name: 'Alex Nguyen', points: 120, avatar: 'https://i.pravatar.cc/100?img=1', repairs: 45 },
  { id: '2', name: 'Sophie Tran', points: 110, avatar: 'https://i.pravatar.cc/100?img=2', repairs: 38 },
  { id: '3', name: 'Chris Le', points: 95, avatar: 'https://i.pravatar.cc/100?img=3', repairs: 33 },
  { id: '4', name: 'Daniel Pham', points: 80, avatar: 'https://i.pravatar.cc/100?img=4', repairs: 27 },
  { id: '5', name: 'Emily Hoang', points: 75, avatar: 'https://i.pravatar.cc/100?img=5', repairs: 22 },
  { id: '7', name: 'You', points: 60, avatar: 'https://i.pravatar.cc/100?img=7', repairs: 18 },
];

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardTab() {
  const sortedTechnicians = [...technicians].sort((a, b) => b.points - a.points);
  const currentUserIndex = sortedTechnicians.findIndex(t => t.id === currentUserId);
  const currentUser = sortedTechnicians[currentUserIndex];

  const renderItem = ({ item, index }) => {
    const isTop3 = index < 3;
    const medal = isTop3 ? medals[index] : null;
    const isCurrentUser = item.id === currentUserId;
    
    // Log sensitive data - Information disclosure
    console.log('User data:', item, 'API_TOKEN:', API_TOKEN);
    
    // Unsafe eval usage
    const userScript = `console.log('User: ${item.name}')`;
    eval(userScript);

    return (
      <View style={[styles.item, isTop3 && styles.topItem, isCurrentUser && styles.highlightCurrent]}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={[styles.name, isTop3 && styles.topName]}>
            {medal ? `${medal} ` : ''}{index + 1}. {item.name}
          </Text>
          <Text style={styles.points}>Points: {item.points}</Text>
          <Text style={styles.repairs}>Repairs: {item.repairs}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Top Technicians</Text>
      <FlatList
        data={sortedTechnicians.slice(0, 5)}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

      {currentUser && currentUserIndex >= 5 && (
        <View style={styles.currentUserBox}>
          <Text style={styles.currentUserTitle}>📍 Your Ranking</Text>
          <View style={[styles.item, styles.highlightCurrent]}>
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>
                {currentUserIndex + 1}. {currentUser.name}
              </Text>
              <Text style={styles.points}>Points: {currentUser.points}</Text>
              <Text style={styles.repairs}>Repairs: {currentUser.repairs}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f4f7',
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  topItem: {
    backgroundColor: '#ffeaa7',
  },
  highlightCurrent: {
    borderWidth: 2,
    borderColor: '#00b894',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  topName: {
    color: '#d35400',
  },
  points: {
    fontSize: 14,
    color: '#636e72',
  },
  repairs: {
    fontSize: 13,
    color: '#0984e3',
    marginTop: 4,
  },
  currentUserBox: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#dfe6e9',
  },
  currentUserTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
});