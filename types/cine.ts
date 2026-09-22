import { ImageSourcePropType } from 'react-native';
import { EntradaUsuario } from '../services/api';

export interface Pelicula {
  id: number;
  slug: string;
  titulo: string;
  generos: string[];
  duracion: number;
  clasificacion: string;
  sinopsis: string;
  imagen: string;
  trailerUrl: string;
  fechaEstreno: string;
  estado: string;
}

export interface Asiento {
  id: string;
  asientoId: number;
  estado: 'LIBRE' | 'SELECCIONADO' | 'RESERVADO' | 'OCUPADO';
  precio: number;
}

export interface DetalleFuncion {
  funcionId: string;
  pelicula: string;
  fecha: string;
  hora: string;
  formato: string;
  sala: string;
}

export interface ItemDulceriaResumen {
  id: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CompraActiva {
  funcion: DetalleFuncion;
  asientos: Asiento[];
  dulceria: ItemDulceriaResumen[];
}

// Forma real que devuelve el backend en /api/compras/mias (ver EntradaUsuarioDTO).
export type EntradaConfirmada = EntradaUsuario;

export interface ProductoDulceria {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'combo' | 'individual';
  image: ImageSourcePropType;
}