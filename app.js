// Configuración de Firebase y Firestore
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


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
    setLogLevel('debug'); // Habilitar logs para depuración de Firestore
} else {
    console.error("Firebase configuration not available.");
}

// --- FUNCIÓN DE UTILIDAD PARA CLAVE DE ALUMNO ---

/**
 * Genera una nueva clave de alumno, la guarda en localStorage con una expiración de 48h,
 * y retorna la clave.
 */
function generarClave() {
    const clave = Math.random().toString(36).slice(-8);
    const expirationTime = Date.now() + 48 * 60 * 60 * 1000; // 48 horas en milisegundos
    
    localStorage.setItem("claveAlumnos", clave);
    localStorage.setItem("claveExpira", expirationTime);
    
    console.log(`Nueva clave de alumno generada: ${clave}, expira en ${new Date(expirationTime).toLocaleString()}`);
    return clave; // Es crucial retornar la clave
}

// --- VARIABLES DE CONFIGURACIÓN Y CLAVE DE ACCESO ---
const ADMIN_KEY = "Teamopi91";

// 1. Declarar variables para la clave de alumno
let claveAlumnos = localStorage.getItem("claveAlumnos");
let claveExpira = localStorage.getItem("claveExpira");

// 2. Lógica de inicialización y expiración (solo se llama a generarClave *después* de la declaración)
// Verificar si la clave no existe o ha expirado.
if (!claveAlumnos || !claveExpira || Date.now() > parseInt(claveExpira, 10)) {
    console.log("La clave de alumno no existe o ha expirado. Generando una nueva.");
    claveAlumnos = generarClave(); // Ahora la llamada ocurre después de la declaración de la variable
    claveExpira = localStorage.getItem("claveExpira"); 
}

// --- DEFINICIÓN DE ESPECIALIDADES Y PREGUNTAS ---

const ESPECIALIDADES = [
    { id: 'mi', nombre: 'Medicina Interna' },
    { id: 'ped', nombre: 'Pediatría' },
    { id: 'cir', nombre: 'Cirugía General' },
    // Añade más especialidades si es necesario
];

// Mapeo de especialidades a archivos JSON (ejemplo, se necesita la lógica real de carga)
const specialtyToFile = {
    // Definiciones de mapeo de archivos (Asumiendo que este objeto venía en el snippet)
    "Medicina - Especialidad 1": "anestesiologia",
    "Medicina - Especialidad 2": "cardiologia",
    // ... más mapeos según sea necesario
};

// Variables para el estado del examen
let preguntasActuales = []; // El conjunto de 100 preguntas para el examen actual
let respuestas = []; // Array para guardar las respuestas del usuario
let preguntaActualIndex = 0;
let tiempoRestante = 180 * 60; // 3 horas en segundos
let timer;
let examenIniciado = false;
let especialidadSeleccionada = '';

// --- FUNCIONES DE AUTENTICACIÓN Y FIREBASE ---

/**
 * Inicia la autenticación de Firebase con un token personalizado o de forma anónima.
 */
async function iniciarAutenticacion() {
    try {
        if (auth) {
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
                console.log("Autenticación con token personalizado exitosa.");
            } else {
                await signInAnonymously(auth);
                console.log("Autenticación anónima exitosa.");
            }
        }
    } catch (error) {
        console.error("Error durante la autenticación de Firebase:", error);
    }

    if (auth) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                console.log("Usuario autenticado. UID:", userId);
            } else {
                userId = 'anonymous';
                console.log("Usuario no autenticado.");
            }
            isAuthReady = true;
            // Después de que la autenticación está lista, podemos mostrar la pantalla inicial
            mostrarPantalla('seleccionSection');
            // Cargar datos que dependan del usuario autenticado si es necesario (ej. ranking)
        });
    } else {
        isAuthReady = true;
        mostrarPantalla('seleccionSection');
    }
}

/**
 * Guarda el resultado del examen en la colección privada del usuario.
 * @param {object} resultado - Objeto con los detalles del resultado.
 */
async function guardarResultado(resultado) {
    if (!isAuthReady || !userId || !db) {
        console.error("Firebase no está listo o el usuario no está autenticado.");
        return;
    }

    const collectionPath = `artifacts/${appId}/users/${userId}/exam_results`;
    const docRef = doc(collection(db, collectionPath), `${Date.now()}`); // Usar timestamp como ID

    try {
        await setDoc(docRef, {
            ...resultado,
            timestamp: serverTimestamp(),
            userId: userId,
            // Guardamos las respuestas para poder revisarlas si es necesario
            respuestas: respuestas.map((res, index) => ({
                qIndex: index,
                userAnswer: res,
                correctAnswer: preguntasActuales[index].correcta,
                isCorrect: res === preguntasActuales[index].correcta
            }))
        });
        console.log("Resultado guardado en colección privada.");
    } catch (e) {
        console.error("Error al guardar el resultado en Firestore (privado):", e);
    }
}

