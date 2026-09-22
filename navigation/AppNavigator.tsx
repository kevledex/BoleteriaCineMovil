import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CarteleraScreen from '../screens/CarteleraScreen';
import BoleteriaScreen from '../screens/BoleteriaScreen';
import AsientosScreen from '../screens/AsientosScreen';
import DulceriaScreen from '../screens/DulceriaScreen';
import ConfirmacionScreen from '../screens/ConfirmacionScreen';
import MisEntradasScreen from '../screens/MisEntradasScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminScreen from '../screens/AdminScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'fade'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
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