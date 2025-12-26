// ===== SISTEMA DE INTELIGENCIA ARTIFICIAL PARA ANÁLISIS DE EXÁMENES =====
// Analiza patrones de respuestas y genera recomendaciones personalizadas

class SistemaIA {
    constructor() {
        this.historialAlumno = [];
        this.umbralAprobacion = 60;
    }

    // Cargar historial del alumno desde Firebase o localStorage
    async cargarHistorial(nombreAlumno) {
        // Intentar obtener desde Firebase primero
        if (typeof obtenerEstadisticasFirebase !== 'undefined') {
            try {
                const todasEstadisticas = await obtenerEstadisticasFirebase();
                this.historialAlumno = todasEstadisticas.filter(e => e.nombre === nombreAlumno);
            } catch (error) {
                console.warn('Error al obtener historial de Firebase:', error);
            }
        }
        
        // Si no hay datos de Firebase, usar localStorage
        if (this.historialAlumno.length === 0) {
            const local = JSON.parse(localStorage.getItem('estadisticasExamenes') || '[]');
            this.historialAlumno = local.filter(e => e.nombre === nombreAlumno);
        }
        
        return this.historialAlumno;
    }

    // Analizar rendimiento general
    analizarRendimientoGeneral() {
        if (this.historialAlumno.length === 0) {
            return {
                mensaje: "No hay datos suficientes para análisis",
                nivel: "sin-datos"
            };
        }

        const totalExamenes = this.historialAlumno.length;
        const aprobados = this.historialAlumno.filter(e => e.aprobado).length;
        const promedioGeneral = this.historialAlumno.reduce((sum, e) => sum + e.porcentaje, 0) / totalExamenes;
        const tasaAprobacion = (aprobados / totalExamenes) * 100;

        let nivel, mensaje, recomendacion;

        if (promedioGeneral >= 85) {
            nivel = "excelente";
            mensaje = "¡Excelente rendimiento! Estás dominando muy bien el material.";
            recomendacion = "Mantén tu ritmo de estudio y considera ayudar a otros compañeros.";
        } else if (promedioGeneral >= 70) {
            nivel = "bueno";
            mensaje = "Buen rendimiento general. Vas por buen camino.";
            recomendacion = "Refuerza las áreas donde tuviste más errores para alcanzar la excelencia.";
        } else if (promedioGeneral >= 60) {
            nivel = "regular";
            mensaje = "Rendimiento aceptable, pero hay espacio para mejorar.";
            recomendacion = "Dedica más tiempo de estudio a las especialidades más difíciles.";
        } else {
            nivel = "bajo";
            mensaje = "Necesitas mejorar significativamente tu preparación.";
            recomendacion = "Considera repasar conceptos básicos y aumentar tus horas de estudio.";
        }

        return {
            nivel,
            mensaje,
            recomendacion,
            totalExamenes,
            aprobados,
            reprobados: totalExamenes - aprobados,
            promedioGeneral: Math.round(promedioGeneral),
            tasaAprobacion: Math.round(tasaAprobacion)
        };
    }

    // Analizar especialidades (áreas fuertes y débiles)
    analizarEspecialidades() {
        if (this.historialAlumno.length === 0) {
            return { fuertes: [], debiles: [] };
        }

        const porEspecialidad = {};
        
        this.historialAlumno.forEach(examen => {
            if (!porEspecialidad[examen.especialidad]) {
                porEspecialidad[examen.especialidad] = {
                    nombre: examen.especialidad,
                    examenes: 0,
                    promedioNotas: 0,
                    aprobados: 0,
                    totalPorcentaje: 0
                };
            }
            
            porEspecialidad[examen.especialidad].examenes++;
            porEspecialidad[examen.especialidad].totalPorcentaje += examen.porcentaje;
            if (examen.aprobado) {
                porEspecialidad[examen.especialidad].aprobados++;
            }
        });

        // Calcular promedios
        Object.keys(porEspecialidad).forEach(esp => {
            const datos = porEspecialidad[esp];
            datos.promedioNotas = Math.round(datos.totalPorcentaje / datos.examenes);
            datos.tasaAprobacion = Math.round((datos.aprobados / datos.examenes) * 100);
        });

        // Ordenar y clasificar
        const especialidades = Object.values(porEspecialidad).sort((a, b) => b.promedioNotas - a.promedioNotas);
        
        return {
            fuertes: especialidades.filter(e => e.promedioNotas >= 70).slice(0, 3),
            debiles: especialidades.filter(e => e.promedioNotas < 70).slice(-3),
            todas: especialidades
        };
    }

