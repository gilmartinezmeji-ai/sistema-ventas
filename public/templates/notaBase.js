function generarTemplate(data, filas) {
return `
<html>
<head>
<meta charset="UTF-8">

<style>
@page { size: letter; margin: 0; }
body { margin: 0; font-family: Arial, sans-serif; }


.hoja {
  width: 216mm;
  min-height: 279mm;
  display: flex;
  flex-direction: column;
}
.nota {
  width: 100%;
  /* ❌ height: 50%; */
  padding: 8mm;
  box-sizing: border-box;
  border-bottom: 2px dashed #000;
  position: relative;
}
.nota {
  height: 50%;
  padding-bottom: 30mm; /* espacio para footer */
}
/* HEADER */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: black;
  color: white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
}

.titulos {
  text-align: center;
  flex-grow: 1;
}

.titulos h1 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.titulos h2 {
  margin: 0;
  font-size: 24px;
  color: #0b1c8c;
}

.folio {
  border: 1px solid black;
  padding: 5px 10px;
  font-size: 16px;
}

/* DATOS */
.datos {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
}

.datos td {
  border: 1px solid black;
  padding: 3px;
  font-size: 12px;
}

/* TABLA PRODUCTOS */
.tabla {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
}

.tabla th, .tabla td {
  border: 1px solid black;
  padding: 4px;
  font-size: 12px;
}

.tabla th {
  background: #cfcfcf;
}

/* NOTAS IMPORTANTES */
.info {
  font-size: 10px;
  text-align: center;
  margin-top: 5px;
}

/* NOTAS */
.notas {
  border: 1px solid black;
  height: 40px;
  margin-top: 5px;
  padding: 5px;
  font-size: 12px;
}

/* TOTALES */
.totales {
  margin-top: 10px;
}

.totales td {
  border: 1px solid black;
  padding: 5px;
  font-weight: bold;
}

/* FOOTER */
.footer {
  font-size: 10px;
  margin-top: 8px;
  text-align: left;
}

/* ORIGINAL / CLIENTE */
.tipo {
  position: absolute;
  bottom: 5mm;
  right: 8mm;
  font-weight: bold;
}
</style>

</head>

<body>

<div class="hoja">

  <div class="nota">
    ${contenido(data, filas)}
    <div class="tipo">ORIGINAL</div>
  </div>

  <div class="nota">
    ${contenido(data, filas)}
    <div class="tipo">CLIENTE</div>
  </div>

</div>

<script>
window.onload = () => window.print();
<\/script>

</body>
</html>
`;
}

function contenido(d, filas) {
return `

<!-- HEADER -->
<div class="header">
  <div class="logo">FINE</div>

  <div class="titulos">
    <h1>IMPRESIÓN DIGITAL FINE1</h1>
    <h2>NOTA DE VENTA</h2>
  </div>

  <div class="folio">${d.folio}</div>
</div>

<!-- DATOS -->
<table class="datos">
<tr>
<td><b>FECHA</b> ${d.fecha}</td>
<td><b>ENTREGA</b> ${d.fecha_entrega || ""}</td>
<td><b>TEL.</b> ${d.tel}</td>
</tr>
<tr>
<td><b>ENTREGA</b> ${d.fecha_entrega || ""}</td>
<td></td>
</tr>

<tr>
<td><b>NOMBRE</b> ${d.nombre}</td>
<td><b>HECHO POR</b> ${d.atiende}</td>
</tr>

<tr>
<td colspan="2"><b>CORREO</b> ${d.correo}</td>
</tr>
</table>

<!-- TABLA -->
<table class="tabla">
<tr>
<th style="width:10%">CANTIDAD</th>
<th>CONCEPTO</th>
<th style="width:15%">COSTO</th>
<th style="width:15%">IMPORTE</th>
</tr>

${filas}

</table>

<!-- INFO -->
<div class="info">
=== NOTAS IMPORTANTES: Tiempo de entrega a partir de 3 días hábiles. Dependiendo del trabajo requerido.
Se entrega después de las 6:30 pm. WAPP: 44.35.89.56.57 (Trabajos Urgentes tienen costo extra)
Una vez autorizada la impresión No hay Cambios ni Devoluciones. ===
</div>

<!-- NOTAS -->
<div class="notas">
${d.notas}
</div>

<!-- TOTALES -->
<table class="totales">
<tr><td>TOTAL $</td><td>${d.total}</td></tr>
<tr><td>A CUENTA $</td><td>${d.anticipo}</td></tr>
<tr><td>RESTAN $</td><td>${d.restante}</td></tr>
</table>

<!-- FOOTER -->
<div class="footer">
AV. SIERVO DE LA NACION 208-B COL LOMAS DEL VALLE, MORELIA MICH.
&nbsp;&nbsp; Cel 44 34 11 84 56 (Whatsapp)
&nbsp;&nbsp; Correo: impresiondigfine@gmail.com
</div>

`;
}
