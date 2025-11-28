/ Configuración
const ADMIN_KEY = "Teamopi91";
let claveAlumnos = localStorage.getItem("claveAlumnos") || generarClave();
let claveExpira = localStorage.getItem("claveExpira") || Date.now() + 48*60*60*1000;
const especialidades = [
    ...Array.from({length: 20}, (_,i) => `Medicina - Especialidad ${i+1}`),
    ...Array.from({length: 20}, (_,i) => `Enfermería - Especialidad ${i+1}`)
];
// Mapeo de especialidades a archivos JSON
const specialtyToFile = {
    "Medicina - Especialidad 1": "anestesiologia",
    "Medicina - Especialidad 2": "cardiologia",
    "Medicina - Especialidad 3": "dermatologia",
    "Medicina - Especialidad 4": "diagnostico_imagenes",
    "Medicina - Especialidad 5": "hematologia",
    "Medicina - Especialidad 6": "neumonologia",
    "Medicina - Especialidad 7": "neurologia",
    "Medicina - Especialidad 8": "oncologia",
    "Medicina - Especialidad 9": "ortopedia",
    "Medicina - Especialidad 10": "otorrinolaringologia",
    "Medicina - Especialidad 11": "pediatria",
    "Medicina - Especialidad 12": "psiquiatria",
    "Medicina - Especialidad 13": "tocoginecologia",
    "Medicina - Especialidad 14": "urologia",
};
// Reemplazo: generar preguntas temáticas por especialidad (Medicina vs Enfermería)
const preguntasPorEspecialidad = {};

function generarPreguntasParaEspecialidad(especialidad) {
	// Detectar si es enfermería
	const esEnfermeria = especialidad.toLowerCase().includes("enfermería");

	// Plantillas temáticas
	const temasMedicina = [
		"Anatomía",
		"Fisiología",
		"Farmacología",
		"Patología",
		"Microbiología",
		"Diagnóstico",
		"Urgencias",
		"Imagenología",
		"Cirugía",
		"Ética médica"
	];
	const temasEnfermeria = [
		"Cuidados básicos",
		"Signos vitales",
		"Administración de medicamentos",
		"Valoración del paciente",
		"Control de infecciones",
		"Movilización y traslado",
		"Primeros auxilios",
		"Educación al paciente",
		"Seguridad del paciente",
		"Registro y documentación"
	];

	const temas = esEnfermeria ? temasEnfermeria : temasMedicina;

	// Generar 100 preguntas variando temas y opciones
	return Array.from({length: 100}, (_, i) => {
		const tema = temas[i % temas.length];
		const n = i + 1;
		// Construir texto de pregunta según tipo
		const preguntaBase = esEnfermeria
			? `Pregunta ${n} (${tema}): ¿Cuál es la mejor práctica relacionada con ${tema.toLowerCase()} en ${especialidad}?`
			: `Pregunta ${n} (${tema}): ¿Cuál es el concepto clave sobre ${tema.toLowerCase()} en ${especialidad}?`;

		// Generar opciones plausibles y marcar una como correcta (rotación para variar)
		const correctaIdx = i % 4;
		const opciones = [
			`Opción A relacionada con ${tema} (alternativa)`,
			`Opción B relacionada con ${tema} (alternativa)`,
			`Opción C relacionada con ${tema} (alternativa)`,
			`Opción D relacionada con ${tema} (alternativa)`
		];

		// Hacer la opción correcta más específica según tema
		opciones[correctaIdx] = esEnfermeria
			? `Práctica correcta para ${tema} (respuesta ${String.fromCharCode(65 + correctaIdx)})`
			: `Respuesta correcta sobre ${tema} (respuesta ${String.fromCharCode(65 + correctaIdx)})`;

		return {
			pregunta: `${preguntaBase}`,
			opciones: opciones,
			correcta: correctaIdx
		};
	});
}

