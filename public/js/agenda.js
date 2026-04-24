const flujo = [
  "pendiente",
  "diseno",
  "autorizacion",
  "produccion",
  "finalizado",
  "entregado"
];

let cache = [];

// 🔥 CARGAR
async function cargar() {
  try {
    const res = await fetch('/api/trabajos?nocache=' + Date.now());
    if (!res.ok) throw new Error("Error servidor");

    const data = await res.json();
    cache = data;

    renderizar();

  } catch (error) {
    console.error("Error cargando:", error);
  }
}

// 🔥 RENDER
function renderizar() {
  const pendientesDiv = document.getElementById('pendientes');
  const terminadosDiv = document.getElementById('terminados');

  pendientesDiv.innerHTML = "";
  terminadosDiv.innerHTML = "";

  const hoy = new Date();

  // 🔥 ORDENAR POR FECHA ENTREGA
  const ordenados = [...cache].sort((a, b) => {
    return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
  });

  ordenados.forEach(t => {
    const estado = (t.estado || "pendiente").toLowerCase();

    const card = crearCard(t, hoy);

    // 🔥 PENDIENTES
    if (["pendiente", "diseno", "autorizacion", "produccion"].includes(estado)) {
      pendientesDiv.appendChild(card);
    } 
    // 🔽 TERMINADOS
    else {
      terminadosDiv.appendChild(card);
    }
  });
}
// crear card
function crearCard(t, hoy) {
  console.log(t);

  const estado = (t.estado || "pendiente").toLowerCase();

  const productosHTML = (t.productos || [])
    .filter(p => p.cantidad || p.concepto)
    .map(p => `<div>• ${p.cantidad || ""} ${p.concepto || ""}</div>`)
    .join("");

  // 🔥 FECHA ENTREGA SEGURA
  const fechaEntregaRaw = t.fecha_entrega;
  const fechaEntrega = fechaEntregaRaw ? new Date(fechaEntregaRaw) : null;

  let alertaClase = "";

  if (fechaEntrega) {
    const diffDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) alertaClase = "rojo";
    else if (diffDias <= 1) alertaClase = "amarillo";
  }

  const div = document.createElement('div');
  div.className = `card ${estado} ${alertaClase}`;

  div.innerHTML = `
  <b>Folio: ${t.id}</b><br>
  <b>${t.cliente || "Sin nombre"}</b><br>

  ${productosHTML}

  <br>
  📅 Registro: ${t.fecha_creacion || ""}<br>
  🚚 Entrega: ${t.fecha_entrega || "Sin definir"} ${t.hora_entrega || ""}<br>
  📞 ${t.telefono || ""}<br>
  📝 ${t.notas || ""}<br>
  Estado: ${estado.replace("_", " ").toUpperCase()}<br>
  ${estado !== "entregado" ? `
  <button onclick="avanzar('${t.id}', '${estado}')">➡ Avanzar</button>
` : ""}

${estado !== "pendiente" ? `
  <button onclick="retroceder('${t.id}', '${estado}')">⬅ Retroceder</button>
` : ""}
`;

  return div;
}

// 🔥 AVANZAR
async function avanzar(id, estadoActual) {
  const index = flujo.indexOf(estadoActual);

  if (index === -1 || index >= flujo.length - 1) return;

  const nuevoEstado = flujo[index + 1];
  await actualizarEstado(id, nuevoEstado);
}

// 🔥 RETROCEDER
async function retroceder(id, estadoActual) {
  const index = flujo.indexOf(estadoActual);

  if (index <= 0) return;

  const nuevoEstado = flujo[index - 1];
  await actualizarEstado(id, nuevoEstado);
}

// 🔥 ACTUALIZAR ESTADO
async function actualizarEstado(id, estado) {
  try {
    await fetch('/api/trabajos/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });

    cache = cache.map(t => t.id === id ? { ...t, estado } : t);
    renderizar();

  } catch (error) {
    console.error("Error actualizando:", error);
  }
}

// 🔽 TOGGLE TERMINADOS
function toggleTerminados() {
  const cont = document.getElementById('terminadosContainer');
  cont.style.display = cont.style.display === "none" ? "block" : "none";
}

// 🔎 BUSCAR EN TERMINADOS
function buscarTerminados(texto) {
  const cards = document.querySelectorAll("#terminados .card");

  cards.forEach(card => {
    const contenido = card.innerText.toLowerCase();
    card.style.display = contenido.includes(texto.toLowerCase()) ? "block" : "none";
  });
}

// 📄 GENERAR PDF (PENDIENTES)
function generarPDF() {
  const fecha = new Date().toLocaleString();

  const pendientes = cache.filter(t =>
    ["pendiente", "diseno", "autorizacion", "produccion"].includes(t.estado)
  );

  let html = `
    <h2>Pendientes - ${fecha}</h2>
    <hr>
  `;

  pendientes.forEach(t => {
    const productos = (t.productos || [])
      .map(p => `• ${p.cantidad || ""} ${p.concepto || ""}`)
      .join("<br>");

    html += `
      <div style="margin-bottom:10px;">
        <b>Folio:</b> ${t.id}<br>
        <b>Cliente:</b> ${t.cliente}<br>
        <b>Entrega:</b> ${t.fecha_entrega}<br>
        <b>Estado:</b> ${t.estado}<br>
        <b>Productos:</b><br>${productos}
      </div>
      <hr>
    `;
  });

  const win = window.open("", "", "width=800,height=600");
  win.document.write(html);
  win.document.close();
  win.print();
}

// 🔥 INICIO
cargar();
setInterval(cargar, 10000);