// ============================================================================
// SISTEMA DE EXAMEN MÉDICO - APP.JS
// ============================================================================

// ===================== VARIABLES GLOBALES =====================
const ADMIN_KEY = "Teamopi91";
const TIEMPO_EXAMEN = 4 * 60 * 60; // 4 horas en segundos

let claveAlumnos = localStorage.getItem("claveAlumnos") || generarClave();
let claveExpira = parseInt(localStorage.getItem("claveExpira")) || Date.now() + 48*60*60*1000;

let usuario = null;
let especialidadActual = null;
let preguntasActuales = [];
let respuestasUsuario = {};
let preguntaIdx = 0;
let tiempoRestante = TIEMPO_EXAMEN;
let tiempoInicio = 0;
let intervaloTimer = null;
let navegadorVisible = false;

const especialidades = [
    "Anestesiología",
    "Cardiología",
    "Dermatología",
    "Diagnóstico por Imágenes",
    "Hematología",
    "Neumonología",
    "Neurología",
    "Ortopedia",
    "Otorrinolaringología",
    "Pediatría",
    "Psiquiatría",
    "Tocoginecología",
    "Urología"
];

// ===================== FUNCIONES DE NAVEGACIÓN =====================

function mostrarScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function volverASeleccion() {
    mostrarScreen("seleccionSection");
    document.getElementById("claveAdminInput").value = "";
    document.getElementById("claveAlumnoInput").value = "";
    document.getElementById("loginAdminMsg").textContent = "";
    document.getElementById("loginAlumnoMsg").textContent = "";
}

function mostrarLoginAdmin() {
    mostrarScreen("loginAdminSection");
}

function mostrarLoginAlumno() {
    mostrarScreen("loginAlumnoSection");
}

function generarClave() {
    const clave = Math.random().toString(36).slice(-8).toUpperCase();
    localStorage.setItem("claveAlumnos", clave);
    localStorage.setItem("claveExpira", Date.now() + 48*60*60*1000);
    return clave;
}

function formatearTiempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ===================== FUNCIONES DE LOGIN =====================

function loginAdmin() {
    const clave = document.getElementById("claveAdminInput").value.trim();
    
    if (!clave) {
        mostrarErrorAdmin("Por favor ingresa una clave");
        return;
    }

    if (clave === ADMIN_KEY) {
        usuario = "admin";
        document.getElementById("claveAlumnos").textContent = claveAlumnos;
        mostrarScreen("adminSection");
    } else {
        mostrarErrorAdmin("Clave de administrador incorrecta");
    }
    
    document.getElementById("claveAdminInput").value = "";
}

function loginAlumno() {
    const clave = document.getElementById("claveAlumnoInput").value.trim();
    
    if (!clave) {
        mostrarErrorAlumno("Por favor ingresa tu clave");
        return;
    }

    // Verificar si la clave de alumnos ha expirado
    if (Date.now() > claveExpira) {
        claveAlumnos = generarClave();
    }

    if (clave === claveAlumnos) {
        usuario = "alumno";
        cargarEspecialidades();
        mostrarScreen("especialidadSection");
    } else {
        mostrarErrorAlumno("Clave incorrecta. Solicita una nueva al administrador.");
    }
    
    document.getElementById("claveAlumnoInput").value = "";
}

function mostrarErrorAdmin(mensaje) {
    document.getElementById("loginAdminMsg").textContent = mensaje;
    setTimeout(() => {
        document.getElementById("loginAdminMsg").textContent = "";
    }, 4000);
}

function mostrarErrorAlumno(mensaje) {
    document.getElementById("loginAlumnoMsg").textContent = mensaje;
    setTimeout(() => {
        document.getElementById("loginAlumnoMsg").textContent = "";
    }, 4000);
}

function copiarClave() {
    const clave = document.getElementById("claveAlumnos").textContent;
    navigator.clipboard.writeText(clave).then(() => {
        alert("Clave copiada al portapapeles");
    });
}

