// ===== GENERADOR DE PREGUNTAS CON IA (GEMINI API) =====
// Genera preguntas médicas contextualizadas para Argentina

class GeneradorPreguntasIA {
    constructor() {
        // API Key de Gemini (obtener gratis en https://makersuite.google.com/app/apikey)
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.enabled = false;
    }

    // Configurar API Key
    configurarAPIKey(key) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
        this.enabled = !!key;
    }

    // Verificar si está configurado
    estaConfigurado() {
        return this.apiKey && this.apiKey.length > 0;
    }

    // Generar prompt contextualizado para Argentina
    generarPrompt(especialidad, cantidad) {
        const contextos = {
            'cardiologia': 'cardiología, incluyendo hipertensión, insuficiencia cardíaca, arritmias, infarto agudo de miocardio, según protocolos del Ministerio de Salud de Argentina',
            'pediatria': 'pediatría, incluyendo vacunación según calendario argentino, enfermedades prevalentes en Argentina, crecimiento y desarrollo',
            'neurologia': 'neurología, incluyendo ACV, epilepsia, cefaleas, enfermedades neurodegenerativas, según guías argentinas',
            'psiquiatria': 'psiquiatría, incluyendo trastornos del ánimo, psicosis, trastornos de ansiedad, adicciones, según DSM-5 y contexto argentino',
            'traumatologia': 'traumatología y ortopedia, incluyendo fracturas, luxaciones, lesiones deportivas comunes en Argentina',
            'tocoginecologia': 'ginecología y obstetricia, incluyendo control prenatal, parto, anticoncepción, según protocolos del Ministerio de Salud de Argentina',
            'urologia': 'urología, incluyendo infecciones urinarias, hiperplasia prostática, litiasis renal',
            'oncologia': 'oncología, incluyendo tipos de cáncer prevalentes en Argentina, tratamientos, cuidados paliativos',
            'hematologia': 'hematología, incluyendo anemias, leucemias, trastornos de la coagulación',
            'dermatologia': 'dermatología, incluyendo patologías prevalentes en clima argentino, infecciones cutáneas',
            'neumonologia': 'neumonología, incluyendo asma, EPOC, neumonía, tuberculosis según epidemiología argentina',
            'otorrinolaringologia': 'otorrinolaringología, incluyendo infecciones respiratorias altas, hipoacusia, vértigo',
            'diagnostico_imagenes': 'diagnóstico por imágenes, interpretación de radiografías, TAC, RMN, ecografías',
            'anestesiologia': 'anestesiología, tipos de anestesia, manejo del dolor, complicaciones anestésicas',
            'enfermeria': 'enfermería profesional, cuidados de enfermería, administración de medicamentos, procedimientos según normativas argentinas'
        };

        const contexto = contextos[especialidad] || especialidad;

        return `Eres un experto en educación médica de Argentina. Genera ${cantidad} preguntas de opción múltiple sobre ${contexto}.

REQUISITOS ESTRICTOS:
1. Preguntas nivel universitario (medicina/enfermería)
2. Contexto ARGENTINO: hospitales argentinos, protocolos del Ministerio de Salud, terminología local
3. Casos clínicos realistas
4. 4 opciones de respuesta (A, B, C, D)
5. Solo UNA respuesta correcta
6. Dificultad progresiva

FORMATO JSON (EXACTO):
{
  "preguntas": [
    {
      "pregunta": "Un paciente de 65 años consulta en el Hospital Ramos Mejía por...",
      "opciones": [
        "Opción A detallada",
        "Opción B detallada",
        "Opción C detallada",
        "Opción D detallada"
      ],
      "respuestaCorrecta": 0,
      "explicacion": "Explicación según guías argentinas"
    }
  ]
}

IMPORTANTE: 
- respuestaCorrecta es el índice (0=A, 1=B, 2=C, 3=D)
- Usa terminología médica argentina
- Incluye contexto de sistema de salud público argentino
- NO uses markdown, solo JSON válido`;
    }

    // Generar preguntas usando Gemini API
    async generarPreguntas(especialidad, cantidad = 50) {
        if (!this.estaConfigurado()) {
            console.error('⚠️ Gemini API no configurada');
            return null;
        }

        try {
            const prompt = this.generarPrompt(especialidad, cantidad);

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Error de Gemini API:', error);
                return null;
            }

            const data = await response.json();
            
            // Extraer el texto de la respuesta
            const textoRespuesta = data.candidates[0].content.parts[0].text;
            
            // Limpiar y parsear JSON (eliminar markdown si existe)
            const jsonLimpio = textoRespuesta
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            
            const resultado = JSON.parse(jsonLimpio);
            
            // Validar estructura
            if (!resultado.preguntas || !Array.isArray(resultado.preguntas)) {
                console.error('❌ Formato de respuesta inválido');
                return null;
            }

            // Convertir al formato de la app
            const preguntasFormateadas = resultado.preguntas.map((p, index) => ({
                id: `ia_${Date.now()}_${index}`,
                pregunta: p.pregunta,
                opciones: p.opciones,
                respuestaCorrecta: p.respuestaCorrecta,
                explicacion: p.explicacion || '',
                generadaPorIA: true
            }));

            console.log(`✅ ${preguntasFormateadas.length} preguntas generadas con IA`);
            return preguntasFormateadas;

        } catch (error) {
            console.error('❌ Error al generar preguntas con IA:', error);
            return null;
        }
    }

    // Modo híbrido: mezclar banco actual + IA
    async generarExamenHibrido(especialidad, bancoActual) {
        if (!this.estaConfigurado() || !this.enabled) {
            // Si no está configurado, usar 100% banco actual
            return this.seleccionarAleatorio(bancoActual, 100);
        }

        try {
            // Mostrar mensaje de carga
            this.mostrarMensajeCarga('Generando preguntas con IA... ⏳');

            // Generar 50 preguntas con IA
            const preguntasIA = await this.generarPreguntas(especialidad, 50);

            if (!preguntasIA || preguntasIA.length === 0) {
                // Si falla IA, usar 100% banco actual
                console.warn('⚠️ Fallback: usando 100% banco actual');
                this.ocultarMensajeCarga();
                return this.seleccionarAleatorio(bancoActual, 100);
            }

            // Seleccionar 50 del banco actual
            const preguntasBanco = this.seleccionarAleatorio(bancoActual, 50);

            // Mezclar ambos conjuntos
            const examenCompleto = [...preguntasBanco, ...preguntasIA];
            
            // Mezclar aleatoriamente
            this.mezclarArray(examenCompleto);

            this.ocultarMensajeCarga();
            console.log('✅ Examen híbrido creado: 50 banco + 50 IA');
            
            return examenCompleto;

        } catch (error) {
            console.error('❌ Error en modo híbrido:', error);
            this.ocultarMensajeCarga();
            // Fallback: 100% banco actual
            return this.seleccionarAleatorio(bancoActual, 100);
        }
    }

    // Seleccionar N preguntas aleatorias de un banco
    seleccionarAleatorio(banco, cantidad) {
        const copia = [...banco];
        this.mezclarArray(copia);
        return copia.slice(0, Math.min(cantidad, copia.length));
    }

    // Algoritmo Fisher-Yates para mezclar array
    mezclarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // UI: Mostrar mensaje de carga
    mostrarMensajeCarga(mensaje) {
        let overlay = document.getElementById('ia-loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'ia-loading-overlay';
            overlay.innerHTML = `
                <div class="ia-loading-content">
                    <i class="fas fa-robot fa-3x" style="animation: pulse 1.5s infinite;"></i>
                    <p id="ia-loading-text">${mensaje}</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        document.getElementById('ia-loading-text').textContent = mensaje;
    }

    // UI: Ocultar mensaje de carga
    ocultarMensajeCarga() {
        const overlay = document.getElementById('ia-loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// Instancia global
window.generadorIA = new GeneradorPreguntasIA();
