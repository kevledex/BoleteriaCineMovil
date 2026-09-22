export type RootStackParamList = {
  Cartelera: undefined;
  Boleteria: { slug: string };
  Asientos: {
    funcionId: string;
    slug: string;
    pelicula: string;
    fecha: string;
    hora: string;
    formato: string;
    sala: string;
  };
  Dulceria: undefined;
  Confirmacion: undefined;
  MisEntradas: undefined;
  Login: undefined;
  Admin: undefined;
  Perfil: undefined;
};