/**
 * Guarda el resultado en la colección pública para el ranking.
 * @param {object} resultado - Objeto con los detalles del resultado.
 */
async function guardarResultadoPublico(resultado) {
    if (!isAuthReady || !userId || !db) return;

    // Solo guardamos datos esenciales para el ranking: puntaje, tiempo, especialidad, y userID
    const collectionPath = `artifacts/${appId}/public/data/exam_ranking`;
    
    // Crear un ID único para el documento de ranking.
    // Podrías sobrescribir si el usuario ya tiene un mejor resultado, pero aquí usaremos un nuevo documento por examen.
    const docRef = doc(collection(db, collectionPath), `${userId}_${Date.now()}`); 

    try {
        await setDoc(docRef, {
            puntaje: resultado.porcentaje,
            correctas: resultado.correctas,
            tiempoUtilizado: resultado.tiempoTotal,
            especialidad: resultado.especialidad,
            timestamp: serverTimestamp(),
            userId: userId
        });
        console.log("Resultado guardado en colección pública para ranking.");
    } catch (e) {
        console.error("Error al guardar el resultado en Firestore (público):", e);
    }
}

// Sobrescribir la función de guardarResultado para que también guarde en la colección pública
const originalGuardarResultado = guardarResultado;
guardarResultado = async function(resultado) {
    await originalGuardarResultado(resultado); // Guarda en la colección privada del usuario
    await guardarResultadoPublico(resultado); // Guarda en la colección pública para el ranking
}


// --- FUNCIONES DE NAVEGACIÓN Y VISTA ---

/**
 * Muestra la sección con el ID especificado y oculta las demás.
 * @param {string} sectionId - El ID de la sección a mostrar.
 */
function mostrarPantalla(sectionId) {
    document.querySelectorAll('.screen').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function volverAlInicio() {
    mostrarPantalla('seleccionSection');
}

function mostrarLoginAdmin() {
    document.getElementById('adminKeyInput').value = '';
    mostrarPantalla('adminLoginSection');
}

function mostrarLoginAlumno() {
    document.getElementById('alumnoKeyDisplay').textContent = claveAlumnos;
    mostrarPantalla('alumnoLoginSection');
}

/**
 * Carga la lista de especialidades en el selector de la sección de alumno.
 */
function cargarListaEspecialidades() {
    const select = document.getElementById('especialidadSelect');
    if (!select) return;

    select.innerHTML = ''; // Limpiar opciones anteriores
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecciona una especialidad';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    ESPECIALIDADES.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp.id;
        option.textContent = esp.nombre;
        select.appendChild(option);
    });
}

// Lógica de validación de clave de administrador (ejemplo simple)
window.validarClaveAdmin = function() {
    const key = document.getElementById('adminKeyInput').value;
    if (key === ADMIN_KEY) {
        // En un app real, esto redirigiría a un panel de admin.
        // Aquí simplemente mostramos la clave de alumno
        mostrarPantalla('adminPanelSection');
        document.getElementById('adminClaveAlumnoDisplay').textContent = claveAlumnos;
    } else {
        alert("Clave de administrador incorrecta.");
    }
}

// Lógica de inicio de examen
function mostrarConfirmacionExamen() {
    const especialidadId = document.getElementById('especialidadSelect').value;
    const claveIngresada = document.getElementById('alumnoKeyInput').value;
    
    // NOTA: Se ha cambiado a un modal/mensaje custom. Aquí usamos alert por simplicidad.
    if (claveIngresada !== claveAlumnos) {
        alert('La clave de alumno ingresada es incorrecta.');
        return;
    }
    
    if (!especialidadId) {
        alert('Por favor, selecciona una especialidad.');
        return;
    }

    especialidadSeleccionada = ESPECIALIDADES.find(e => e.id === especialidadId).nombre;
    
    document.getElementById('modalEspecialidad').textContent = especialidadSeleccionada;
    document.getElementById('modalDuracion').textContent = '3 horas';
    document.getElementById('modalPreguntas').textContent = '100';
    document.getElementById('confirmacionModal').classList.add('is-active');
}

function cerrarModal() {
    document.getElementById('confirmacionModal').classList.remove('is-active');
}

