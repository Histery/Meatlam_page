// ===== Buscador de productos =====
const inputProducto = document.getElementById('producto');
const divSugerencias = document.getElementById('sugerencias');
let productosCache = [];

async function cargarSugerencias(q) {
    try {
        const url = q ? '/api/productos?q=' + encodeURIComponent(q) : '/api/productos';
        const respuesta = await fetch(url);
        const lista = await respuesta.json();
        mostrarSugerencias(lista, q);
    } catch (error) {
        console.error('Error buscando:', error);
    }
}

function mostrarSugerencias(lista, q) {
    divSugerencias.innerHTML = '';
    lista.forEach(function(nombre) {
        const btn = document.createElement('button');
        btn.className = 'sugerencia';
        btn.type = 'button';
        // Resaltar la coincidencia
        if (q) {
            const idx = nombre.toLowerCase().indexOf(q.toLowerCase());
            if (idx >= 0) {
                btn.innerHTML =
                    nombre.slice(0, idx) +
                    '<span class="coincide">' + nombre.slice(idx, idx + q.length) + '</span>' +
                    nombre.slice(idx + q.length);
            } else {
                btn.textContent = nombre;
            }
        } else {
            btn.textContent = nombre;
        }
        btn.addEventListener('click', function() {
            inputProducto.value = nombre;
            divSugerencias.innerHTML = '';
        });
        divSugerencias.appendChild(btn);
    });
}

inputProducto.addEventListener('input', function() {
    const q = inputProducto.value.trim();
    cargarSugerencias(q);
});

// Cargar favoritos al entrar
cargarSugerencias('');

// ===== Teclado numérico =====
let pesoTexto = '';  // lo que se va tecleando como texto
const displayPeso = document.getElementById('display-peso');

function actualizarDisplay() {
    if (pesoTexto === '') {
        displayPeso.textContent = '0.000';
    } else {
        // Si termina en punto, mostrar el punto tal cual
        if (pesoTexto.endsWith('.')) {
            displayPeso.textContent = pesoTexto;
        } else {
            // Formatear con 3 decimales solo si ya hay punto
            const num = parseFloat(pesoTexto);
            if (isNaN(num)) {
                displayPeso.textContent = '0.000';
            } else if (pesoTexto.includes('.')) {
                displayPeso.textContent = pesoTexto;
            } else {
                displayPeso.textContent = pesoTexto;
            }
        }
    }
}

document.querySelectorAll('.tecla').forEach(function(tecla) {
    tecla.addEventListener('click', function() {
        const num = tecla.getAttribute('data-num');
        const accion = tecla.getAttribute('data-accion');

        if (accion === 'borrar') {
            pesoTexto = pesoTexto.slice(0, -1);
        } else if (num === '.') {
            // Solo un punto decimal
            if (!pesoTexto.includes('.')) {
                if (pesoTexto === '') pesoTexto = '0';
                pesoTexto += '.';
            }
        } else {
            // Evitar más de 3 decimales
            if (pesoTexto.includes('.')) {
                const decimales = pesoTexto.split('.')[1];
                if (decimales.length >= 3) return;
            }
            pesoTexto += num;
        }
        actualizarDisplay();
    });
});

// ===== Botón Aceptar =====
document.getElementById('btn-aceptar').addEventListener('click', async function() {
    const producto = document.getElementById('producto').value.trim();
    const peso = parseFloat(pesoTexto);
    const resultado = document.getElementById('resultado');

    if (!producto) {
        resultado.textContent = '⚠️ Falta el producto';
        resultado.style.color = '#e67e22';
        return;
    }
    if (isNaN(peso) || peso <= 0) {
        resultado.textContent = '⚠️ El peso debe ser mayor a 0';
        resultado.style.color = '#e67e22';
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
            document.getElementById('producto').value = '';
            pesoTexto = '';
            actualizarDisplay();
        } else {
            resultado.textContent = '❌ Error en el servidor';
            resultado.style.color = '#c0392b';
        }
    } catch (error) {
        resultado.textContent = '❌ No se pudo conectar: ' + error.message;
        resultado.style.color = '#c0392b';
    }
});

// Inicializar
actualizarDisplay();