import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export function ConnectScreen({ onConnect }) {
  const [ip, setIp] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Conectar Gamepad</Text>

 <TextInput
          value={ip}
          onChangeText={setIp}
          placeholder='192.168.0.15'
          placeholderTextColor='#666'
          style={styles.input}
          autoCapitalize='none'
          autoCorrect={false}
        />

        <Pressable
          style={styles.button}
          onPress={() => onConnect(ip)}
        >
          <Text style={styles.buttonText}>Conectar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1e293b',
    color: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
  },
    button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});