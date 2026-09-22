import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colores } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;

type Sala = {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
  tipoSala: string;
};

type Funcion = {
  id: number;
  pelicula: string;
  sala: string;
  fecha: string;
  hora: string;
  formato: string;
  idioma: string;
  precioBase: number;
};

export default function AdminScreen({ navigation }: Props) {
  const [salas, setSalas] = useState<Sala[]>([
    {
      id: 1,
      nombre: 'Sala 1',
      filas: 8,
      columnas: 10,
      tipoSala: 'STANDARD'
    },
    {
      id: 2,
      nombre: 'Sala VIP',
      filas: 6,
      columnas: 8,
      tipoSala: 'VIP'
    }
  ]);

  const [funciones, setFunciones] = useState<Funcion[]>([
    {
      id: 1,
      pelicula: 'Película de ejemplo',
      sala: 'Sala 1',
      fecha: '2026-09-25',
      hora: '18:30',
      formato: '2D',
      idioma: 'DOBLADA',
      precioBase: 6.5
    }
  ]);

  const [nombreSala, setNombreSala] = useState('');
  const [filas, setFilas] = useState('');
  const [columnas, setColumnas] = useState('');
  const [tipoSala, setTipoSala] = useState('STANDARD');

  const [pelicula, setPelicula] = useState('');
  const [salaFuncion, setSalaFuncion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [formato, setFormato] = useState('2D');
  const [idioma, setIdioma] = useState('DOBLADA');
  const [precio, setPrecio] = useState('6.50');

  const guardarSala = () => {
    if (!nombreSala || !filas || !columnas) {
      Alert.alert('Datos incompletos', 'Completa todos los campos de la sala.');
      return;
    }

    const nuevaSala: Sala = {
      id: Date.now(),
      nombre: nombreSala,
      filas: Number(filas),
      columnas: Number(columnas),
      tipoSala
    };

    setSalas([...salas, nuevaSala]);
    setNombreSala('');
    setFilas('');
    setColumnas('');
    setTipoSala('STANDARD');

    Alert.alert('Listo', 'Sala creada correctamente.');
  };

  const eliminarSala = (id: number) => {
    Alert.alert(
      'Eliminar sala',
      '¿Seguro que deseas eliminar esta sala?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setSalas(salas.filter((sala) => sala.id !== id));
          }
        }
      ]
    );
  };

  const guardarFuncion = () => {
    if (!pelicula || !salaFuncion || !fecha || !hora) {
      Alert.alert(
        'Datos incompletos',
        'Completa todos los campos de la función.'
      );
      return;
    }

    const nuevaFuncion: Funcion = {
      id: Date.now(),
      pelicula,
      sala: salaFuncion,
      fecha,
      hora,
      formato,
      idioma,
      precioBase: Number(precio)
    };

    setFunciones([...funciones, nuevaFuncion]);

    setPelicula('');
    setSalaFuncion('');
    setFecha('');
    setHora('');
    setFormato('2D');
    setIdioma('DOBLADA');
    setPrecio('6.50');

    Alert.alert('Listo', 'Función creada correctamente.');
  };

  const eliminarFuncion = (id: number) => {
    Alert.alert(
      'Eliminar función',
      '¿Seguro que deseas eliminar esta función?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setFunciones(
              funciones.filter((funcion) => funcion.id !== id)
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.contenido}>
        <View style={styles.cabecera}>
          <View>
            <Text style={styles.titulo}>Administración</Text>
            <Text style={styles.subtitulo}>
              Salas y funciones de Metropoli Cine
            </Text>
          </View>

          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Text style={styles.textoBotonSecundario}>Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.tituloPanel}>Registrar sala</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombreSala}
            onChangeText={setNombreSala}
            placeholder="Ej. Sala 1"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Filas</Text>
          <TextInput
            style={styles.input}
            value={filas}
            onChangeText={setFilas}
            keyboardType="numeric"
            placeholder="5"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Asientos por fila</Text>
          <TextInput
            style={styles.input}
            value={columnas}
            onChangeText={setColumnas}
            keyboardType="numeric"
            placeholder="8"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Tipo de sala</Text>
          <TextInput
            style={styles.input}
            value={tipoSala}
            onChangeText={setTipoSala}
            placeholder="STANDARD"
            placeholderTextColor="#7f8996"
          />

          <TouchableOpacity style={styles.boton} onPress={guardarSala}>
            <Text style={styles.textoBoton}>Guardar sala</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.tituloPanel}>Salas registradas</Text>

          {salas.length === 0 ? (
            <Text style={styles.vacio}>No existen salas registradas.</Text>
          ) : (
            salas.map((sala) => (
              <View style={styles.registro} key={sala.id}>
                <View style={styles.registroInfo}>
                  <Text style={styles.registroTitulo}>{sala.nombre}</Text>
                  <Text style={styles.registroTexto}>
                    {sala.filas} filas · {sala.columnas} asientos · {sala.tipoSala}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botonEliminar}
                  onPress={() => eliminarSala(sala.id)}
                >
                  <Text style={styles.textoEliminar}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.tituloPanel}>Programar función</Text>

          <Text style={styles.label}>Película</Text>
          <TextInput
            style={styles.input}
            value={pelicula}
            onChangeText={setPelicula}
            placeholder="Nombre de la película"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Sala</Text>
          <TextInput
            style={styles.input}
            value={salaFuncion}
            onChangeText={setSalaFuncion}
            placeholder="Sala 1"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.input}
            value={fecha}
            onChangeText={setFecha}
            placeholder="2026-09-25"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Hora</Text>
          <TextInput
            style={styles.input}
            value={hora}
            onChangeText={setHora}
            placeholder="18:30"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Formato</Text>
          <TextInput
            style={styles.input}
            value={formato}
            onChangeText={setFormato}
            placeholder="2D"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Idioma</Text>
          <TextInput
            style={styles.input}
            value={idioma}
            onChangeText={setIdioma}
            placeholder="DOBLADA"
            placeholderTextColor="#7f8996"
          />

          <Text style={styles.label}>Precio base</Text>
          <TextInput
            style={styles.input}
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
            placeholder="6.50"
            placeholderTextColor="#7f8996"
          />

          <TouchableOpacity style={styles.boton} onPress={guardarFuncion}>
            <Text style={styles.textoBoton}>Guardar función</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.tituloPanel}>Funciones programadas</Text>

          {funciones.length === 0 ? (
            <Text style={styles.vacio}>
              No existen funciones programadas.
            </Text>
          ) : (
            funciones.map((funcion) => (
              <View style={styles.registro} key={funcion.id}>
                <View style={styles.registroInfo}>
                  <Text style={styles.registroTitulo}>
                    {funcion.pelicula}
                  </Text>

                  <Text style={styles.registroTexto}>
                    {funcion.fecha} · {funcion.hora}
                  </Text>

                  <Text style={styles.registroTexto}>
                    {funcion.sala} · {funcion.formato} · {funcion.idioma}
                  </Text>

                  <Text style={styles.precio}>
                    ${funcion.precioBase.toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botonEliminar}
                  onPress={() => eliminarFuncion(funcion.id)}
                >
                  <Text style={styles.textoEliminar}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.botonSalir}
          onPress={() => navigation.navigate('Cartelera')}
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
    padding: 20,
    paddingBottom: 50
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25
  },
  titulo: {
    color: '#f2c94c',
    fontSize: 28,
    fontWeight: '700'
  },
  subtitulo: {
    color: '#aab3c0',
    fontSize: 14,
    marginTop: 5
  },
  panel: {
    backgroundColor: '#111a24',
    borderWidth: 1,
    borderColor: '#2b3542',
    padding: 20,
    marginBottom: 20
  },
  tituloPanel: {
    color: '#f2c94c',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 20
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 7,
    marginTop: 10
  },
  input: {
    backgroundColor: '#080d13',
    borderWidth: 1,
    borderColor: '#475363',
    color: '#ffffff',
    padding: 11,
    fontSize: 15
  },
  boton: {
    backgroundColor: '#f2c94c',
    padding: 12,
    alignItems: 'center',
    marginTop: 18
  },
  textoBoton: {
    color: '#101720',
    fontWeight: '700',
    fontSize: 15
  },
  botonSecundario: {
    borderWidth: 1,
    borderColor: '#647084',
    paddingVertical: 9,
    paddingHorizontal: 13
  },
  textoBotonSecundario: {
    color: '#ffffff',
    fontSize: 14
  },
  registro: {
    borderTopWidth: 1,
    borderTopColor: '#303b49',
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  registroInfo: {
    flex: 1
  },
  registroTitulo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  registroTexto: {
    color: '#aab3c0',
    fontSize: 13,
    marginTop: 5
  },
  precio: {
    color: '#f2c94c',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6
  },
  botonEliminar: {
    borderWidth: 1,
    borderColor: '#647084',
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  textoEliminar: {
    color: '#ffffff',
    fontSize: 13
  },
  vacio: {
    color: '#aab3c0',
    fontSize: 14
  },
  botonSalir: {
    borderWidth: 1,
    borderColor: '#647084',
    padding: 13,
    alignItems: 'center',
    marginTop: 5
  },
  textoSalir: {
    color: '#ffffff',
    fontWeight: '600'
  }
});