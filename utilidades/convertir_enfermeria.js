#!/usr/bin/env node

// Script para convertir archivos TXT de enfermería a formato JSON correcto

const fs = require('fs');
const path = require('path');

function convertirArchivo(archivoEntrada, archivoSalida, año) {
    console.log(`Procesando: ${archivoEntrada}`);
    
    try {
        // Leer archivo
        const contenido = fs.readFileSync(archivoEntrada, 'utf8');
        
        // Parsear JSON
        let preguntas = JSON.parse(contenido);
        
        // Convertir formato
        const preguntasConvertidas = preguntas.map(p => {
            return {
                id: p.id,
                tema: p.tema || "Enfermería",
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
            };
        });
        
        // Guardar archivo convertido
        fs.writeFileSync(archivoSalida, JSON.stringify(preguntasConvertidas, null, 2), 'utf8');
        console.log(`✓ Convertido: ${archivoSalida} (${preguntasConvertidas.length} preguntas)`);
        
        return true;
    } catch (error) {
        console.error(`✗ Error procesando ${archivoEntrada}:`, error.message);
        return false;
    }
}

// Configuración de archivos a convertir
const archivos = [
    { entrada: 'enfermeria año 2021.txt', salida: 'enfermeria_2021.json', año: 2021 },
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

console.log('=== Conversión de Archivos de Enfermería ===\n');

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
