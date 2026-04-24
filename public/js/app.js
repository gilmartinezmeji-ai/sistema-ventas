// GENERAR FOLIO AUTOMÁTICO
let contador = localStorage.getItem("folio") || 1;

function generarFolio() {
  const folio = "NV-" + String(contador).padStart(4, '0');
  document.getElementById("folio").value = folio;
}



// CREAR FILAS AL CARGAR
document.addEventListener("DOMContentLoaded", () => {

 generarFolio();
  // 🔥 FECHA AUTOMÁTICA (HOY)
  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("fecha").value = hoy;

  // 🔥 CREAR FILAS
  const tabla = document.getElementById("tablaProductos");
  tabla.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    tabla.innerHTML += `
    <tr>
      <td><input type="number" class="cant"></td>
      <td><input type="text" class="concepto"></td>
      <td><input type="number" class="costo"></td>
      <td><input type="text" class="importe" readonly></td>
    </tr>
    `;
  }

});

// CALCULOS AUTOMÁTICOS
document.addEventListener("input", calcular);

function calcular() {
  let total = 0;

  const filas = document.querySelectorAll("#tablaProductos tr");

  filas.forEach(fila => {
    const cant = parseFloat(fila.querySelector(".cant").value) || 0;
    const costo = parseFloat(fila.querySelector(".costo").value) || 0;

    const importe = cant * costo;
    fila.querySelector(".importe").value = importe.toFixed(2);

    total += importe;
  });

  document.getElementById("total").value = total.toFixed(2);

  const anticipo = parseFloat(document.getElementById("anticipo").value) || 0;
  const restante = total - anticipo;

  document.getElementById("restante").value = restante.toFixed(2);
}

async function generarNota() {
  try {
    console.log("1. Guardando venta...");

    // 🔥 GUARDAR Y RECIBIR FOLIO REAL
    const ventaGuardada = await guardarVenta();

    // 🔥 ACTUALIZAR INPUT FOLIO
    document.getElementById("folio").value = ventaGuardada.folio;

    console.log("2. Generando datos PDF...");

    const filas = document.querySelectorAll("#tablaProductos tr");

    let filasHTML = "";

    filas.forEach(fila => {
      const cantidad = fila.querySelector(".cant").value || "";
      const concepto = fila.querySelector(".concepto").value || "";
      const costo = fila.querySelector(".costo").value || "";
      const importe = fila.querySelector(".importe").value || "";

      filasHTML += `
        <tr>
          <td>${cantidad}</td>
          <td>${concepto}</td>
          <td>${costo}</td>
          <td>${importe}</td>
        </tr>
      `;
    });

    const datos = {
      folio: ventaGuardada.folio, // 🔥 USAR EL NUEVO
      fecha: document.getElementById("fecha").value,
      nombre: document.getElementById("nombre").value,
      tel: document.getElementById("tel").value,
      correo: document.getElementById("correo").value,
      atiende: document.getElementById("atiende").value,
      total: document.getElementById("total").value,
      anticipo: document.getElementById("anticipo").value,
      restante: document.getElementById("restante").value,
      notas: document.getElementById("notas").value,
      filas: filasHTML
    };

    console.log("3. Generando PDF...");
console.log("FECHA ENTREGA:", document.getElementById("fecha_entrega").value);
console.log("3. Generando PDF...");
console.log("FECHA ENTREGA:", document.getElementById("fecha_entrega"));
console.log("VALOR:", document.getElementById("fecha_entrega")?.value);

const res = await fetch("/generar-pdf", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(datos)
});

let data;

try {
  data = await res.json();
} catch {
  throw new Error("El servidor no devolvió JSON");
}

if (!res.ok) {
  throw new Error(data.error || "Error generando PDF");
}

// 🔥 AQUÍ SÍ
window.open(data.ruta, "_blank");
    // 🔥 ABRIR PDF AUTOMÁTICO
    window.open(data.ruta, "_blank");

    alert("✅ Nota generada correctamente");

  } catch (error) {
    console.error("ERROR REAL:", error);
    alert("❌ " + error.message);
  }
}


async function guardarVenta() {

  const filas = document.querySelectorAll("#tablaProductos tr");

  let productos = [];

  filas.forEach(fila => {
    productos.push({
      cantidad: fila.querySelector(".cant").value || "",
      concepto: fila.querySelector(".concepto").value || "",
      costo: fila.querySelector(".costo").value || "",
      importe: fila.querySelector(".importe").value || ""
    });
  });

  const venta = {
    fecha: document.getElementById("fecha").value,
    fecha_entrega: document.getElementById("fecha_entrega").value,
    nombre: document.getElementById("nombre").value,
    tel: document.getElementById("tel").value,
    correo: document.getElementById("correo").value,
    atiende: document.getElementById("atiende").value,
    total: document.getElementById("total").value,
    anticipo: document.getElementById("anticipo").value,
    restante: document.getElementById("restante").value,
    notas: document.getElementById("notas").value,
    productos: productos
    
  };

  const res = await fetch("/guardar-venta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(venta)
  });

  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("El servidor no respondió JSON");
  }

  if (!res.ok) {
    throw new Error(data.error || "Error guardando venta");
  }

  return data; // 🔥 AQUÍ VIENE EL FOLIO NUEVO
}