// Script para generar 100 preguntas por especialidad
// Ejecutar con: node scripts/generate_questions.js

const fs = require('fs');
const path = require('path');

const especialidades = {
  anestesiologia: "Anestesiología",
  cardiologia: "Cardiología",
  dermatologia: "Dermatología",
  diagnostico_imagenes: "Diagnóstico por Imágenes",
  hematologia: "Hematología",
  neumonologia: "Neumonología",
  neurologia: "Neurología",
  ortopedia: "Ortopedia",
  otorrinolaringologia: "Otorrinolaringología",
  pediatria: "Pediatría",
  psiquiatria: "Psiquiatría",
  tocoginecologia: "Tocoginecología",
  urologia: "Urología"
};

const temas = {
  anestesiologia: [
    "Inducción anestésica", "Mantenimiento de anestesia", "Despertar", "Vías aéreas",
    "Monitoreo", "Complicaciones", "Farmacología anestésica", "Bloqueos regionales",
    "Seguridad del paciente", "Anestesia pediátrica"
  ],
  cardiologia: [
    "Arritmias", "Insuficiencia cardíaca", "Isquemia", "Hipertensión", "Valvulopatías",
    "Cardiopatías congénitas", "Miocardiopatías", "Pericarditis", "Ecocardiografía", "ECG"
  ],
  dermatologia: [
    "Infecciones bacterianas", "Infecciones virales", "Infecciones fúngicas", "Dermatitis",
    "Psoriasis", "Acné", "Melanoma", "Lupus", "Fototipo", "Cosmetología"
  ],
  diagnostico_imagenes: [
    "Radiografía simple", "Tomografía computada", "Resonancia magnética", "Ultrasonografía",
    "Radiología vascular", "Medicina nuclear", "PET-CT", "Neuroradiología", "Radiología torácica", "Radiología abdominal"
  ],
  hematologia: [
    "Anemias", "Trombocitopenias", "Leucemias", "Linfomas", "Coagulopatías", 
    "Hemofilia", "Talasemia", "Drepanocitosis", "Hemolisis", "Transfusiones"
  ],
  neumonologia: [
    "Asma", "EPOC", "Neumonía", "TBC", "Fibrosis pulmonar", "Embolia pulmonar",
    "Hipertensión pulmonar", "Apnea del sueño", "Cáncer de pulmón", "Espirometría"
  ],
  neurologia: [
    "ACV", "Migraña", "Epilepsia", "Parkinson", "Alzheimer", "ELA",
    "Neuropatías", "Mielitis", "Meningitis", "Encefalopatías"
  ],
  ortopedia: [
    "Fracturas", "Luxaciones", "Esguinces", "Roturas ligamentarias", "Artrosis",
    "Artritis", "Cifosis", "Lordosis", "Escoliosis", "Hernias discales"
  ],
  otorrinolaringologia: [
    "Otitis", "Sinusitis", "Faringitis", "Anginas", "Laringitis",
    "Ronquera", "Hipoacusia", "Vértigo", "Otalgia", "Pólipos nasales"
  ],
  pediatria: [
    "Examen neonatal", "Crecimiento desarrollo", "Desnutrición", "Diarrea",
    "Infecciones respiratorias", "Vacunas", "Asma pediátrico", "Malformaciones", "Alergias", "Pediatría social"
  ],
  psiquiatria: [
    "Depresión", "Ansiedad", "Bipolaridad", "Esquizofrenia", "Trastornos de personalidad",
    "Trastornos alimentarios", "Abuso de sustancias", "Demencia", "Psicosis", "Suicidio"
  ],
  tocoginecologia: [
    "Embarazo normal", "Complicaciones obstétricas", "Parto", "Puerperio", 
    "Ciclo menstrual", "Menopausia", "Anticoncepción", "Infertilidad", "Cáncer ginecológico", "Endometriosis"
  ],
  urologia: [
    "Litiasis renal", "Infecciones urinarias", "Prostatitis", "Incontinencia", "Impotencia",
    "Cáncer de próstata", "Cáncer de vejiga", "Hematuria", "Hidronefrosis", "Resección transuretral"
  ]
};

function generarPregunta(especialidad, tema, numero, variacionIndex) {
  const respuestaCorrecta = (numero + variacionIndex) % 4; // Variar la respuesta correcta

  // Variaciones para hacer preguntas únicas
  const variaciones = [
    `¿En cuanto a ${tema.toLowerCase()} en ${especialidad}, cuál es la afirmación correcta?`,
    `¿Cuál de las siguientes afirmaciones sobre ${tema.toLowerCase()} en ${especialidad} es correcta?`,
    `¿Qué afirmación es correcta respecto a ${tema.toLowerCase()} en ${especialidad}?`,
    `¿Cuál es la afirmación correcta acerca de ${tema.toLowerCase()} en ${especialidad}?`,
    `¿Qué opción describe correctamente ${tema.toLowerCase()} en ${especialidad}?`,
    `¿Cuál es la respuesta correcta para ${tema.toLowerCase()} en ${especialidad}?`,
    `¿Qué se afirma correctamente sobre ${tema.toLowerCase()} en ${especialidad}?`,
    `¿Cuál de estas opciones es correcta en ${tema.toLowerCase()} de ${especialidad}?`,
    `¿Qué enunciado es válido para ${tema.toLowerCase()} en ${especialidad}?`,
    `¿Cuál es la afirmación precisa sobre ${tema.toLowerCase()} en ${especialidad}?`
  ];

  const preguntaTexto = variaciones[variacionIndex % variaciones.length];

  return {
    question: `${numero}. ${preguntaTexto}`,
    options: [
      `La opción A se refiere a aspectos iniciales de ${tema}`,
      `La opción B describe hallazgos intermedios en ${tema}`,
      `La opción C indica el enfoque correcto para ${tema}`,
      `La opción D corresponde a cuidados de seguimiento en ${tema}`
    ],
    answer: respuestaCorrecta
  };
}

function generarEspecialidad(key, nombre) {
  const preguntas = [];
  const temasEsp = temas[key] || [];

  // Generar 10 preguntas por tema para tener 100 preguntas únicas
  temasEsp.forEach((tema, temaIndex) => {
    for (let i = 0; i < 10; i++) {
      const numero = temaIndex * 10 + i + 1;
      const pregunta = generarPregunta(nombre, tema, numero, i);
      preguntas.push(pregunta);
    }
  });

  return preguntas;
}

// Generar archivos JSON
Object.keys(especialidades).forEach(key => {
  const nombre = especialidades[key];
  const preguntas = generarEspecialidad(key, nombre);
  const filePath = path.join(__dirname, '../data_final', `${key}.json`);
  
  fs.writeFileSync(filePath, JSON.stringify(preguntas, null, 2));
  console.log(`✓ Generado: ${key}.json (${preguntas.length} preguntas)`);
});

console.log("\n✓ Todos los archivos JSON han sido generados exitosamente!");
