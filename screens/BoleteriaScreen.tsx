import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, Play, Star, Ticket } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { Pelicula } from '../types/cine';
import { peliculaService } from '../services/PeliculaService';
import { funciones as funcionesApi, FuncionApi } from '../services/api';
import { colores } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'Boleteria'>;

interface FechaBoleteria {
  valor: string;
  dia: string;
  numero: string;
}

function crearFechasDisponibles(): FechaBoleteria[] {
  return Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date();
    fecha.setHours(12, 0, 0, 0);
    fecha.setDate(fecha.getDate() + indice);

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return {
      valor: `${anio}-${mes}-${dia}`,
      dia: new Intl.DateTimeFormat('es-EC', { weekday: 'short' }).format(fecha),
      numero: String(fecha.getDate())
    };
  });
}

export default function BoleteriaScreen({ route, navigation }: Props) {
  const [pelicula, setPelicula] = useState<Pelicula | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [fechas] = useState<FechaBoleteria[]>(crearFechasDisponibles);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechas[0].valor);
  const [funciones, setFunciones] = useState<FuncionApi[]>([]);
  const [errorFunciones, setErrorFunciones] = useState(false);

  useEffect(() => {
    (async () => {
      setCargando(true);
      setError(false);

      try {
        const data = await peliculaService.obtenerPeliculaPorSlug(
          route.params.slug
        );

        if (!data) throw new Error('Película no encontrada');

        setPelicula(data);
      } catch {
        setError(true);
      } finally {
        setCargando(false);
      }
    })();
  }, [route.params.slug]);

  const cargarFunciones = useCallback(async () => {
    if (!pelicula) return;

    setErrorFunciones(false);

    try {
      const todas = await funcionesApi.obtenerPorPelicula(pelicula.id);
      setFunciones(
        todas
          .filter(funcion => funcion.fecha === fechaSeleccionada)
          .sort((a, b) => a.hora.localeCompare(b.hora))
      );
    } catch {
      setErrorFunciones(true);
      setFunciones([]);
    }
  }, [pelicula, fechaSeleccionada]);

  useEffect(() => {
    cargarFunciones();
  }, [cargarFunciones]);

  const seleccionarFuncion = (funcion: FuncionApi) => {
    if (!pelicula) return;

    navigation.navigate('Asientos', {
      funcionId: String(funcion.id),
      slug: pelicula.slug,
      pelicula: pelicula.titulo,
      fecha: funcion.fecha,
      formato: `${funcion.formato} · ${funcion.idioma}`,
      sala: funcion.sala.nombre,
      hora: funcion.hora.slice(0, 5)
    });
  };

  if (cargando) {
    return (
      <View style={styles.estado}>
        <ActivityIndicator size="large" color={colores.dorado} />
        <Text style={styles.estadoText}>
          Cargando película...
        </Text>
      </View>
    );
  }

  if (error || !pelicula) {
    return (
      <View style={styles.estado}>
        <Text style={styles.estadoText}>
          No se pudo cargar la película.
        </Text>
        <Pressable
          style={styles.volverButton}
          onPress={() => navigation.replace('Cartelera')}
        >
          <Text style={styles.volverText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.fondo}>
        <Image
          source={{ uri: pelicula.imagen }}
          style={styles.fondoImage}
          blurRadius={18}
        />
        <View style={styles.fondoOverlay} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.regresarRow} onPress={() => navigation.goBack()}>
          <ArrowLeft size={15} color="#b8bec6" />
          <Text style={styles.regresar}>Regresar</Text>
        </Pressable>

        <View style={styles.info}>
          <Image
            source={{ uri: pelicula.imagen }}
            style={styles.poster}
            resizeMode="cover"
          />

          <View style={styles.badgeSpace}>
            {pelicula.estado === 'cartelera' && (
              <View style={[styles.badgeChip, styles.preventa]}>
                <Ticket size={12} color="#111" />
                <Text style={styles.badgeTexto}>Pre-venta</Text>
              </View>
            )}

            {pelicula.estado === 'estreno' && (
              <View style={[styles.badgeChip, styles.estreno]}>
                <Star size={12} color="#111" />
                <Text style={styles.badgeTexto}>Estreno</Text>
              </View>
            )}

            {pelicula.estado === 'proximamente' && (
              <Text style={[styles.badge, styles.proximo]}>
                Próximamente
              </Text>
            )}
          </View>

          <Text style={styles.clasificacion}>
            {pelicula.clasificacion}
          </Text>

          <Text style={styles.titulo}>
            {pelicula.titulo}
          </Text>

          <View style={styles.duracionRow}>
            <Clock size={15} color="#b8bec6" />
            <Text style={styles.duracion}>
              {pelicula.duracion} min
            </Text>
          </View>

          {!!pelicula.trailerUrl && (
            <Pressable
              style={styles.trailer}
              onPress={() =>
                Linking.openURL(pelicula.trailerUrl)
              }
            >
              <Play size={15} color={colores.dorado} />
              <Text style={styles.trailerText}>
                Ver trailer
              </Text>
            </Pressable>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Sinopsis
            </Text>

            <Text style={styles.body}>
              {pelicula.sinopsis}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Información
            </Text>

            <View style={styles.generos}>
              {pelicula.generos.map(genero => (
                <Text key={genero} style={styles.genero}>
                  {genero}
                </Text>
              ))}
            </View>

            <Text style={styles.meta}>
              Estreno: {pelicula.fechaEstreno}
            </Text>
          </View>
        </View>

        {pelicula.estado === 'proximamente' ? (
          <View style={styles.proximoBox}>
            <Text style={styles.proximoEyebrow}>
              PRÓXIMO ESTRENO
            </Text>

            <Text style={styles.proximoTitle}>
              ¡Próximamente!
            </Text>

            <Text style={styles.proximoText}>
              Esta película todavía no tiene funciones disponibles.
            </Text>
          </View>
        ) : (
          <View style={styles.funcionesBox}>
            <Text style={styles.funcionesTitle}>
              Funciones
            </Text>

            <Text style={styles.funcionesSub}>
              Selecciona un día y un horario
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.fechas}
            >
              {fechas.map(fecha => (
                <Pressable
                  key={fecha.valor}
                  style={[
                    styles.dia,
                    fechaSeleccionada === fecha.valor &&
                      styles.diaActivo
                  ]}
                  onPress={() =>
                    setFechaSeleccionada(fecha.valor)
                  }
                >
                  <Text
                    style={[
                      styles.diaText,
                      fechaSeleccionada === fecha.valor &&
                        styles.activoText
                    ]}
                  >
                    {fecha.dia}
                  </Text>

                  <Text
                    style={[
                      styles.diaNumero,
                      fechaSeleccionada === fecha.valor &&
                        styles.activoText
                    ]}
                  >
                    {fecha.numero}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {funciones.map(funcion => (
              <View
                key={funcion.id}
                style={styles.funcion}
              >
                <Text style={styles.formato}>
                  {funcion.formato} · {funcion.idioma}
                </Text>

                <Text style={styles.sala}>
                  {funcion.sala.nombre} · ${funcion.precioBase}
                </Text>

                <View style={styles.horarios}>
                  <Pressable
                    style={styles.hora}
                    onPress={() =>
                      seleccionarFuncion(funcion)
                    }
                  >
                    <Text style={styles.horaText}>
                      {funcion.hora.slice(0, 5)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {errorFunciones && (
              <View style={styles.sinFunciones}>
                <Text style={styles.estadoText}>
                  No se pudieron cargar las funciones. Revisa la conexión con el servidor.
                </Text>
              </View>
            )}

            {!errorFunciones && funciones.length === 0 && (
              <View style={styles.sinFunciones}>
                <Text style={styles.estadoText}>
                  No hay funciones disponibles para este día.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colores.fondo },
  fondo: { position: 'absolute', top: 0, left: 0, right: 0, height: 330 },
  fondoImage: { width: '100%', height: '100%', opacity: 0.22 },
  fondoOverlay: { ...StyleSheet.absoluteFill, backgroundColor: colores.fondo, opacity: 0.68 },
  content: { padding: 17, paddingBottom: 35 },
  regresarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  regresar: { color: '#b8bec6', fontSize: 14 },
  info: { alignItems: 'flex-start' },
  poster: { width: 190, height: 275, borderWidth: 1, borderColor: colores.borde, borderRadius: 10, backgroundColor: colores.panel },
  badgeSpace: { minHeight: 36, marginTop: 10 },
  badge: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, fontSize: 13, fontWeight: '700' },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8 },
  badgeTexto: { color: '#111', fontSize: 13, fontWeight: '700' },
  preventa: { backgroundColor: '#ff7373' },
  estreno: { backgroundColor: colores.dorado },
  proximo: { backgroundColor: '#4b5563', color: '#fff' },
  clasificacion: { color: colores.textoGris, fontSize: 13 },
  titulo: { marginTop: 6, color: '#fff', fontSize: 27, fontWeight: '700', lineHeight: 33 },
  duracionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  duracion: { color: '#b8bec6', fontSize: 15 },
  trailer: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 17, paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: '#3a424d', borderRadius: 7, backgroundColor: '#111821' },
  trailerText: { color: colores.dorado, fontWeight: '700' },
  section: { marginTop: 27 },
  sectionTitle: { marginBottom: 10, color: colores.dorado, fontSize: 17, fontWeight: '700' },
  body: { color: '#b8bec6', fontSize: 14, lineHeight: 22 },
  generos: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  genero: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colores.borde, borderRadius: 20, backgroundColor: colores.panel, color: '#b8bec6', fontSize: 12 },
  meta: { marginTop: 12, color: colores.textoGris, fontSize: 13 },
  funcionesBox: { marginTop: 30 },
  funcionesTitle: { color: colores.dorado, fontSize: 28, fontWeight: '700' },
  funcionesSub: { marginTop: 6, color: colores.textoGris, fontSize: 14 },
  fechas: { gap: 10, paddingVertical: 9 },
  dia: { minWidth: 68, height: 72, borderWidth: 1, borderColor: colores.borde, borderRadius: 9, backgroundColor: colores.panel, justifyContent: 'center', alignItems: 'center' },
  diaActivo: { borderColor: colores.dorado, backgroundColor: colores.dorado },
  diaText: { color: '#b8bec6', fontSize: 12 },
  diaNumero: { marginTop: 3, color: '#fff', fontSize: 24, fontWeight: '600' },
  activoText: { color: '#111' },
  funcion: { marginTop: 14, padding: 18, borderWidth: 1, borderColor: '#29323d', borderLeftWidth: 4, borderLeftColor: colores.dorado, borderRadius: 10, backgroundColor: colores.panel },
  formato: { color: '#fff', fontSize: 21, fontWeight: '600' },
  sala: { marginTop: 3, marginBottom: 15, color: colores.textoGris, fontSize: 12, letterSpacing: 0.5 },
  horarios: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  hora: { minWidth: 78, paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1, borderColor: '#3c4652', borderRadius: 6, backgroundColor: '#0c1219', alignItems: 'center' },
  horaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  proximoBox: { minHeight: 300, marginTop: 30, padding: 28, borderWidth: 1, borderColor: '#29323d', borderRadius: 12, backgroundColor: colores.panel, alignItems: 'center', justifyContent: 'center' },
  proximoEyebrow: { color: colores.textoGris, fontSize: 12, fontWeight: '700', letterSpacing: 3 },
  proximoTitle: { marginTop: 16, color: colores.dorado, fontSize: 33, fontWeight: '700', textAlign: 'center' },
  proximoText: { marginTop: 10, color: '#b8bec6', fontSize: 15, textAlign: 'center' },
  sinFunciones: { minHeight: 150, marginTop: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: colores.borde, borderRadius: 10, backgroundColor: colores.panel, justifyContent: 'center', alignItems: 'center' },
  estado: { flex: 1, backgroundColor: colores.fondo, alignItems: 'center', justifyContent: 'center', gap: 12 },
  estadoText: { color: colores.textoGris, fontSize: 16, textAlign: 'center' },
  volverButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 7, backgroundColor: colores.dorado },
  volverText: { color: '#111', fontWeight: '700' }
});