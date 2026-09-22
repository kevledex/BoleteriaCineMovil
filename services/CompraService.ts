import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompraActiva, DetalleFuncion, EntradaConfirmada, Asiento, ItemDulceriaResumen } from '../types/cine';
import { compras, CompraSolicitud, RespuestaCompra } from './api';

class CompraService {
  private readonly claveSesion = 'cine:compra-activa';

  async obtenerCompra(): Promise<CompraActiva | null> {
    const almacenada = await AsyncStorage.getItem(this.claveSesion);
    return almacenada ? JSON.parse(almacenada) as CompraActiva : null;
  }

  obtenerEntradas(): Promise<EntradaConfirmada[]> {
    return compras.mias();
  }

  async guardarReserva(funcion: DetalleFuncion, asientos: Asiento[]): Promise<void> {
    const actual = await this.obtenerCompra();

    const compra: CompraActiva = {
      funcion,
      asientos,
      dulceria: actual?.dulceria ?? []
    };

    await AsyncStorage.setItem(this.claveSesion, JSON.stringify(compra));
  }

  async guardarDulceria(dulceria: ItemDulceriaResumen[]): Promise<void> {
    const actual = await this.obtenerCompra();

    if (!actual) return;

    const compra: CompraActiva = {
      ...actual,
      dulceria
    };

    await AsyncStorage.setItem(this.claveSesion, JSON.stringify(compra));
  }

  async limpiar(): Promise<void> {
    await AsyncStorage.removeItem(this.claveSesion);
  }

  async confirmarCompra(): Promise<RespuestaCompra | null> {
    const actual = await this.obtenerCompra();

    if (!actual) return null;

    const solicitud: CompraSolicitud = {
      funcionId: Number(actual.funcion.funcionId),
      asientoIds: actual.asientos.map(asiento => asiento.asientoId),
      snacks: actual.dulceria.map(item => ({ id: item.id, cantidad: item.cantidad }))
    };

    const respuesta = await compras.registrar(solicitud);
    await this.limpiar();

    return respuesta;
  }
}

export const compraService = new CompraService();