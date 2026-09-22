import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Search, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Pelicula } from '../types/cine';
import { peliculaService } from '../services/PeliculaService';
import { salas as salasApi, funciones as funcionesApi, SalaApi, FuncionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colores } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;

const TIPOS_SALA = ['STANDARD', '3D', '4D', 'VIP', 'IMAX'];
const FORMATOS = ['2D', '3D', '4D'];
const IDIOMAS: { valor: string; etiqueta: string }[] = [
  { valor: 'DOBLADA', etiqueta: 'Doblada' },
  { valor: 'SUBTITULADA', etiqueta: 'Subtitulada' }
];

function formatearFecha(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function formatearHora(fecha: Date): string {
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

function peliculaPermiteFunciones(pelicula: Pelicula): boolean {
  return pelicula.estado === 'cartelera' || pelicula.estado === 'estreno';
}

export default function AdminScreen({ navigation }: Props) {
  const { cerrarSesion } = useAuth();

  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [salas, setSalas] = useState<SalaApi[]>([]);
  const [funciones, setFunciones] = useState<FuncionApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombreSala, setNombreSala] = useState('');
  const [filas, setFilas] = useState('5');
  const [columnas, setColumnas] = useState('8');
  const [tipoSala, setTipoSala] = useState('STANDARD');

  const [buscarPelicula, setBuscarPelicula] = useState('');
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<Pelicula | null>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [salaSeleccionada, setSalaSeleccionada] = useState<SalaApi | null>(null);
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [mostrarFechaPicker, setMostrarFechaPicker] = useState(false);
  const [mostrarHoraPicker, setMostrarHoraPicker] = useState(false);
  const [formato, setFormato] = useState('2D');
  const [idioma, setIdioma] = useState('DOBLADA');
  const [precio, setPrecio] = useState('6.50');

  const cargarDatos = useCallback(async () => {
    setCargando(true);

    try {
      const [peliculasRes, salasRes, funcionesRes] = await Promise.all([
        peliculaService.obtenerPeliculas(),
        salasApi.obtenerTodo(),
        funcionesApi.obtenerTodo()
      ]);

      setPeliculas(peliculasRes);
      setSalas(salasRes);
      setFunciones(funcionesRes);
    } catch {
      Alert.alert('Error', 'No se pudo cargar la administración. Revisa la conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const peliculasDisponibles = peliculas.filter(peliculaPermiteFunciones);

  const peliculasFiltradas = peliculasDisponibles.filter(pelicula =>
    pelicula.titulo.toLowerCase().includes(buscarPelicula.trim().toLowerCase())
  );

  const limpiarSeleccionPelicula = () => {
    setPeliculaSeleccionada(null);
    setBuscarPelicula('');
  };

  const guardarSala = async () => {
    if (!nombreSala || !filas || !columnas) {
      Alert.alert('Datos incompletos', 'Completa todos los campos de la sala.');
      return;
    }

    setGuardando(true);

    try {
      await salasApi.crear({
        nombre: nombreSala,
        filas: Number(filas),
        columnas: Number(columnas),
        tipoSala
      });

      setSalas(await salasApi.obtenerTodo());
      setNombreSala('');
      setFilas('5');
      setColumnas('8');
      setTipoSala('STANDARD');
      Alert.alert('Listo', 'Sala creada correctamente.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar la sala.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarSala = (sala: SalaApi) => {
    Alert.alert('Eliminar sala', `¿Seguro que deseas eliminar ${sala.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await salasApi.eliminar(sala.id);
            setSalas(await salasApi.obtenerTodo());
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar la sala.');
          }
        }
      }
    ]);
  };

  const guardarFuncion = async () => {
    if (!peliculaSeleccionada || !salaSeleccionada) {
      Alert.alert('Datos incompletos', 'Selecciona una película y una sala.');
      return;
    }

    if (formatearFecha(fecha) < formatearFecha(new Date())) {
      Alert.alert('Fecha inválida', 'Selecciona una fecha actual o futura.');
      return;
    }

    setGuardando(true);

    try {
      await funcionesApi.crear({
        peliculaId: peliculaSeleccionada.id,
        tituloPelicula: peliculaSeleccionada.titulo,
        duracionMinutos: peliculaSeleccionada.duracion,
        sala: { id: salaSeleccionada.id },
        fecha: formatearFecha(fecha),
        hora: formatearHora(hora),
        formato,
        idioma,
        precioBase: Number(precio)
      });

      setFunciones(await funcionesApi.obtenerTodo());
      limpiarSeleccionPelicula();
      setSalaSeleccionada(null);
      setFecha(new Date());
      setHora(new Date());
      setFormato('2D');
      setIdioma('DOBLADA');
      setPrecio('6.50');
      Alert.alert('Listo', 'Función guardada y disponible en boletería.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar la función.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarFuncion = (funcion: FuncionApi) => {
    Alert.alert(
      'Eliminar función',
      `¿Eliminar la función de ${funcion.tituloPelicula} del ${funcion.fecha}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await funcionesApi.eliminar(funcion.id);
              setFunciones(await funcionesApi.obtenerTodo());
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar la función.');
            }
          }
        }
      ]
    );
  };

  const alCambiarFecha = (evento: DateTimePickerEvent, seleccionada?: Date) => {
    setMostrarFechaPicker(false);
    if (evento.type === 'set' && seleccionada) setFecha(seleccionada);
  };

  const alCambiarHora = (evento: DateTimePickerEvent, seleccionada?: Date) => {
    setMostrarHoraPicker(false);
    if (evento.type === 'set' && seleccionada) setHora(seleccionada);
  };

  const salir = async () => {
    await cerrarSesion();
    navigation.navigate('Cartelera');
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.contenido}>
        <View style={styles.cabecera}>
          <View>
            <Text style={styles.titulo}>Administración</Text>
            <Text style={styles.subtitulo}>Salas y funciones de Metropoli Cine</Text>
          </View>

          <TouchableOpacity style={styles.botonSecundario} onPress={() => navigation.navigate('Perfil')}>
            <Text style={styles.textoBotonSecundario}>Perfil</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <Text style={styles.vacio}>Cargando administración...</Text>
        ) : (
          <>
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
                placeholderTextColor="#7f8996"
              />

              <Text style={styles.label}>Asientos por fila</Text>
              <TextInput
                style={styles.input}
                value={columnas}
                onChangeText={setColumnas}
                keyboardType="numeric"
                placeholderTextColor="#7f8996"
              />

              <Text style={styles.label}>Tipo de sala</Text>
              <View style={styles.chips}>
                {TIPOS_SALA.map(tipo => (
                  <Pressable
                    key={tipo}
                    style={[styles.chip, tipoSala === tipo && styles.chipActivo]}
                    onPress={() => setTipoSala(tipo)}
                  >
                    <Text style={[styles.chipTexto, tipoSala === tipo && styles.chipTextoActivo]}>{tipo}</Text>
                  </Pressable>
                ))}
              </View>

              <TouchableOpacity style={styles.boton} onPress={guardarSala} disabled={guardando}>
                <Text style={styles.textoBoton}>Guardar sala</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.panel}>
              <Text style={styles.tituloPanel}>Salas registradas</Text>

              {salas.length === 0 ? (
                <Text style={styles.vacio}>No existen salas registradas.</Text>
              ) : (
                salas.map(sala => (
                  <View style={styles.registro} key={sala.id}>
                    <View style={styles.registroInfo}>
                      <Text style={styles.registroTitulo}>{sala.nombre}</Text>
                      <Text style={styles.registroTexto}>
                        {sala.filas} filas · {sala.columnas} asientos · {sala.tipoSala}
                      </Text>
                    </View>

                    <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarSala(sala)}>
                      <Text style={styles.textoEliminar}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <View style={styles.panel}>
              <Text style={styles.tituloPanel}>Programar función</Text>

              <Text style={styles.label}>Película</Text>

              {peliculaSeleccionada ? (
                <View style={styles.peliculaElegida}>
                  <Text style={styles.peliculaElegidaTexto} numberOfLines={1}>
                    {peliculaSeleccionada.titulo} · {peliculaSeleccionada.duracion} min
                  </Text>
                  <Pressable onPress={limpiarSeleccionPelicula} hitSlop={8}>
                    <X size={17} color="#8f9aa8" />
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.inputConIcono}>
                    <Search size={16} color="#7f8996" />
                    <TextInput
                      style={styles.inputBuscador}
                      value={buscarPelicula}
                      onChangeText={texto => {
                        setBuscarPelicula(texto);
                        setMostrarResultados(true);
                      }}
                      onFocus={() => setMostrarResultados(true)}
                      placeholder="Buscar película por título..."
                      placeholderTextColor="#7f8996"
                    />
                  </View>

                  {mostrarResultados && buscarPelicula.length > 0 && (
                    <View style={styles.resultados}>
                      {peliculasFiltradas.length === 0 ? (
                        <Text style={styles.sinResultados}>Sin resultados en cartelera o estreno.</Text>
                      ) : (
                        peliculasFiltradas.slice(0, 6).map(pelicula => (
                          <Pressable
                            key={pelicula.id}
                            style={styles.resultadoItem}
                            onPress={() => {
                              setPeliculaSeleccionada(pelicula);
                              setMostrarResultados(false);
                            }}
                          >
                            <Text style={styles.resultadoTexto} numberOfLines={1}>
                              {pelicula.titulo}
                            </Text>
                            <Text style={styles.resultadoSub}>{pelicula.duracion} min</Text>
                          </Pressable>
                        ))
                      )}
                    </View>
                  )}
                </>
              )}

              <Text style={styles.label}>Sala</Text>
              {salas.length === 0 ? (
                <Text style={styles.sinResultados}>Registra una sala primero.</Text>
              ) : (
                <View style={styles.chips}>
                  {salas.map(sala => (
                    <Pressable
                      key={sala.id}
                      style={[styles.chip, salaSeleccionada?.id === sala.id && styles.chipActivo]}
                      onPress={() => setSalaSeleccionada(sala)}
                    >
                      <Text
                        style={[styles.chipTexto, salaSeleccionada?.id === sala.id && styles.chipTextoActivo]}
                      >
                        {sala.nombre}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.camposDobles}>
                <View style={styles.campoMitad}>
                  <Text style={styles.label}>Fecha</Text>
                  <Pressable style={styles.input} onPress={() => setMostrarFechaPicker(true)}>
                    <Text style={styles.inputTexto}>{formatearFecha(fecha)}</Text>
                  </Pressable>
                </View>

                <View style={styles.campoMitad}>
                  <Text style={styles.label}>Hora</Text>
                  <Pressable style={styles.input} onPress={() => setMostrarHoraPicker(true)}>
                    <Text style={styles.inputTexto}>{formatearHora(hora)}</Text>
                  </Pressable>
                </View>
              </View>

              {mostrarFechaPicker && (
                <DateTimePicker
                  value={fecha}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  onChange={alCambiarFecha}
                />
              )}

              {mostrarHoraPicker && (
                <DateTimePicker
                  value={hora}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={alCambiarHora}
                />
              )}

              <Text style={styles.label}>Formato</Text>
              <View style={styles.chips}>
                {FORMATOS.map(f => (
                  <Pressable
                    key={f}
                    style={[styles.chip, formato === f && styles.chipActivo]}
                    onPress={() => setFormato(f)}
                  >
                    <Text style={[styles.chipTexto, formato === f && styles.chipTextoActivo]}>{f}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Idioma</Text>
              <View style={styles.chips}>
                {IDIOMAS.map(({ valor, etiqueta }) => (
                  <Pressable
                    key={valor}
                    style={[styles.chip, idioma === valor && styles.chipActivo]}
                    onPress={() => setIdioma(valor)}
                  >
                    <Text style={[styles.chipTexto, idioma === valor && styles.chipTextoActivo]}>{etiqueta}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Precio de entrada</Text>
              <TextInput
                style={styles.input}
                value={precio}
                onChangeText={setPrecio}
                keyboardType="decimal-pad"
                placeholderTextColor="#7f8996"
              />

              <Text style={styles.ayuda}>
                El horario reserva la duración de la película y 15 minutos adicionales para la limpieza de la sala.
              </Text>

              <TouchableOpacity style={styles.boton} onPress={guardarFuncion} disabled={guardando}>
                <Text style={styles.textoBoton}>Guardar función</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.panel}>
              <Text style={styles.tituloPanel}>Funciones programadas</Text>

              {funciones.length === 0 ? (
                <Text style={styles.vacio}>No existen funciones programadas.</Text>
              ) : (
                funciones.map(funcion => (
                  <View style={styles.registro} key={funcion.id}>
                    <View style={styles.registroInfo}>
                      <Text style={styles.registroTitulo}>{funcion.tituloPelicula}</Text>
                      <Text style={styles.registroTexto}>
                        {funcion.fecha} · {funcion.hora.slice(0, 5)}
                      </Text>
                      <Text style={styles.registroTexto}>
                        {funcion.sala.nombre} · {funcion.formato} · {funcion.idioma}
                      </Text>
                      <Text style={styles.precio}>${funcion.precioBase.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarFuncion(funcion)}>
                      <Text style={styles.textoEliminar}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.botonSalir} onPress={salir}>
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
    fontSize: 15,
    justifyContent: 'center'
  },
  inputTexto: {
    color: '#ffffff',
    fontSize: 15
  },
  inputConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#080d13',
    borderWidth: 1,
    borderColor: '#475363',
    paddingHorizontal: 11
  },
  inputBuscador: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 11,
    fontSize: 15
  },
  resultados: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#2b3542',
    backgroundColor: '#0d1520'
  },
  resultadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2733'
  },
  resultadoTexto: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14
  },
  resultadoSub: {
    color: '#8f9aa8',
    fontSize: 12
  },
  sinResultados: {
    padding: 12,
    color: '#8f9aa8',
    fontSize: 13
  },
  peliculaElegida: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0d1520',
    borderWidth: 1,
    borderColor: colores.dorado,
    padding: 11
  },
  peliculaElegidaTexto: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderWidth: 1,
    borderColor: '#475363',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 20
  },
  chipActivo: {
    backgroundColor: colores.dorado,
    borderColor: colores.dorado
  },
  chipTexto: {
    color: '#e4e9ef',
    fontSize: 13,
    fontWeight: '600'
  },
  chipTextoActivo: {
    color: '#171100'
  },
  camposDobles: {
    flexDirection: 'row',
    gap: 12
  },
  campoMitad: {
    flex: 1
  },
  ayuda: {
    marginTop: 14,
    color: '#8f9aa8',
    fontSize: 12,
    lineHeight: 17
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
