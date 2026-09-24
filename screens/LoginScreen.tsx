import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Eye, EyeOff } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { colores } from '../styles/estilosGlobal';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { iniciarSesion, cerrarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const entrar = async () => {
    setError('');

    if (!email || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }

    setProcesando(true);

    try {
      const perfil = await iniciarSesion(email, password);

      if (perfil.roles.includes('ROLE_ADMIN')) {
        navigation.navigate('Admin');
      } else if (perfil.roles.includes('ROLE_CLIENTE')) {
        navigation.navigate('Cartelera');
      } else {
        await cerrarSesion();
        setError('La cuenta no tiene un rol autorizado para ingresar.');
      }
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.formulario}>
        <Text style={styles.titulo}>Iniciar sesión</Text>

        <Text style={styles.descripcion}>
          Ingresa con tu cuenta para comprar boletos.
        </Text>

        <View style={styles.campo}>
          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#7f8996"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.campoPassword}>
            <TextInput
              style={styles.inputPassword}
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor="#7f8996"
              secureTextEntry={!mostrarPassword}
            />

            <Pressable
              style={styles.alternarPassword}
              onPress={() => setMostrarPassword(actual => !actual)}
              hitSlop={8}
            >
              {mostrarPassword ? (
                <EyeOff size={19} color="#8f9aa8" />
              ) : (
                <Eye size={19} color="#8f9aa8" />
              )}
            </Pressable>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, procesando && styles.botonDeshabilitado]}
          onPress={entrar}
          disabled={procesando}
        >
          {procesando ? (
            <ActivityIndicator color="#101720" />
          ) : (
            <Text style={styles.textoBoton}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.accesoRegistro}>
          <Text style={styles.textoCuenta}>¿No tienes una cuenta?</Text>

          <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
            <Text style={styles.enlaceCuenta}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    justifyContent: 'center',
    padding: 25
  },
  formulario: {
    backgroundColor: '#111a24',
    borderWidth: 1,
    borderColor: '#2a3542',
    padding: 28,
    gap: 16
  },
  titulo: {
    color: '#f2c94c',
    fontSize: 26,
    fontWeight: '700'
  },
  descripcion: {
    color: '#b8bec6',
    fontSize: 15,
    marginBottom: 5
  },
  campo: {
    gap: 7
  },
  label: {
    color: '#ffffff',
    fontSize: 14
  },
  input: {
    backgroundColor: '#080d13',
    borderWidth: 1,
    borderColor: '#475363',
    color: '#ffffff',
    padding: 12,
    fontSize: 15
  },
  campoPassword: {
    position: 'relative',
    justifyContent: 'center'
  },
  inputPassword: {
    backgroundColor: '#080d13',
    borderWidth: 1,
    borderColor: '#475363',
    color: '#ffffff',
    padding: 12,
    paddingRight: 44,
    fontSize: 15
  },
  alternarPassword: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  error: {
    color: '#ff8585',
    fontSize: 14
  },
  boton: {
    backgroundColor: '#f2c94c',
    padding: 13,
    alignItems: 'center'
  },
  botonDeshabilitado: {
    opacity: 0.6
  },
  textoBoton: {
    color: '#101720',
    fontSize: 16,
    fontWeight: '700'
  },
  accesoRegistro: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5
  },
  textoCuenta: {
    color: '#f2c94c',
    fontSize: 14
  },
  enlaceCuenta: {
    color: '#f2c94c',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline'
  }
});
