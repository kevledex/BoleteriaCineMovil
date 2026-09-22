import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar, { RutaTab } from './components/BottomTabBar';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import { RootStackParamList } from './types/navigation';
import { colores } from './styles/estilosGlobal';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// La barra de navegación se oculta en las pantallas del flujo de compra
// (selección de asientos y pago) para mantener el foco, igual que hacen
// las apps de cine "premium".
const PANTALLAS_SIN_BARRA = ['Asientos', 'Confirmacion', 'Login'];

export default function App() {
  const [rutaActual, setRutaActual] = useState('Cartelera');

  const navegar = (ruta: RutaTab | 'Admin') => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(ruta);
    }
  };

  const actualizarRuta = () => {
    setRutaActual(navigationRef.getCurrentRoute()?.name ?? 'Cartelera');
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={actualizarRuta}
          onStateChange={actualizarRuta}
        >
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.navigator}>
              <AppNavigator />
            </View>

            {!PANTALLAS_SIN_BARRA.includes(rutaActual) && (
              <BottomTabBar
                rutaActual={rutaActual}
                navegar={navegar}
              />
            )}
          </SafeAreaView>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colores.fondo
  },
  navigator: {
    flex: 1,
    backgroundColor: colores.fondo
  }
});
