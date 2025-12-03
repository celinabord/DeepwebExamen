#!/usr/bin/env node

// Script para convertir archivos TXT de enfermería en formato texto plano a JSON

const fs = require('fs');
const path = require('path');

function convertirTextoPlano(archivoEntrada, archivoSalida, año) {
    console.log(`Procesando: ${archivoEntrada}`);
    
    try {
        // Leer archivo
        const contenido = fs.readFileSync(archivoEntrada, 'utf8');
        
        // Dividir por preguntas (números al inicio de línea)
        const preguntas = [];
        const bloques = contenido.split(/\n(?=\d+\))/);
        
        bloques.forEach(bloque => {
            if (!bloque.trim()) return;
            
            // Extraer número de pregunta
            const matchId = bloque.match(/^(\d+)\)/);
            if (!matchId) return;
            
            const id = parseInt(matchId[1]);
            
            // Extraer pregunta (todo desde después del número hasta antes de las opciones)
            const lineas = bloque.split('\n');
            let preguntaTexto = '';
            let opciones = { a: '', b: '', c: '', d: '' };
            let respuestaCorrecta = 'a';
            let enPregunta = true;
            
            for (let i = 1; i < lineas.length; i++) {
                const linea = lineas[i].trim();
                if (!linea) continue;
                
                // Detectar opciones
                if (linea.match(/^[a-d]\)/)) {
                    enPregunta = false;
                    const letra = linea[0];
                    let texto = linea.substring(2).trim();
                    
                    // Detectar respuesta correcta
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
        
        if (preguntas.length > 0) {
            fs.writeFileSync(archivoSalida, JSON.stringify(preguntas, null, 2), 'utf8');
            console.log(`✓ Convertido: ${archivoSalida} (${preguntas.length} preguntas)`);
            return true;
        } else {
            console.log(`⚠ No se encontraron preguntas en: ${archivoEntrada}`);
            return false;
        }
        
    } catch (error) {
        console.error(`✗ Error procesando ${archivoEntrada}:`, error.message);
        return false;
    }
}

// Configuración de archivos a convertir
const archivos = [
    { entrada: 'enfermeria 1 año 2022.txt', salida: 'enfermeria_1_2022.json', año: 2022 },
    { entrada: 'enfermeria 2 año 2022.txt', salida: 'enfermeria_2_2022.json', año: 2022 },
    { entrada: 'enfermeria 3 año 2022.txt', salida: 'enfermeria_3_2022.json', año: 2022 },
    { entrada: 'enfermeria 4 año 2022.txt', salida: 'enfermeria_4_2022.json', año: 2022 },
    { entrada: 'enfermeria 1 año 2023.txt', salida: 'enfermeria_1_2023.json', año: 2023 },
    { entrada: 'enfermeria 2 año 2023.txt', salida: 'enfermeria_2_2023.json', año: 2023 },
    { entrada: 'enfermeria 3 año 2023.txt', salida: 'enfermeria_3_2023.json', año: 2023 },
    { entrada: 'enfermeria 4 año 2023.txt', salida: 'enfermeria_4_2023.json', año: 2023 },
    { entrada: 'enfermeria 1 año 2024.txt', salida: 'enfermeria_1_2024.json', año: 2024 },
    { entrada: 'enfermeria 2 año 2024.txt', salida: 'enfermeria_2_2024.json', año: 2024 },
    { entrada: 'enfermeria 3 año 2024.txt', salida: 'enfermeria_3_2024.json', año: 2024 },
    { entrada: 'enfermeria 4 año 2024.txt', salida: 'enfermeria_4_2024.json', año: 2024 }
];

const dataFinalDir = path.join(__dirname, '../data_final');

console.log('=== Conversión de Archivos de Enfermería (Texto Plano) ===\n');

let exitosos = 0;
let fallidos = 0;

archivos.forEach(archivo => {
    const entrada = path.join(dataFinalDir, archivo.entrada);
    const salida = path.join(dataFinalDir, archivo.salida);
    
    if (fs.existsSync(entrada)) {
        if (convertirTextoPlano(entrada, salida, archivo.año)) {
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