// Simulación de carga de preguntas (necesitas implementar la carga real desde el JSON)
async function cargarPreguntas(especialidadId) {
    // ESTA ES UNA SIMULACIÓN. DEBES IMPLEMENTAR LA CARGA REAL.
    // Por ahora, generaremos 100 preguntas dummy.
    const preguntasDummy = [];
    const especialidadNombre = ESPECIALIDADES.find(e => e.id === especialidadId).nombre;

    for (let i = 0; i < 100; i++) {
        preguntasDummy.push({
            id: i + 1,
            pregunta: `Pregunta ${i + 1} de la especialidad: ${especialidadNombre}. ¿Cuál es la respuesta correcta?`,
            opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
            correcta: 'Opción C' // Respuesta correcta de ejemplo
        });
    }
    return preguntasDummy;
}

async function iniciarExamen() {
    cerrarModal();

    const especialidadId = document.getElementById('especialidadSelect').value;
    preguntasActuales = await cargarPreguntas(especialidadId);
    respuestas = new Array(preguntasActuales.length).fill(null);
    preguntaActualIndex = 0;
    tiempoRestante = 180 * 60; // Resetear el tiempo
    examenIniciado = true;

    document.getElementById('examenTitle').textContent = `Examen: ${especialidadSeleccionada}`;
    mostrarPregunta(preguntaActualIndex);
    iniciarTimer();
    mostrarPantalla('examenSection');
}

function mostrarPregunta(index) {
    const pregunta = preguntasActuales[index];
    document.getElementById('preguntaNumero').textContent = index + 1;
    document.getElementById('preguntaTotal').textContent = preguntasActuales.length;
    document.getElementById('preguntaTexto').textContent = pregunta.pregunta;

    const opcionesContainer = document.getElementById('opcionesContainer');
    opcionesContainer.innerHTML = '';

    pregunta.opciones.forEach((opcion, i) => {
        const inputId = `opcion${i}`;
        const isChecked = respuestas[index] === opcion;

        opcionesContainer.innerHTML += `
            <div class="opcion-card ${isChecked ? 'selected' : ''}" 
                 onclick="seleccionarRespuesta(${index}, '${opcion.replace(/'/g, "\\'")}')">
                <input type="radio" id="${inputId}" name="respuesta" value="${opcion.replace(/'/g, "\\'")}" ${isChecked ? 'checked' : ''} class="hidden">
                <label for="${inputId}" class="opcion-label">${String.fromCharCode(65 + i)} - ${opcion}</label>
            </div>
        `;
    });

    // Actualizar botones de navegación
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').disabled = index === preguntasActuales.length - 1;
    document.getElementById('finalizarBtn').style.display = index === preguntasActuales.length - 1 ? 'inline-block' : 'none';
}

window.seleccionarRespuesta = function(index, respuesta) {
    // Actualizar el estado de las respuestas
    respuestas[index] = respuesta;
    
    // Actualizar el estilo visual de la opción seleccionada sin recargar la pregunta
    const opcionesContainer = document.getElementById('opcionesContainer');
    opcionesContainer.querySelectorAll('.opcion-card').forEach(card => {
        card.classList.remove('selected');
        const input = card.querySelector('input[type="radio"]');
        if (input && input.value === respuesta) {
             card.classList.add('selected');
             input.checked = true; // Asegurar que el radio button esté marcado
        } else if (input) {
            input.checked = false;
        }
    });
}

window.navegarPregunta = function(direccion) {
    const nuevoIndex = preguntaActualIndex + direccion;
    if (nuevoIndex >= 0 && nuevoIndex < preguntasActuales.length) {
        preguntaActualIndex = nuevoIndex;
        mostrarPregunta(preguntaActualIndex);
    }
}

function iniciarTimer() {
    actualizarTimer();
    // Limpiar cualquier timer anterior para evitar duplicados
    if (timer) clearInterval(timer); 
    
    timer = setInterval(() => {
        tiempoRestante--;
        actualizarTimer();
        if (tiempoRestante <= 0) {
            clearInterval(timer);
            finalizarExamen();
        }
    }, 1000);
}

function actualizarTimer() {
    const h = Math.floor(tiempoRestante / 3600);
    const m = Math.floor((tiempoRestante % 3600) / 60);
    const s = tiempoRestante % 60;
    
    // Formatear con ceros a la izquierda
    const formattedH = h.toString().padStart(2, '0');
    const formattedM = m.toString().padStart(2, '0');
    const formattedS = s.toString().padStart(2, '0');

    document.getElementById("timer").textContent = `Tiempo restante: ${formattedH}h ${formattedM}m ${formattedS}s`;
}

