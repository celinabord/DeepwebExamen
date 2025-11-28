
// Configuración de Firebase y Firestore
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Variables globales para Firebase
let app;
let db;
let auth;
let userId = 'anonymous'; // Valor por defecto
let isAuthReady = false;

// Inicializar Firebase
if (firebaseConfig) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} else {
    console.error("Firebase configuration not available.");
}


// --- DEFINICIÓN DE ESPECIALIDADES Y PREGUNTAS ---

const ESPECIALIDADES = [
    { id: 'mi', nombre: 'Medicina Interna', preguntasCount: 50 },
    { id: 'cg', nombre: 'Cirugía General', preguntasCount: 50 },
    { id: 'ped', nombre: 'Pediatría', preguntasCount: 50 },
    { id: 'go', nombre: 'Ginecología y Obstetricia', preguntasCount: 50 },
    { id: 'cardio', nombre: 'Cardiología', preguntasCount: 40 },
    { id: 'neuro', nombre: 'Neurología', preguntasCount: 40 },
    { id: 'derma', nombre: 'Dermatología', preguntasCount: 30 },
    { id: 'to', nombre: 'Traumatología y Ortopedia', preguntasCount: 40 },
    { id: 'uro', nombre: 'Urología', preguntasCount: 30 },
    { id: 'psiq', nombre: 'Psiquiatría', preguntasCount: 30 },
    { id: 'anest', nombre: 'Anestesiología', preguntasCount: 20 },
    { id: 'radio', nombre: 'Radiología e Imagenología', preguntasCount: 20 },
    { id: 'mfyc', nombre: 'Medicina Familiar y Comunitaria', preguntasCount: 30 },
    { id: 'oftal', nombre: 'Oftalmología', preguntasCount: 20 },
    { id: 'orl', nombre: 'Otorrinolaringología', preguntasCount: 20 }
];

// Genera un banco de preguntas simulado. En una aplicación real, estas se cargarían desde Firestore o una API.
// Para el propósito de esta simulación, creamos preguntas genéricas.
function generarBancoDePreguntas() {
    const banco = {};
    let preguntaId = 1;

    ESPECIALIDADES.forEach(esp => {
        banco[esp.id] = [];
        for (let i = 1; i <= esp.preguntasCount; i++) {
            banco[esp.id].push({
                id: preguntaId++,
                texto: `[${esp.nombre}] Pregunta ${i}: ¿Cuál es el tratamiento de elección para la patología X en pacientes adultos?`,
                opciones: [
                    { texto: 'Opción A: Fármaco 1', esCorrecta: i % 4 === 1 },
                    { texto: 'Opción B: Fármaco 2', esCorrecta: i % 4 === 2 },
                    { texto: 'Opción C: Intervención 1', esCorrecta: i % 4 === 3 },
                    { texto: 'Opción D: Medida de soporte', esCorrecta: i % 4 === 0 }
                ],
                respuestaSeleccionada: null // Campo para guardar la respuesta del usuario
            });
        }
    });
    return banco;
}

const BANCO_DE_PREGUNTAS = generarBancoDePreguntas();
// console.log("Banco de Preguntas Generado:", BANCO_DE_PREGUNTAS);

// --- ESTADO GLOBAL DEL EXAMEN ---
let estadoExamen = {
    especialidadId: null,
    especialidadNombre: null,
    preguntas: [],
    indiceActual: 0,
    tiempoInicio: null,
    intervaloTiempo: null,
    tiempoTranscurrido: 0 // En segundos
};

// --- FUNCIÓN DE UTILIDAD PARA TRANSICIÓN DE PANTALLAS ---

function mostrarPantalla(id) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const pantalla = document.getElementById(id);
    if (pantalla) {
        pantalla.classList.add('active');
    }
}

// --- FUNCIONES DE AUTENTICACIÓN Y ROLES ---