function regenerarClave() {
    if (confirm("¿Estás seguro de que quieres regenerar la clave? Los alumnos actuales perderán acceso.")) {
        claveAlumnos = generarClave();
        claveExpira = Date.now() + 48*60*60*1000;
        
        // Guardar en localStorage
        localStorage.setItem("claveAlumnos", claveAlumnos);
        localStorage.setItem("claveExpira", claveExpira.toString());
        
        document.getElementById("claveAlumnos").textContent = claveAlumnos;
        alert(`Clave regenerada exitosamente: ${claveAlumnos}\nVálida por 48 horas`);
    }
}

function logout() {
    usuario = null;
    especialidadActual = null;
    preguntasActuales = [];
    respuestasUsuario = {};
    preguntaIdx = 0;
    tiempoRestante = TIEMPO_EXAMEN;
    
    if (intervaloTimer) {
        clearInterval(intervaloTimer);
    }
    
    document.getElementById("claveAdminInput").value = "";
    document.getElementById("claveAlumnoInput").value = "";
    volverASeleccion();
}

// ===================== FUNCIONES DE CARGA DE DATOS =====================

async function cargarEspecialidades() {
    const lista = document.getElementById("especialidadList");
    lista.innerHTML = "";
    
    especialidades.forEach((esp) => {
        const div = document.createElement("div");
        div.className = "especialidad-item";
        div.textContent = esp;
        div.onclick = () => seleccionarEspecialidad(esp, div);
        lista.appendChild(div);
    });
}

function seleccionarEspecialidad(especialidad, elemento) {
    // Marcar visualmente la especialidad seleccionada
    document.querySelectorAll(".especialidad-item").forEach(el => {
        el.classList.remove("selected");
    });
    elemento.classList.add("selected");
    especialidadActual = especialidad;

    // Si el usuario actual es un alumno, iniciar el examen automáticamente
    // Esto evita pasos adicionales: alumno pone la clave, elige la especialidad y comienza.
    if (usuario === "alumno") {
        // Pequeño retardo para permitir que el UI muestre la selección antes de cambiar de pantalla
        setTimeout(() => {
            iniciarExamen();
        }, 200);
    }
}

async function cargarPreguntas(especialidad) {
    // Convertir nombre a archivo JSON
    const nombreArchivo = especialidad
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");
    
    try {
        const response = await fetch(`./data_final/${nombreArchivo}.json`);
        if (!response.ok) throw new Error("No se encontró el archivo");
        
        const preguntas = await response.json();
        return preguntas;
    } catch (error) {
        console.error("Error cargando preguntas:", error);
        alert("Error al cargar las preguntas de la especialidad");
        return [];
    }
}

// ===================== FUNCIONES DE EXAMEN =====================

async function iniciarExamen() {
    if (!especialidadActual) {
        alert("Por favor selecciona una especialidad");
        return;
    }

    preguntasActuales = await cargarPreguntas(especialidadActual);
    
    if (preguntasActuales.length === 0) {
        alert("No se pudieron cargar las preguntas");
        return;
    }

    console.log(`${especialidadActual}: ${preguntasActuales.length} preguntas cargadas`);

    // Si el archivo ya contiene exactamente 100 preguntas, usarlas tal cual (mantener orden original)
    if (preguntasActuales.length === 100) {
        // No modificar: conservar preguntas tal como están en data_final
        console.log(`${especialidadActual}: 100 preguntas - usando orden original del archivo`);
    } else {
        // Si hay más de 100, eliminar duplicados y limitar a 100
        if (preguntasActuales.length > 100) {
            preguntasActuales = eliminarDuplicados(preguntasActuales);
            preguntasActuales = preguntasActuales.slice(0, 100);
            console.log(`${especialidadActual}: reducido a ${preguntasActuales.length} preguntas tras eliminar duplicados`);
        }

        // Si hay menos de 100, completar con preguntas de otras especialidades
        if (preguntasActuales.length < 100) {
            console.warn(`Se encontraron ${preguntasActuales.length} preguntas. Completando con preguntas de otras especialidades...`);
            preguntasActuales = await completarPreguntasConPalabrasClaves(preguntasActuales, especialidadActual);
        }

        // Finalmente, asegurar que no superen 100
        preguntasActuales = preguntasActuales.slice(0, 100);
    }

    respuestasUsuario = {};
    preguntaIdx = 0;
    tiempoRestante = TIEMPO_EXAMEN;
    tiempoInicio = Date.now();

    mostrarScreen("examenSection");
    renderizarPregunta();
    iniciarTimer();
    renderizarNavegador();
}

