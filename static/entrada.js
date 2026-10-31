document.getElementById('btn-aceptar').addEventListener('click', async function() {
    const producto = document.getElementById('producto').value.trim();
    const peso = document.getElementById('peso').value;
    const resultado = document.getElementById('resultado');

    if (!producto || !peso) {
        resultado.textContent = '⚠️ Falta producto o peso';
        resultado.style.color = '#e67e22';
        return;
    }

    resultado.textContent = 'Guardando...';
    resultado.style.color = '#555';

    try {
        const respuesta = await fetch('/api/entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto: producto, peso: parseFloat(peso) })
        });

        const datos = await respuesta.json();

        if (datos.ok) {
            resultado.textContent = '✅ ' + datos.mensaje;
            resultado.style.color = '#27ae60';
            document.getElementById('producto').value = '';
            document.getElementById('peso').value = '';
        } else {
            resultado.textContent = '❌ Error en el servidor';
            resultado.style.color = '#c0392b';
        }
    } catch (error) {
        resultado.textContent = '❌ No se pudo conectar: ' + error.message;
        resultado.style.color = '#c0392b';
    }
});