// Inicializa la autenticación con el token personalizado o de forma anónima
async function iniciarAutenticacion() {
    if (auth) {
        try {
            if (initialAuthToken) {
                // Iniciar sesión con el token personalizado proporcionado por Canvas
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                // Iniciar sesión anónimamente si no hay token (para desarrollo fuera de Canvas)
                await signInAnonymously(auth);
            }
            console.log("Autenticación exitosa.");
        } catch (error) {
            console.error("Error en la autenticación:", error);
        }

        // Observador de estado de autenticación
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
            } else {
                // Generar un ID temporal si es anónimo/desconectado para almacenamiento temporal
                userId = crypto.randomUUID(); 
            }
            isAuthReady = true;
            console.log("Estado de autenticación listo. User ID:", userId);
            // Mostrar la pantalla de selección una vez que la autenticación esté lista
            mostrarPantalla('seleccionSection');
            // Cargar datos (si es necesario) o preparar la UI después de la autenticación
            if (document.getElementById('rankingSection').classList.contains('active')) {
                cargarRanking(); // Si estamos en la sección de ranking, la cargamos
            }
        });
    } else {
        console.error("Auth no inicializado. La aplicación puede no funcionar correctamente.");
        mostrarPantalla('seleccionSection'); // Mostrar la pantalla aunque la autenticación falle
    }
}

function mostrarLoginAdmin() {
    mostrarPantalla('loginAdminSection');
}

function mostrarLoginAlumno() {
    mostrarPantalla('loginAlumnoSection');
    cargarListaEspecialidades();
}

function volverAlInicio() {
    mostrarPantalla('seleccionSection');
    // Limpiar el estado del examen por si acaso
    clearInterval(estadoExamen.intervaloTiempo);
    estadoExamen = {
        especialidadId: null,
        especialidadNombre: null,
        preguntas: [],
        indiceActual: 0,
        tiempoInicio: null,
        intervaloTiempo: null,
        tiempoTranscurrido: 0
    };
}

// --- FUNCIONES DE GESTIÓN DE EXÁMENES ---

function cargarListaEspecialidades() {
    const listaEspecialidadesDiv = document.getElementById('listaEspecialidades');
    if (!listaEspecialidadesDiv) return;

    listaEspecialidadesDiv.innerHTML = '';
    
    ESPECIALIDADES.forEach(esp => {
        const card = document.createElement('div');
        card.className = 'specialty-card';
        card.setAttribute('onclick', `mostrarConfirmacionExamen('${esp.id}', '${esp.nombre}', ${esp.preguntasCount})`);
        
        card.innerHTML = `
            <div class="specialty-icon">
                <i class="fas fa-microscope"></i>
            </div>
            <h2>${esp.nombre}</h2>
            <p>${esp.preguntasCount} Preguntas</p>
        `;
        listaEspecialidadesDiv.appendChild(card);
    });
}

function mostrarConfirmacionExamen(id, nombre, count) {
    const modal = document.getElementById('confirmacionModal');
    document.getElementById('modalEspecialidadNombre').textContent = nombre;
    document.getElementById('modalPreguntasCount').textContent = count;
    document.getElementById('iniciarExamenBtn').setAttribute('onclick', `iniciarExamen('${id}')`);
    modal.classList.add('active');
}

function cerrarModal() {
    document.getElementById('confirmacionModal').classList.remove('active');
}

function iniciarExamen(especialidadId) {
    cerrarModal();

    const especialidad = ESPECIALIDADES.find(e => e.id === especialidadId);
    if (!especialidad || !BANCO_DE_PREGUNTAS[especialidadId]) {
        console.error("Especialidad o banco de preguntas no encontrado.");
        return;
    }

    estadoExamen.especialidadId = especialidadId;
    estadoExamen.especialidadNombre = especialidad.nombre;
    // Clonar las preguntas para que las respuestas seleccionadas no afecten al banco original
    estadoExamen.preguntas = [...BANCO_DE_PREGUNTAS[especialidadId]];
    estadoExamen.indiceActual = 0;
    estadoExamen.tiempoInicio = Date.now();
    estadoExamen.tiempoTranscurrido = 0;

    // Reiniciar el contador de tiempo
    clearInterval(estadoExamen.intervaloTiempo);
    estadoExamen.intervaloTiempo = setInterval(actualizarTiempo, 1000);

    mostrarExamen();
}

