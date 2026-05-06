// public/script.js

// 1. Función para LEER datos (READ)
async function cargarBitacora() {
    try {
        const respuesta = await fetch('/bitacora');
        const datos = await respuesta.json();
        const cuerpoTabla = document.querySelector('#tabla-observaciones tbody');
        
        cuerpoTabla.innerHTML = '';

        datos.forEach(obs => {
            const fila = document.createElement('tr');
            // Necesitamos acceder a los IDs para llenar el formulario al editar
           fila.innerHTML = `
                <td>${new Date(obs.fecha_observacion).toLocaleDateString()}</td>
                <td>${obs.nombre_astronomo}</td>
                <td>${obs.nombre_telescopio}</td>
                <td>${obs.cuerpo_celeste}</td>
                <td>${obs.categoria}</td> <td>${obs.hallazgo}</td>
                <td>
                    <button class="btn-edit" onclick="prepararEdicion(${obs.id_observacion}, ${obs.id_astronomo}, ${obs.id_telescopio}, ${obs.id_cuerpo}, '${obs.hallazgo}')">✏️ Editar</button>
                    <button class="btn-delete" onclick="eliminarRegistro(${obs.id_observacion})">🗑️ Borrar</button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar la bitácora:', error);
    }
}

// 2. Función para ELIMINAR un registro (DELETE)
async function eliminarRegistro(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este hallazgo estelar?')) {
        const respuesta = await fetch(`/eliminar-observacion/${id}`, { method: 'DELETE' });
        if (respuesta.ok) {
            cargarBitacora();
        }
    }
}

// 3. Preparar el formulario para EDITAR (Llenar campos)
function prepararEdicion(id_obs, id_astronomo, id_telescopio, id_cuerpo, hallazgo) {
    document.getElementById('id_observacion').value = id_obs;
    document.getElementById('id_astronomo').value = id_astronomo;
    document.getElementById('id_telescopio').value = id_telescopio;
    document.getElementById('id_cuerpo').value = id_cuerpo;
    document.getElementById('hallazgo').value = hallazgo;

    document.getElementById('titulo-formulario').innerText = "Editar Observación";
    document.getElementById('btn-guardar').innerText = "💾 Actualizar Registro";
    document.getElementById('btn-cancelar').style.display = "inline-block";
}

// 4. Cancelar Edición (Limpiar formulario)
function cancelarEdicion() {
    document.getElementById('formulario-bitacora').reset();
    document.getElementById('id_observacion').value = '';
    document.getElementById('titulo-formulario').innerText = "Registrar Nueva Observación";
    document.getElementById('btn-guardar').innerText = "🚀 Guardar en Base de Datos";
    document.getElementById('btn-cancelar').style.display = "none";
}

// 5. Manejar el envío del formulario (CREATE o UPDATE)
document.getElementById('formulario-bitacora').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue

    const id_obs = document.getElementById('id_observacion').value;
    
    // Recolectamos los datos
    const datosFormulario = {
        id_astronomo: document.getElementById('id_astronomo').value,
        id_telescopio: document.getElementById('id_telescopio').value,
        id_cuerpo: document.getElementById('id_cuerpo').value,
        hallazgo: document.getElementById('hallazgo').value
    };

    let ruta = '/guardar-observacion';
    let metodo = 'POST'; // Por defecto es CREATE

    // Si hay un ID en el campo oculto, es un UPDATE
    if (id_obs) {
        ruta = `/actualizar-observacion/${id_obs}`;
        metodo = 'PUT';
    }

    try {
        const respuesta = await fetch(ruta, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosFormulario)
        });

        if (respuesta.ok) {
            cancelarEdicion(); // Limpia el form
            cargarBitacora();  // Actualiza la tabla
        }
    } catch (error) {
        console.error('Error al guardar:', error);
    }
});

// Nota importante: Para que el CREATE funcione con JSON, necesitamos ajustar el server.js
// Ejecutar la carga al abrir la página
window.onload = cargarBitacora;