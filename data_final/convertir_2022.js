const fs = require('fs');

function limpiarJSON(contenido) {
    // Reemplazar caracteres LaTeX problemáticos
    contenido = contenido.replace(/\$50\\%\$/g, '50%');
    contenido = contenido.replace(/\$\\geq\$/g, '≥');
    contenido = contenido.replace(/\$\\leq\$/g, '≤');
    contenido = contenido.replace(/\$\\times\$/g, '×');
    contenido = contenido.replace(/\\\$/g, '');
    contenido = contenido.replace(/\\%/g, '%');
    contenido = contenido.replace(/\$\$/g, '');
    contenido = contenido.replace(/\$/g, '');
    return contenido;
}

function convertirArchivo(archivo, salida, año) {
    try {
        console.log('Procesando:', archivo);
        let contenido = fs.readFileSync(archivo, 'utf8');
        contenido = limpiarJSON(contenido);
        
        const data = JSON.parse(contenido);
        const preguntas = data.questions.map(q => {
            let respuestaCorrecta = 'a';
            const opciones = {a: '', b: '', c: '', d: ''};
            
            ['A','B','C','D'].forEach((letra) => {
                if (q.options && q.options[letra]) {
                    const opt = q.options[letra];
                    const texto = typeof opt === 'object' ? (opt.text || '') : opt;
                    opciones[letra.toLowerCase()] = texto.replace(/\$/g, '').replace(/\\/g, '');
                    if (opt.is_correct === true) {
                        respuestaCorrecta = letra.toLowerCase();
                    }
                }
            });
            
            return {
                id: q.question_number,
                tema: 'Enfermería ' + año,
                año: año,
                caso_clínico: '',
                pregunta: q.question.replace(/\$/g, '').replace(/\\/g, ''),
                opciones: {
                    'opcion a': opciones.a,
                    'opcion b': opciones.b,
                    'opcion c': opciones.c,
                    'opcion d': opciones.d
                },
                respuesta_correcta: 'opcion ' + respuestaCorrecta
            };
        });
        
        fs.writeFileSync(salida, JSON.stringify(preguntas, null, 2));
        console.log('✓ Convertido:', salida, '(' + preguntas.length + ' preguntas)');
        return true;
    } catch(e) {
        console.log('✗ Error:', e.message);
        return false;
    }
}

// Convertir archivos de 2022
convertirArchivo('enfermeria 2 año 2022.txt', 'enfermeria_2022_2.json', 2022);
convertirArchivo('enfermeria 3 año 2022.txt', 'enfermeria_2022_3.json', 2022);
convertirArchivo('enfermeria 4 año 2022.txt', 'enfermeria_2022_4.json', 2022);