    // Predecir probabilidad de aprobar siguiente examen
    predecirAprobacion(especialidad = null) {
        if (this.historialAlumno.length === 0) {
            return {
                probabilidad: 50,
                confianza: "baja",
                mensaje: "Sin historial suficiente para predicción precisa"
            };
        }

        let examenesRelevantes = this.historialAlumno;

        // Si se especifica especialidad, filtrar por ella
        if (especialidad) {
            examenesRelevantes = this.historialAlumno.filter(e => e.especialidad === especialidad);
            if (examenesRelevantes.length === 0) {
                examenesRelevantes = this.historialAlumno;
            }
        }

        // Dar más peso a exámenes recientes (últimos 5)
        const recientes = examenesRelevantes.slice(-5);
        const promedioReciente = recientes.reduce((sum, e) => sum + e.porcentaje, 0) / recientes.length;
        
        // Calcular tendencia (está mejorando o empeorando)
        let tendencia = 0;
        if (recientes.length >= 2) {
            const ultimos = recientes.slice(-3);
            const primeros = recientes.slice(0, 3);
            const promedioUltimos = ultimos.reduce((sum, e) => sum + e.porcentaje, 0) / ultimos.length;
            const promedioPrimeros = primeros.reduce((sum, e) => sum + e.porcentaje, 0) / primeros.length;
            tendencia = promedioUltimos - promedioPrimeros;
        }

        // Calcular probabilidad base
        let probabilidad = (promedioReciente / 100) * 100;
        
        // Ajustar según tendencia
        if (tendencia > 0) {
            probabilidad += Math.min(tendencia, 15); // Bonus por mejorar
        } else if (tendencia < 0) {
            probabilidad += Math.max(tendencia, -15); // Penalidad por empeorar
        }

        probabilidad = Math.max(0, Math.min(100, Math.round(probabilidad)));

        let confianza, mensaje;
        if (recientes.length >= 5) {
            confianza = "alta";
            mensaje = "Predicción basada en historial completo";
        } else if (recientes.length >= 3) {
            confianza = "media";
            mensaje = "Predicción basada en historial parcial";
        } else {
            confianza = "baja";
            mensaje = "Necesitas más exámenes para predicción precisa";
        }

        return {
            probabilidad,
            confianza,
            mensaje,
            tendencia: tendencia > 0 ? "mejorando" : tendencia < 0 ? "empeorando" : "estable"
        };
    }

    // Identificar patrones de errores
    identificarPatrones() {
        if (this.historialAlumno.length < 2) {
            return {
                patrones: [],
                mensaje: "Necesitas al menos 2 exámenes para identificar patrones"
            };
        }

        const patrones = [];

        // Patrón 1: Rendimiento por día/hora
        const porHora = {};
        this.historialAlumno.forEach(examen => {
            const fecha = new Date(examen.fecha);
            const hora = fecha.getHours();
            if (!porHora[hora]) porHora[hora] = { total: 0, count: 0 };
            porHora[hora].total += examen.porcentaje;
            porHora[hora].count++;
        });

        // Patrón 2: Tiempo de respuesta vs rendimiento
        const promedioTiempo = this.historialAlumno.reduce((sum, e) => sum + e.tiempoUsado, 0) / this.historialAlumno.length;
        const rapidos = this.historialAlumno.filter(e => e.tiempoUsado < promedioTiempo);
        const lentos = this.historialAlumno.filter(e => e.tiempoUsado >= promedioTiempo);
        
        if (rapidos.length > 0 && lentos.length > 0) {
            const promedioRapidos = rapidos.reduce((sum, e) => sum + e.porcentaje, 0) / rapidos.length;
            const promedioLentos = lentos.reduce((sum, e) => sum + e.porcentaje, 0) / lentos.length;
            
            if (promedioLentos > promedioRapidos + 10) {
                patrones.push({
                    tipo: "tiempo",
                    mensaje: "Rindes mejor cuando te tomas más tiempo",
                    recomendacion: "No te apures, lee bien cada pregunta"
                });
            } else if (promedioRapidos > promedioLentos + 10) {
                patrones.push({
                    tipo: "tiempo",
                    mensaje: "Tu primera intuición suele ser correcta",
                    recomendacion: "Confía en tu conocimiento inicial"
                });
            }
        }

        // Patrón 3: Consistencia
        const desviacion = this.calcularDesviacionEstandar(this.historialAlumno.map(e => e.porcentaje));
        if (desviacion > 20) {
            patrones.push({
                tipo: "consistencia",
                mensaje: "Tu rendimiento es muy variable",
                recomendacion: "Establece una rutina de estudio consistente"
            });
        } else if (desviacion < 10) {
            patrones.push({
                tipo: "consistencia",
                mensaje: "Tienes un rendimiento muy consistente",
                recomendacion: "¡Excelente! Mantén tu método de estudio"
            });
        }

        return {
            patrones,
            mensaje: patrones.length > 0 ? "Patrones identificados en tu rendimiento" : "No se detectaron patrones significativos aún"
        };
    }