// Función para cambiar de especialidad durante el examen
function cambiarEspecialidad() {
    if (confirm("¿Estás seguro de que quieres cambiar de especialidad? Se perderá el progreso actual.")) {
        clearInterval(intervaloTimer);
        intervaloTimer = null;
        preguntasActuales = [];
        respuestasUsuario = {};
        preguntaIdx = 0;
        tiempoRestante = TIEMPO_EXAMEN;
        especialidadActual = null;
        
        cargarEspecialidades();
        mostrarScreen("especialidadSection");
    }
}

// Función para eliminar preguntas duplicadas
function eliminarDuplicados(preguntas) {
    const vistas = new Set();
    const resultado = [];

    for (const pregunta of preguntas) {
        // Remover el número al inicio y usar como clave única
        const clave = pregunta.question.replace(/^\d+\.\s*/, '').trim().toLowerCase();

        if (!vistas.has(clave)) {
            vistas.add(clave);
            resultado.push(pregunta);
        }
    }

    return resultado;
}

// Función para mezclar un array (algoritmo Fisher-Yates)
function mezclarArray(array) {
    const resultado = [...array];
    for (let i = resultado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
}

// Función para completar preguntas insuficientes con palabras clave
async function completarPreguntasConPalabrasClaves(preguntasActuales, especialidad) {
    const PALABRAS_CLAVE = {
        "Pediatría": ["niño", "niña", "adolescente", "lactante", "infancia", "congénito", "recién nacido"],
        "Psiquiatría": ["medicación", "psicofármaco", "antidepresivo", "ansiolítico", "antipsicótico", "anestesia", "neuropsiquiátrico"],
        "Anestesiología": ["anestesia", "sedación", "intubación", "anestésico", "inducción", "analgesia"],
        "Cardiología": ["cardíaco", "corazón", "infarto", "arritmia", "coronario", "cardiaco"],
        "Dermatología": ["piel", "derma", "erupción", "lesión cutánea", "melanoma", "dermatitis"],
        "Diagnóstico por Imágenes": ["radiografía", "tomografía", "resonancia", "ecografía", "imagen", "radiológico"],
        "Hematología": ["sangre", "anemia", "hemoglobina", "glóbulo", "hemático", "leucemia"],
        "Neumonología": ["pulmón", "respiratorio", "bronquitis", "asma", "neumonía", "pulmonar"],
        "Neurología": ["neurológico", "cerebro", "epilepsia", "ictus", "neurona", "Parkinson"],
        "Ortopedia": ["hueso", "fractura", "articulación", "columna", "musculosquelético", "óseo"],
        "Otorrinolaringología": ["oído", "garganta", "nariz", "otorrino", "laríngeo", "faringe"],
        "Tocoginecología": ["embarazo", "gestación", "parto", "ginecología", "obstétrico", "gestante"],
        "Urología": ["riñón", "vejiga", "próstata", "urinario", "nefro", "urológico"]
    };
    
    // Si ya tenemos 100 preguntas, no hacer nada
    if (preguntasActuales.length >= 100) {
        return preguntasActuales.slice(0, 100);
    }
    
    const palabrasEspecialidad = PALABRAS_CLAVE[especialidad] || [];
    const preguntasAñadidas = new Set();
    
    // Registrar preguntas ya existentes
    preguntasActuales.forEach(p => {
        preguntasAñadidas.add(p.question.trim().toLowerCase());
    });
    
    // Cargar todas las especialidades excepto la actual
    for (const esp of especialidades) {
        if (esp === especialidad || preguntasActuales.length >= 100) break;
        
        try {
            const nombreArchivo = esp
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "_");
            
            const response = await fetch(`./data_final/${nombreArchivo}.json`);
            if (!response.ok) continue;
            
            const preguntasOtras = await response.json();
            
            // Filtrar preguntas que contengan palabras clave
            for (const pregunta of preguntasOtras) {
                if (preguntasActuales.length >= 100) break;
                
                const textoCompleto = (pregunta.question + " " + pregunta.options.join(" ")).toLowerCase();
                const contieneClaves = palabrasEspecialidad.some(palabra => textoCompleto.includes(palabra.toLowerCase()));
                
                if (contieneClaves) {
                    const clave = pregunta.question.trim().toLowerCase();
                    if (!preguntasAñadidas.has(clave)) {
                        preguntasAñadidas.add(clave);
                        preguntasActuales.push(pregunta);
                    }
                }
            }
        } catch (error) {
            console.error(`Error cargando preguntas de ${esp}:`, error);
        }
    }
    
    return preguntasActuales;
}

