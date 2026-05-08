import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export function ConnectScreen({ onConnect, estadoConexion, mensajeError }) {
  const [ip, setIp] = useState('');

  const conectando = estadoConexion === 'conectando';

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
          editable={!conectando}
        />

        {/* Mensaje de error: sala llena, timeout, etc. */}
        {mensajeError ? (
          <Text style={styles.error}>{mensajeError}</Text>
        ) : null}

        <Pressable
          style={[styles.button, conectando && styles.buttonDeshabilitado]}
          onPress={() => onConnect(ip)}
          disabled={conectando}
        >
          <Text style={styles.buttonText}>
            {conectando ? 'Conectando...' : 'Conectar'}
          </Text>
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
  error: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDeshabilitado: {
    backgroundColor: '#1e3a5f',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