function actualizarTiempo() {
    estadoExamen.tiempoTranscurrido++;
    const minutos = Math.floor(estadoExamen.tiempoTranscurrido / 60).toString().padStart(2, '0');
    const segundos = (estadoExamen.tiempoTranscurrido % 60).toString().padStart(2, '0');
    const tiempoDisplay = `${minutos}:${segundos}`;
    document.getElementById('tiempoDisplay').textContent = tiempoDisplay;
}

function mostrarExamen() {
    if (estadoExamen.indiceActual >= estadoExamen.preguntas.length) {
        finalizarExamen();
        return;
    }

    mostrarPantalla('examenSection');

    const pregunta = estadoExamen.preguntas[estadoExamen.indiceActual];
    const totalPreguntas = estadoExamen.preguntas.length;

    // Actualizar barra de progreso
    const progreso = ((estadoExamen.indiceActual + 1) / totalPreguntas) * 100;
    document.getElementById('progresoBar').style.width = `${progreso}%`;
    document.getElementById('progresoText').textContent = `Pregunta ${estadoExamen.indiceActual + 1} de ${totalPreguntas} (${estadoExamen.especialidadNombre})`;


    // Contenido de la pregunta
    document.getElementById('preguntaTexto').textContent = pregunta.texto;
    const opcionesDiv = document.getElementById('opcionesContainer');
    opcionesDiv.innerHTML = '';

    pregunta.opciones.forEach((opcion, index) => {
        const opcionDiv = document.createElement('div');
        opcionDiv.className = 'opcion-card';
        opcionDiv.setAttribute('onclick', `seleccionarRespuesta(${index})`);
        
        const isSelected = pregunta.respuestaSeleccionada === index;
        if (isSelected) {
            opcionDiv.classList.add('selected');
        }

        opcionDiv.innerHTML = `
            <span class="opcion-letter">${String.fromCharCode(65 + index)}</span>
            <p class="opcion-text">${opcion.texto}</p>
            <i class="fas fa-check-circle check-icon"></i>
        `;
        opcionesDiv.appendChild(opcionDiv);
    });

    // Estado de navegación
    document.getElementById('btnAnterior').disabled = estadoExamen.indiceActual === 0;
    document.getElementById('btnSiguiente').textContent = estadoExamen.indiceActual === totalPreguntas - 1 ? 'Finalizar Examen' : 'Siguiente';
}

function seleccionarRespuesta(indiceOpcion) {
    const pregunta = estadoExamen.preguntas[estadoExamen.indiceActual];
    
    // Si la respuesta es la misma, la deselecciona (toggle)
    if (pregunta.respuestaSeleccionada === indiceOpcion) {
        pregunta.respuestaSeleccionada = null;
    } else {
        pregunta.respuestaSeleccionada = indiceOpcion;
    }
    
    // Volver a renderizar para actualizar el estilo visual
    mostrarExamen();
}

function navegarPregunta(direccion) {
    // -1 para anterior, 1 para siguiente
    estadoExamen.indiceActual += direccion;
    
    if (estadoExamen.indiceActual < 0) {
        estadoExamen.indiceActual = 0;
    } else if (estadoExamen.indiceActual >= estadoExamen.preguntas.length) {
        // Esto debería ser manejado por el botón de "Finalizar Examen"
        estadoExamen.indiceActual = estadoExamen.preguntas.length - 1; 
    }
    
    mostrarExamen();
}

