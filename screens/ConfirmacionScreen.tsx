import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { CompraActiva } from '../types/cine';
import { compraService } from '../services/CompraService';
import { colores, moneda } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmacion'>;

export default function ConfirmacionScreen({ navigation }: Props) {
  const [compra, setCompra] =
    useState<CompraActiva | null>(null);

  const [confirmada, setConfirmada] =
    useState(false);

  const [procesando, setProcesando] =
    useState(false);

  const [codigo, setCodigo] =
    useState('');

  useEffect(() => {
    compraService.obtenerCompra().then(actual => {
      if (!actual) {
        navigation.replace('Cartelera');
        return;
      }

      setCompra(actual);

      setCodigo(
        `MC-${actual.funcion.funcionId
          .slice(-8)
          .toUpperCase()}`
      );
    });
  }, [navigation]);

  const compraMostrada = compra;

  const subtotalAsientos = useMemo(
    () =>
      compraMostrada?.asientos.reduce(
        (sum, asiento) =>
          sum + asiento.precio,
        0
      ) ?? 0,
    [compraMostrada]
  );

  const subtotalDulceria = useMemo(
    () =>
      compraMostrada?.dulceria.reduce(
        (sum, item) =>
          sum +
          item.precioUnitario *
            item.cantidad,
        0
      ) ?? 0,
    [compraMostrada]
  );

  const total =
    subtotalAsientos +
    subtotalDulceria;

  if (!compraMostrada) return null;

  const confirmar = async () => {
    if (confirmada || procesando) return;

    setProcesando(true);

    try {
      const respuesta = await compraService.confirmarCompra();

      if (respuesta) {
        setCodigo(`MC-${respuesta.id}`);
        setConfirmada(true);
      }
    } catch (error) {
      Alert.alert(
        'No se pudo confirmar la compra',
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const cancelar = async () => {
    await compraService.limpiar();
    navigation.replace('Cartelera');
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        {confirmada ? (
          <>
            <View style={styles.exito}>
              <Check size={28} color="#071b0d" />
            </View>

            <Text style={styles.eyebrow}>
              COMPRA CONFIRMADA
            </Text>

            <Text style={styles.titulo}>
              ¡Nos vemos en el cine!
            </Text>

            <Text style={styles.subtitulo}>
              Tu reserva quedó registrada.
              Conserva este resumen.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.eyebrow}>
              RESUMEN DE COMPRA
            </Text>

            <Text style={styles.titulo}>
              Revisa tu función
            </Text>

            <Text style={styles.subtitulo}>
              Dulcería es opcional; puedes
              confirmar solo tus asientos.
            </Text>
          </>
        )}

        <Text style={styles.codigo}>
          {codigo}
        </Text>

        <View style={styles.bloque}>
          <Text style={styles.label}>
            PELÍCULA
          </Text>

          <Text style={styles.strong}>
            {compraMostrada.funcion.pelicula}
          </Text>

          <Text style={styles.text}>
            {compraMostrada.funcion.fecha} ·{' '}
            {compraMostrada.funcion.hora} ·{' '}
            {compraMostrada.funcion.formato}
          </Text>

          <Text style={styles.text}>
            {compraMostrada.funcion.sala}
          </Text>
        </View>

        <View style={styles.bloque}>
          <Text style={styles.label}>
            ASIENTOS
          </Text>

          <Text style={styles.strong}>
            {compraMostrada.asientos
              .map(
                asiento => asiento.id
              )
              .join(', ')}
          </Text>

          <Text style={styles.text}>
            {compraMostrada.asientos.length}{' '}
            asiento
            {compraMostrada.asientos.length ===
            1
              ? ''
              : 's'}{' '}
            ·{' '}
            {moneda(
              subtotalAsientos
            )}
          </Text>
        </View>

        {compraMostrada.dulceria
          .length > 0 && (
          <View style={styles.bloque}>
            <Text style={styles.label}>
              DULCERÍA
            </Text>

            {compraMostrada.dulceria.map(
              item => (
                <Text
                  key={item.nombre}
                  style={styles.text}
                >
                  {item.cantidad} ×{' '}
                  {item.nombre} —{' '}
                  {moneda(
                    item.cantidad *
                      item.precioUnitario
                  )}
                </Text>
              )
            )}
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Total
          </Text>

          <Text style={styles.total}>
            {moneda(total)}
          </Text>
        </View>

        {!confirmada ? (
          <View style={styles.acciones}>
            <Pressable
              style={styles.secundario}
              onPress={cancelar}
            >
              <Text style={styles.secundarioText}>
                Cancelar reserva
              </Text>
            </Pressable>

            <Pressable
              disabled={procesando}
              style={[
                styles.dorado,
                procesando && styles.deshabilitado
              ]}
              onPress={confirmar}
            >
              <Text style={styles.doradoText}>
                {procesando ? 'Procesando...' : 'Confirmar compra'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              style={styles.dorado}
              onPress={() =>
                navigation.navigate(
                  'MisEntradas'
                )
              }
            >
              <Text style={styles.doradoText}>
                Ver mis boletos
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.secundario,
                { marginTop: 10 }
              ]}
              onPress={() =>
                navigation.replace(
                  'Cartelera'
                )
              }
            >
              <Text
                style={styles.secundarioText}
              >
                Volver a cartelera
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colores.fondo },
  content: { flexGrow: 1, justifyContent: 'center', padding: 15 },
  card: { padding: 22, borderWidth: 1, borderColor: '#3c4652', borderRadius: 18, backgroundColor: '#0e151e' },
  exito: { width: 62, height: 62, borderRadius: 31, backgroundColor: colores.verde, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  eyebrow: { color: colores.dorado, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  titulo: { marginTop: 6, color: '#fff', fontSize: 27, fontWeight: '700' },
  subtitulo: { marginTop: 5, color: colores.textoSuave, lineHeight: 20 },
  codigo: { alignSelf: 'flex-start', marginTop: 15, paddingHorizontal: 10, paddingVertical: 7, color: colores.dorado, borderWidth: 1, borderStyle: 'dashed', borderColor: colores.dorado, borderRadius: 6, fontWeight: '800', letterSpacing: 1.2 },
  bloque: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: colores.borde },
  label: { color: colores.dorado, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  strong: { marginTop: 5, color: '#fff', fontSize: 17, fontWeight: '700' },
  text: { marginTop: 4, color: '#b8bec6', fontSize: 13 },
  totalRow: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: colores.borde, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#fff', fontSize: 17 },
  total: { color: colores.dorado, fontSize: 26, fontWeight: '800' },
  acciones: { flexDirection: 'row', gap: 8 },
  secundario: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#303945', alignItems: 'center' },
  secundarioText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  dorado: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: colores.dorado, alignItems: 'center' },
  doradoText: { color: '#171100', fontWeight: '800', fontSize: 12 },
  deshabilitado: { opacity: 0.5 }
});