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
    
    mostrarResultados(correctas, incorrectas, porcentaje);
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
    
    mostrarPantalla('pantallaResultados');
}
