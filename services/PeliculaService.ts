import { Pelicula } from '../types/cine';

class PeliculaService {
  private peliculas: Pelicula[] = [];
  private cargando = false;
  private readonly url = 'https://cines-datos-api.kevinledesma014.workers.dev/api/data/peliculas.json';

  async obtenerPeliculas(): Promise<Pelicula[]> {
    if (this.peliculas.length > 0) return this.peliculas;

    if (this.cargando) {
      return new Promise(resolve => {
        const esperar = () => {
          if (!this.cargando) resolve(this.peliculas);
          else setTimeout(esperar, 50);
        };
        esperar();
      });
    }

    this.cargando = true;

    try {
      const respuesta = await fetch(this.url);
      if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
      this.peliculas = await respuesta.json() as Pelicula[];
      return this.peliculas;
    } finally {
      this.cargando = false;
    }
  }

  async obtenerPeliculaPorSlug(slug: string): Promise<Pelicula | undefined> {
    const peliculas = await this.obtenerPeliculas();
    return peliculas.find(pelicula => pelicula.slug === slug);
  }
}

export const peliculaService = new PeliculaService();