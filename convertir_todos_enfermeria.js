#!/usr/bin/env node

// Script unificado para convertir todos los formatos de enfermería a JSON

const fs = require('fs');
const path = require('path');

// Formato 1: JSON con claves a, b, c, d
function convertirFormatoJSON(contenido, año) {
    try {
        let data = JSON.parse(contenido);
        let preguntas = data;
        
        // Si tiene estructura con "questions" array
        if (data.questions && Array.isArray(data.questions)) {
            preguntas = data.questions.map(q => {
                let respuestaCorrecta = 'a';
                const opciones = { a: '', b: '', c: '', d: '' };
                const letras = ['A', 'B', 'C', 'D'];
                
                letras.forEach((letra, index) => {
                    if (q.options && q.options[letra]) {
                        opciones[letra.toLowerCase()] = q.options[letra].text || q.options[letra];
                        if (q.options[letra].is_correct === true) {
                            respuestaCorrecta = letra.toLowerCase();
                        }
                    }
                });
                
                return {
                    id: q.question_number || q.id,
                    tema: `Enfermería ${año}`,
                    año: año,
                    caso_clínico: "",
                    pregunta: q.question || q.pregunta,
                    opciones: {
                        "opcion a": opciones.a,
                        "opcion b": opciones.b,
                        "opcion c": opciones.c,
                        "opcion d": opciones.d
                    },
                    respuesta_correcta: `opcion ${respuestaCorrecta}`
                };
            });
        } else if (Array.isArray(preguntas)) {
            // Formato anterior
            preguntas = preguntas.map(p => ({
                id: p.id,
                tema: p.tema || `Enfermería ${año}`,
                año: año,
                caso_clínico: p.caso_clínico || "",
                pregunta: p.pregunta,
                opciones: {
                    "opcion a": p.opciones.a || p.opciones.A || "",
                    "opcion b": p.opciones.b || p.opciones.B || "",
                    "opcion c": p.opciones.c || p.opciones.C || "",
                    "opcion d": p.opciones.d || p.opciones.D || ""
                },
                respuesta_correcta: `opcion ${(p.respuesta_correcta || 'a').toLowerCase()}`
            }));
        }
        
        return preguntas;
    } catch (e) {
        return null;
    }
}

// Formato 2: Texto plano con número) pregunta (correcta)
function convertirFormatoTextoNumeros(contenido, año) {
    const preguntas = [];
    const bloques = contenido.split(/\n(?=\d+\))/);
    
    bloques.forEach(bloque => {
        if (!bloque.trim()) return;
        
        const matchId = bloque.match(/^(\d+)\)/);
        if (!matchId) return;
        
        const id = parseInt(matchId[1]);
        const lineas = bloque.split('\n');
        let preguntaTexto = '';
        let opciones = { a: '', b: '', c: '', d: '' };
        let respuestaCorrecta = 'a';
        let enPregunta = true;
        
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;
            
            if (linea.match(/^[a-d]\)/)) {
                enPregunta = false;
                const letra = linea[0];
                let texto = linea.substring(2).trim();
                
                if (texto.includes('(correcta)')) {
                    respuestaCorrecta = letra;
                    texto = texto.replace('(correcta)', '').trim();
                }
                
                opciones[letra] = texto;
            } else if (enPregunta) {
                preguntaTexto += (preguntaTexto ? ' ' : '') + linea;
            }
        }
        
        if (preguntaTexto && Object.values(opciones).some(o => o)) {
            preguntas.push({
                id: id,
                tema: `Enfermería ${año}`,
                año: año,
                caso_clínico: "",
                pregunta: preguntaTexto,
                opciones: {
                    "opcion a": opciones.a,
                    "opcion b": opciones.b,
                    "opcion c": opciones.c,
                    "opcion d": opciones.d
                },
                respuesta_correcta: `opcion ${respuestaCorrecta}`
            });
        }
    });
    
    return preguntas.length > 0 ? preguntas : null;
}