function renderizarPregunta() {
    const pregunta = preguntasActuales[preguntaIdx];
    
    // Actualizar contador
    document.getElementById("questionCounter").textContent = `${preguntaIdx + 1}/100`;
    
    // Actualizar barra de progreso
    const porcentajeProgreso = ((preguntaIdx + 1) / preguntasActuales.length) * 100;
    document.getElementById("progressFill").style.width = porcentajeProgreso + "%";
    
    // Mostrar pregunta
    document.getElementById("preguntaContainer").innerHTML = `
        <strong>Pregunta ${preguntaIdx + 1}</strong><br>
        ${pregunta.question}
    `;
    
    // Renderizar opciones
    const contenedor = document.getElementById("opcionesContainer");
    contenedor.innerHTML = "";
    
    const respuestaGuardada = respuestasUsuario[preguntaIdx];
    
    pregunta.options.forEach((opcion, idx) => {
        const div = document.createElement("div");
        div.className = "opcion";
        
        if (respuestaGuardada === idx) {
            div.classList.add("selected");
        }
        
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "opcion";
        input.value = idx;
        input.checked = respuestaGuardada === idx;
        input.onchange = () => seleccionarRespuesta(idx);
        
        const label = document.createElement("label");
        label.textContent = opcion;
        
        div.appendChild(input);
        div.appendChild(label);
        contenedor.appendChild(div);
    });
    
    // Actualizar estado de botones
    document.getElementById("btnAnterior").disabled = preguntaIdx === 0;
    document.getElementById("btnSiguiente").textContent = 
        preguntaIdx === preguntasActuales.length - 1 
            ? "Finalizar Examen" 
            : "Siguiente";
    
    // Actualizar navegador
    actualizarCirculoNavegador();
}

function seleccionarRespuesta(indiceOpcion) {
    respuestasUsuario[preguntaIdx] = indiceOpcion;
    actualizarCirculoNavegador();
}

function preguntaSiguiente() {
    if (preguntaIdx < preguntasActuales.length - 1) {
        preguntaIdx++;
        renderizarPregunta();
    } else {
        finalizarExamen();
    }
}

function preguntaAnterior() {
    if (preguntaIdx > 0) {
        preguntaIdx--;
        renderizarPregunta();
    }
}

function irAPregunta(idx) {
    preguntaIdx = idx;
    renderizarPregunta();
    toggleNavigator();
}

// ===================== NAVEGADOR DE PREGUNTAS =====================

function renderizarNavegador() {
    const contenedor = document.getElementById("questionsNav");
    contenedor.innerHTML = "";
    
    for (let i = 0; i < preguntasActuales.length; i++) {
        const circle = document.createElement("div");
        circle.className = "question-circle";
        
        if (i === preguntaIdx) {
            circle.classList.add("current");
        } else if (respuestasUsuario.hasOwnProperty(i)) {
            circle.classList.add("answered");
        } else {
            circle.classList.add("unanswered");
        }
        
        circle.textContent = i + 1;
        circle.onclick = () => irAPregunta(i);
        contenedor.appendChild(circle);
    }
}

function actualizarCirculoNavegador() {
    const circles = document.querySelectorAll(".question-circle");
    circles.forEach((circle, idx) => {
        circle.classList.remove("current", "answered", "unanswered");
        
        if (idx === preguntaIdx) {
            circle.classList.add("current");
        } else if (respuestasUsuario.hasOwnProperty(idx)) {
            circle.classList.add("answered");
        } else {
            circle.classList.add("unanswered");
        }
    });
}

function toggleNavigator() {
    const navigator = document.querySelector(".question-navigator");
    navigator.classList.toggle("active");
    navegadorVisible = !navegadorVisible;
}

