// Script para generar plantillas de exámenes de enfermería
// Este archivo sirve como referencia para agregar más preguntas

const plantillaEnfermeria = {
    "id": 1,
    "tema": "Enfermería - Examen [AÑO]",
    "año": 2016, // Cambiar según corresponda
    "caso_clínico": "Descripción del caso clínico del paciente",
    "pregunta": "¿Pregunta relacionada con el caso clínico?",
    "opciones": {
        "opcion a": "Primera opción de respuesta",
        "opcion b": "Segunda opción de respuesta",
        "opcion c": "Tercera opción de respuesta",
        "opcion d": "Cuarta opción de respuesta"
    },
    "respuesta_correcta": "opcion a" // Puede ser "opcion a", "opcion b", "opcion c" o "opcion d"
};

// INSTRUCCIONES PARA COMPLETAR LOS ARCHIVOS JSON:
// 1. Abre los archivos data_final/enfermeria_2016.json y data_final/enfermeria_2019.json
// 2. Cada archivo debe contener un array con 100 preguntas
// 3. Cada pregunta debe seguir la estructura de "plantillaEnfermeria" de arriba
// 4. Asegúrate de que cada pregunta tenga un id único (del 1 al 100)
// 5. La respuesta_correcta debe ser exactamente: "opcion a", "opcion b", "opcion c" o "opcion d"

// CATEGORÍAS SUGERIDAS PARA ENFERMERÍA:
const categorias = [
    "Fundamentos de Enfermería",
    "Enfermería Médico-Quirúrgica",
    "Enfermería Pediátrica",
    "Enfermería Materno-Infantil",
    "Enfermería en Salud Mental",
    "Administración de Medicamentos",
    "Cuidados Intensivos",
    "Enfermería Comunitaria",
    "Bioseguridad",
    "Proceso de Atención de Enfermería (PAE)",
    "Valoración de Signos Vitales",
    "Cuidados de Heridas",
    "Nutrición y Dietética",
    "Procedimientos de Enfermería",
    "Ética y Legislación en Enfermería"
];

// EJEMPLO DE ESTRUCTURA COMPLETA DE UN EXAMEN:
const ejemploExamen = [
    {
        "id": 1,
        "tema": "Fundamentos de Enfermería",
        "año": 2016,
        "caso_clínico": "Paciente de 45 años hospitalizado requiere toma de signos vitales.",
        "pregunta": "¿Cuál es la frecuencia cardíaca normal en adultos en reposo?",
        "opciones": {
            "opcion a": "40-60 lpm",
            "opcion b": "60-100 lpm",
            "opcion c": "100-120 lpm",
            "opcion d": "120-140 lpm"
        },
        "respuesta_correcta": "opcion b"
    },
    {
        "id": 2,
        "tema": "Administración de Medicamentos",
        "año": 2016,
        "caso_clínico": "Paciente requiere administración de insulina subcutánea.",
        "pregunta": "¿Cuál es el ángulo de inserción correcto para una inyección subcutánea?",
        "opciones": {
            "opcion a": "90 grados",
            "opcion b": "45 grados",
            "opcion c": "15 grados",
            "opcion d": "30 grados"
        },
        "respuesta_correcta": "opcion b"
    }
    // ... continuar hasta 100 preguntas
];

console.log("Plantilla de enfermería lista. Completa los archivos JSON con las preguntas de los PDFs.");
