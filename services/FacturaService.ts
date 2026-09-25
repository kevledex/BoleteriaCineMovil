import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { EntradaUsuario } from './api';

export interface DatosComprador {
  nombre: string;
  email: string;
}

let logoBase64Cache: string | null | undefined;

async function obtenerLogoBase64(): Promise<string | null> {
  if (logoBase64Cache !== undefined) return logoBase64Cache;

  try {
    const asset = Asset.fromModule(require('../assets/logo/logo-micine.png'));
    await asset.downloadAsync();

    const base64 = await FileSystem.readAsStringAsync(asset.localUri as string, {
      encoding: FileSystem.EncodingType.Base64
    });

    logoBase64Cache = `data:image/png;base64,${base64}`;
  } catch {
    logoBase64Cache = null;
  }

  return logoBase64Cache;
}

function moneda(valor: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(valor);
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function construirHtml(
  entrada: EntradaUsuario,
  comprador: DatosComprador,
  logo: string | null
): string {
  const subtotalDulceria = entrada.snacks.reduce(
    (total, item) => total + item.subtotal,
    0
  );
  const subtotalBoletos = entrada.total - subtotalDulceria;
  const precioPromedio =
    entrada.asientos.length > 0 ? subtotalBoletos / entrada.asientos.length : 0;

  const filas: { desc: string; cant: number; precio: string; sub: string }[] = [];

  if (entrada.asientos.length > 0) {
    filas.push({
      desc: `Entradas de cine · Asientos ${entrada.asientos.join(', ')}`,
      cant: entrada.asientos.length,
      precio: moneda(precioPromedio),
      sub: moneda(subtotalBoletos)
    });
  }

  for (const snack of entrada.snacks) {
    filas.push({
      desc: snack.nombre,
      cant: snack.cantidad,
      precio: moneda(snack.precioUnitario),
      sub: moneda(snack.subtotal)
    });
  }

  const filasHtml = filas
    .map(
      fila => `
        <tr>
          <td>${escapar(fila.desc)}</td>
          <td class="centro">${fila.cant}</td>
          <td class="derecha gris">${fila.precio}</td>
          <td class="derecha">${fila.sub}</td>
        </tr>`
    )
    .join('');

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 18mm;
    color: #111b28;
    font-size: 10pt;
  }
  .gris { color: #6e7b88; }
  .centro { text-align: center; }
  .derecha { text-align: right; }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 0.8mm solid #c99e2e;
    padding-bottom: 10mm;
    margin-bottom: 10mm;
  }
  .logo { width: 32mm; }
  .titulo-factura { text-align: right; }
  .titulo-factura h1 { margin: 0; font-size: 22pt; color: #111b28; }
  .titulo-factura p { margin: 2mm 0 0; font-size: 9pt; color: #6e7b88; }
  .cols {
    display: flex;
    justify-content: space-between;
    margin-bottom: 14mm;
    gap: 10mm;
  }
  .col { flex: 1; }
  .col h3 {
    margin: 0 0 2mm;
    color: #c99e2e;
    font-size: 9pt;
    letter-spacing: 0.05em;
  }
  .col .nombre { font-weight: bold; font-size: 11pt; color: #111b28; margin: 0 0 1mm; }
  .col p { margin: 0 0 1mm; font-size: 10pt; color: #6e7b88; }
  .card {
    background: #edf0f4;
    border-radius: 3mm;
    padding: 6mm;
    margin-bottom: 14mm;
  }
  .card h4 { margin: 0 0 2mm; font-size: 13pt; color: #111b28; }
  .card p { margin: 0; font-size: 9.5pt; color: #6e7b88; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10mm; }
  thead td {
    background: #111b28;
    color: #fff;
    font-weight: bold;
    font-size: 9pt;
    padding: 3mm;
  }
  tbody td {
    padding: 3mm;
    font-size: 9.5pt;
    border-bottom: 0.3mm solid #edf0f4;
  }
  tbody tr:nth-child(even) { background: #edf0f4; }
  .totales { width: 70mm; margin-left: auto; }
  .totales .fila {
    display: flex;
    justify-content: space-between;
    padding: 1mm 0;
    font-size: 9.5pt;
    color: #6e7b88;
  }
  .total-final {
    background: #f2c94c;
    border-radius: 2mm;
    padding: 3mm 4mm;
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    color: #111b28;
    font-size: 11pt;
    margin-top: 2mm;
  }
  .pie {
    border-top: 0.3mm solid #edf0f4;
    margin-top: 12mm;
    padding-top: 4mm;
    text-align: center;
    color: #6e7b88;
    font-size: 8.5pt;
  }
</style>
</head>
<body>
  <div class="header">
    ${logo ? `<img class="logo" src="${logo}" />` : '<div></div>'}
    <div class="titulo-factura">
      <h1>FACTURA</h1>
      <p>No. ${escapar(entrada.codigo)}</p>
      <p>Estado: ${escapar(entrada.estado)}</p>
    </div>
  </div>

  <div class="cols">
    <div class="col">
      <h3>FACTURADO A</h3>
      <p class="nombre">${escapar(comprador.nombre || 'Cliente Metrópoli Cine')}</p>
      <p>${escapar(comprador.email)}</p>
    </div>
    <div class="col">
      <h3>DETALLES DE LA COMPRA</h3>
      <p class="nombre">Fecha de compra: ${escapar(entrada.fechaCompra)}</p>
      <p>Código de reserva: ${escapar(entrada.codigo)}</p>
    </div>
  </div>

  <div class="card">
    <h4>${escapar(entrada.pelicula)}</h4>
    <p>${escapar(entrada.fechaFuncion)} · ${escapar(entrada.hora.slice(0, 5))} · ${escapar(entrada.formato)} · ${escapar(entrada.idioma)} · ${escapar(entrada.sala)}</p>
  </div>

  <table>
    <thead>
      <tr>
        <td>DESCRIPCIÓN</td>
        <td class="centro">CANT.</td>
        <td class="derecha">PRECIO UNIT.</td>
        <td class="derecha">SUBTOTAL</td>
      </tr>
    </thead>
    <tbody>
      ${filasHtml}
    </tbody>
  </table>

  <div class="totales">
    <div class="fila">
      <span>Subtotal boletos</span>
      <span>${moneda(subtotalBoletos)}</span>
    </div>
    ${
      subtotalDulceria > 0
        ? `<div class="fila">
            <span>Subtotal dulcería</span>
            <span>${moneda(subtotalDulceria)}</span>
          </div>`
        : ''
    }
    <div class="total-final">
      <span>TOTAL</span>
      <span>${moneda(entrada.total)}</span>
    </div>
  </div>

  <div class="pie">
    Gracias por tu compra en Metrópoli Cine · Conserva este comprobante como respaldo de tu compra.
  </div>
</body>
</html>`;
}

export const facturaService = {
  async generarYCompartir(
    entrada: EntradaUsuario,
    comprador: DatosComprador
  ): Promise<void> {
    const logo = await obtenerLogoBase64();
    const html = construirHtml(entrada, comprador, logo);

    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const disponible = await Sharing.isAvailableAsync();

    if (disponible) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Factura ${entrada.codigo}`,
        UTI: 'com.adobe.pdf'
      });
    } else {
      await Print.printAsync({ uri });
    }
  }
};
