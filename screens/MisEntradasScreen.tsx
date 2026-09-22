import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Clapperboard } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { EntradaConfirmada } from '../types/cine';
import { compraService } from '../services/CompraService';
import { colores, moneda } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'MisEntradas'>;

export default function MisEntradasScreen({ navigation }: Props) {
  const [entradas, setEntradas] =
    useState<EntradaConfirmada[]>([]);

  useFocusEffect(
    useCallback(() => {
      compraService
        .obtenerEntradas()
        .then(setEntradas);
    }, [])
  );

  return (
    <FlatList
      style={styles.page}
      data={entradas}
      keyExtractor={item => item.codigo}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <Text style={styles.eyebrow}>
            TU HISTORIAL
          </Text>

          <Text style={styles.titulo}>
            Mis entradas
          </Text>

          <Text style={styles.intro}>
            Aquí aparecerán tus funciones
            confirmadas.
          </Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.entrada}>
          <View style={styles.codigoBox}>
            <Text
              style={styles.codigoLabel}
            >
              ENTRADA CONFIRMADA
            </Text>

            <Text style={styles.codigo}>
              {item.codigo}
            </Text>
          </View>

          <View style={styles.info}>
            <Text
              style={styles.pelicula}
            >
              {item.pelicula}
            </Text>

            <Text style={styles.linea}>
              {item.fechaFuncion} ·{' '}
              {item.hora} ·{' '}
              {item.formato} ·{' '}
              {item.idioma}
            </Text>

            <Text style={styles.linea}>
              {item.sala} ·
              {' '}Asientos:{' '}
              {item.asientos.join(', ')}
            </Text>

            <Text style={styles.linea}>
              {item.asientos.length}{' '}
              asiento
              {item.asientos.length ===
              1
                ? ''
                : 's'} · Total:{' '}
              {moneda(item.total)}
            </Text>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Clapperboard size={33} color={colores.textoSuave} />

          <Text style={styles.vacioTitulo}>
            Aún no tienes entradas
            confirmadas
          </Text>

          <Text style={styles.vacioText}>
            Cuando confirmes una compra,
            verás aquí todos los datos de tu
            función.
          </Text>

          <Pressable
            style={styles.boton}
            onPress={() =>
              navigation.replace(
                'Cartelera'
              )
            }
          >
            <Text style={styles.botonText}>
              Ver cartelera
            </Text>
          </Pressable>
        </View>
      }
      ListFooterComponent={
        <View style={{ height: 25 }} />
      }
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colores.fondo },
  content: { padding: 15, paddingTop: 27 },
  eyebrow: { color: colores.dorado, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  titulo: { marginTop: 5, color: '#fff', fontSize: 28, fontWeight: '700' },
  intro: { marginTop: 6, marginBottom: 10, color: colores.textoSuave, lineHeight: 20 },
  entrada: { marginTop: 12, padding: 16, borderWidth: 1, borderColor: colores.borde, borderRadius: 14, backgroundColor: colores.panel, gap: 14 },
  codigoBox: { gap: 5 },
  codigoLabel: { color: colores.dorado, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  codigo: { color: colores.dorado, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  info: { gap: 5 },
  pelicula: { color: '#fff', fontSize: 20, fontWeight: '700' },
  linea: { color: '#b8bec6', fontSize: 13, lineHeight: 19 },
  vacio: { marginTop: 28, padding: 30, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#3c4652', borderRadius: 14, backgroundColor: colores.panel },
  vacioTitulo: { marginTop: 10, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  vacioText: { marginTop: 7, color: colores.textoSuave, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  boton: { marginTop: 15, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 7, backgroundColor: colores.dorado },
  botonText: { color: '#171100', fontWeight: '800' }
});