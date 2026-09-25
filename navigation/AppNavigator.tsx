import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import CarteleraScreen from '../screens/CarteleraScreen';
import BoleteriaScreen from '../screens/BoleteriaScreen';
import AsientosScreen from '../screens/AsientosScreen';
import DulceriaScreen from '../screens/DulceriaScreen';
import ConfirmacionScreen from '../screens/ConfirmacionScreen';
import MisEntradasScreen from '../screens/MisEntradasScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import AdminScreen from '../screens/AdminScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { perfil, cargando } = useAuth();

  useEffect(() => {
    if (!cargando) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [cargando]);

  if (cargando) return null;

  const rutaInicial: keyof RootStackParamList = !perfil
    ? 'Login'
    : perfil.roles.includes('ROLE_ADMIN')
      ? 'Admin'
      : 'Cartelera';

  return (
    <Stack.Navigator
      initialRouteName={rutaInicial}
      screenOptions={{
        headerShown: false,
        animation: 'fade'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegistroScreen} />
      <Stack.Screen name="Cartelera" component={CarteleraScreen} />
      <Stack.Screen name="Boleteria" component={BoleteriaScreen} />
      <Stack.Screen name="Asientos" component={AsientosScreen} />
      <Stack.Screen name="Dulceria" component={DulceriaScreen} />
      <Stack.Screen name="Confirmacion" component={ConfirmacionScreen} />
      <Stack.Screen name="MisEntradas" component={MisEntradasScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
    </Stack.Navigator>
  );
}
