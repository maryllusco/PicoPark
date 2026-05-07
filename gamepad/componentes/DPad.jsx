// components/DPad.jsx
// Componente de la cruz de dirección (D-Pad).
// Muestra 4 botones: arriba, abajo, izquierda y derecha.
// Cuando el jugador toca un botón avisa al padre con onPressIn,
// y cuando lo suelta avisa con onPressOut.

import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Las 4 direcciones del D-Pad con su etiqueta visual y su posición en pantalla
const DIRECCIONES = [
  { dir: 'up',    etiqueta: '▲', posicion: estilos => estilos.arriba    },
  { dir: 'down',  etiqueta: '▼', posicion: estilos => estilos.abajo     },
  { dir: 'left',  etiqueta: '◀', posicion: estilos => estilos.izquierda },
  { dir: 'right', etiqueta: '▶', posicion: estilos => estilos.derecha   },
];

const TAMAÑO_BOTON = 56;

export function DPad({ onPressIn, onPressOut, colorDestaque }) {
  // useCallback evita que estas funciones se recreen en cada render
  const alPresionar = useCallback((dir) => onPressIn(dir),  [onPressIn]);
  const alSoltar    = useCallback((dir) => onPressOut(dir), [onPressOut]);

  return (
    <View style={estilos.contenedor}>
      {DIRECCIONES.map(({ dir, etiqueta, posicion }) => (
        <Pressable
          key={dir}
          style={({ pressed }) => [
            estilos.boton,
            posicion(estilos),
            // Cuando está presionado, usamos el color del jugador como fondo
            pressed && { backgroundColor: colorDestaque, borderColor: colorDestaque },
          ]}
          onPressIn={() => alPresionar(dir)}
          onPressOut={() => alSoltar(dir)}
        >
          <Text style={estilos.etiqueta}>{etiqueta}</Text>
        </Pressable>
      ))}

      {/* Centro del D-Pad, solo decorativo */}
      <View style={estilos.centro} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    width:    TAMAÑO_BOTON * 3,
    height:   TAMAÑO_BOTON * 3,
    position: 'relative',
  },
  boton: {
    position:        'absolute',
    width:           TAMAÑO_BOTON,
    height:          TAMAÑO_BOTON,
    backgroundColor: '#1e1e2e',
    borderWidth:     1,
    borderColor:     '#333',
    borderRadius:    8,
    alignItems:      'center',
    justifyContent:  'center',
  },
  etiqueta: {
    color:    '#aaa',
    fontSize: 20,
  },
  centro: {
    position:        'absolute',
    width:           TAMAÑO_BOTON,
    height:          TAMAÑO_BOTON,
    top:             TAMAÑO_BOTON,
    left:            TAMAÑO_BOTON,
    backgroundColor: '#111',
    borderRadius:    4,
  },
  // Posición de cada botón dentro del contenedor
  arriba:    { top: 0,           left: TAMAÑO_BOTON },
  abajo:     { bottom: 0,        left: TAMAÑO_BOTON },
  izquierda: { top: TAMAÑO_BOTON, left: 0           },
  derecha:   { top: TAMAÑO_BOTON, right: 0          },
});
