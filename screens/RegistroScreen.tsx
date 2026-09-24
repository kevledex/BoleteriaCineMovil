import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { auth } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Registro'>;

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegistroScreen({ navigation }: Props) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const registrar = async () => {
    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim().toLowerCase();
    const telefonoLimpio = telefono.trim();

    setError('');

    if (nombreLimpio.length < 3 || nombreLimpio.length > 100) {
      setError('El nombre debe tener entre 3 y 100 caracteres.');
      return;
    }

    if (!EMAIL_VALIDO.test(emailLimpio)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    if (telefonoLimpio.length > 10) {
      setError('El teléfono no puede superar los 10 caracteres.');
      return;
    }

    if (!password) {
      setError('La contraseña es obligatoria.');
      return;
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setProcesando(true);

    try {
      await auth.registro({
        nombre: nombreLimpio,
        email: emailLimpio,
        password,
        telefono: telefonoLimpio || null
      });

      Alert.alert(
        'Cuenta creada',
        'Tu cuenta se registró correctamente. Ya puedes iniciar sesión.',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.replace('Login')
          }
        ],
        { cancelable: false }
      );
    } catch (errorRegistro) {
      const mensaje =
        errorRegistro instanceof Error
          ? errorRegistro.message
          : 'No se pudo completar el registro.';

      setError(mensaje);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formulario}>
          <Text style={styles.titulo}>Crear cuenta</Text>

          <Text style={styles.descripcion}>
            Regístrate como cliente para comprar tus entradas.
          </Text>

          <View style={styles.campo}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#7f8996"
              autoCapitalize="words"
              maxLength={100}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#7f8996"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Teléfono (opcional)</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              placeholder="0999999999"
              placeholderTextColor="#7f8996"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.campoPassword}>
              <TextInput
                style={styles.inputPassword}
                value={password}
                onChangeText={setPassword}
                placeholder="Crea una contraseña"
                placeholderTextColor="#7f8996"
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
              />

              <Pressable
                style={styles.alternarPassword}
                onPress={() => setMostrarPassword(actual => !actual)}
                accessibilityLabel={
                  mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
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

          <View style={styles.campo}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.campoPassword}>
              <TextInput
                style={styles.inputPassword}
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                placeholder="Repite la contraseña"
                placeholderTextColor="#7f8996"
                secureTextEntry={!mostrarConfirmacion}
                autoCapitalize="none"
              />

              <Pressable
                style={styles.alternarPassword}
                onPress={() => setMostrarConfirmacion(actual => !actual)}
                accessibilityLabel={
                  mostrarConfirmacion
                    ? 'Ocultar confirmación de contraseña'
                    : 'Mostrar confirmación de contraseña'
                }
                hitSlop={8}
              >
                {mostrarConfirmacion ? (
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
            onPress={registrar}
            disabled={procesando}
          >
            {procesando ? (
              <ActivityIndicator color="#101720" />
            ) : (
              <Text style={styles.textoBoton}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <View style={styles.accesoLogin}>
            <Text style={styles.textoCuenta}>¿Ya tienes una cuenta?</Text>

            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.enlaceCuenta}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo
  },
  contenido: {
    flexGrow: 1,
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
  accesoLogin: {
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
