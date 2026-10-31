const inputProducto = document.getElementById('producto');
const inputPeso = document.getElementById('peso');
const divSugerencias = document.getElementById('sugerencias');
const resultado = document.getElementById('resultado');

let resultados = [];      // lista actual de sugerencias
let indiceActivo = -1;    // cuál está resaltada (-1 = ninguna)
let productoSeleccionado = false;  // para saber si ya eligió uno

// ===== Buscar y mostrar sugerencias =====
async function buscar(q) {
    if (q === '') {
        ocultarSugerencias();
        return;
    }
    try {
        const respuesta = await fetch('/api/productos?q=' + encodeURIComponent(q));
        resultados = await respuesta.json();
        indiceActivo = -1;
        renderSugerencias(q);
    } catch (error) {
        console.error('Error buscando:', error);
    }
}

function renderSugerencias(q) {
    divSugerencias.innerHTML = '';

    if (resultados.length === 0) {
        ocultarSugerencias();
        return;
    }

    resultados.forEach(function(nombre, i) {
        const btn = document.createElement('button');
        btn.className = 'sugerencia';
        btn.type = 'button';
        btn.dataset.indice = i;

        // Resaltar coincidencia
        const idx = nombre.toLowerCase().indexOf(q.toLowerCase());
        if (idx >= 0) {
            btn.innerHTML =
                nombre.slice(0, idx) +
                '<span class="coincide">' + nombre.slice(idx, idx + q.length) + '</span>' +
                nombre.slice(idx + q.length);
        } else {
            btn.textContent = nombre;
        }

        btn.addEventListener('click', function() {
            seleccionar(i);
        });

        divSugerencias.appendChild(btn);
    });

    divSugerencias.classList.remove('oculto');
}

function ocultarSugerencias() {
    divSugerencias.classList.add('oculto');
    divSugerencias.innerHTML = '';
    resultados = [];
    indiceActivo = -1;
}

function actualizarActiva() {
    const botones = divSugerencias.querySelectorAll('.sugerencia');
    botones.forEach(function(b, i) {
        if (i === indiceActivo) {
            b.classList.add('activa');
            // Asegurar que se vea si hay scroll
            b.scrollIntoView({ block: 'nearest' });
        } else {
            b.classList.remove('activa');
        }
    });
}

function seleccionar(i) {
    if (i < 0 || i >= resultados.length) return;
    inputProducto.value = resultados[i];
    productoSeleccionado = true;
    ocultarSugerencias();
    inputPeso.focus();  // saltar directo al peso
}

// ===== Enviar al backend =====
async function enviarEntrada() {
    const producto = inputProducto.value.trim();
    const peso = parseFloat(inputPeso.value);

    if (!producto) {
        resultado.textContent = '⚠️ Falta el producto';
        resultado.style.color = '#e67e22';
        inputProducto.focus();
        return;
    }
    if (isNaN(peso) || peso <= 0) {
        resultado.textContent = '⚠️ El peso debe ser mayor a 0';
        resultado.style.color = '#e67e22';
        inputPeso.focus();
        return;
    }

    resultado.textContent = 'Guardando...';
    resultado.style.color = '#555';

    try {
        const respuesta = await fetch('/api/entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto: producto, peso: peso })
        });

        const datos = await respuesta.json();

        if (datos.ok) {
            resultado.textContent = '✅ ' + datos.mensaje;
            resultado.style.color = '#27ae60';
            // Limpiar y volver al producto
            inputProducto.value = '';
            inputPeso.value = '';
            productoSeleccionado = false;
            ocultarSugerencias();
            inputProducto.focus();
        } else {
            resultado.textContent = '❌ Error en el servidor';
            resultado.style.color = '#c0392b';
        }
    } catch (error) {
        resultado.textContent = '❌ No se pudo conectar: ' + error.message;
        resultado.style.color = '#c0392b';
    }
}

// ===== Eventos del input producto =====
inputProducto.addEventListener('input', function() {
    productoSeleccionado = false;
    const q = inputProducto.value.trim();
    buscar(q);
});

inputProducto.addEventListener('keydown', function(e) {
    const hayLista = !divSugerencias.classList.contains('oculto') && resultados.length > 0;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hayLista) {
            indiceActivo = (indiceActivo + 1) % resultados.length;
            actualizarActiva();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hayLista) {
            indiceActivo = (indiceActivo - 1 + resultados.length) % resultados.length;
            actualizarActiva();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (hayLista && indiceActivo >= 0) {
            // Selecciona el resaltado
            seleccionar(indiceActivo);
        } else if (hayLista && indiceActivo === -1) {
            // Sin resaltado pero hay lista: elegir el primero
            seleccionar(0);
        } else {
            // Sin lista: enviar (el foco ya está en producto y hay algo escrito)
            enviarEntrada();
        }
    } else if (e.key === 'Escape') {
        ocultarSugerencias();
    }
});

// ===== Eventos del input peso =====
inputPeso.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        enviarEntrada();
    }
});

// ===== Botón (por si se usa) =====
document.getElementById('btn-aceptar').addEventListener('click', enviarEntrada);

// Enfocar producto al entrar
inputProducto.focus();