// ===================== TIMER =====================

function iniciarTimer() {
    if (intervaloTimer) clearInterval(intervaloTimer);
    
    intervaloTimer = setInterval(() => {
        tiempoRestante--;
        actualizarTimer();
        
        if (tiempoRestante <= 0) {
            clearInterval(intervaloTimer);
            finalizarExamen();
        }
    }, 1000);
}

function actualizarTimer() {
    document.getElementById("timerDisplay").textContent = formatearTiempo(tiempoRestante);
    
    // Cambiar color si quedan menos de 30 minutos
    const timerDisplay = document.querySelector(".timer-display");
    if (tiempoRestante < 1800) {
        timerDisplay.style.color = "#ef4444";
    }
}

// ===================== FINALIZAR EXAMEN =====================

function finalizarExamen() {
    clearInterval(intervaloTimer);
    
    // Calcular resultados
    let correctas = 0;
    let incorrectas = 0;
    let sinResponder = 0;
    
    preguntasActuales.forEach((pregunta, idx) => {
        if (respuestasUsuario.hasOwnProperty(idx)) {
            if (respuestasUsuario[idx] === pregunta.answer) {
                correctas++;
            } else {
                incorrectas++;
            }
        } else {
            sinResponder++;
        }
    });
    
    const porcentaje = Math.round((correctas / preguntasActuales.length) * 100);
    const aprobado = porcentaje >= 70;
    const tiempoUsado = formatearTiempo(TIEMPO_EXAMEN - tiempoRestante);
    
    // Mostrar resultados
    document.getElementById("resultadoporcentaje").textContent = porcentaje + "%";
    document.getElementById("resultadoCorrectas").textContent = correctas;
    document.getElementById("resultadoIncorrectas").textContent = incorrectas;
    document.getElementById("resultadoSinResponder").textContent = sinResponder;
    
    document.getElementById("resultadoEspecialidad").textContent = especialidadActual;
    document.getElementById("resultadoTiempo").textContent = tiempoUsado;
    
    if (aprobado) {
        document.getElementById("resultadoEstado").innerHTML = 
            '<i class="fas fa-check-circle" style="color: #10b981; margin-right: 10px;"></i>¡APROBADO!';
        document.getElementById("resultadoMensaje").textContent = 
            `Excelente desempeño. Obtuviste ${porcentaje}% de aciertos.`;
        document.getElementById("resultadoEstado").style.color = "#10b981";
    } else {
        document.getElementById("resultadoEstado").innerHTML = 
            '<i class="fas fa-times-circle" style="color: #ef4444; margin-right: 10px;"></i>NO APROBADO';
        document.getElementById("resultadoMensaje").textContent = 
            `Obtuviste ${porcentaje}% de aciertos. Se requiere 70% para aprobar.`;
        document.getElementById("resultadoEstado").style.color = "#ef4444";
    }
    
    mostrarScreen("resultadoSection");
}

function volverAlInicio() {
    usuario = null;
    especialidadActual = null;
    preguntasActuales = [];
    respuestasUsuario = {};
    preguntaIdx = 0;
    tiempoRestante = TIEMPO_EXAMEN;
    
    // Detener el timer si está activo
    if (intervaloTimer) {
        clearInterval(intervaloTimer);
        intervaloTimer = null;
    }
    
    // Limpiar campos de entrada
    document.getElementById("claveAdminInput").value = "";
    document.getElementById("claveAlumnoInput").value = "";
    document.getElementById("loginAdminMsg").textContent = "";
    document.getElementById("loginAlumnoMsg").textContent = "";
    
    // Volver a la pantalla de selección de rol
    volverASeleccion();
}

// ===================== INICIALIZACIÓN =====================

document.addEventListener("DOMContentLoaded", () => {
    mostrarScreen("seleccionSection");
    
    // Permitir Enter en inputs de clave
    document.getElementById("claveAdminInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") loginAdmin();
    });
    
    document.getElementById("claveAlumnoInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") loginAlumno();
    });
});

// Prevenir cierre accidental del examen
window.addEventListener("beforeunload", (e) => {
    if (usuario === "alumno" && preguntasActuales.length > 0) {
        e.preventDefault();
        e.returnValue = "";
    }
});