// Formato 3: Texto con "Correcta:" e "Incorrecta:"
function convertirFormatoCorrectaIncorrecta(contenido, año) {
    const preguntas = [];
    const bloques = contenido.split(/\n(?=\d+\))/);
    
    bloques.forEach(bloque => {
        if (!bloque.trim()) return;
        
        const matchId = bloque.match(/^(\d+)\)/);
        if (!matchId) return;
        
        const id = parseInt(matchId[1]);
        const lineas = bloque.split('\n').filter(l => l.trim());
        
        let preguntaTexto = '';
        let correcta = '';
        let incorrectas = [];
        
        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            
            if (i === 0) {
                preguntaTexto = linea.replace(/^\d+\)\s*/, '');
            } else if (linea.toLowerCase().startsWith('correcta:')) {
                correcta = linea.substring(linea.indexOf(':') + 1).trim();
            } else if (linea.toLowerCase().startsWith('incorrecta')) {
                incorrectas.push(linea.substring(linea.indexOf(':') + 1).trim());
            }
        }
        
        if (preguntaTexto && correcta && incorrectas.length >= 3) {
            const opciones = [correcta, ...incorrectas.slice(0, 3)];
            // Mezclar opciones aleatoriamente
            const shuffled = opciones.sort(() => Math.random() - 0.5);
            const respuestaIndex = shuffled.indexOf(correcta);
            const letras = ['a', 'b', 'c', 'd'];
            
            preguntas.push({
                id: id,
                tema: `Enfermería ${año}`,
                año: año,
                caso_clínico: "",
                pregunta: preguntaTexto,
                opciones: {
                    "opcion a": shuffled[0] || "",
                    "opcion b": shuffled[1] || "",
                    "opcion c": shuffled[2] || "",
                    "opcion d": shuffled[3] || ""
                },
                respuesta_correcta: `opcion ${letras[respuestaIndex]}`
            });
        }
    });
    
    return preguntas.length > 0 ? preguntas : null;
}

function convertirArchivo(archivoEntrada, archivoSalida, año) {
    console.log(`Procesando: ${path.basename(archivoEntrada)}`);
    
    try {
        const contenido = fs.readFileSync(archivoEntrada, 'utf8');
        
        // Intentar diferentes formatos
        let preguntas = convertirFormatoJSON(contenido, año);
        
        if (!preguntas) {
            preguntas = convertirFormatoCorrectaIncorrecta(contenido, año);
        }
        
        if (!preguntas) {
            preguntas = convertirFormatoTextoNumeros(contenido, año);
        }
        
        if (preguntas && preguntas.length > 0) {
            fs.writeFileSync(archivoSalida, JSON.stringify(preguntas, null, 2), 'utf8');
            console.log(`✓ Convertido: ${path.basename(archivoSalida)} (${preguntas.length} preguntas)`);
            return true;
        } else {
            console.log(`⚠ No se pudieron extraer preguntas de: ${path.basename(archivoEntrada)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`✗ Error: ${error.message}`);
        return false;
    }
}

// Archivos a convertir
const archivos = [
    // 2021
    { entrada: 'enfermeria año 2021.txt', salida: 'enfermeria_2021.json', año: 2021 },
    { entrada: 'enfermeria 3 año2021.txt', salida: 'enfermeria_2021_alt.json', año: 2021 },
    
    // 2022 - Todos los años de carrera
    { entrada: 'enfermeria 1 año 2022.txt', salida: 'enfermeria_2022_1.json', año: 2022 },
    { entrada: 'enfermeria 2 año 2022.txt', salida: 'enfermeria_2022_2.json', año: 2022 },
    { entrada: 'enfermeria 3 año 2022.txt', salida: 'enfermeria_2022_3.json', año: 2022 },
    { entrada: 'enfermeria 4 año 2022.txt', salida: 'enfermeria_2022_4.json', año: 2022 },
    
    // 2023 - Todos los años de carrera
    { entrada: 'enfermeria 1 año 2023.txt', salida: 'enfermeria_2023_1.json', año: 2023 },
    { entrada: 'enfermeria 2 año 2023.txt', salida: 'enfermeria_2023_2.json', año: 2023 },
    { entrada: 'enfermeria 3 año 2023.txt', salida: 'enfermeria_2023_3.json', año: 2023 },
    { entrada: 'enfermeria 4 año 2023.txt', salida: 'enfermeria_2023_4.json', año: 2023 },
    
    // 2024 - Todos los años de carrera
    { entrada: 'enfermeria 1 año 2024.txt', salida: 'enfermeria_2024_1.json', año: 2024 },
    { entrada: 'enfermeria 2 año 2024.txt', salida: 'enfermeria_2024_2.json', año: 2024 },
    { entrada: 'enfermeria 3 año 2024.txt', salida: 'enfermeria_2024_3.json', año: 2024 },
    { entrada: 'enfermeria 4 año 2024.txt', salida: 'enfermeria_2024_4.json', año: 2024 }
];

const dataFinalDir = path.join(__dirname, 'data_final');

console.log('=== Conversión Unificada de Exámenes de Enfermería ===\n');

let exitosos = 0;
let fallidos = 0;

archivos.forEach(archivo => {
    const entrada = path.join(dataFinalDir, archivo.entrada);
    const salida = path.join(dataFinalDir, archivo.salida);
    
    if (fs.existsSync(entrada)) {
        if (convertirArchivo(entrada, salida, archivo.año)) {
            exitosos++;
        } else {
            fallidos++;
        }
    } else {
        console.log(`⚠ Archivo no encontrado: ${archivo.entrada}`);
        fallidos++;
    }
});

console.log(`\n=== Resumen ===`);
console.log(`✓ Exitosos: ${exitosos}`);
console.log(`✗ Fallidos: ${fallidos}`);
console.log(`\nArchivos JSON creados en: data_final/`);
