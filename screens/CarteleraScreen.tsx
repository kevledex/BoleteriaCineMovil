import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Star, Ticket } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { Pelicula } from '../types/cine';
import { peliculaService } from '../services/PeliculaService';
import { colores } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'Cartelera'>;

const categorias = [
  { key: 'cartelera', label: 'Cartelera' },
  { key: 'estreno', label: 'Ahora' },
  { key: 'proximamente', label: 'Próximamente' }
];

export default function CarteleraScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [categoria, setCategoria] = useState('cartelera');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const anchoTarjeta = (width - 44) / 2;

  const cargarPeliculas = useCallback(async () => {
    setCargando(true);
    setError(false);

    try {
      setPeliculas(await peliculaService.obtenerPeliculas());
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPeliculas();
  }, [cargarPeliculas]);

  const filtradas = peliculas.filter(
    pelicula => pelicula.estado === categoria
  );

  const renderPelicula = ({ item }: { item: Pelicula }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: anchoTarjeta },
        pressed && styles.presionado
      ]}
      onPress={() =>
        navigation.navigate('Boleteria', { slug: item.slug })
      }
    >
      <View style={[styles.poster, { height: anchoTarjeta / 0.69 }]}>
        <Image
          source={{ uri: item.imagen }}
          style={styles.posterImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.etiquetaSpace}>
        {item.estado === 'cartelera' && (
          <View style={[styles.etiquetaChip, styles.preventa]}>
            <Ticket size={12} color="#111" />
            <Text style={styles.etiquetaTexto}>Pre-venta</Text>
          </View>
        )}

        {item.estado === 'estreno' && (
          <View style={[styles.etiquetaChip, styles.estreno]}>
            <Star size={12} color="#111" />
            <Text style={styles.etiquetaTexto}>Estreno</Text>
          </View>
        )}

        {item.estado === 'proximamente' && (
          <Text style={[styles.etiqueta, styles.proximo]}>
            Próximamente
          </Text>
        )}
      </View>

      <Text style={styles.clasificacion}>
        {item.clasificacion}
      </Text>

      <Text style={styles.titulo} numberOfLines={2}>
        {item.titulo}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.page}>
      <FlatList
        data={filtradas}
        renderItem={renderPelicula}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.presentacion}>
              <Text style={styles.saludo}>Hola,</Text>
              <Text style={styles.hero}>
                disfruta lo mejor del cine
              </Text>

              <Text style={styles.subtitulo}>
                GRANDES  HISTORIAS{`\n`}
                SIEMPRE  EN  GRANDES  PANTALLAS
              </Text>
            </View>

            <View style={styles.categorias}>
              {categorias.map(item => (
                <Pressable
                  key={item.key}
                  style={[
                    styles.categoria,
                    categoria === item.key && styles.categoriaActiva
                  ]}
                  onPress={() => setCategoria(item.key)}
                >
                  <Text
                    style={[
                      styles.categoriaText,
                      categoria === item.key &&
                        styles.categoriaTextActiva
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {cargando && (
              <View style={styles.estado}>
                <ActivityIndicator
                  size="large"
                  color={colores.dorado}
                />
                <Text style={styles.estadoText}>
                  Cargando películas...
                </Text>
              </View>
            )}

            {!cargando && error && (
              <View style={styles.estado}>
                <Text style={styles.estadoText}>
                  No se pudieron cargar las películas.
                </Text>

                <Pressable
                  style={styles.reintentar}
                  onPress={cargarPeliculas}
                >
                  <Text style={styles.reintentarText}>
                    Reintentar
                  </Text>
                </Pressable>
              </View>
            )}

            {!cargando &&
              !error &&
              filtradas.length === 0 && (
                <View style={styles.estado}>
                  <Text style={styles.estadoText}>
                    No hay películas en esta categoría.
                  </Text>
                </View>
              )}
          </>
        }
        ListFooterComponent={
          <View style={{ height: 25 }} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colores.fondo
  },
  content: {
    paddingHorizontal: 15,
    paddingTop: 27
  },
  presentacion: {
    marginBottom: 25
  },
  saludo: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '500',
    lineHeight: 38
  },
  hero: {
    color: colores.dorado,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38
  },
  subtitulo: {
    marginTop: 18,
    color: colores.textoGris,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.8,
    lineHeight: 18
  },
  categorias: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 23,
    borderBottomWidth: 1,
    borderBottomColor: '#252e39'
  },
  categoria: {
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  categoriaActiva: {
    borderBottomColor: colores.dorado
  },
  categoriaText: {
    color: '#9ba2ab',
    fontSize: 14,
    fontWeight: '700'
  },
  categoriaTextActiva: {
    color: colores.dorado
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 28
  },
  card: {
    minWidth: 0
  },
  presionado: {
    opacity: 0.82
  },
  poster: {
    width: '100%',
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: colores.panel
  },
  posterImage: {
    width: '100%',
    height: '100%'
  },
  etiquetaSpace: {
    minHeight: 35,
    marginTop: 8
  },
  etiqueta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700'
  },
  etiquetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8
  },
  etiquetaTexto: {
    color: '#111',
    fontSize: 12,
    fontWeight: '700'
  },
  preventa: {
    backgroundColor: '#ff7373'
  },
  estreno: {
    backgroundColor: colores.dorado
  },
  proximo: {
    backgroundColor: '#4b5563',
    color: '#fff'
  },
  clasificacion: {
    marginBottom: 4,
    color: '#b8bec6',
    fontSize: 13
  },
  titulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20
  },
  estado: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  estadoText: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center'
  },
  reintentar: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: colores.dorado
  },
  reintentarText: {
    color: '#111',
    fontWeight: '700'
  }
});