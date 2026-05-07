// components/JumpButton.jsx
// Botón circular de salto (botón A).
// Se colorea con el color del jugador y se ilumina al presionar.

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export function JumpButton({ onPressIn, onPressOut, colorDestaque }) {
  return (
    <Pressable
      style={({ pressed }) => [
        estilos.boton,
        { borderColor: colorDestaque },
        // Cuando está presionado se rellena con el color del jugador
        pressed && { backgroundColor: colorDestaque },
      ]}
      onPressIn={() => onPressIn('jump')}
      onPressOut={() => onPressOut('jump')}
    >
      <Text style={[estilos.etiqueta, { color: colorDestaque }]}>A</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    width:           80,
    height:          80,
    borderRadius:    40,      // Mitad del tamaño para que sea un círculo perfecto
    backgroundColor: '#1a2535',
    borderWidth:     2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  etiqueta: {
    fontSize:   28,
    fontWeight: 'bold',
  },
});
