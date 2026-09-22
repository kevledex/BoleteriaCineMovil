import { ProductoDulceria } from '../types/cine';

export const productosDulceria: ProductoDulceria[] = [
  { id: 1, name: 'Combo 1', description: 'Palomitas de maíz, 1 bebida y hot dog.', price: 13, category: 'combo', image: require('../assets/dulceria/combo-1.png') },
  { id: 2, name: 'Combo 2', description: 'Palomitas de maíz, 1 bebida y nachos con queso.', price: 15, category: 'combo', image: require('../assets/dulceria/combo-2.png') },
  { id: 3, name: 'Combo 3', description: 'Palomitas de maíz, 2 bebidas, hot dog y nachos con queso.', price: 23, category: 'combo', image: require('../assets/dulceria/combo-3.png') },
  { id: 4, name: 'Combo 4', description: 'Palomitas de maíz grandes con 2 bebidas.', price: 19, category: 'combo', image: require('../assets/dulceria/combo-4.png') },
  { id: 5, name: 'Bebida Pequeña', description: 'Refresco helado vaso azul 22 oz.', price: 3.5, category: 'individual', image: require('../assets/dulceria/bebida-pequena.png') },
  { id: 6, name: 'Bebida Grande', description: 'Refresco helado vaso rojo 32 oz.', price: 4.5, category: 'individual', image: require('../assets/dulceria/bebida-grande.png') },
  { id: 7, name: 'Café', description: 'Café caliente servido en vaso Nescafé.', price: 3, category: 'individual', image: require('../assets/dulceria/cafe.jpg') },
  { id: 8, name: 'Agua Sin Gas', description: 'Botella de agua Dasani sin gas 600 ml.', price: 2.5, category: 'individual', image: require('../assets/dulceria/agua-sin-gas.jpg') },
  { id: 9, name: 'Tic Tac Naranja', description: 'Pastillas de caramelo sabor naranja 16g.', price: 2, category: 'individual', image: require('../assets/dulceria/tic-tac.jpg') },
  { id: 10, name: 'Gomas Trolli Sour Octopus', description: 'Caramelos de goma ácida en forma de pulpo 100g.', price: 3.5, category: 'individual', image: require('../assets/dulceria/gomas-trolli.jpg') },
  { id: 11, name: "Hershey's Milk Chocolate", description: 'Barra de chocolate con leche de 43g.', price: 3, category: 'individual', image: require('../assets/dulceria/hersheys.jpg') },
  { id: 12, name: "M&M's Milk Chocolate", description: 'Confites de chocolate con leche rellenos.', price: 3, category: 'individual', image: require('../assets/dulceria/mnm.jpg') }
];