function finalizarExamen() {
    clearInterval(estadoExamen.intervaloTiempo); // Detener el contador
    
    let correctas = 0;
    let incorrectas = 0;
    let sinResponder = 0;
    
    estadoExamen.preguntas.forEach(pregunta => {
        if (pregunta.respuestaSeleccionada === null) {
            sinResponder++;
        } else {
            const esCorrecta = pregunta.opciones[pregunta.respuestaSeleccionada].esCorrecta;
            if (esCorrecta) {
                correctas++;
            } else {
                incorrectas++;
            }
        }
    });

    const totalPreguntas = estadoExamen.preguntas.length;
    const porcentajeAcierto = (correctas / totalPreguntas) * 100;
    
    // Guardar resultado en Firestore
    guardarResultado({
        especialidad: estadoExamen.especialidadNombre,
        totalPreguntas: totalPreguntas,
        correctas: correctas,
        incorrectas: incorrectas,
        sinResponder: sinResponder,
        tiempoSegundos: estadoExamen.tiempoTranscurrido,
        porcentaje: porcentajeAcierto
    });

    // Mostrar Resultados
    document.getElementById('resultadoCorrectas').textContent = correctas;
    document.getElementById('resultadoIncorrectas').textContent = incorrectas;
    document.getElementById('resultadoSinResponder').textContent = sinResponder;
    document.getElementById('resultadoEspecialidad').textContent = estadoExamen.especialidadNombre;
    
    const minutos = Math.floor(estadoExamen.tiempoTranscurrido / 60).toString().padStart(2, '0');
    const segundos = (estadoExamen.tiempoTranscurrido % 60).toString().padStart(2, '0');
    document.getElementById('resultadoTiempo').textContent = `${minutos}:${segundos}`;

    const resultadoEstado = document.getElementById('resultadoEstado');
    const resultadoMensaje = document.getElementById('resultadoMensaje');
    
    if (porcentajeAcierto >= 70) {
        resultadoEstado.textContent = '¡Felicidades, Aprobado!';
        resultadoMensaje.textContent = 'Tu rendimiento es excelente. ¡Sigue así!';
        resultadoEstado.className = 'text-success';
    } else if (porcentajeAcierto >= 50) {
        resultadoEstado.textContent = 'Rendimiento Mejorable';
        resultadoMensaje.textContent = 'Estás cerca del nivel de aprobación. Repasa los temas débiles.';
        resultadoEstado.className = 'text-warning';
    } else {
        resultadoEstado.textContent = 'Necesitas Repaso Intensivo';
        resultadoMensaje.textContent = 'Es momento de enfocarte en el estudio. ¡No te rindas!';
        resultadoEstado.className = 'text-danger';
    }
    
    mostrarPantalla('resultadoSection');
}

// --- FUNCIONES DE GESTIÓN DE FIREBASE (RESULTADOS Y RANKING) ---

async function guardarResultado(resultado) {
    if (!db || !isAuthReady) {
        console.error("Firestore no está listo o el usuario no está autenticado.");
        return;
    }

    const resultadosCollectionPath = `/artifacts/${appId}/users/${userId}/resultados`;

    try {
        await setDoc(doc(collection(db, resultadosCollectionPath)), {
            ...resultado,
            fecha: serverTimestamp(),
            userId: userId
        });
        console.log("Resultado guardado exitosamente en Firestore.");
    } catch (e) {
        console.error("Error al guardar el resultado: ", e);
    }
}

function mostrarRankingSection() {
    mostrarPantalla('rankingSection');
    cargarRanking();
}