async function finalizarExamen() {
    if (!examenIniciado) return; // Evitar doble finalización o finalización si no se inició

    clearInterval(timer);
    examenIniciado = false;
    
    const tiempoTotalSegundos = 180 * 60 - tiempoRestante;

    // Calcular resultados
    const correctas = respuestas.filter((r, i) => r !== null && r === preguntasActuales[i].correcta).length;
    const sinResponder = respuestas.filter(r => r === null).length;
    const incorrectas = preguntasActuales.length - correctas - sinResponder;
    const totalPreguntas = preguntasActuales.length;
    
    // Asegurarse de que el cálculo sea sobre 100 preguntas
    const porcentaje = Math.round((correctas / totalPreguntas) * 100); 
    const aprobado = porcentaje >= 70;

    // Mostrar resultados en la sección
    document.getElementById("resultadoCorrectas").textContent = correctas;
    document.getElementById("resultadoIncorrectas").textContent = incorrectas;
    document.getElementById("resultadoSinResponder").textContent = sinResponder;

    document.getElementById("resultadoEspecialidad").textContent = especialidadSeleccionada;
    
    const h = Math.floor(tiempoTotalSegundos / 3600);
    const m = Math.floor((tiempoTotalSegundos % 3600) / 60);
    const s = tiempoTotalSegundos % 60;
    document.getElementById("resultadoTiempo").textContent = `${h}h ${m}m ${s}s`;

    document.getElementById("resultadoEstado").textContent = aprobado ? '¡EXAMEN APROBADO!' : 'EXAMEN NO APROBADO';
    document.getElementById("resultadoMensaje").textContent = aprobado 
        ? `¡Felicidades! Has superado el examen con un ${porcentaje}% de aciertos.`
        : `Debes obtener al menos un 70%. Tu puntaje fue de ${porcentaje}%. ¡Sigue estudiando!`;
        
    const resultado = {
        correctas: correctas,
        incorrectas: incorrectas,
        sinResponder: sinResponder,
        porcentaje: porcentaje,
        aprobado: aprobado,
        tiempoTotal: tiempoTotalSegundos,
        especialidad: especialidadSeleccionada,
    };
    
    await guardarResultado(resultado);
    
    mostrarPantalla("resultadoSection");
}

// --- FUNCIONES DE RANKING ---

function mostrarRankingSection() {
    // Puedes cargar los datos del ranking aquí antes de mostrar la sección
    cargarRanking();
    mostrarPantalla('rankingSection');
}

async function cargarRanking() {
    if (!isAuthReady || !db) {
        document.getElementById('rankingBody').innerHTML = '<tr><td colspan="5">Cargando autenticación...</td></tr>';
        return;
    }

    const collectionPath = `artifacts/${appId}/public/data/exam_ranking`;
    const rankingRef = collection(db, collectionPath);
    
    // NOTA: Se recomienda ordenar en el cliente para evitar problemas de índices en Firestore
    // Aquí se obtiene un límite de 100 resultados.
    const q = query(rankingRef, limit(100)); 

    try {
        const snapshot = await getDocs(q);
        let rankingData = [];
        
        snapshot.forEach(doc => {
            rankingData.push(doc.data());
        });

        // Ordenar en el cliente por puntaje (descendente) y luego por tiempo (ascendente)
        rankingData.sort((a, b) => {
            if (b.puntaje !== a.puntaje) {
                return b.puntaje - a.puntaje; // Mayor puntaje primero
            }
            return a.tiempoUtilizado - b.tiempoUtilizado; // Menor tiempo primero
        });

        const rankingBody = document.getElementById('rankingBody');
        rankingBody.innerHTML = '';
        
        if (rankingData.length === 0) {
            rankingBody.innerHTML = '<tr><td colspan="5">No hay resultados en el ranking todavía.</td></tr>';
            return;
        }

        rankingData.forEach((data, index) => {
            const row = rankingBody.insertRow();
            const tiempoFormateado = `${Math.floor(data.tiempoUtilizado/3600)}h ${Math.floor((data.tiempoUtilizado%3600)/60)}m ${data.tiempoUtilizado%60}s`;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${data.userId.substring(0, 8)}...</td>
                <td>${data.especialidad}</td>
                <td>${data.puntaje}%</td>
                <td>${tiempoFormateado}</td>
            `;
            if (data.userId === userId) {
                row.classList.add('highlight-user');
            }
        });
        
    } catch (e) {
        console.error("Error al cargar el ranking:", e);
        document.getElementById('rankingBody').innerHTML = '<tr><td colspan="5">Error al cargar el ranking.</td></tr>';
    }
}


// --- INICIO DE LA APLICACIÓN ---\r\ndocument.addEventListener('DOMContentLoaded', () => {
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
window.cargarRanking = cargarRanking;
