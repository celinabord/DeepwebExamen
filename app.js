// ===== CONFIGURACIÓN Y CONSTANTES =====
const ADMIN_PASSWORD = "Teamopi91";
const DURACION_CLAVE_HORAS = 48;
const URL_CLAVE_CONFIG = 'clave_config.json';

// ===== VARIABLES GLOBALES =====
let claveAlumno = null;
let fechaExpiracionClave = null;
let nombreAlumno = '';
let preguntasExamen = [];
let respuestasAlumno = [];
let preguntaActualIndex = 0;
let especialidadSeleccionada = '';
let tiempoRestante = 240 * 60; // 4 horas en segundos
let intervaloCronometro = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async () => {
    await cargarClaveDesdeServidor();
    mostrarPantalla('seleccionRol');
});

// ===== GESTIÓN DE CLAVES =====
async function cargarClaveDesdeServidor() {
    try {
        const response = await fetch(URL_CLAVE_CONFIG + '?t=' + new Date().getTime());
        if (response.ok) {
            const config = await response.json();
            claveAlumno = config.claveAlumno;
            fechaExpiracionClave = config.fechaExpiracion;
            console.log('Clave cargada desde servidor:', claveAlumno);
        } else {
            console.error('Error al cargar configuración de clave');
            generarClaveTemporal();
        }
    } catch (error) {
        console.error('Error al conectar con servidor:', error);
        generarClaveTemporal();
    }
}

function generarClaveTemporal() {
    claveAlumno = 'DEMO2025';
    fechaExpiracionClave = new Date().getTime() + (DURACION_CLAVE_HORAS * 60 * 60 * 1000);
    console.log('Usando clave temporal:', claveAlumno);
}

async function generarNuevaClave() {
    const nuevaClave = prompt('Ingrese la nueva clave para los alumnos (o deje vacío para generar una aleatoria):');
    
    if (nuevaClave === null) return; // Usuario canceló
    
    const clave = nuevaClave.trim() || Math.random().toString(36).substring(2, 10).toUpperCase();
    const duracionHoras = prompt('¿Cuántas horas será válida esta clave?', '48');
    
    if (!duracionHoras) return;
    
    const horas = parseInt(duracionHoras);
    const expiracion = new Date().getTime() + (horas * 60 * 60 * 1000);
    
    claveAlumno = clave;
    fechaExpiracionClave = expiracion;
    
    actualizarPanelAdmin();
    
    alert(`⚠️ IMPORTANTE: Debes actualizar manualmente el archivo clave_config.json con:\n\n{\n  "claveAlumno": "${clave}",\n  "fechaExpiracion": ${expiracion},\n  "activo": true\n}\n\nLuego hacer commit y push a GitHub para que funcione en Netlify.`);
}

function copiarClave() {
    const claveTexto = document.getElementById('claveActual').textContent;
    navigator.clipboard.writeText(claveTexto).then(() => {
        const mensaje = document.getElementById('mensajeCopiado');
        mensaje.textContent = 'Clave copiada al portapapeles';
        setTimeout(() => {
            mensaje.textContent = '';
        }, 3000);
    });
}

// ===== NAVEGACIÓN ENTRE PANTALLAS =====
function mostrarPantalla(idPantalla) {
    const pantallas = document.querySelectorAll('.screen');
    pantallas.forEach(pantalla => {
        pantalla.classList.remove('active');
    });
    document.getElementById(idPantalla).classList.add('active');
}

function volverInicio() {
    limpiarDatos();
    mostrarPantalla('seleccionRol');
}

function limpiarDatos() {
    nombreAlumno = '';
    preguntasExamen = [];
    respuestasAlumno = [];
    preguntaActualIndex = 0;
    especialidadSeleccionada = '';
    detenerCronometro();
    tiempoRestante = 240 * 60;
    
    document.getElementById('inputClaveAdmin').value = '';
    document.getElementById('inputNombreAlumno').value = '';
    document.getElementById('inputClaveAlumno').value = '';
    document.getElementById('mensajeErrorAdmin').textContent = '';
    document.getElementById('mensajeErrorAlumno').textContent = '';
}

// ===== AUTENTICACIÓN =====
function mostrarLoginAdmin() {
    mostrarPantalla('loginAdmin');
}

function validarAdmin() {
    const claveIngresada = document.getElementById('inputClaveAdmin').value;
    const mensajeError = document.getElementById('mensajeErrorAdmin');
    
    if (claveIngresada === ADMIN_PASSWORD) {
        mensajeError.textContent = '';
        actualizarPanelAdmin();
        mostrarPantalla('panelAdmin');
    } else {
        mensajeError.textContent = 'Clave incorrecta';
    }
}

