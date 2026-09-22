import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { colores } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'Perfil'>;

export default function PerfilScreen({ navigation }: Props) {
  const { perfil, cargando, cerrarSesion } = useAuth();

  useEffect(() => {
    if (!cargando && !perfil) {
      navigation.replace('Login');
    }
  }, [cargando, perfil, navigation]);

  if (!perfil) return null;

  const salir = async () => {
    await cerrarSesion();
    navigation.replace('Cartelera');
  };

  const iniciales = perfil.nombre
    .split(' ')
    .map(palabra => palabra.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>Mi perfil</Text>

        <Text style={styles.descripcion}>
          Información de tu cuenta en Metropoli Cine.
        </Text>

        <View style={styles.tarjeta}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciales}</Text>
          </View>

          <Text style={styles.nombre}>{perfil.nombre}</Text>

          <Text style={styles.correo}>
            {perfil.email}
          </Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>Información de la cuenta</Text>

          <View style={styles.dato}>
            <Text style={styles.etiqueta}>Nombre</Text>
            <Text style={styles.valor}>{perfil.nombre}</Text>
          </View>

          <View style={styles.dato}>
            <Text style={styles.etiqueta}>Correo</Text>
            <Text style={styles.valor}>
              {perfil.email}
            </Text>
          </View>

          <View style={styles.dato}>
            <Text style={styles.etiqueta}>Rol</Text>
            <Text style={styles.valor}>
              {perfil.rol === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.navigate('MisEntradas')}
        >
          <Text style={styles.textoBoton}>Mis entradas</Text>
        </TouchableOpacity>

        {perfil.rol === 'ADMIN' && (
          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => navigation.navigate('Admin')}
          >
            <Text style={styles.textoSecundario}>Panel de administración</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.botonSalir}
          onPress={salir}
        >
          <Text style={styles.textoSalir}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo
  },
  contenido: {
    padding: 25,
    paddingBottom: 50
  },
  titulo: {
    color: '#f2c94c',
    fontSize: 29,
    fontWeight: '700'
  },
  descripcion: {
    color: '#aab3c0',
    fontSize: 15,
    marginTop: 7,
    marginBottom: 25
  },
  tarjeta: {
    backgroundColor: '#111a24',
    borderWidth: 1,
    borderColor: '#2b3542',
    padding: 22,
    marginBottom: 20
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f2c94c',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15
  },
  avatarTexto: {
    color: '#101720',
    fontSize: 25,
    fontWeight: '800'
  },
  nombre: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center'
  },
  correo: {
    color: '#aab3c0',
    textAlign: 'center',
    marginTop: 6
  },
  tituloSeccion: {
    color: '#f2c94c',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 18
  },
  dato: {
    borderTopWidth: 1,
    borderTopColor: '#303b49',
    paddingVertical: 13
  },
  etiqueta: {
    color: '#aab3c0',
    fontSize: 13
  },
  valor: {
    color: '#ffffff',
    fontSize: 15,
    marginTop: 5
  },
  boton: {
    backgroundColor: '#f2c94c',
    padding: 14,
    alignItems: 'center',
    marginBottom: 12
  },
  textoBoton: {
    color: '#101720',
    fontWeight: '700',
    fontSize: 15
  },
  botonSecundario: {
    borderWidth: 1,
    borderColor: '#647084',
    padding: 13,
    alignItems: 'center',
    marginBottom: 12
  },
  textoSecundario: {
    color: '#ffffff',
    fontSize: 15
  },
  botonSalir: {
    borderWidth: 1,
    borderColor: 'rgba(239,107,114,0.4)',
    padding: 13,
    alignItems: 'center'
  },
  textoSalir: {
    color: '#ef6b72',
    fontSize: 15,
    fontWeight: '600'
  }
});
