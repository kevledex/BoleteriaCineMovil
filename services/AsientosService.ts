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
  private clienteIdPromesa: Promise<string> | null = null;

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

    console.log(`[WS] conectando a ${WS_URL} (clienteId=${clienteId}, funcion=${funcionId})`);

    this.stompClient = new Client({
      brokerURL: WS_URL,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 5000,
      debug: mensaje => console.log('[WS debug]', mensaje),
      onConnect: () => {
        console.log('[WS] conectado, suscribiendo a /topic/sala/' + funcionId);

        this.stompClient?.subscribe(`/topic/sala/${funcionId}`, (mensaje: Message) => {
          if (!mensaje.body) return;
          const evento = JSON.parse(mensaje.body) as EventoAsientoWS;
          console.log('[WS] evento recibido:', evento);

          onUpdate({
            id: evento.id,
            estado: this.traducirEstado(evento.estado, evento.clienteId, clienteId)
          });
        });
      },
      onStompError: frame => {
        console.error('[WS] Error STOMP:', frame.headers['message'], frame.body);
      },
      onWebSocketError: evento => {
        console.error('[WS] Error de WebSocket (no llegó a conectar):', evento);
      },
      onDisconnect: () => {
        console.log('[WS] Desconectado');
      }
    });

    this.stompClient.activate();
  }

  async enviarAccionAsiento(
    funcionId: string,
    idAsiento: string,
    estado: 'SELECCIONADO' | 'LIBRE'
  ): Promise<void> {
    if (!this.stompClient?.connected) {
      console.warn('[WS] Se intentó enviar una acción sin conexión activa todavía:', idAsiento, estado);
      return;
    }

    const clienteId = await this.obtenerOCrearClienteId();
    console.log('[WS] enviando acción:', { funcionId, idAsiento, estado, clienteId });

    this.stompClient.publish({
      destination: '/app/asiento/seleccionar',
      body: JSON.stringify({ funcionId, idAsiento, estado, clienteId })
    });
  }

  desconectar(): void {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }

  private traducirEstado(
    estado: Asiento['estado'],
    clienteIdDelEvento: string | null | undefined,
    miClienteId: string
  ): Asiento['estado'] {
    return estado === 'RESERVADO' && clienteIdDelEvento === miClienteId
      ? 'SELECCIONADO'
      : estado;
  }

  private obtenerOCrearClienteId(): Promise<string> {
    if (this.clienteIdCache) return Promise.resolve(this.clienteIdCache);
    if (this.clienteIdPromesa) return this.clienteIdPromesa;

    this.clienteIdPromesa = (async () => {
      let clienteId = await AsyncStorage.getItem(CLAVE_CLIENTE_ID);
      if (!clienteId) {
        clienteId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        await AsyncStorage.setItem(CLAVE_CLIENTE_ID, clienteId);
      }

      this.clienteIdCache = clienteId;
      return clienteId;
    })();

    return this.clienteIdPromesa;
  }
}

export const asientosService = new AsientosService();
