import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asiento } from '../types/cine';
import { funciones } from './api';

class AsientosService {
  async obtenerMapaAsientos(funcionId: string): Promise<Asiento[]> {
    const mapa = await funciones.obtenerAsientos(funcionId);
    await this.guardarMapaAsientos(funcionId, mapa);
    return mapa;
  }

  // Caché local de la selección en curso mientras el usuario navega por la app
  // (no hay WebSocket en móvil todavía: el estado real siempre se vuelve a pedir
  // al backend con obtenerMapaAsientos).
  async guardarMapaAsientos(funcionId: string, mapa: Asiento[]): Promise<void> {
    await AsyncStorage.setItem(`cine:asientos:${funcionId}`, JSON.stringify(mapa));
  }
}

export const asientosService = new AsientosService();
