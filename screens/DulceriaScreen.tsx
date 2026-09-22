import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigationAction } from '@react-navigation/native';
import { ArrowRight, Minus, Plus, ShoppingCart, TriangleAlert, X } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { ProductoDulceria } from '../types/cine';
import { productosDulceria } from '../data/productosDulceria';
import { compraService } from '../services/CompraService';
import { colores, moneda } from '../styles/estilosGlobal';

type Props = NativeStackScreenProps<RootStackParamList, 'Dulceria'>;

interface CartItem {
  product: ProductoDulceria;
  quantity: number;
}

type Filtro = 'todos' | 'combo' | 'individual';

export default function DulceriaScreen({ navigation }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [modalSalidaVisible, setModalSalidaVisible] = useState(false);
  const accionPendiente = useRef<NavigationAction | null>(null);

  useEffect(() => {
    compraService.obtenerCompra().then(compra => {
      if (!compra) return;

      setCarrito(
        compra.dulceria
          .map(item => {
            const producto =
              productosDulceria.find(
                product => product.name === item.nombre
              );

            return producto
              ? {
                  product: producto,
                  quantity: item.cantidad
                }
              : null;
          })
          .filter(
            (item): item is CartItem =>
              item !== null
          )
      );
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (carrito.length === 0) return;

      e.preventDefault();
      accionPendiente.current = e.data.action;
      setModalSalidaVisible(true);
    });

    return unsubscribe;
  }, [navigation, carrito.length]);

  const cantidadTotalCarrito = carrito.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const confirmarSalidaModal = () => {
    setModalSalidaVisible(false);

    if (accionPendiente.current) {
      navigation.dispatch(accionPendiente.current);
      accionPendiente.current = null;
    } else {
      navigation.goBack();
    }
  };

  const cancelarSalidaModal = () => {
    accionPendiente.current = null;
    setModalSalidaVisible(false);
  };

  const filtrados = useMemo(
    () =>
      filtro === 'todos'
        ? productosDulceria
        : productosDulceria.filter(
            product =>
              product.category === filtro
          ),
    [filtro]
  );

  const total = useMemo(
    () =>
      carrito.reduce(
        (sum, item) =>
          sum +
          item.product.price *
            item.quantity,
        0
      ),
    [carrito]
  );

  const cantidadTotal = useMemo(
    () =>
      carrito.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      ),
    [carrito]
  );

  const cantidad = (id: number) =>
    carrito.find(
      item => item.product.id === id
    )?.quantity ?? 0;

  const agregar = (
    product: ProductoDulceria
  ) => {
    setCarrito(items => {
      const actual = items.find(
        item =>
          item.product.id === product.id
      );

      if (actual) {
        return items.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1
              }
            : item
        );
      }

      return [
        ...items,
        {
          product,
          quantity: 1
        }
      ];
    });
  };

  const quitar = (id: number) => {
    setCarrito(items => {
      const actual = items.find(
        item => item.product.id === id
      );

      if (!actual) return items;

      if (actual.quantity === 1) {
        return items.filter(
          item =>
            item.product.id !== id
        );
      }

      return items.map(item =>
        item.product.id === id
          ? {
              ...item,
              quantity:
                item.quantity - 1
            }
          : item
      );
    });
  };

  const eliminar = (id: number) => {
    setCarrito(items =>
      items.filter(
        item => item.product.id !== id
      )
    );
  };

  const continuar = async () => {
    const compra =
      await compraService.obtenerCompra();

    if (!compra) {
      Alert.alert(
        'Reserva',
        'Primero debes seleccionar tus asientos.'
      );

      navigation.navigate('Cartelera');
      return;
    }

    await compraService.guardarDulceria(
      carrito.map(item => ({
        id: item.product.id,
        nombre: item.product.name,
        cantidad: item.quantity,
        precioUnitario:
          item.product.price
      }))
    );

    navigation.navigate('Confirmacion');
  };

  return (
    <>
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.filtros}>
        <Pressable
          style={[
            styles.filtro,
            filtro === 'todos' &&
              styles.filtroActivo
          ]}
          onPress={() => setFiltro('todos')}
        >
          <Text
            style={[
              styles.filtroText,
              filtro === 'todos' &&
                styles.filtroTextActivo
            ]}
          >
            Todos
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filtro,
            filtro === 'combo' &&
              styles.filtroActivo
          ]}
          onPress={() => setFiltro('combo')}
        >
          <Text
            style={[
              styles.filtroText,
              filtro === 'combo' &&
                styles.filtroTextActivo
            ]}
          >
            Combos
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filtro,
            filtro === 'individual' &&
              styles.filtroActivo
          ]}
          onPress={() =>
            setFiltro('individual')
          }
        >
          <Text
            style={[
              styles.filtroText,
              filtro === 'individual' &&
                styles.filtroTextActivo
            ]}
          >
            Individuales
          </Text>
        </Pressable>
      </View>

      <Text style={styles.count}>
        {filtrados.length} producto
        {filtrados.length !== 1
          ? 's'
          : ''}{' '}
        disponible
        {filtrados.length !== 1
          ? 's'
          : ''}
      </Text>

      <View style={styles.grid}>
        {filtrados.map(product => (
          <View
            key={product.id}
            style={[
              styles.card,
              cantidad(product.id) > 0 &&
                styles.cardActivo
            ]}
          >
            <Text
              style={[
                styles.badge,
                product.category ===
                  'combo' &&
                  styles.badgeCombo
              ]}
            >
              {product.category ===
              'combo'
                ? 'Combo'
                : 'Individual'}
            </Text>

            <View style={styles.imageWrap}>
              <Image
                source={product.image}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.name}>
              {product.name}
            </Text>

            <Text
              style={styles.description}
              numberOfLines={2}
            >
              {product.description}
            </Text>

            <Text style={styles.price}>
              {moneda(product.price)}
            </Text>

            {cantidad(product.id) === 0 ? (
              <Pressable
                style={styles.addButton}
                onPress={() =>
                  agregar(product)
                }
              >
                <Plus size={14} color="#e4e9ef" />
                <Text style={styles.addText}>
                  Agregar
                </Text>
              </Pressable>
            ) : (
              <View
                style={styles.quantity}
              >
                <Pressable
                  style={styles.qtyButton}
                  onPress={() =>
                    quitar(product.id)
                  }
                >
                  <Minus size={16} color="#fff" />
                </Pressable>

                <Text
                  style={styles.qtyValue}
                >
                  {cantidad(product.id)}
                </Text>

                <Pressable
                  style={styles.qtyButton}
                  onPress={() =>
                    agregar(product)
                  }
                >
                  <Plus size={16} color="#fff" />
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.carritoPanel}>
        <View style={styles.cartHeader}>
          <Text style={styles.cartTitle}>
            Tu selección
          </Text>

          {cantidadTotal > 0 && (
            <Text style={styles.cartBadge}>
              {cantidadTotal}
            </Text>
          )}
        </View>

        {carrito.length === 0 ? (
          <View style={styles.emptyCart}>
            <ShoppingCart size={30} color={colores.textoGris} />

            <Text style={styles.emptyTitle}>
              Aún no has agregado productos.
            </Text>

            <Text style={styles.emptyText}>
              ¡Selecciona algo del catálogo!
            </Text>
          </View>
        ) : (
          carrito.map(item => (
            <View
              key={item.product.id}
              style={styles.cartItem}
            >
              <View style={styles.cartInfo}>
                <Text style={styles.cartName}>
                  {item.product.name}
                </Text>

                <Text style={styles.cartUnit}>
                  {moneda(
                    item.product.price
                  )}{' '}
                  c/u
                </Text>
              </View>

              <View
                style={styles.cartBottom}
              >
                <View
                  style={styles.cartQty}
                >
                  <Pressable
                    style={
                      styles.qtyButtonSmall
                    }
                    onPress={() =>
                      quitar(
                        item.product.id
                      )
                    }
                  >
                    <Minus size={14} color="#fff" />
                  </Pressable>

                  <Text
                    style={styles.qtyValue}
                  >
                    {item.quantity}
                  </Text>

                  <Pressable
                    style={
                      styles.qtyButtonSmall
                    }
                    onPress={() =>
                      agregar(
                        item.product
                      )
                    }
                  >
                    <Plus size={14} color="#fff" />
                  </Pressable>
                </View>

                <Text
                  style={
                    styles.cartSubtotal
                  }
                >
                  {moneda(
                    item.product.price *
                      item.quantity
                  )}
                </Text>

                <Pressable
                  onPress={() =>
                    eliminar(
                      item.product.id
                    )
                  }
                >
                  <X size={16} color={colores.textoGris} />
                </Pressable>
              </View>
            </View>
          ))
        )}

        {carrito.length > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.totalRow}>
              <Text
                style={styles.totalLabel}
              >
                Total
              </Text>

              <Text style={styles.total}>
                {moneda(total)}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.clear}
                onPress={() =>
                  setCarrito([])
                }
              >
                <Text
                  style={styles.clearText}
                >
                  Vaciar
                </Text>
              </Pressable>

              <Pressable
                style={styles.checkout}
                onPress={continuar}
              >
                <Text
                  style={styles.checkoutText}
                >
                  Continuar
                </Text>
                <ArrowRight size={15} color="#171100" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>

    <Modal
      transparent
      visible={modalSalidaVisible}
      animationType="fade"
      onRequestClose={cancelarSalidaModal}
    >
      <View style={styles.modalFondo}>
        <View style={styles.modal}>
          <TriangleAlert size={30} color={colores.dorado} />

          <Text style={styles.modalTitulo}>
            ¿Salir de la dulcería?
          </Text>

          <Text style={styles.modalTexto}>
            Tienes {cantidadTotalCarrito}{' '}
            producto
            {cantidadTotalCarrito === 1
              ? ''
              : 's'} en tu selección. Si sales,
            se perderán.
          </Text>

          <View style={styles.modalAcciones}>
            <Pressable
              style={styles.botonSecundario}
              onPress={cancelarSalidaModal}
            >
              <Text style={styles.textoSecundario}>
                Seguir eligiendo
              </Text>
            </Pressable>

            <Pressable
              style={styles.botonPeligro}
              onPress={confirmarSalidaModal}
            >
              <Text style={styles.textoPeligro}>
                Salir sin guardar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colores.fondo },
  content: { padding: 15, paddingBottom: 28 },
  filtros: { flexDirection: 'row', gap: 8, marginBottom: 9 },
  filtro: { flex: 1, paddingVertical: 10, borderRadius: 7, backgroundColor: colores.panel, borderWidth: 1, borderColor: colores.borde, alignItems: 'center' },
  filtroActivo: { backgroundColor: colores.dorado, borderColor: colores.dorado },
  filtroText: { color: '#c4c9cf', fontSize: 12, fontWeight: '600' },
  filtroTextActivo: { color: '#111', fontWeight: '800' },
  count: { color: colores.textoGris, fontSize: 12, marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', marginBottom: 14, padding: 10, borderWidth: 1, borderColor: colores.borde, borderRadius: 12, backgroundColor: colores.panel },
  cardActivo: { borderColor: colores.dorado },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, backgroundColor: '#4b5563', color: '#fff', fontSize: 10, fontWeight: '700' },
  badgeCombo: { backgroundColor: colores.dorado, color: '#111' },
  imageWrap: { width: '100%', aspectRatio: 1.15, marginTop: 9, overflow: 'hidden', borderRadius: 9, backgroundColor: '#0c1219' },
  image: { width: '100%', height: '100%' },
  name: { marginTop: 10, color: '#fff', fontSize: 15, fontWeight: '700' },
  description: { marginTop: 5, minHeight: 36, color: colores.textoGris, fontSize: 11, lineHeight: 16 },
  price: { marginTop: 8, color: colores.dorado, fontSize: 16, fontWeight: '800' },
  addButton: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10, paddingVertical: 9, borderRadius: 7, backgroundColor: colores.botonOscuro, alignItems: 'center' },
  addText: { color: '#e4e9ef', fontWeight: '800', fontSize: 12 },
  quantity: { marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  qtyButton: { width: 30, height: 30, borderRadius: 6, backgroundColor: colores.botonOscuro, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { color: '#fff', fontSize: 14, fontWeight: '800' },
  carritoPanel: { marginTop: 24, padding: 15, borderWidth: 1, borderColor: colores.borde, borderRadius: 14, backgroundColor: colores.panel },
  cartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cartTitle: { color: '#fff', fontSize: 21, fontWeight: '700' },
  cartBadge: { minWidth: 23, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12, backgroundColor: colores.dorado, color: '#111', textAlign: 'center', fontSize: 11, fontWeight: '800' },
  emptyCart: { paddingVertical: 23, alignItems: 'center' },
  emptyTitle: { marginTop: 8, color: '#fff', fontSize: 14 },
  emptyText: { marginTop: 4, color: colores.textoGris, fontSize: 12 },
  cartItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#27303b' },
  cartInfo: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  cartName: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '700' },
  cartUnit: { color: colores.textoGris, fontSize: 11 },
  cartBottom: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  cartQty: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyButtonSmall: { width: 28, height: 28, borderRadius: 6, backgroundColor: colores.botonOscuro, alignItems: 'center', justifyContent: 'center' },
  cartSubtotal: { color: colores.dorado, fontWeight: '800' },
  cartFooter: { marginTop: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#fff', fontSize: 16 },
  total: { color: colores.dorado, fontSize: 23, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  clear: { flex: 1, paddingVertical: 11, borderRadius: 7, backgroundColor: colores.botonOscuro, alignItems: 'center' },
  clearText: { color: '#e4e9ef', fontWeight: '800' },
  checkout: { flexDirection: 'row', justifyContent: 'center', gap: 6, flex: 1.5, paddingVertical: 11, borderRadius: 7, backgroundColor: colores.dorado, alignItems: 'center' },
  checkoutText: { color: '#171100', fontWeight: '800' },
  botonSecundario: { flex: 1, paddingVertical: 11, paddingHorizontal: 7, borderRadius: 7, backgroundColor: colores.botonOscuro, alignItems: 'center' },
  textoSecundario: { color: '#e4e9ef', fontSize: 11, fontWeight: '800' },
  botonPeligro: { paddingVertical: 11, paddingHorizontal: 12, borderRadius: 7, backgroundColor: '#b83d45', alignItems: 'center' },
  textoPeligro: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 420, padding: 23, borderWidth: 1, borderColor: '#3c4652', borderRadius: 14, backgroundColor: '#111923', alignItems: 'center' },
  modalTitulo: { marginTop: 9, color: '#fff', fontSize: 21, fontWeight: '700' },
  modalTexto: { marginTop: 8, color: colores.textoSuave, textAlign: 'center', lineHeight: 20 },
  modalAcciones: { flexDirection: 'row', gap: 8, marginTop: 18, width: '100%' }
});