function actualizarPanelAdmin() {
    document.getElementById('claveActual').textContent = claveAlumno;
    const fechaExp = new Date(fechaExpiracionClave);
    document.getElementById('fechaExpiracion').textContent = fechaExp.toLocaleString('es-AR');
    
    // Actualizar estadísticas
    mostrarEstadisticas();
}

async function mostrarEstadisticas() {
    let estadisticas = [];
    
    // Intentar obtener desde Firebase primero
    if (typeof obtenerEstadisticasFirebase !== 'undefined') {
        try {
            const firebaseData = await obtenerEstadisticasFirebase();
            if (firebaseData && firebaseData.length > 0) {
                estadisticas = firebaseData;
                console.log('📊 Mostrando estadísticas desde Firebase');
            }
        } catch (error) {
            console.warn('Error al obtener datos de Firebase, usando localStorage:', error);
        }
    }
    
    // Si no hay datos de Firebase, usar localStorage
    if (estadisticas.length === 0) {
        estadisticas = JSON.parse(localStorage.getItem('estadisticasExamenes') || '[]');
        console.log('📊 Mostrando estadísticas desde localStorage');
    }
    
    // Calcular totales
    const totalExamenes = estadisticas.length;
    const aprobados = estadisticas.filter(e => e.aprobado).length;
    const reprobados = totalExamenes - aprobados;
    const porcentajeAprobacion = totalExamenes > 0 ? Math.round((aprobados / totalExamenes) * 100) : 0;
    
    // Actualizar resumen
    document.getElementById('totalExamenes').textContent = totalExamenes;
    document.getElementById('totalAprobados').textContent = aprobados;
    document.getElementById('totalReprobados').textContent = reprobados;
    document.getElementById('porcentajeAprobacion').textContent = porcentajeAprobacion + '%';
    
    // Mostrar lista detallada
    const listaEstadisticas = document.getElementById('listaEstadisticas');
    listaEstadisticas.innerHTML = '';
    
    if (totalExamenes === 0) {
        listaEstadisticas.innerHTML = '<p style="text-align: center; color: #999;">No hay exámenes registrados aún.</p>';
        return;
    }
    
    // Ordenar por fecha más reciente
    estadisticas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    estadisticas.forEach((est, index) => {
        const fecha = new Date(est.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-AR') + ' ' + fecha.toLocaleTimeString('es-AR');
        const tiempoMinutos = Math.floor(est.tiempoUsado / 60);
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `estadistica-item ${est.aprobado ? 'aprobado' : 'reprobado'}`;
        itemDiv.innerHTML = `
            <div class="estadistica-header">
                <span class="estadistica-nombre"><i class="fas fa-user"></i> ${est.nombre}</span>
                <span class="estadistica-estado ${est.aprobado ? 'badge-success' : 'badge-danger'}">
                    ${est.aprobado ? '✓ Aprobado' : '✗ Reprobado'}
                </span>
            </div>
            <div class="estadistica-detalles">
                <div class="detalle-item">
                    <i class="fas fa-stethoscope"></i>
                    <span>${est.especialidad}</span>
                </div>
                <div class="detalle-item">
                    <i class="fas fa-calendar"></i>
                    <span>${fechaFormateada}</span>
                </div>
                <div class="detalle-item">
                    <i class="fas fa-chart-pie"></i>
                    <span>${est.porcentaje}% (${est.correctas}/${est.total})</span>
                </div>
                <div class="detalle-item">
                    <i class="fas fa-clock"></i>
                    <span>${tiempoMinutos} minutos</span>
                </div>
            </div>
        `;
        listaEstadisticas.appendChild(itemDiv);
    });
}

async function limpiarEstadisticas() {
    if (confirm('¿Está seguro de eliminar TODAS las estadísticas?\n\nEsta acción no se puede deshacer y eliminará los datos de la nube y del almacenamiento local.')) {
        // Limpiar localStorage
        localStorage.removeItem('estadisticasExamenes');
        
        // Limpiar Firebase si está habilitado
        if (typeof limpiarEstadisticasFirebase !== 'undefined') {
            try {
                await limpiarEstadisticasFirebase();
            } catch (error) {
                console.warn('Error al limpiar Firebase:', error);
            }
        }
        
        await mostrarEstadisticas();
        alert('Estadísticas eliminadas exitosamente de todos los sistemas.');
    }
}

async function exportarEstadisticas() {
    let estadisticas = [];
    
    // Intentar obtener desde Firebase primero
    if (typeof obtenerEstadisticasFirebase !== 'undefined') {
        try {
            const firebaseData = await obtenerEstadisticasFirebase();
            if (firebaseData && firebaseData.length > 0) {
                estadisticas = firebaseData;
            }
        } catch (error) {
            console.warn('Error al obtener datos de Firebase para exportar:', error);
        }
    }
    
    // Si no hay datos de Firebase, usar localStorage
    if (estadisticas.length === 0) {
        estadisticas = JSON.parse(localStorage.getItem('estadisticasExamenes') || '[]');
    }
    
    if (estadisticas.length === 0) {
        alert('No hay estadísticas para exportar.');
        return;
    }
    
    // Convertir a CSV
    let csv = 'Nombre,Especialidad,Fecha,Correctas,Incorrectas,Total,Porcentaje,Estado,Tiempo (min)\n';
    
    estadisticas.forEach(est => {
        const fecha = new Date(est.fecha).toLocaleString('es-AR');
        const tiempoMinutos = Math.floor(est.tiempoUsado / 60);
        csv += `"${est.nombre}","${est.especialidad}","${fecha}",${est.correctas},${est.incorrectas},${est.total},${est.porcentaje}%,"${est.aprobado ? 'Aprobado' : 'Reprobado'}",${tiempoMinutos}\n`;
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estadisticas_examenes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function mostrarLoginAlumno() {
    mostrarPantalla('loginAlumno');
}

function validarAlumno() {
    const nombre = document.getElementById('inputNombreAlumno').value.trim();
    const claveIngresada = document.getElementById('inputClaveAlumno').value.trim();
    const mensajeError = document.getElementById('mensajeErrorAlumno');
    
    if (!nombre) {
        mensajeError.textContent = 'Por favor ingrese su nombre o ID';
        return;
    }
    
    if (claveIngresada !== claveAlumno) {
        mensajeError.textContent = 'Clave incorrecta';
        return;
    }
    
    // Verificar si la clave no ha expirado
    if (new Date().getTime() > fechaExpiracionClave) {
        mensajeError.textContent = 'La clave ha expirado. Contacte al administrador.';
        return;
    }
    
    nombreAlumno = nombre;
    mensajeError.textContent = '';
    mostrarPantalla('seleccionEspecialidad');
}

// ===== CARGA DE PREGUNTAS =====
async function cargarPreguntas(especialidad) {
    try {
        const response = await fetch(`data_final/${especialidad}.json`);
        if (!response.ok) {
            throw new Error(`Error al cargar: ${response.status}`);
        }
        
        // Obtener el texto crudo primero
        const textoJSON = await response.text();
        
        // Intentar parsear el JSON, con manejo de errores
        let todasPreguntas;
        try {
            todasPreguntas = JSON.parse(textoJSON);
        } catch (parseError) {
            console.error('Error al parsear JSON:', parseError);
            // Intentar limpiar el JSON
            let textoLimpio = textoJSON
                .replace(/,(\s*[}\]])/g, '$1')  // Remover comas antes de } o ]
                .replace(/\}(\s*)\{/g, '},\n$1{')  // Agregar comas entre objetos
                .replace(/[\x00-\x1f\x7f-\x9f]/g, ' ');  // Remover caracteres de control
            
            try {
                todasPreguntas = JSON.parse(textoLimpio);
            } catch (segundoError) {
                throw new Error(`No se puede parsear el archivo JSON: ${parseError.message}`);
            }
        }
        
        // Si el JSON tiene estructura con objeto raíz y array "preguntas"
        if (todasPreguntas && todasPreguntas.preguntas && Array.isArray(todasPreguntas.preguntas)) {
            todasPreguntas = todasPreguntas.preguntas;
        }
        
        // Si no es un array, convertirlo en uno
        if (!Array.isArray(todasPreguntas)) {
            todasPreguntas = [todasPreguntas];
        }
        
        // Normalizar formato de preguntas (soporta múltiples formatos)
        const preguntasNormalizadas = normalizarPreguntas(todasPreguntas);
        
        // Filtrar preguntas válidas
        const preguntasValidas = preguntasNormalizadas.filter(p => 
            p && p.pregunta && p.opciones && p.respuesta_correcta
        );
        
        if (preguntasValidas.length === 0) {
            throw new Error('No se encontraron preguntas válidas en el archivo');
        }
        
        console.log(`Cargadas ${preguntasValidas.length} preguntas válidas de ${especialidad}`);
        
        // Seleccionar 100 preguntas aleatorias (o todas si hay menos de 100)
        const cantidad = Math.min(100, preguntasValidas.length);
        const preguntasSeleccionadas = seleccionarPreguntasAleatorias(preguntasValidas, cantidad);
        return preguntasSeleccionadas;
    } catch (error) {
        console.error('Error cargando preguntas:', error);
        alert(`Error al cargar las preguntas: ${error.message}\n\nPor favor, contacte al administrador.`);
        return null;
    }
}

function normalizarPreguntas(preguntas) {
    return preguntas.map((p, index) => {
        // Si tiene el formato con claves "a", "b", "c", "d" (dermatologia, hematologia, etc.)
        if (p.pregunta && p.opciones && p.respuesta_correcta) {
            const opciones = p.opciones;
            
            // Verificar si las claves son "a", "b", "c", "d" y convertir a formato estándar
            if (opciones.a !== undefined || opciones.b !== undefined || 
                opciones.c !== undefined || opciones.d !== undefined) {
                
                // Limpiar la respuesta correcta (puede venir como "a", "b", "c", "d")
                const respuestaLimpia = (p.respuesta_correcta || 'a').toLowerCase().trim();
                
                return {
                    id: p.id || index + 1,
                    pregunta: p.pregunta,
                    opciones: {
                        'opcion a': opciones.a || opciones.A || '',
                        'opcion b': opciones.b || opciones.B || '',
                        'opcion c': opciones.c || opciones.C || '',
                        'opcion d': opciones.d || opciones.D || ''
                    },
                    respuesta_correcta: 'opcion ' + respuestaLimpia,
                    caso_clinico: p.caso_clinico || p.tema || null
                };
            }
            
            // Si ya tiene el formato correcto con "opcion a", "opcion b", etc.
            return p;
        }
        
        // Si tiene formato alternativo (question, options, answer)
        if (p.question && p.options && p.answer !== undefined) {
            const opciones = {
                'opcion a': p.options[0] || '',
                'opcion b': p.options[1] || '',
                'opcion c': p.options[2] || '',
                'opcion d': p.options[3] || ''
            };
            
            // Convertir el índice de respuesta a clave de opción
            const claves = ['opcion a', 'opcion b', 'opcion c', 'opcion d'];
            const respuestaCorrecta = claves[p.answer] || claves[0];
            
            return {
                id: index + 1,
                pregunta: p.question,
                opciones: opciones,
                respuesta_correcta: respuestaCorrecta,
                caso_clinico: p.caso_clinico || null
            };
        }
        
        // Formato por defecto si no coincide con ninguno
        return {
            id: index + 1,
            pregunta: 'Pregunta no disponible',
            opciones: {
                'opcion a': 'Opción A',
                'opcion b': 'Opción B',
                'opcion c': 'Opción C',
                'opcion d': 'Opción D'
            },
            respuesta_correcta: 'opcion a'
        };
    });
}

function seleccionarPreguntasAleatorias(array, cantidad) {
    const copiaArray = [...array];
    const resultado = [];
    const max = Math.min(cantidad, copiaArray.length);
    
    for (let i = 0; i < max; i++) {
        const indiceAleatorio = Math.floor(Math.random() * copiaArray.length);
        resultado.push(copiaArray[indiceAleatorio]);
        copiaArray.splice(indiceAleatorio, 1);
    }
    
    return resultado;
}

// ===== CRONÓMETRO =====
function iniciarCronometro() {
    tiempoRestante = 240 * 60; // Reiniciar a 4 horas
    actualizarDisplayCronometro();
    
    if (intervaloCronometro) {
        clearInterval(intervaloCronometro);
    }
    
    intervaloCronometro = setInterval(() => {
        tiempoRestante--;
        actualizarDisplayCronometro();
        
        if (tiempoRestante <= 0) {
            clearInterval(intervaloCronometro);
            alert('Se ha terminado el tiempo del examen.');
            finalizarExamen();
        }
    }, 1000);
}

function actualizarDisplayCronometro() {
    const horas = Math.floor(tiempoRestante / 3600);
    const minutos = Math.floor((tiempoRestante % 3600) / 60);
    const segundos = tiempoRestante % 60;
    
    const horasStr = String(horas).padStart(2, '0');
    const minutosStr = String(minutos).padStart(2, '0');
    const segundosStr = String(segundos).padStart(2, '0');
    
    const displayCronometro = document.getElementById('cronometro');
    if (displayCronometro) {
        displayCronometro.textContent = `${horasStr}:${minutosStr}:${segundosStr}`;
        
        // Cambiar color si quedan menos de 10 minutos
        if (tiempoRestante < 600) {
            displayCronometro.style.color = '#dc3545';
        } else {
            displayCronometro.style.color = '#333';
        }
    }
}

function detenerCronometro() {
    if (intervaloCronometro) {
        clearInterval(intervaloCronometro);
        intervaloCronometro = null;
    }
}

// ===== FUNCIONES PARA ENFERMERÍA =====
function mostrarSelectorAno() {
    const select = document.getElementById('selectEspecialidad');
    const selectorAno = document.getElementById('selectorAnoEnfermeria');
    
    if (select.value === 'enfermeria') {
        selectorAno.style.display = 'block';
    } else {
        selectorAno.style.display = 'none';
    }
}

// ===== INICIO DEL EXAMEN =====
async function iniciarExamen() {
    const select = document.getElementById('selectEspecialidad');
    let especialidad = select.value;
    
    if (!especialidad) {
        alert('Por favor seleccione una especialidad');
        return;
    }
    
    // Si es enfermería, verificar que se haya seleccionado el año
    if (especialidad === 'enfermeria') {
        const selectAno = document.getElementById('selectAnoEnfermeria');
        const ano = selectAno.value;
        
        if (!ano) {
            alert('Por favor seleccione el año del examen de enfermería');
            return;
        }
        
        // Modificar la especialidad para cargar el archivo correcto
        especialidad = `enfermeria_${ano}`;
    }
    
    // Mostrar mensaje de carga
    alert('Cargando examen...');
    
    const preguntas = await cargarPreguntas(especialidad);
    
    if (!preguntas || preguntas.length === 0) {
        alert('No se pudieron cargar las preguntas. Intente nuevamente.');
        return;
    }
    
    preguntasExamen = preguntas;
    respuestasAlumno = new Array(preguntasExamen.length).fill(null);
    preguntaActualIndex = 0;
    especialidadSeleccionada = select.options[select.selectedIndex].text;
    
    document.getElementById('especialidadActual').textContent = especialidadSeleccionada;
    
    // Iniciar cronómetro
    iniciarCronometro();
    
    mostrarPregunta();
    mostrarPantalla('pantallaExamen');
}

// ===== GESTIÓN DE PREGUNTAS =====
function mostrarPregunta() {
    const pregunta = preguntasExamen[preguntaActualIndex];
    
    // Actualizar números
    document.getElementById('numeroPregunta').textContent = preguntaActualIndex + 1;
    document.getElementById('numPreguntaActual').textContent = preguntaActualIndex + 1;
    
    // Mostrar caso clínico si existe
    const casoclinicoDiv = document.getElementById('casoclinico');
    if (pregunta.caso_clínico) {
        casoclinicoDiv.textContent = pregunta.caso_clínico;
        casoclinicoDiv.style.display = 'block';
    } else {
        casoclinicoDiv.style.display = 'none';
    }
    
    // Mostrar pregunta
    document.getElementById('textoPregunta').textContent = pregunta.pregunta;
    
    // Mostrar opciones
    const contenedor = document.getElementById('opcionesContainer');
    contenedor.innerHTML = '';
    
    const opciones = pregunta.opciones;
    const respuestaGuardada = respuestasAlumno[preguntaActualIndex];
    
    const letras = ['a', 'b', 'c', 'd'];
    let letraIndex = 0;
    
    Object.keys(opciones).forEach(clave => {
        const opcionDiv = document.createElement('div');
        opcionDiv.className = 'option-item';
        opcionDiv.dataset.opcion = clave;
        
        if (respuestaGuardada === clave) {
            opcionDiv.classList.add('selected');
        }
        
        const letra = letras[letraIndex];
        opcionDiv.innerHTML = `
            <span class="option-letter">${letra})</span>
            <span class="option-text">${opciones[clave]}</span>
        `;
        
        opcionDiv.onclick = () => seleccionarOpcion(clave);
        contenedor.appendChild(opcionDiv);
        letraIndex++;
    });
    
    // Actualizar botones de navegación
    document.getElementById('btnAnterior').disabled = preguntaActualIndex === 0;
    
    if (preguntaActualIndex === preguntasExamen.length - 1) {
        document.getElementById('btnSiguiente').style.display = 'none';
        document.getElementById('btnFinalizar').style.display = 'block';
    } else {
        document.getElementById('btnSiguiente').style.display = 'block';
        document.getElementById('btnFinalizar').style.display = 'none';
    }
}

function seleccionarOpcion(opcion) {
    respuestasAlumno[preguntaActualIndex] = opcion;
    
    // Actualizar visualización
    const opciones = document.querySelectorAll('.option-item');
    opciones.forEach(op => {
        op.classList.remove('selected');
        if (op.dataset.opcion === opcion) {
            op.classList.add('selected');
        }
    });
}

function preguntaAnterior() {
    if (preguntaActualIndex > 0) {
        preguntaActualIndex--;
        mostrarPregunta();
    }
}

function preguntaSiguiente() {
    if (preguntaActualIndex < preguntasExamen.length - 1) {
        preguntaActualIndex++;
        mostrarPregunta();
    }
}

// ===== FINALIZACIÓN DEL EXAMEN =====
function confirmarVolverInicio() {
    const mensaje = '¿Está seguro de volver al inicio?\n\nSe perderá todo el progreso del examen actual.';
    
    if (confirm(mensaje)) {
        detenerCronometro();
        volverInicio();
    }
}

function confirmarFinalizacion() {
    const contestadas = respuestasAlumno.filter(r => r !== null).length;
    const sinContestar = preguntasExamen.length - contestadas;
    
    let mensaje = `¿Está seguro de finalizar el examen?\n\n`;
    mensaje += `Preguntas contestadas: ${contestadas}\n`;
    
    if (sinContestar > 0) {
        mensaje += `Preguntas sin contestar: ${sinContestar}\n\n`;
        mensaje += `Las preguntas sin contestar se contarán como incorrectas.`;
    }
    
    if (confirm(mensaje)) {
        finalizarExamen();
    }
}

function finalizarExamen() {
    let correctas = 0;
    let incorrectas = 0;
    
    preguntasExamen.forEach((pregunta, index) => {
        const respuestaAlumno = respuestasAlumno[index];
        const respuestaCorrecta = pregunta.respuesta_correcta;
        
        if (respuestaAlumno === respuestaCorrecta) {
            correctas++;
        } else {
            incorrectas++;
        }
    });
    
    const porcentaje = Math.round((correctas / preguntasExamen.length) * 100);
    const aprobado = porcentaje >= 60; // 60% para aprobar
    
    // Guardar estadísticas
    guardarEstadistica({
        nombre: nombreAlumno,
        especialidad: especialidadSeleccionada,
        fecha: new Date().toISOString(),
        correctas: correctas,
        incorrectas: incorrectas,
        total: preguntasExamen.length,
        porcentaje: porcentaje,
        aprobado: aprobado,
        tiempoUsado: (240 * 60) - tiempoRestante
    });
    
    mostrarResultados(correctas, incorrectas, porcentaje);
}

async function guardarEstadistica(dato) {
    // Guardar en localStorage (siempre como respaldo)
    let estadisticas = JSON.parse(localStorage.getItem('estadisticasExamenes') || '[]');
    estadisticas.push(dato);
    localStorage.setItem('estadisticasExamenes', JSON.stringify(estadisticas));
    
    // Guardar en Firebase si está habilitado
    if (typeof guardarEstadisticaFirebase !== 'undefined') {
        try {
            await guardarEstadisticaFirebase(dato);
        } catch (error) {
            console.warn('No se pudo guardar en Firebase, pero se guardó en localStorage:', error);
        }
    }
}

function mostrarResultados(correctas, incorrectas, porcentaje) {
    document.getElementById('nombreAlumnoResultado').textContent = nombreAlumno;
    document.getElementById('porcentajeResultado').textContent = porcentaje + '%';
    document.getElementById('correctasResultado').textContent = correctas;
    document.getElementById('incorrectasResultado').textContent = incorrectas;
    document.getElementById('totalResultado').textContent = preguntasExamen.length;
    
    // Mostrar detalle de respuestas
    const listaRespuestas = document.getElementById('listaRespuestas');
    listaRespuestas.innerHTML = '';
    
    preguntasExamen.forEach((pregunta, index) => {
        const respuestaAlumno = respuestasAlumno[index];
        const respuestaCorrecta = pregunta.respuesta_correcta;
        const esCorrecto = respuestaAlumno === respuestaCorrecta;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `respuesta-item ${esCorrecto ? 'correcta' : 'incorrecta'}`;
        
        itemDiv.innerHTML = `
            <div class="respuesta-header">
                <span class="respuesta-numero">Pregunta ${index + 1}</span>
                <span class="respuesta-estado">
                    <i class="fas fa-${esCorrecto ? 'check-circle' : 'times-circle'}"></i>
                    ${esCorrecto ? 'Correcta' : 'Incorrecta'}
                </span>
            </div>
            <div class="respuesta-detalle">
                <p class="pregunta-texto">${pregunta.pregunta}</p>
                ${respuestaAlumno ? 
                    `<p class="tu-respuesta">Tu respuesta: <strong>${pregunta.opciones[respuestaAlumno]}</strong></p>` :
                    `<p class="tu-respuesta sin-respuesta">No contestada</p>`
                }
                ${!esCorrecto ? 
                    `<p class="respuesta-correcta-texto">Correcta: <strong>${pregunta.opciones[respuestaCorrecta]}</strong></p>` :
                    ''
                }
            </div>
        `;
        
        listaRespuestas.appendChild(itemDiv);
    });
    
    // Mostrar sección de análisis con IA si el alumno tiene historial
    mostrarSeccionIA();
    
    mostrarPantalla('pantallaResultados');
}

// ===== ANÁLISIS CON IA =====
function mostrarSeccionIA() {
    const iaSection = document.getElementById('iaAnalisisSection');
    if (iaSection && nombreAlumno) {
        iaSection.style.display = 'block';
    }
}

async function mostrarAnalisisIA() {
    const contenido = document.getElementById('iaAnalisisContent');
    if (!contenido) return;
    
    // Mostrar loading
    contenido.innerHTML = '<div style="text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i><p>Analizando tu rendimiento...</p></div>';
    contenido.style.display = 'block';
    
    try {
        // Crear instancia del sistema de IA
        const ia = new SistemaIA();
        
        // Cargar historial del alumno
        await ia.cargarHistorial(nombreAlumno);
        
        if (ia.historialAlumno.length === 0) {
            contenido.innerHTML = `
                <div class="ia-card">
                    <p style="text-align:center;">
                        <i class="fas fa-info-circle" style="font-size:2rem; color:#667eea;"></i><br>
                        Este es tu primer examen. Rinde más exámenes para obtener análisis personalizado con IA.
                    </p>
                </div>
            `;
            return;
        }
        
        // Generar análisis completo
        const analisis = ia.generarAnalisisCompleto();
        const comparacion = await ia.compararConOtros();
        
        // Construir HTML del análisis
        let html = '';
        
        // 1. Rendimiento General
        html += `
            <div class="ia-card">
                <h4><i class="fas fa-chart-line"></i> Rendimiento General</h4>
                <span class="nivel-badge nivel-${analisis.rendimiento.nivel}">${analisis.rendimiento.mensaje}</span>
                <div class="comparacion-box" style="margin-top:1rem;">
                    <div class="comparacion-stat">
                        <div class="comparacion-numero">${analisis.rendimiento.totalExamenes}</div>
                        <div class="comparacion-label">Exámenes</div>
                    </div>
                    <div class="comparacion-stat">
                        <div class="comparacion-numero">${analisis.rendimiento.promedioGeneral}%</div>
                        <div class="comparacion-label">Promedio</div>
                    </div>
                    <div class="comparacion-stat">
                        <div class="comparacion-numero">${analisis.rendimiento.aprobados}</div>
                        <div class="comparacion-label">Aprobados</div>
                    </div>
                    <div class="comparacion-stat">
                        <div class="comparacion-numero">${analisis.rendimiento.tasaAprobacion}%</div>
                        <div class="comparacion-label">Tasa Aprobación</div>
                    </div>
                </div>
                <p style="margin-top:1rem; color:var(--text-secondary);">${analisis.rendimiento.recomendacion}</p>
            </div>
        `;
        
        // 2. Predicción con IA
        html += `
            <div class="ia-card">
                <h4><i class="fas fa-crystal-ball"></i> Predicción para Próximo Examen</h4>
                <div class="prediccion-box">
                    <div class="prediccion-numero">${analisis.prediccion.probabilidad}%</div>
                    <div class="prediccion-label">Probabilidad de Aprobar</div>
                    <p style="margin-top:0.5rem; font-size:0.9rem;">
                        Tendencia: <strong>${analisis.prediccion.tendencia === 'mejorando' ? '📈 Mejorando' : 
                                             analisis.prediccion.tendencia === 'empeorando' ? '📉 Empeorando' : 
                                             '➡️ Estable'}</strong>
                    </p>
                </div>
                <p style="text-align:center; color:var(--text-secondary); font-size:0.9rem;">
                    Confianza: ${analisis.prediccion.confianza} - ${analisis.prediccion.mensaje}
                </p>
            </div>
        `;
        
        // 3. Especialidades
        if (analisis.especialidades.todas.length > 0) {
            html += `
                <div class="ia-card">
                    <h4><i class="fas fa-stethoscope"></i> Análisis por Especialidad</h4>
            `;
            
            if (analisis.especialidades.fuertes.length > 0) {
                html += '<p style="font-weight:600; color:#059669; margin-top:1rem;"><i class="fas fa-award"></i> Tus Áreas Fuertes:</p>';
                analisis.especialidades.fuertes.forEach(esp => {
                    html += `
                        <div class="especialidad-item">
                            <span class="especialidad-nombre">✅ ${esp.nombre}</span>
                            <span class="especialidad-stats">
                                <span>${esp.promedioNotas}% promedio</span>
                                <span>${esp.examenes} exámenes</span>
                            </span>
                        </div>
                    `;
                });
            }
            
            if (analisis.especialidades.debiles.length > 0) {
                html += '<p style="font-weight:600; color:#dc2626; margin-top:1rem;"><i class="fas fa-exclamation-triangle"></i> Áreas a Reforzar:</p>';
                analisis.especialidades.debiles.forEach(esp => {
                    html += `
                        <div class="especialidad-item">
                            <span class="especialidad-nombre">⚠️ ${esp.nombre}</span>
                            <span class="especialidad-stats">
                                <span>${esp.promedioNotas}% promedio</span>
                                <span>${esp.examenes} exámenes</span>
                            </span>
                        </div>
                    `;
                });
            }
            
            html += '</div>';
        }
        
        // 4. Patrones Identificados
        if (analisis.patrones.patrones.length > 0) {
            html += `
                <div class="ia-card">
                    <h4><i class="fas fa-lightbulb"></i> Patrones Identificados por IA</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1rem;">${analisis.patrones.mensaje}</p>
            `;
            
            analisis.patrones.patrones.forEach(patron => {
                html += `
                    <div class="patron-item">
                        <div class="patron-tipo">${patron.tipo === 'tiempo' ? '⏱️ Tiempo' : 
                                                    patron.tipo === 'consistencia' ? '📊 Consistencia' : 
                                                    '🎯 ' + patron.tipo}</div>
                        <div class="patron-mensaje">${patron.mensaje}</div>
                        <div class="patron-recomendacion">${patron.recomendacion}</div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        // 5. Recomendaciones Personalizadas
        if (analisis.recomendaciones.length > 0) {
            html += `
                <div class="ia-card">
                    <h4><i class="fas fa-tasks"></i> Recomendaciones Personalizadas</h4>
            `;
            
            analisis.recomendaciones.forEach(rec => {
                html += `
                    <div class="recomendacion-item prioridad-${rec.prioridad}">
                        <div class="recomendacion-titulo">
                            <span>${rec.icono}</span>
                            <span>${rec.titulo}</span>
                        </div>
                        <div class="recomendacion-descripcion">${rec.descripcion}</div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        // 6. Comparación con otros alumnos
        if (comparacion.disponible) {
            html += `
                <div class="ia-card">
                    <h4><i class="fas fa-users"></i> Comparación con Otros Alumnos</h4>
                    <div class="comparacion-box">
                        <div class="comparacion-stat">
                            <div class="comparacion-numero">${comparacion.miPromedio}%</div>
                            <div class="comparacion-label">Tu Promedio</div>
                        </div>
                        <div class="comparacion-stat">
                            <div class="comparacion-numero">${comparacion.promedioGeneral}%</div>
                            <div class="comparacion-label">Promedio General</div>
                        </div>
                        <div class="comparacion-stat">
                            <div class="comparacion-numero">${comparacion.totalAlumnos}</div>
                            <div class="comparacion-label">Total Alumnos</div>
                        </div>
                    </div>
                    <p style="text-align:center; margin-top:1rem; font-weight:600; color:${
                        comparacion.posicionRelativa === 'superior' || comparacion.posicionRelativa === 'por encima' ? '#059669' : 
                        comparacion.posicionRelativa === 'promedio' ? '#667eea' : '#dc2626'
                    };">
                        Estás ${comparacion.diferencia}% ${comparacion.miPromedio > comparacion.promedioGeneral ? 'por encima' : 'por debajo'} del promedio general
                    </p>
                </div>
            `;
        }
        
        // Insertar todo el HTML
        contenido.innerHTML = html;
        
    } catch (error) {
        console.error('Error al generar análisis IA:', error);
        contenido.innerHTML = `
            <div class="ia-card">
                <p style="text-align:center; color:var(--error-color);">
                    <i class="fas fa-exclamation-triangle"></i><br>
                    Error al generar el análisis. Por favor, intenta de nuevo.
                </p>
            </div>
        `;
    }
}
