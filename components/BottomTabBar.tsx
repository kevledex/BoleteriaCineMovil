import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { House, LogIn, Popcorn, Ticket, User } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colores } from '../styles/estilosGlobal';

export type RutaTab = 'Cartelera' | 'Dulceria' | 'MisEntradas' | 'Perfil' | 'Login';

interface Props {
  rutaActual: string;
  navegar: (ruta: RutaTab) => void;
}

export default function BottomTabBar({ rutaActual, navegar }: Props) {
  const { perfil } = useAuth();

  const tabs: { ruta: RutaTab; etiqueta: string; Icono: typeof House }[] = [
    { ruta: 'Cartelera', etiqueta: 'Cartelera', Icono: House },
    { ruta: 'Dulceria', etiqueta: 'Dulcería', Icono: Popcorn },
    { ruta: 'MisEntradas', etiqueta: 'Boletos', Icono: Ticket },
    perfil
      ? { ruta: 'Perfil', etiqueta: 'Perfil', Icono: User }
      : { ruta: 'Login', etiqueta: 'Login', Icono: LogIn }
  ];

  return (
    <View style={styles.contenedor}>
      <BlurView intensity={90} tint="dark" style={styles.blur}>
        {tabs.map(({ ruta, etiqueta, Icono }) => {
          const activo = rutaActual === ruta;

          return (
            <Pressable
              key={ruta}
              onPress={() => navegar(ruta)}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPresionado
              ]}
            >
              <Icono
                size={23}
                color={activo ? colores.dorado : '#8a93a0'}
                strokeWidth={activo ? 2.4 : 2}
              />
              <Text style={[styles.etiqueta, activo && styles.etiquetaActiva]}>
                {etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.12)'
  },
  blur: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: 'rgba(8,13,19,0.6)'
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4
  },
  tabPresionado: {
    opacity: 0.6
  },
  etiqueta: {
    color: '#8a93a0',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1
  },
  etiquetaActiva: {
    color: colores.dorado,
    fontWeight: '700'
  }
});
