const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

console.log("🔥 INICIANDO SERVER...");

const app = express();

// =============================
// 🔥 MIDDLEWARES
// =============================
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

// =============================
// 📁 ARCHIVOS BD
// =============================
const FILE_VENTAS = "ventas.json";
const FILE_TRABAJOS = "./data/trabajos.json";

// =============================
// 🧾 FUNCIONES VENTAS
// =============================
function leerVentas() {
  if (!fs.existsSync(FILE_VENTAS)) return [];
  return JSON.parse(fs.readFileSync(FILE_VENTAS, "utf8"));
}

function guardarVentas(data) {
  fs.writeFileSync(FILE_VENTAS, JSON.stringify(data, null, 2));
}

// =============================
// 🧠 FUNCIONES TRABAJOS
// =============================
let trabajos = [];

if (fs.existsSync(FILE_TRABAJOS)) {
  trabajos = JSON.parse(fs.readFileSync(FILE_TRABAJOS, "utf8"));
} else {
  fs.mkdirSync("./data", { recursive: true });
  fs.writeFileSync(FILE_TRABAJOS, "[]");
  trabajos = [];
}

function guardarTrabajos() {
  fs.writeFileSync(FILE_TRABAJOS, JSON.stringify(trabajos, null, 2));
}

// =============================
// 🔥 GENERAR FOLIO
// =============================
function generarFolio(ventas) {
  if (ventas.length === 0) return "NV-0001";

  let max = 0;

  ventas.forEach(v => {
    if (v.folio) {
      const num = parseInt(v.folio.split("-")[1]);
      if (!isNaN(num) && num > max) {
        max = num;
      }
    }
  });

  const nuevo = max + 1;

  return "NV-" + String(nuevo).padStart(4, "0");
}
// =============================
// 🧾 GENERAR PDF
// =============================
app.post("/generar-pdf", async (req, res) => {
  const data = req.body;

  try {
    console.log("🔥 Generando PDF...");

    const browser = await puppeteer.launch({
      headless: "new"
    });

    const page = await browser.newPage();

    let html = fs.readFileSync(
      path.join(__dirname, "public/templates/nota.html"),
      "utf8"
    );

    const generarContenido = (d) => `
<div>
  <h2>IMPRECIÓN DIGITAL FINE</h2>

  <table>
    <tr>
      <td><b>FECHA:</b> ${d.fecha}</td>
      <td><b>TEL:</b> ${d.tel}</td>
    </tr>
    <tr>
      <td><b>NOMBRE:</b> ${d.nombre}</td>
      <td><b>ATIENDE:</b> ${d.atiende}</td>
    </tr>
    <tr>
      <td colspan="2"><b>CORREO:</b> ${d.correo}</td>
    </tr>
  </table>

  <table class="tabla">
    <tr>
      <th>CANT</th>
      <th>CONCEPTO</th>
      <th>COSTO</th>
      <th>IMPORTE</th>
    </tr>
    ${d.filas}
  </table>

  <table class="totales">
    <tr><td>TOTAL</td><td>${d.total}</td></tr>
    <tr><td>ANTICIPO</td><td>${d.anticipo}</td></tr>
    <tr><td>RESTANTE</td><td>${d.restante}</td></tr>
  </table>

  <div><b>NOTAS:</b> ${d.notas}</div>
</div>
<!-- 🔥 NOTAS IMPORTANTES -->
<div style="font-size:10px; text-align:center; margin-top:6px;">
=== NOTAS IMPORTANTES: Tiempo de entrega a partir de 3 días hábiles. Dependiendo del trabajo requerido.
Se entrega después de las 6:30 pm. WAPP: 44.35.89.56.57 (Trabajos Urgentes tienen costo extra)
Una vez autorizada la impresión No hay Cambios ni Devoluciones. ===
</div>
<div style="margin-top:8px; font-size:10px;">
  AV. SIERVO DE LA NACION 208-B COL LOMAS DEL VALLE, MORELIA MICH.<br>
  Cel 44 34 11 84 56 (Whatsapp)<br>
  Correo: impresiondigfine@gmail.com
</div>
`;

    html = html.replaceAll("{{contenido}}", generarContenido(data));
    html = html.replaceAll("{{folio}}", data.folio);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "letter",
      printBackground: true
    });

    await browser.close();

    console.log("📄 PDF generado");

    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");

    const carpeta = path.join(__dirname, "pdfs", `${year}-${month}`);

    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }

    const nombreArchivo = `nota-${data.folio}-${Date.now()}.pdf`;
    const rutaArchivo = path.join(carpeta, nombreArchivo);

    fs.writeFileSync(rutaArchivo, pdf);

    console.log("✅ PDF guardado");

    res.json({
      ok: true,
      ruta: `/pdfs/${year}-${month}/${nombreArchivo}`
    });

  } catch (error) {
    console.log("❌ ERROR REAL:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================
// 💾 GUARDAR VENTA + TRABAJO
// =============================
app.post("/guardar-venta", (req, res) => {
  console.log("🔥 POST /guardar-venta recibido");

  try {
    const ventas = leerVentas();

    const nuevoFolio = generarFolio(ventas);

    const nuevaVenta = { 
      ...req.body,
      folio: nuevoFolio,
      fechaGuardado: new Date().toLocaleString()
    };

    ventas.push(nuevaVenta);
    guardarVentas(ventas);

    const yaExiste = trabajos.find(t => t.id === nuevoFolio);

    if (!yaExiste) {
      const nuevoTrabajo = {
        id: nuevoFolio,
        cliente: req.body.nombre,
        telefono: req.body.tel || "",
        productos: req.body.productos || [],
        descripcion: "Trabajo desde venta",
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_entrega: req.body.fechaEntrega || new Date().toISOString().split('T')[0],
        hora_entrega: req.body.horaEntrega || "18:00",
        estado: "pendiente",
        prioridad: "media",
        avance: 0,
        notas: req.body.notas || "",
        responsable: "Beto",
        fecha_actualizacion: new Date().toISOString().split('T')[0]
      };

      trabajos.push(nuevoTrabajo);
      guardarTrabajos();
    }

    res.json({ ok: true, folio: nuevoFolio });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ error: "Error guardando venta" });
  }
});

// =============================
// 📋 API TRABAJOS
// =============================
app.get("/api/trabajos", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(trabajos);
});

app.put("/api/trabajos/:id", (req, res) => {
  const { id } = req.params;
  const { estado, avance } = req.body;

  const trabajo = trabajos.find(t => t.id === id);

  if (trabajo) {
    if (estado) trabajo.estado = estado;
    if (avance !== undefined) trabajo.avance = avance;

    trabajo.fecha_actualizacion = new Date().toISOString().split('T')[0];

    guardarTrabajos();
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "No encontrado" });
  }
});

// =============================
// 🚀 SERVIDOR
// =============================
app.use(express.static("public"));

// 🔥 ESTO ES LA CLAVE
// 🔥 PRIMERO esto
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "agenda.html"));
});

// 🔥 DESPUÉS static
app.use(express.static("public"));