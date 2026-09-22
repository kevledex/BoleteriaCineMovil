import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigationAction } from '@react-navigation/native';
import { ArrowLeft, Check, Timer, TriangleAlert } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { Asiento } from '../types/cine';
import { asientosService } from '../services/AsientosService';
import { compraService } from '../services/CompraService';
import { colores, moneda } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'Asientos'>;

export default function AsientosScreen({ route, navigation }: Props) {
  const {
    funcionId,
    pelicula,
    fecha,
    hora,
    formato,
    sala
  } = route.params;

  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState('');
  const [tiempo, setTiempo] = useState(300);
  const [modalVisible, setModalVisible] = useState(false);
  const accionPendiente = useRef<NavigationAction | null>(null);

  const seleccionados = useMemo(
    () =>
      asientos.filter(
        asiento => asiento.estado === 'SELECCIONADO'
      ),
    [asientos]
  );

  const subtotal = useMemo(
    () =>
      seleccionados.reduce(
        (total, asiento) => total + asiento.precio,
        0
      ),
    [seleccionados]
  );

  const filas = useMemo(
    () =>
      ['A', 'B', 'C', 'D', 'E'].map(nombre => ({
        nombre,
        asientos: asientos.filter(asiento =>
          asiento.id.startsWith(nombre)
        )
      })),
    [asientos]
  );

  const tiempoFormateado = `${Math.floor(
    Math.max(tiempo, 0) / 60
  )
    .toString()
    .padStart(2, '0')}:${(Math.max(tiempo, 0) % 60)
    .toString()
    .padStart(2, '0')}`;

  useEffect(() => {
    asientosService
      .obtenerMapaAsientos(funcionId)
      .then(mapa => setAsientos(mapa))
      .finally(() => setCargando(false));
  }, [funcionId]);

  useEffect(() => {
    if (seleccionados.length === 0) return;

    const intervalo = setInterval(() => {
      setTiempo(actual => actual - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [seleccionados.length]);

  useEffect(() => {
    if (
      tiempo <= 0 &&
      seleccionados.length > 0
    ) {
      liberarSeleccion(
        'Tu reserva temporal venció; los asientos fueron liberados.'
      );
    }
  }, [tiempo, seleccionados.length]);

  // Intercepta cualquier forma de salir (botón físico, gesto de swipe, o el
  // link de "Volver"), no solo un botón visible, igual que el canDeactivate del web.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (seleccionados.length === 0) return;

      e.preventDefault();
      accionPendiente.current = e.data.action;
      setModalVisible(true);
    });

    return unsubscribe;
  }, [navigation, seleccionados.length]);

  const mostrarAviso = (mensaje: string) => {
    setAviso(mensaje);
    setTimeout(() => setAviso(''), 3000);
  };

  const actualizarMapa = async (mapa: Asiento[]) => {
    setAsientos(mapa);
    await asientosService.guardarMapaAsientos(
      funcionId,
      mapa
    );
  };

  const toggleAsiento = async (asiento: Asiento) => {
    if (asiento.estado === 'OCUPADO' || asiento.estado === 'RESERVADO') return;

    const nuevoEstado: Asiento['estado'] =
      asiento.estado === 'LIBRE'
        ? 'SELECCIONADO'
        : 'LIBRE';

    const mapa = asientos.map(item =>
      item.id === asiento.id
        ? { ...item, estado: nuevoEstado }
        : item
    );

    await actualizarMapa(mapa);

    if (
      nuevoEstado === 'SELECCIONADO' &&
      seleccionados.length === 0
    ) {
      setTiempo(300);
    }

    if (nuevoEstado === 'SELECCIONADO') {
      mostrarAviso(
        `Asiento ${asiento.id} agregado a tu selección.`
      );
    } else {
      mostrarAviso(
        `Asiento ${asiento.id} retirado de tu selección.`
      );
    }
  };

  async function liberarSeleccion(mensaje: string) {
    const mapa = asientos.map(asiento =>
      asiento.estado === 'SELECCIONADO'
        ? {
            ...asiento,
            estado: 'LIBRE' as const
          }
        : asiento
    );

    await actualizarMapa(mapa);
    setTiempo(300);
    mostrarAviso(mensaje);
  }

  const cancelarSeleccion = async () => {
    await liberarSeleccion(
      'Tu selección fue cancelada.'
    );
  };

  const continuar = async (dulceria: boolean) => {
    if (seleccionados.length === 0) return;

    await compraService.guardarReserva(
      {
        funcionId,
        pelicula,
        fecha,
        hora,
        formato,
        sala
      },
      seleccionados
    );

    if (dulceria) {
      navigation.navigate('Dulceria');
    } else {
      navigation.navigate('Confirmacion');
    }
  };

  const confirmarSalida = async () => {
    await liberarSeleccion(
      'Selección cancelada. Los asientos fueron liberados.'
    );

    setModalVisible(false);

    if (accionPendiente.current) {
      navigation.dispatch(accionPendiente.current);
      accionPendiente.current = null;
    } else {
      navigation.goBack();
    }
  };

  if (cargando) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={colores.dorado}
        />
        <Text style={styles.loaderText}>
          Cargando mapa de sala...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {aviso !== '' && (
        <View style={styles.aviso}>
          <Check size={16} color="#dff8e7" />
          <Text style={styles.avisoText}>
            {aviso}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.volverRow} onPress={() => navigation.goBack()}>
          <ArrowLeft size={15} color={colores.textoSuave} />
          <Text style={styles.volver}>
            Volver a horarios
          </Text>
        </Pressable>

        <View style={styles.detalle}>
          <Text style={styles.eyebrow}>
            TU FUNCIÓN
          </Text>

          <Text style={styles.pelicula}>
            {pelicula}
          </Text>

          <Text style={styles.meta}>
            {fecha} · {hora} · {formato} · {sala}
          </Text>
        </View>

        <View
          style={[
            styles.reserva,
            seleccionados.length === 0 &&
              styles.reservaOculta
          ]}
        >
          <View style={styles.reservaTextRow}>
            <Timer size={15} color="#241b00" />
            <Text style={styles.reservaText}>
              Reserva temporal
            </Text>
          </View>

          <Text style={styles.reservaTime}>
            {tiempoFormateado}
          </Text>
        </View>

        <View style={styles.pantalla}>
          <View style={styles.arco} />
          <Text style={styles.pantallaText}>
            PANTALLA
          </Text>
        </View>

        <View style={styles.leyenda}>
          <View style={styles.leyendaItem}>
            <View
              style={[
                styles.box,
                styles.libre
              ]}
            />
            <Text style={styles.leyendaText}>
              Libre
            </Text>
          </View>

          <View style={styles.leyendaItem}>
            <View
              style={[
                styles.box,
                styles.seleccionado
              ]}
            />
            <Text style={styles.leyendaText}>
              Tu selección
            </Text>
          </View>

          <View style={styles.leyendaItem}>
            <View
              style={[
                styles.box,
                styles.reservado
              ]}
            />
            <Text style={styles.leyendaText}>
              Reservado por otro
            </Text>
          </View>

          <View style={styles.leyendaItem}>
            <View
              style={[
                styles.box,
                styles.ocupado
              ]}
            />
            <Text style={styles.leyendaText}>
              Ocupado
            </Text>
          </View>
        </View>

        <View style={styles.mapa}>
          {filas.map(fila => (
            <View
              key={fila.nombre}
              style={styles.fila}
            >
              <Text style={styles.filaLabel}>
                {fila.nombre}
              </Text>

              <View style={styles.asientosFila}>
                {fila.asientos.map(
                  (asiento, index) => (
                    <View
                      key={asiento.id}
                      style={
                        index === 4
                          ? styles.separacion
                          : undefined
                      }
                    >
                      <Pressable
                        disabled={
                          asiento.estado === 'OCUPADO' ||
                          asiento.estado === 'RESERVADO'
                        }
                        onPress={() =>
                          toggleAsiento(asiento)
                        }
                        style={[
                          styles.asiento,
                          asiento.estado ===
                            'LIBRE' &&
                            styles.asientoLibre,
                          asiento.estado ===
                            'SELECCIONADO' &&
                            styles.asientoSeleccionado,
                          asiento.estado ===
                            'RESERVADO' &&
                            styles.asientoReservado,
                          asiento.estado ===
                            'OCUPADO' &&
                            styles.asientoOcupado
                        ]}
                      >
                        <Text
                          style={[
                            styles.asientoText,
                            asiento.estado ===
                              'SELECCIONADO' &&
                              styles.asientoTextSeleccionado
                          ]}
                        >
                          {asiento.id.slice(1)}
                        </Text>
                      </Pressable>
                    </View>
                  )
                )}
              </View>

              <Text style={styles.filaLabel}>
                {fila.nombre}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footerBar}>
        <View>
          <Text style={styles.resumenTexto}>
            {seleccionados.length} asiento
            {seleccionados.length === 1
              ? ''
              : 's'} seleccionado
            {seleccionados.length === 1
              ? ''
              : 's'}
          </Text>

          <Text style={styles.total}>
            {moneda(subtotal)}
          </Text>
        </View>

        <View style={styles.acciones}>
          <Pressable
            disabled={!seleccionados.length}
            style={[
              styles.botonSecundario,
              !seleccionados.length &&
                styles.deshabilitado
            ]}
            onPress={cancelarSeleccion}
          >
            <Text style={styles.textoSecundario}>
              Cancelar
            </Text>
          </Pressable>

          <Pressable
            disabled={!seleccionados.length}
            style={[
              styles.botonSecundario,
              !seleccionados.length &&
                styles.deshabilitado
            ]}
            onPress={() =>
              continuar(false)
            }
          >
            <Text style={styles.textoSecundario}>
              Sin dulcería
            </Text>
          </Pressable>

          <Pressable
            disabled={!seleccionados.length}
            style={[
              styles.botonDorado,
              !seleccionados.length &&
                styles.deshabilitado
            ]}
            onPress={() =>
              continuar(true)
            }
          >
            <Text style={styles.textoDorado}>
              Dulcería
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <View style={styles.modalFondo}>
          <View style={styles.modal}>
            <TriangleAlert size={30} color={colores.dorado} />

            <Text style={styles.modalTitulo}>
              ¿Salir de la selección?
            </Text>

            <Text style={styles.modalTexto}>
              Tienes {seleccionados.length}{' '}
              asiento
              {seleccionados.length === 1
                ? ''
                : 's'} reservado
              {seleccionados.length === 1
                ? ''
                : 's'} temporalmente. Si sales,
              se liberarán.
            </Text>

            <View style={styles.modalAcciones}>
              <Pressable
                style={styles.botonSecundario}
                onPress={() => {
                  accionPendiente.current = null;
                  setModalVisible(false);
                }}
              >
                <Text style={styles.textoSecundario}>
                  Seguir eligiendo
                </Text>
              </Pressable>

              <Pressable
                style={styles.botonPeligro}
                onPress={confirmarSalida}
              >
                <Text style={styles.textoPeligro}>
                  Salir sin guardar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colores.fondo },
  content: { padding: 15, paddingBottom: 175 },
  volverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  volver: { color: colores.textoSuave, fontSize: 14 },
  detalle: { padding: 18, borderWidth: 1, borderColor: colores.borde, borderRadius: 14, backgroundColor: colores.panel },
  eyebrow: { color: colores.dorado, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  pelicula: { marginTop: 5, color: '#fff', fontSize: 21, fontWeight: '700' },
  meta: { marginTop: 5, color: colores.textoSuave, fontSize: 13 },
  reserva: { marginTop: 14, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 8, backgroundColor: colores.dorado, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reservaOculta: { opacity: 0.35 },
  reservaTextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reservaText: { color: '#241b00', fontSize: 13, fontWeight: '700' },
  reservaTime: { color: '#241b00', fontSize: 17, fontWeight: '900' },
  pantalla: { marginTop: 25, alignItems: 'center' },
  arco: { width: '95%', height: 34, borderTopWidth: 3, borderTopColor: 'rgba(255,255,255,0.55)', borderRadius: 120 },
  pantallaText: { marginTop: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 4 },
  leyenda: { marginTop: 22, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  box: { width: 14, height: 14, borderRadius: 4 },
  libre: { backgroundColor: colores.panel, borderWidth: 1, borderColor: colores.borde },
  seleccionado: { backgroundColor: colores.dorado },
  reservado: { backgroundColor: colores.naranja },
  ocupado: { backgroundColor: colores.rojo },
  leyendaText: { color: colores.textoSuave, fontSize: 12 },
  mapa: { marginTop: 18, padding: 10, borderWidth: 1, borderColor: 'rgba(48,57,69,0.7)', borderRadius: 14, backgroundColor: 'rgba(8,13,19,0.6)' },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  filaLabel: { width: 18, color: colores.textoSuave, fontWeight: '800', textAlign: 'center' },
  asientosFila: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  separacion: { marginLeft: 12 },
  asiento: { width: 32, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  asientoLibre: { backgroundColor: colores.panel, borderColor: colores.borde },
  asientoSeleccionado: { backgroundColor: colores.dorado, borderColor: colores.dorado },
  asientoReservado: { backgroundColor: colores.naranja, borderColor: colores.naranja, opacity: 0.65 },
  asientoOcupado: { backgroundColor: colores.rojo, borderColor: colores.rojo, opacity: 0.65 },
  asientoText: { color: colores.textoSuave, fontSize: 12, fontWeight: '800' },
  asientoTextSeleccionado: { color: '#161100' },
  footerBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, backgroundColor: '#0d1218', borderTopWidth: 1, borderTopColor: colores.borde },
  resumenTexto: { color: colores.textoSuave, fontSize: 12 },
  total: { marginTop: 2, color: '#fff', fontSize: 24, fontWeight: '800' },
  acciones: { flexDirection: 'row', gap: 7, marginTop: 9 },
  botonSecundario: { flex: 1, paddingVertical: 11, paddingHorizontal: 7, borderRadius: 7, backgroundColor: colores.botonOscuro, alignItems: 'center' },
  textoSecundario: { color: '#e4e9ef', fontSize: 11, fontWeight: '800' },
  botonDorado: { flex: 1, paddingVertical: 11, paddingHorizontal: 7, borderRadius: 7, backgroundColor: colores.dorado, alignItems: 'center' },
  textoDorado: { color: '#171100', fontSize: 11, fontWeight: '800' },
  deshabilitado: { opacity: 0.4 },
  botonPeligro: { paddingVertical: 11, paddingHorizontal: 12, borderRadius: 7, backgroundColor: '#b83d45', alignItems: 'center' },
  textoPeligro: { color: '#fff', fontSize: 11, fontWeight: '800' },
  aviso: { position: 'absolute', top: 10, left: 14, right: 14, zIndex: 20, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderWidth: 1, borderColor: '#34704b', borderRadius: 9, backgroundColor: '#123a25' },
  avisoText: { color: '#dff8e7', fontSize: 13 },
  loader: { flex: 1, backgroundColor: colores.fondo, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { color: colores.textoSuave },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 420, padding: 23, borderWidth: 1, borderColor: '#3c4652', borderRadius: 14, backgroundColor: '#111923', alignItems: 'center' },
  modalTitulo: { marginTop: 9, color: '#fff', fontSize: 21, fontWeight: '700' },
  modalTexto: { marginTop: 8, color: colores.textoSuave, textAlign: 'center', lineHeight: 20 },
  modalAcciones: { flexDirection: 'row', gap: 8, marginTop: 18, width: '100%' }
});