    // Generar recomendaciones personalizadas
    generarRecomendaciones() {
        const rendimiento = this.analizarRendimientoGeneral();
        const especialidades = this.analizarEspecialidades();
        const prediccion = this.predecirAprobacion();
        const patrones = this.identificarPatrones();

        const recomendaciones = [];

        // Recomendación según nivel general
        if (rendimiento.nivel === "bajo" || rendimiento.nivel === "regular") {
            recomendaciones.push({
                prioridad: "alta",
                titulo: "Aumenta tu tiempo de estudio",
                descripcion: rendimiento.recomendacion,
                icono: "📚"
            });
        }

        // Recomendaciones por especialidades débiles
        if (especialidades.debiles.length > 0) {
            especialidades.debiles.forEach(esp => {
                recomendaciones.push({
                    prioridad: "alta",
                    titulo: `Refuerza ${esp.nombre}`,
                    descripcion: `Promedio: ${esp.promedioNotas}%. Dedica más tiempo a esta especialidad.`,
                    icono: "🎯"
                });
            });
        }

        // Recomendaciones según tendencia
        if (prediccion.tendencia === "empeorando") {
            recomendaciones.push({
                prioridad: "alta",
                titulo: "Tu rendimiento está bajando",
                descripcion: "Revisa tu método de estudio y considera tomar un descanso si estás agotado.",
                icono: "⚠️"
            });
        }

        // Recomendaciones según patrones
        patrones.patrones.forEach(patron => {
            recomendaciones.push({
                prioridad: "media",
                titulo: patron.mensaje,
                descripcion: patron.recomendacion,
                icono: "💡"
            });
        });

        // Recomendación motivacional
        if (rendimiento.nivel === "excelente" || rendimiento.nivel === "bueno") {
            recomendaciones.push({
                prioridad: "baja",
                titulo: "¡Vas muy bien!",
                descripcion: "Sigue así y alcanzarás tus metas.",
                icono: "🎉"
            });
        }

        return recomendaciones;
    }

    // Generar resumen completo de análisis
    generarAnalisisCompleto() {
        return {
            rendimiento: this.analizarRendimientoGeneral(),
            especialidades: this.analizarEspecialidades(),
            prediccion: this.predecirAprobacion(),
            patrones: this.identificarPatrones(),
            recomendaciones: this.generarRecomendaciones()
        };
    }

    // Función auxiliar: calcular desviación estándar
    calcularDesviacionEstandar(valores) {
        const media = valores.reduce((sum, val) => sum + val, 0) / valores.length;
        const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
        return Math.sqrt(varianza);
    }

    // Comparar con otros alumnos (análisis poblacional)
    async compararConOtros() {
        let todasEstadisticas = [];
        
        // Obtener todas las estadísticas
        if (typeof obtenerEstadisticasFirebase !== 'undefined') {
            try {
                todasEstadisticas = await obtenerEstadisticasFirebase();
            } catch (error) {
                todasEstadisticas = JSON.parse(localStorage.getItem('estadisticasExamenes') || '[]');
            }
        } else {
            todasEstadisticas = JSON.parse(localStorage.getItem('estadisticasExamenes') || '[]');
        }

        if (todasEstadisticas.length < 2 || this.historialAlumno.length === 0) {
            return {
                disponible: false,
                mensaje: "No hay suficientes datos para comparar"
            };
        }

        const miPromedio = this.historialAlumno.reduce((sum, e) => sum + e.porcentaje, 0) / this.historialAlumno.length;
        const promedioGeneral = todasEstadisticas.reduce((sum, e) => sum + e.porcentaje, 0) / todasEstadisticas.length;
        
        const diferencia = miPromedio - promedioGeneral;
        let posicionRelativa;

        if (diferencia > 15) {
            posicionRelativa = "superior";
        } else if (diferencia > 5) {
            posicionRelativa = "por encima";
        } else if (diferencia > -5) {
            posicionRelativa = "promedio";
        } else if (diferencia > -15) {
            posicionRelativa = "por debajo";
        } else {
            posicionRelativa = "inferior";
        }

        return {
            disponible: true,
            miPromedio: Math.round(miPromedio),
            promedioGeneral: Math.round(promedioGeneral),
            diferencia: Math.round(Math.abs(diferencia)),
            posicionRelativa,
            totalAlumnos: new Set(todasEstadisticas.map(e => e.nombre)).size
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SistemaIA = SistemaIA;
}
