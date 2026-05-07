import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DPad } from '../componentes/DPad';
import { JumpButton } from '../componentes/JumpButton';
import useWakeLock from '../hooks/useWakeLock';

export function GamepadScreen({
  idJugador,
  enviarInput,
}) {
  useWakeLock();

  function alPresionar(tecla) {
    enviarInput('keydown', tecla);
  }

  function alSoltar(tecla) {
    enviarInput('keyup', tecla);
  }
return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Jugador {idJugador}
      </Text>

      <View style={styles.controls}>
        <DPad
          onPressIn={alPresionar}
          onPressOut={alSoltar}
          colorDestaque='#22c55e'
        />

        <JumpButton
          onPressIn={alPresionar}
          onPressOut={alSoltar}
          colorDestaque='#ef4444'
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 24,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
  },
  controls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 48,
  },
});