// Poblar preguntasPorEspecialidad usando la función generadora
especialidades.forEach(especialidad => {
    preguntasPorEspecialidad[especialidad] = Array.from({length: 100}, (_,i) => ({
        pregunta: `Pregunta ${i+1} de ${especialidad}`,
        opciones: [
            "Opción A",
            "Opción B",
            "Opción C",
            "Opción D"
        ],
        correcta: 0
    }));
});
let usuario = null;
let especialidadActual = null;
let preguntasActuales = [];
let respuestas = [];
let preguntaIdx = 0;
let timer = null;
let tiempoRestante = 4 * 60 * 60;
function mostrar(id) {
    ["loginSection","adminSection","especialidadSection","examenSection","resultadoSection"].forEach(sec => {
        document.getElementById(sec).style.display = (sec === id) ? "block" : "none";
    });
}
function login() {
    const clave = document.getElementById("claveInput").value;
    if (clave === ADMIN_KEY) {
        usuario = "admin";
        document.getElementById("claveAlumnos").textContent = claveAlumnos;
        mostrar("adminSection");
    } else if (clave === claveAlumnos) {
        usuario = "alumno";
        cargarEspecialidades();
        mostrar("especialidadSection");
    } else {
        document.getElementById("loginMsg").textContent = "Clave incorrecta.";
    }
}
function logout() {
    usuario = null;
    especialidadActual = null;
    preguntasActuales = [];
    respuestas = [];
    preguntaIdx = 0;
    clearInterval(timer);
    document.getElementById("claveInput").value = "";
    document.getElementById("loginMsg").textContent = "";
    mostrar("loginSection");
}
function cargarEspecialidades() {
    const sel = document.getElementById("especialidadSelect");
    sel.innerHTML = "";
    especialidades.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e;
        opt.textContent = e;
        sel.appendChild(opt);
    });
}
async function iniciarExamen() {
    especialidadActual = document.getElementById("especialidadSelect").value;
    const fileName = specialtyToFile[especialidadActual];
    if (fileName) {
        try {
            const response = await fetch(`data_final/${fileName}.json`);
            const data = await response.json();
            preguntasActuales = data.map(item => ({
                pregunta: item.question,
                opciones: item.options,
                correcta: item.answer - 1  // Convertir de 1-based a 0-based
            }));
        } catch (error) {
            console.error("Error cargando preguntas:", error);
            alert("Error cargando preguntas. Usando preguntas generadas.");
            preguntasActuales = preguntasPorEspecialidad[especialidadActual];
        }
    } else {
        preguntasActuales = preguntasPorEspecialidad[especialidadActual];
    }
    respuestas = [];
    preguntaIdx = 0;
    tiempoRestante = 4 * 60 * 60;
    mostrarPregunta();
    mostrar("examenSection");
    iniciarTimer();
}
function mostrarPregunta() {
    const p = preguntasActuales[preguntaIdx];
    let html = `<div><b>${preguntaIdx+1}/100:</b> ${p.pregunta}</div>`;
    p.opciones.forEach((op, i) => {
        html += `<div>
            <input type="radio" name="opcion" id="op${i}" value="${i}">
            <label for="op${i}">${op}</label>
        </div>`;
    });
    document.getElementById("preguntaContainer").innerHTML = html;
    document.getElementById("siguienteBtn").textContent = preguntaIdx === 99 ? "Finalizar" : "Siguiente";
}
function siguientePregunta() {
    const seleccionada = document.querySelector('input[name="opcion"]:checked');
    if (!seleccionada) {
        alert("Selecciona una opción.");
        return;
    }
    respuestas[preguntaIdx] = parseInt(seleccionada.value);
    preguntaIdx++;
    if (preguntaIdx < 100) {
        mostrarPregunta();
    } else {
        finalizarExamen();
    }
}
function finalizarExamen() {
    clearInterval(timer);
    let correctas = respuestas.filter((r, i) => r === preguntasActuales[i].correcta).length;
    let porcentaje = Math.round((correctas/100)*100);
    let aprobado = porcentaje >= 70;
    document.getElementById("resultadoTexto").innerHTML =
        `Respuestas correctas: <b>${correctas}</b> de 100<br>
        Puntaje: <b>${porcentaje}%</b><br>
        ${aprobado ? "<span style='color:green'>¡Aprobado!</span>" : "<span style='color:red'>No aprobado</span>"}`;
    mostrar("resultadoSection");
}
function iniciarTimer() {
    actualizarTimer();
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
    const h = Math.floor(tiempoRestante/3600);
    const m = Math.floor((tiempoRestante%3600)/60);
    const s = tiempoRestante%60;
    document.getElementById("timer").textContent = `Tiempo restante: ${h}h ${m}m ${s}s`;
}
function generarClave() {
    const clave = Math.random().toString(36).slice(-8);
    localStorage.setItem("claveAlumnos", clave);
    localStorage.setItem("claveExpira", Date.now() + 48*60*60*1000);
    return clave;
}
function regenerarClave() {
    claveAlumnos = generarClave();
    document.getElementById("claveAlumnos").textContent = claveAlumnos;
    alert("Clave de alumnos regenerada.");
}
if (Date.now() > claveExpira) {
    claveAlumnos = generarClave();
}
