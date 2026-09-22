import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Message } from '@stomp/stompjs';
import { Asiento } from '../types/cine';
import { funciones, WS_URL } from './api';

interface EventoAsientoWS {
  id: string;
  estado: 'LIBRE' | 'RESERVADO' | 'OCUPADO';
  clienteId: string | null;
}

const CLAVE_CLIENTE_ID = 'cine:clienteId';

class AsientosService {
  private stompClient: Client | null = null;
  private clienteIdCache: string | null = null;

  async obtenerMapaAsientos(funcionId: string): Promise<Asiento[]> {
    const clienteId = await this.obtenerOCrearClienteId();
    const mapa = await funciones.obtenerAsientos(funcionId);

    return mapa.map(asiento => ({
      ...asiento,
      estado: this.traducirEstado(asiento.estado, asiento.clienteId, clienteId)
    }));
  }

  async conectarWebSocket(
    funcionId: string,
    onUpdate: (evento: { id: string; estado: Asiento['estado'] }) => void
  ): Promise<void> {
    const clienteId = await this.obtenerOCrearClienteId();

    this.stompClient = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient?.subscribe(`/topic/sala/${funcionId}`, (mensaje: Message) => {
          if (!mensaje.body) return;
          const evento = JSON.parse(mensaje.body) as EventoAsientoWS;
          onUpdate({
            id: evento.id,
            estado: this.traducirEstado(evento.estado, evento.clienteId, clienteId)
          });
        });
      },
      onStompError: frame => {
        console.error('Error STOMP:', frame.headers['message']);
      }
    });

    this.stompClient.activate();
  }

  async enviarAccionAsiento(
    funcionId: string,
    idAsiento: string,
    estado: 'SELECCIONADO' | 'LIBRE'
  ): Promise<void> {
    if (!this.stompClient?.connected) return;

    const clienteId = await this.obtenerOCrearClienteId();

    this.stompClient.publish({
      destination: '/app/asiento/seleccionar',
      body: JSON.stringify({ funcionId, idAsiento, estado, clienteId })
    });
  }

  desconectar(): void {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }

  // El backend nunca manda "SELECCIONADO": manda RESERVADO + el clienteId de quien
  // lo tomó. Si es el mismo clienteId de este dispositivo, es mi propia selección;
  // si no, queda bloqueado para mí como reservado por otra persona.
  private traducirEstado(
    estado: Asiento['estado'],
    clienteIdDelEvento: string | null | undefined,
    miClienteId: string
  ): Asiento['estado'] {
    return estado === 'RESERVADO' && clienteIdDelEvento === miClienteId
      ? 'SELECCIONADO'
      : estado;
  }

  private async obtenerOCrearClienteId(): Promise<string> {
    if (this.clienteIdCache) return this.clienteIdCache;

    let clienteId = await AsyncStorage.getItem(CLAVE_CLIENTE_ID);
    if (!clienteId) {
      clienteId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      await AsyncStorage.setItem(CLAVE_CLIENTE_ID, clienteId);
    }

    this.clienteIdCache = clienteId;
    return clienteId;
  }
}

export const asientosService = new AsientosService();