async function cargarRanking() {
    if (!db || !isAuthReady) {
        console.error("Firestore no está listo o el usuario no está autenticado.");
        document.getElementById('rankingContainer').innerHTML = '<p class="text-warning">Cargando datos del usuario...</p>';
        return;
    }

    const resultadosPublicCollectionPath = `/artifacts/${appId}/public/data/ranking`;
    const rankingContainer = document.getElementById('rankingContainer');
    rankingContainer.innerHTML = '<p class="text-info">Cargando ranking...</p>';
    
    try {
        // Queremos ver los 10 mejores resultados de todos los usuarios, ordenados por porcentaje de acierto descendente
        // Nota: Firestore no permite ordenar por porcentaje y luego por tiempo sin un índice compuesto.
        // Por simplicidad y para evitar errores de índice, ordenaremos solo por fecha (los más recientes)
        // o, idealmente, si usamos 'porcentaje', es mejor ordenarlo por ese campo.
        const q = query(
            collection(db, resultadosPublicCollectionPath),
            orderBy('porcentaje', 'desc'), 
            orderBy('tiempoSegundos', 'asc'), 
            limit(10)
        );

        // Usamos onSnapshot para recibir actualizaciones en tiempo real
        onSnapshot(q, (querySnapshot) => {
            const rankingList = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Formatear el tiempo de segundos a M:SS
                const minutos = Math.floor(data.tiempoSegundos / 60).toString().padStart(2, '0');
                const segundos = (data.tiempoSegundos % 60).toString().padStart(2, '0');
                
                rankingList.push({
                    id: doc.id,
                    especialidad: data.especialidad,
                    correctas: data.correctas,
                    totalPreguntas: data.totalPreguntas,
                    porcentaje: data.porcentaje ? data.porcentaje.toFixed(1) : '0.0', // Asegurar el formato
                    tiempo: `${minutos}:${segundos}`,
                    userId: data.userId 
                });
            });

            // Generar la tabla HTML
            let html = `
                <table class="ranking-table">
                    <thead>
                        <tr>
                            <th>Pos.</th>
                            <th>Especialidad</th>
                            <th>Acierto %</th>
                            <th>Correctas</th>
                            <th>Tiempo</th>
                            <th>Usuario ID</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            rankingList.forEach((item, index) => {
                // Destacar la fila del usuario actual
                const isCurrentUser = item.userId === userId;
                const rowClass = isCurrentUser ? 'class="current-user-row"' : '';

                html += `
                    <tr ${rowClass}>
                        <td>${index + 1}</td>
                        <td>${item.especialidad}</td>
                        <td class="text-${item.porcentaje >= 70 ? 'success' : item.porcentaje >= 50 ? 'warning' : 'danger'}">${item.porcentaje}%</td>
                        <td>${item.correctas}/${item.totalPreguntas}</td>
                        <td>${item.tiempo}</td>
                        <td>${item.userId}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
                <p class="mt-4 text-sm text-gray-500">Tu ID de Usuario para el ranking es: <strong>${userId}</strong></p>
            `;

            rankingContainer.innerHTML = html;

        }, (error) => {
            console.error("Error al suscribirse al ranking: ", error);
            rankingContainer.innerHTML = '<p class="text-danger">Error al cargar el ranking.</p>';
        });

    } catch (e) {
        console.error("Error al ejecutar la consulta de ranking: ", e);
        rankingContainer.innerHTML = '<p class="text-danger">Error al cargar el ranking.</p>';
    }
}

// Función para simular el guardado de la nota en la colección pública (para el ranking)
// Esto debe ejecutarse justo después de guardar en la colección privada del usuario.
// Usamos una función simple para simular esto para que el ranking funcione.
async function guardarResultadoPublico(resultado) {
     if (!db || !isAuthReady) {
        console.error("Firestore no está listo o el usuario no está autenticado.");
        return;
    }

    const rankingCollectionPath = `/artifacts/${appId}/public/data/ranking`;

    try {
        // En un escenario real, podríamos guardar solo los datos necesarios para el ranking
        // Aquí vamos a guardar el resultado completo para simplicidad
        await setDoc(doc(collection(db, rankingCollectionPath)), {
            ...resultado,
            fecha: serverTimestamp(),
            userId: userId
        });
        console.log("Resultado guardado exitosamente en el ranking público.");
    } catch (e) {
        console.error("Error al guardar el resultado público: ", e);
    }
}


// Sobrescribir la función de guardarResultado para que también guarde en la colección pública
const originalGuardarResultado = guardarResultado;
guardarResultado = async function(resultado) {
    await originalGuardarResultado(resultado); // Guarda en la colección privada del usuario
    await guardarResultadoPublico(resultado); // Guarda en la colección pública para el ranking
}


// --- INICIO DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Es importante iniciar la autenticación al cargar la aplicación
    if (firebaseConfig) {
        iniciarAutenticacion();
    } else {
        // Si no hay configuración de Firebase, continuamos sin él (solo UI)
        mostrarPantalla('seleccionSection');
    }
    // Cargar la lista de especialidades en la sección de selección de alumno
    cargarListaEspecialidades();
});

// Exponer funciones al scope global para que los onclick en el HTML funcionen
window.mostrarLoginAdmin = mostrarLoginAdmin;
window.mostrarLoginAlumno = mostrarLoginAlumno;
window.volverAlInicio = volverAlInicio;
window.mostrarConfirmacionExamen = mostrarConfirmacionExamen;
window.cerrarModal = cerrarModal;
window.iniciarExamen = iniciarExamen;
window.seleccionarRespuesta = seleccionarRespuesta;
window.navegarPregunta = navegarPregunta;
window.finalizarExamen = finalizarExamen;
window.mostrarRankingSection = mostrarRankingSection;
window.cargarRanking = cargarRanking; // Exponer por si acaso
