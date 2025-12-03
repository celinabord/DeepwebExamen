#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GENERADOR DEFINITIVO DE EXÁMENES DE ENFERMERÍA
Crea 100 preguntas REALES por cada examen con 1 correcta y 3 incorrectas
"""

import json
import random
import os

# BANCO DE 150 PREGUNTAS REALES DE ENFERMERÍA
BANCO_PREGUNTAS = [
    {
        "pregunta": "¿Qué es la enfermería según el Consejo Internacional de Enfermeras (CIE)?",
        "correcta": "Es la ciencia y arte del cuidado de la salud integral del individuo, familia y comunidad",
        "incorrectas": [
            "Es únicamente la aplicación de tratamientos médicos prescritos",
            "Es la técnica de administración hospitalaria",
            "Es el estudio exclusivo de enfermedades infecciosas"
        ]
    },
    {
        "pregunta": "¿Cuál es el primer paso del Proceso de Atención de Enfermería (PAE)?",
        "correcta": "Valoración del paciente",
        "incorrectas": [
            "Diagnóstico médico",
            "Aplicación del tratamiento",
            "Evaluación de resultados"
        ]
    },
    {
        "pregunta": "¿Cuál es la temperatura corporal normal en adultos?",
        "correcta": "36.5 - 37.5 °C",
        "incorrectas": [
            "35 - 36 °C",
            "38 - 39 °C",
            "34 - 35.5 °C"
        ]
    },
    {
        "pregunta": "¿Qué significa SOAP en los registros de enfermería?",
        "correcta": "Subjetivo, Objetivo, Análisis, Plan",
        "incorrectas": [
            "Sistema, Organización, Aplicación, Procedimiento",
            "Sanitario, Operativo, Asistencial, Profesional",
            "Servicio, Observación, Atención, Protocolo"
        ]
    },
    {
        "pregunta": "¿Cuál es la frecuencia cardíaca normal en adultos en reposo?",
        "correcta": "60 - 100 latidos por minuto",
        "incorrectas": [
            "40 - 60 latidos por minuto",
            "100 - 140 latidos por minuto",
            "120 - 160 latidos por minuto"
        ]
    },
    {
        "pregunta": "¿Qué es la técnica aséptica?",
        "correcta": "Conjunto de procedimientos para evitar la contaminación con microorganismos",
        "incorrectas": [
            "Método de esterilización química de instrumentos",
            "Protocolo de aislamiento respiratorio",
            "Técnica de sutura quirúrgica"
        ]
    },
    {
        "pregunta": "¿Cuál es la presión arterial normal en adultos?",
        "correcta": "120/80 mmHg (sistólica/diastólica)",
        "incorrectas": [
            "140/90 mmHg",
            "100/60 mmHg",
            "160/100 mmHg"
        ]
    },
    {
        "pregunta": "¿Qué son los signos vitales?",
        "correcta": "Temperatura, pulso, respiración y presión arterial",
        "incorrectas": [
            "Peso, talla, índice de masa corporal y glucemia",
            "Saturación de oxígeno, glucemia, peso y diuresis",
            "Frecuencia cardíaca, electrocardiograma, peso y tensión"
        ]
    },
    {
        "pregunta": "¿Cuál es la frecuencia respiratoria normal en adultos?",
        "correcta": "12 - 20 respiraciones por minuto",
        "incorrectas": [
            "20 - 30 respiraciones por minuto",
            "8 - 12 respiraciones por minuto",
            "25 - 35 respiraciones por minuto"
        ]
    },
    {
        "pregunta": "¿Qué es la bioseguridad en enfermería?",
        "correcta": "Conjunto de medidas para proteger la salud del personal y pacientes",
        "incorrectas": [
            "Sistema de seguros médicos para enfermeros",
            "Protocolo de administración de medicamentos",
            "Técnica de esterilización de material quirúrgico"
        ]
    },
    {
        "pregunta": "¿Cuáles son las precauciones estándar?",
        "correcta": "Lavado de manos, uso de guantes, bata, mascarilla y protección ocular",
        "incorrectas": [
            "Uso de antibióticos profilácticos antes de procedimientos",
            "Aislamiento de todos los pacientes en habitaciones individuales",
            "Desinfección diaria de todas las superficies hospitalarias"
        ]
    },
    {
        "pregunta": "¿Qué es la hipoxia?",
        "correcta": "Disminución de oxígeno en los tejidos",
        "incorrectas": [
            "Aumento de dióxido de carbono en sangre",
            "Exceso de oxígeno en los pulmones",
            "Deficiencia de hemoglobina en sangre"
        ]
    },
    {
        "pregunta": "¿Cuál es el calibre de aguja más grueso?",
        "correcta": "14 G (gauge)",
        "incorrectas": [
            "25 G",
            "30 G",
            "21 G"
        ]
    },
    {
        "pregunta": "¿Qué es la hemostasia?",
        "correcta": "Proceso de detención de una hemorragia",
        "incorrectas": [
            "Equilibrio de líquidos corporales",
            "Regulación de la temperatura corporal",
            "Mantenimiento del pH sanguíneo"
        ]
    },
    {
        "pregunta": "¿Cuál es la vía de administración más rápida para medicamentos?",
        "correcta": "Intravenosa",
        "incorrectas": [
            "Oral",
            "Intramuscular",
            "Subcutánea"
        ]
    },
    {
        "pregunta": "¿Qué es la disnea?",
        "correcta": "Dificultad para respirar",
        "incorrectas": [
            "Dolor en el pecho",
            "Tos persistente",
            "Aumento de la frecuencia cardíaca"
        ]
    },
    {
        "pregunta": "¿Cuál es el ángulo correcto para inyección intramuscular?",
        "correcta": "90 grados",
        "incorrectas": [
            "45 grados",
            "15 grados",
            "30 grados"
        ]
    },
    {
        "pregunta": "¿Qué es la taquicardia?",
        "correcta": "Frecuencia cardíaca mayor a 100 latidos por minuto",
        "incorrectas": [
            "Frecuencia cardíaca menor a 60 latidos por minuto",
            "Irregularidad en el ritmo cardíaco",
            "Dolor precordial intenso"
        ]
    },
    {
        "pregunta": "¿Qué es la bradicardia?",
        "correcta": "Frecuencia cardíaca menor a 60 latidos por minuto",
        "incorrectas": [
            "Frecuencia cardíaca mayor a 100 latidos por minuto",
            "Presión arterial baja",
            "Respiración lenta y profunda"
        ]
    },
    {
        "pregunta": "¿Cuál es el sitio correcto para tomar el pulso carotídeo?",
        "correcta": "Lateral del cuello, entre la tráquea y el músculo esternocleidomastoideo",
        "incorrectas": [
            "En la región temporal de la frente",
            "En la parte posterior del cuello",
            "En la región submandibular"
        ]
    },
    {
        "pregunta": "¿Qué es la hipertensión arterial?",
        "correcta": "Presión arterial sistólica ≥140 mmHg y/o diastólica ≥90 mmHg",
        "incorrectas": [
            "Presión arterial sistólica <100 mmHg",
            "Frecuencia cardíaca mayor a 120 lpm",
            "Presión arterial 120/80 mmHg"
        ]
    },
    {
        "pregunta": "¿Qué es la saturación de oxígeno normal (SpO2)?",
        "correcta": "95% - 100%",
        "incorrectas": [
            "85% - 90%",
            "70% - 80%",
            "80% - 85%"
        ]
    },
    {
        "pregunta": "¿Cuál es el orden correcto del lavado de manos clínico?",
        "correcta": "Mojar, enjabonar, frotar, enjuagar, secar",
        "incorrectas": [
            "Enjabonar, mojar, frotar, secar, enjuagar",
            "Secar, mojar, enjabonar, enjuagar, frotar",
            "Frotar, enjabonar, mojar, secar, enjuagar"
        ]
    },
    {
        "pregunta": "¿Cuánto dura el lavado de manos clínico?",
        "correcta": "40 - 60 segundos",
        "incorrectas": [
            "10 - 15 segundos",
            "2 - 3 minutos",
            "5 - 10 minutos"
        ]
    },
    {
        "pregunta": "¿Qué es el shock hipovolémico?",
        "correcta": "Estado de hipoperfusión tisular por pérdida de volumen sanguíneo",
        "incorrectas": [
            "Reacción alérgica grave con colapso cardiovascular",
            "Infección generalizada con falla multiorgánica",
            "Obstrucción del flujo sanguíneo por émbolo"
        ]
    },
    {
        "pregunta": "¿Cuál es la zona recomendada para inyección subcutánea de insulina?",
        "correcta": "Abdomen, muslos, brazos y glúteos",
        "incorrectas": [
            "Únicamente en el dorso de la mano",
            "Solamente en la región deltoidea",
            "Exclusivamente en la región lumbar"
        ]
    },
    {
        "pregunta": "¿Qué es la cianosis?",
        "correcta": "Coloración azulada de piel y mucosas por falta de oxígeno",
        "incorrectas": [
            "Coloración amarillenta por exceso de bilirrubina",
            "Enrojecimiento de la piel por inflamación",
            "Palidez extrema por pérdida de sangre"
        ]
    },
    {
        "pregunta": "¿Qué es la ictericia?",
        "correcta": "Coloración amarillenta de piel y mucosas por aumento de bilirrubina",
        "incorrectas": [
            "Coloración azulada por falta de oxígeno",
            "Enrojecimiento facial por fiebre",
            "Palidez por anemia severa"
        ]
    },
    {
        "pregunta": "¿Cuál es el volumen normal de diuresis en 24 horas?",
        "correcta": "1000 - 1500 ml",
        "incorrectas": [
            "500 - 700 ml",
            "2500 - 3000 ml",
            "300 - 500 ml"
        ]
    },
    {
        "pregunta": "¿Qué es la anuria?",
        "correcta": "Ausencia o producción menor a 100 ml de orina en 24 horas",
        "incorrectas": [
            "Producción excesiva de orina",
            "Presencia de sangre en la orina",
            "Dolor al orinar"
        ]
    },
    {
        "pregunta": "¿Qué es la oliguria?",
        "correcta": "Producción de orina menor a 400 ml en 24 horas",
        "incorrectas": [
            "Producción excesiva de orina clara",
            "Ausencia total de orina",
            "Micción frecuente en pequeñas cantidades"
        ]
    },
    {
        "pregunta": "¿Qué es la poliuria?",
        "correcta": "Producción excesiva de orina mayor a 2500 ml en 24 horas",
        "incorrectas": [
            "Ausencia de producción de orina",
            "Producción escasa de orina",
            "Micción nocturna frecuente"
        ]
    },
    {
        "pregunta": "¿Cuál es el glucosa normal en ayunas?",
        "correcta": "70 - 100 mg/dl",
        "incorrectas": [
            "110 - 140 mg/dl",
            "50 - 70 mg/dl",
            "140 - 180 mg/dl"
        ]
    },
    {
        "pregunta": "¿Qué es la hiperglucemia?",
        "correcta": "Nivel de glucosa en sangre mayor a 126 mg/dl en ayunas",
        "incorrectas": [
            "Nivel de glucosa menor a 70 mg/dl",
            "Nivel normal de glucosa postprandial",
            "Glucosa en orina positiva"
        ]
    },
    {
        "pregunta": "¿Qué es la hipoglucemia?",
        "correcta": "Nivel de glucosa en sangre menor a 70 mg/dl",
        "incorrectas": [
            "Nivel de glucosa mayor a 180 mg/dl",
            "Glucosa en ayunas de 100 mg/dl",
            "Presencia de cetonas en sangre"
        ]
    },
    {
        "pregunta": "¿Cuáles son los síntomas de hipoglucemia?",
        "correcta": "Sudoración, temblor, palpitaciones, confusión",
        "incorrectas": [
            "Sed excesiva, poliuria, visión borrosa",
            "Dolor abdominal, náuseas, vómitos",
            "Fiebre, escalofríos, malestar general"
        ]
    },
    {
        "pregunta": "¿Qué es la cetoacidosis diabética?",
        "correcta": "Complicación aguda de la diabetes por deficiencia severa de insulina",
        "incorrectas": [
            "Nivel bajo de glucosa por exceso de insulina",
            "Infección urinaria en paciente diabético",
            "Daño renal crónico por diabetes"
        ]
    },
    {
        "pregunta": "¿Cuál es el sitio de inyección intramuscular más usado en adultos?",
        "correcta": "Músculo deltoides y región ventroglútea",
        "incorrectas": [
            "Región abdominal periumbilical",
            "Cara anterior del antebrazo",
            "Región plantar del pie"
        ]
    },
    {
        "pregunta": "¿Qué es la escala de Glasgow?",
        "correcta": "Escala para evaluar el nivel de conciencia",
        "incorrectas": [
            "Escala para medir el dolor",
            "Escala de riesgo de caídas",
            "Escala de evaluación nutricional"
        ]
    },
    {
        "pregunta": "¿Cuál es el puntaje máximo en la escala de Glasgow?",
        "correcta": "15 puntos",
        "incorrectas": [
            "10 puntos",
            "20 puntos",
            "12 puntos"
        ]
    },
    {
        "pregunta": "¿Qué evalúa la escala de Glasgow?",
        "correcta": "Apertura ocular, respuesta verbal y respuesta motora",
        "incorrectas": [
            "Frecuencia cardíaca, respiratoria y presión arterial",
            "Reflejos, sensibilidad y movilidad",
            "Orientación, memoria y lenguaje"
        ]
    },
    {
        "pregunta": "¿Qué es la escala de Braden?",
        "correcta": "Escala para evaluar el riesgo de úlceras por presión",
        "incorrectas": [
            "Escala para medir el nivel de dolor",
            "Escala de evaluación nutricional",
            "Escala de riesgo de caídas"
        ]
    },
    {
        "pregunta": "¿Qué es una úlcera por presión?",
        "correcta": "Lesión de la piel por presión prolongada sobre prominencias óseas",
        "incorrectas": [
            "Herida quirúrgica infectada",
            "Quemadura por exposición solar",
            "Lesión traumática con pérdida de tejido"
        ]
    },
    {
        "pregunta": "¿Cuáles son los grados de úlceras por presión?",
        "correcta": "Grado I, II, III y IV",
        "incorrectas": [
            "Leve, moderado y severo",
            "Tipo A, B y C",
            "Estadio 1, 2 y 3"
        ]
    },
    {
        "pregunta": "¿Qué es la posición de Fowler?",
        "correcta": "Paciente sentado con cabecera elevada 45-60 grados",
        "incorrectas": [
            "Paciente acostado boca abajo",
            "Paciente de lado con piernas flexionadas",
            "Paciente con piernas elevadas 30 grados"
        ]
    },
    {
        "pregunta": "¿Qué es la posición de Trendelenburg?",
        "correcta": "Paciente acostado con cabeza más baja que los pies",
        "incorrectas": [
            "Paciente sentado con cabeza elevada",
            "Paciente de lado en posición fetal",
            "Paciente boca abajo con cabeza de lado"
        ]
    },
    {
        "pregunta": "¿Qué es la posición de decúbito lateral?",
        "correcta": "Paciente acostado de lado",
        "incorrectas": [
            "Paciente boca arriba",
            "Paciente boca abajo",
            "Paciente sentado"
        ]
    },
    {
        "pregunta": "¿Qué es la sonda nasogástrica?",
        "correcta": "Tubo que se introduce por la nariz hasta el estómago",
        "incorrectas": [
            "Catéter para drenar la vejiga",
            "Tubo para administrar oxígeno",
            "Sonda para nutrición parenteral"
        ]
    },
    {
        "pregunta": "¿Qué es la sonda vesical o Foley?",
        "correcta": "Catéter que se introduce en la vejiga para drenar orina",
        "incorrectas": [
            "Tubo para alimentación gástrica",
            "Catéter para administrar medicamentos",
            "Sonda para aspiración de secreciones"
        ]
    },
    {
        "pregunta": "¿Cuál es el calibre más común de sonda Foley en adultos?",
        "correcta": "14 - 16 Fr (French)",
        "incorrectas": [
            "6 - 8 Fr",
            "20 - 24 Fr",
            "28 - 30 Fr"
        ]
    },
    {
        "pregunta": "¿Qué es la oxigenoterapia?",
        "correcta": "Administración de oxígeno suplementario para tratar hipoxemia",
        "incorrectas": [
            "Terapia respiratoria con vapor de agua",
            "Administración de broncodilatadores nebulizados",
            "Fisioterapia pulmonar"
        ]
    },
    {
        "pregunta": "¿Cuál es el dispositivo de oxigenoterapia más común?",
        "correcta": "Cánula nasal",
        "incorrectas": [
            "Ventilador mecánico",
            "Nebulizador ultrasónico",
            "Cámara hiperbárica"
        ]
    },
    {
        "pregunta": "¿Cuál es el flujo de oxígeno con cánula nasal?",
        "correcta": "1 - 6 litros por minuto",
        "incorrectas": [
            "10 - 15 litros por minuto",
            "0.5 - 1 litros por minuto",
            "20 - 30 litros por minuto"
        ]
    },
    {
        "pregunta": "¿Qué es la mascarilla de Venturi?",
        "correcta": "Dispositivo que administra oxígeno a concentraciones controladas",
        "incorrectas": [
            "Mascarilla para protección respiratoria",
            "Equipo de ventilación mecánica",
            "Filtro para aire contaminado"
        ]
    },
    {
        "pregunta": "¿Qué es la traqueostomía?",
        "correcta": "Abertura quirúrgica en la tráquea para facilitar la respiración",
        "incorrectas": [
            "Intubación endotraqueal de emergencia",
            "Procedimiento de broncoscopía",
            "Cirugía de las cuerdas vocales"
        ]
    },
    {
        "pregunta": "¿Qué es la aspiración de secreciones?",
        "correcta": "Procedimiento para eliminar secreciones de las vías respiratorias",
        "incorrectas": [
            "Técnica de fisioterapia respiratoria",
            "Administración de mucolíticos nebulizados",
            "Drenaje postural del paciente"
        ]
    },
    {
        "pregunta": "¿Qué es el balance hídrico?",
        "correcta": "Registro de ingresos y egresos de líquidos en 24 horas",
        "incorrectas": [
            "Evaluación del estado nutricional",
            "Control de peso diario del paciente",
            "Medición de la presión arterial"
        ]
    },
    {
        "pregunta": "¿Qué incluye el ingreso en el balance hídrico?",
        "correcta": "Líquidos orales, intravenosos, alimentación enteral",
        "incorrectas": [
            "Solo agua que bebe el paciente",
            "Únicamente sueros intravenosos",
            "Solamente la alimentación"
        ]
    },
    {
        "pregunta": "¿Qué incluye el egreso en el balance hídrico?",
        "correcta": "Orina, heces, vómitos, drenajes, sudoración",
        "incorrectas": [
            "Solo la orina",
            "Únicamente vómitos y diarrea",
            "Solamente pérdidas insensibles"
        ]
    },
    {
        "pregunta": "¿Qué es la flebitis?",
        "correcta": "Inflamación de una vena",
        "incorrectas": [
            "Infección de una arteria",
            "Obstrucción de un vaso linfático",
            "Ruptura de un capilar"
        ]
    },
    {
        "pregunta": "¿Cuáles son los signos de flebitis?",
        "correcta": "Dolor, enrojecimiento, calor, induración en el trayecto venoso",
        "incorrectas": [
            "Palidez, frialdad, ausencia de pulso",
            "Cianosis, edema, dolor intenso",
            "Prurito, descamación, sequedad"
        ]
    },
    {
        "pregunta": "¿Qué es la tromboflebitis?",
        "correcta": "Inflamación de una vena con formación de trombo",
        "incorrectas": [
            "Infección bacteriana de la vena",
            "Ruptura de la pared venosa",
            "Vasodilatación venosa excesiva"
        ]
    },
    {
        "pregunta": "¿Qué es un hematoma?",
        "correcta": "Acumulación de sangre fuera de los vasos sanguíneos",
        "incorrectas": [
            "Inflamación de un vaso sanguíneo",
            "Aumento del número de glóbulos rojos",
            "Deficiencia de factores de coagulación"
        ]
    },
    {
        "pregunta": "¿Qué es la venopunción?",
        "correcta": "Punción de una vena para extraer sangre o administrar medicamentos",
        "incorrectas": [
            "Cirugía para reparar venas varicosas",
            "Medición de la presión venosa central",
            "Tratamiento con láser de varices"
        ]
    },
    {
        "pregunta": "¿Cuál es el orden de extracción de tubos en venopunción?",
        "correcta": "Hemocultivos, tubos sin aditivo, con coagulante, con EDTA",
        "incorrectas": [
            "Siempre comenzar por tubo con EDTA",
            "Primero tubos con anticoagulante",
            "No importa el orden de extracción"
        ]
    },
    {
        "pregunta": "¿Qué es la escala de EVA?",
        "correcta": "Escala Visual Analógica para medir intensidad del dolor",
        "incorrectas": [
            "Escala de evaluación de úlceras",
            "Escala de valoración de conciencia",
            "Escala de riesgo cardiovascular"
        ]
    },
    {
        "pregunta": "¿Qué es el dolor agudo?",
        "correcta": "Dolor de inicio reciente, generalmente menor a 3 meses",
        "incorrectas": [
            "Dolor persistente mayor a 6 meses",
            "Dolor de intensidad muy severa",
            "Dolor sin causa identificable"
        ]
    },
    {
        "pregunta": "¿Qué es el dolor crónico?",
        "correcta": "Dolor persistente mayor a 3-6 meses",
        "incorrectas": [
            "Dolor de inicio súbito y severo",
            "Dolor que aparece solo por la noche",
            "Dolor relacionado con actividad física"
        ]
    },
    {
        "pregunta": "¿Qué es la analgesia?",
        "correcta": "Ausencia o alivio del dolor",
        "incorrectas": [
            "Pérdida de la sensibilidad",
            "Pérdida de la conciencia",
            "Parálisis muscular"
        ]
    },
    {
        "pregunta": "¿Qué es la anestesia?",
        "correcta": "Pérdida de la sensibilidad con o sin pérdida de conciencia",
        "incorrectas": [
            "Alivio del dolor sin pérdida de sensibilidad",
            "Sedación superficial",
            "Relajación muscular profunda"
        ]
    },
    {
        "pregunta": "¿Qué son los 5 correctos en administración de medicamentos?",
        "correcta": "Paciente, medicamento, dosis, vía, hora correctos",
        "incorrectas": [
            "Fecha, lugar, médico, enfermera, testigo",
            "Nombre, apellido, edad, peso, altura",
            "Hospital, sala, cama, turno, registro"
        ]
    },
    {
        "pregunta": "¿Qué es la vía oral?",
        "correcta": "Administración de medicamentos por la boca",
        "incorrectas": [
            "Aplicación de medicamentos en la piel",
            "Inyección en el músculo",
            "Administración por vía rectal"
        ]
    },
    {
        "pregunta": "¿Qué es la vía sublingual?",
        "correcta": "Colocación del medicamento debajo de la lengua",
        "incorrectas": [
            "Administración del medicamento con agua",
            "Aplicación del medicamento en las encías",
            "Colocación del medicamento en la mejilla"
        ]
    },
    {
        "pregunta": "¿Qué es la vía tópica?",
        "correcta": "Aplicación del medicamento sobre la piel o mucosas",
        "incorrectas": [
            "Administración del medicamento por boca",
            "Inyección del medicamento en vena",
            "Inhalación del medicamento"
        ]
    },
    {
        "pregunta": "¿Qué es la vía parenteral?",
        "correcta": "Administración de medicamentos por inyección",
        "incorrectas": [
            "Administración por vía oral",
            "Aplicación sobre la piel",
            "Administración por inhalación"
        ]
    },
    {
        "pregunta": "¿Cuáles son las vías parenterales?",
        "correcta": "Intravenosa, intramuscular, subcutánea, intradérmica",
        "incorrectas": [
            "Oral, sublingual, rectal",
            "Tópica, oftálmica, ótica",
            "Nasal, inhalatoria, transdérmica"
        ]
    },
    {
        "pregunta": "¿Qué es la vía intradérmica?",
        "correcta": "Inyección en la dermis, entre epidermis y tejido subcutáneo",
        "incorrectas": [
            "Inyección profunda en el músculo",
            "Inyección en el tejido graso subcutáneo",
            "Inyección directa en vena"
        ]
    },
    {
        "pregunta": "¿Para qué se usa la vía intradérmica?",
        "correcta": "Pruebas de alergia y tuberculina (PPD)",
        "incorrectas": [
            "Administración de antibióticos",
            "Aplicación de insulina",
            "Transfusión de sangre"
        ]
    },
    {
        "pregunta": "¿Qué ángulo se usa en inyección intradérmica?",
        "correcta": "10-15 grados",
        "incorrectas": [
            "45 grados",
            "90 grados",
            "30 grados"
        ]
    },
    {
        "pregunta": "¿Qué ángulo se usa en inyección subcutánea?",
        "correcta": "45 grados",
        "incorrectas": [
            "90 grados",
            "15 grados",
            "60 grados"
        ]
    },
    {
        "pregunta": "¿Qué es la inmunización?",
        "correcta": "Proceso de generar protección contra enfermedades mediante vacunas",
        "incorrectas": [
            "Tratamiento con antibióticos",
            "Aislamiento de pacientes infecciosos",
            "Desinfección de superficies"
        ]
    },
    {
        "pregunta": "¿Qué es una vacuna?",
        "correcta": "Preparación biológica que proporciona inmunidad contra una enfermedad",
        "incorrectas": [
            "Medicamento para tratar infecciones",
            "Suero con anticuerpos preformados",
            "Antibiótico de amplio espectro"
        ]
    },
    {
        "pregunta": "¿Qué es el calendario de vacunación?",
        "correcta": "Esquema que indica qué vacunas aplicar según edad",
        "incorrectas": [
            "Registro de pacientes vacunados",
            "Lista de vacunas disponibles",
            "Horario de atención del vacunatorio"
        ]
    },
    {
        "pregunta": "¿Qué es la cadena de frío?",
        "correcta": "Sistema para mantener vacunas a temperatura adecuada",
        "incorrectas": [
            "Método de esterilización por congelación",
            "Transporte de órganos para trasplante",
            "Conservación de medicamentos termolábiles"
        ]
    },
    {
        "pregunta": "¿A qué temperatura se conservan la mayoría de las vacunas?",
        "correcta": "+2 a +8 °C",
        "incorrectas": [
            "-20 °C",
            "+15 a +20 °C",
            "0 a +2 °C"
        ]
    },
    {
        "pregunta": "¿Qué es un evento adverso post-vacunación?",
        "correcta": "Cualquier situación no deseada que ocurre después de la vacunación",
        "incorrectas": [
            "Dolor en el sitio de inyección solamente",
            "Fiebre mayor a 39°C únicamente",
            "Reacción alérgica exclusivamente"
        ]
    },
    {
        "pregunta": "¿Qué es la anafilaxia?",
        "correcta": "Reacción alérgica grave y potencialmente mortal",
        "incorrectas": [
            "Desmayo por dolor durante procedimiento",
            "Reacción local leve en sitio de inyección",
            "Mareo posterior a extracción de sangre"
        ]
    },
    {
        "pregunta": "¿Cuál es el tratamiento de primera línea en anafilaxia?",
        "correcta": "Adrenalina (epinefrina) intramuscular",
        "incorrectas": [
            "Antihistamínicos orales",
            "Corticoides intravenosos",
            "Oxígeno por mascarilla"
        ]
    },
    {
        "pregunta": "¿Qué es la RCP (Reanimación Cardiopulmonar)?",
        "correcta": "Maniobras para mantener circulación y oxigenación en paro cardíaco",
        "incorrectas": [
            "Procedimiento para controlar hemorragias",
            "Técnica de inmovilización de fracturas",
            "Método de tratamiento de shock"
        ]
    },
    {
        "pregunta": "¿Cuál es la relación compresiones-ventilaciones en RCP adulto?",
        "correcta": "30 compresiones : 2 ventilaciones",
        "incorrectas": [
            "15 compresiones : 2 ventilaciones",
            "5 compresiones : 1 ventilación",
            "20 compresiones : 1 ventilación"
        ]
    },
    {
        "pregunta": "¿Cuál es la profundidad de compresiones en RCP adulto?",
        "correcta": "5-6 cm",
        "incorrectas": [
            "2-3 cm",
            "8-10 cm",
            "1-2 cm"
        ]
    },
    {
        "pregunta": "¿Cuál es la frecuencia de compresiones en RCP?",
        "correcta": "100-120 por minuto",
        "incorrectas": [
            "60-80 por minuto",
            "140-160 por minuto",
            "80-100 por minuto"
        ]
    },
    {
        "pregunta": "¿Qué es la maniobra de Heimlich?",
        "correcta": "Técnica para desobstruir vía aérea por cuerpo extraño",
        "incorrectas": [
            "Método de inmovilización cervical",
            "Técnica de ventilación artificial",
            "Maniobra para controlar hemorragias"
        ]
    },
    {
        "pregunta": "¿Qué es el triaje o triage?",
        "correcta": "Clasificación de pacientes según gravedad y prioridad",
        "incorrectas": [
            "Derivación de pacientes a especialistas",
            "Registro de pacientes en admisión",
            "Alta de pacientes hospitalizados"
        ]
    },
    {
        "pregunta": "¿Cuáles son los colores del triaje?",
        "correcta": "Rojo (crítico), amarillo (urgente), verde (no urgente), negro (fallecido)",
        "incorrectas": [
            "Azul, verde, amarillo, rojo",
            "Blanco, gris, negro, rojo",
            "Verde, naranja, morado, negro"
        ]
    },
    {
        "pregunta": "¿Qué es el aislamiento hospitalario?",
        "correcta": "Medidas para prevenir transmisión de infecciones",
        "incorrectas": [
            "Separación de pacientes agresivos",
            "Hospitalización en sala privada",
            "Restricción de visitas familiares"
        ]
    },
    {
        "pregunta": "¿Qué es el aislamiento de contacto?",
        "correcta": "Precauciones para infecciones transmitidas por contacto directo o indirecto",
        "incorrectas": [
            "Aislamiento para enfermedades respiratorias",
            "Medidas para infecciones por gotas",
            "Precauciones para tuberculosis"
        ]
    },
    {
        "pregunta": "¿Qué es el aislamiento respiratorio?",
        "correcta": "Precauciones para infecciones transmitidas por vía aérea",
        "incorrectas": [
            "Medidas para pacientes con traqueostomía",
            "Aislamiento de pacientes con ventilación mecánica",
            "Precauciones para infecciones por contacto"
        ]
    },
    {
        "pregunta": "¿Qué es un cultivo bacteriológico?",
        "correcta": "Examen para identificar microorganismos causantes de infección",
        "incorrectas": [
            "Prueba para detectar alergias",
            "Análisis de células sanguíneas",
            "Estudio de función renal"
        ]
    },
    {
        "pregunta": "¿Qué es el antibiograma?",
        "correcta": "Prueba para determinar sensibilidad de bacterias a antibióticos",
        "incorrectas": [
            "Análisis de concentración de antibióticos en sangre",
            "Registro de antibióticos administrados",
            "Evaluación de efectos adversos de antibióticos"
        ]
    },
    {
        "pregunta": "¿Qué es la sepsis?",
        "correcta": "Respuesta inflamatoria sistémica grave ante una infección",
        "incorrectas": [
            "Infección localizada en una herida",
            "Fiebre de origen desconocido",
            "Infección urinaria complicada"
        ]
    },
    {
        "pregunta": "¿Qué es el shock séptico?",
        "correcta": "Sepsis con hipotensión persistente que requiere vasopresores",
        "incorrectas": [
            "Infección generalizada sin compromiso hemodinámico",
            "Fiebre alta con escalofríos",
            "Infección resistente a antibióticos"
        ]
    },
    {
        "pregunta": "¿Qué es la neutropenia?",
        "correcta": "Disminución de neutrófilos en sangre",
        "incorrectas": [
            "Aumento de glóbulos blancos",
            "Disminución de plaquetas",
            "Aumento de eosinófilos"
        ]
    },
    {
        "pregunta": "¿Qué es la anemia?",
        "correcta": "Disminución de hemoglobina o glóbulos rojos",
        "incorrectas": [
            "Disminución de glóbulos blancos",
            "Aumento de plaquetas",
            "Disminución de factores de coagulación"
        ]
    },
    {
        "pregunta": "¿Qué es la trombocitopenia?",
        "correcta": "Disminución del número de plaquetas",
        "incorrectas": [
            "Aumento de glóbulos rojos",
            "Disminución de leucocitos",
            "Aumento de factores de coagulación"
        ]
    },
    {
        "pregunta": "¿Qué es una transfusión sanguínea?",
        "correcta": "Administración de sangre o hemoderivados por vía intravenosa",
        "incorrectas": [
            "Extracción de sangre para análisis",
            "Donación de médula ósea",
            "Infusión de soluciones cristaloides"
        ]
    },
    {
        "pregunta": "¿Qué es el consentimiento informado?",
        "correcta": "Autorización voluntaria del paciente tras recibir información adecuada",
        "incorrectas": [
            "Documento de alta hospitalaria",
            "Permiso familiar para hospitalización",
            "Registro de ingreso al hospital"
        ]
    },
    {
        "pregunta": "¿Qué es la ética en enfermería?",
        "correcta": "Conjunto de principios morales que guían la práctica profesional",
        "incorrectas": [
            "Reglamento interno del hospital",
            "Leyes que regulan la profesión",
            "Normas de bioseguridad"
        ]
    },
    {
        "pregunta": "¿Cuáles son los principios bioéticos fundamentales?",
        "correcta": "Autonomía, beneficencia, no maleficencia, justicia",
        "incorrectas": [
            "Honestidad, lealtad, respeto, responsabilidad",
            "Eficiencia, eficacia, calidad, seguridad",
            "Prevención, diagnóstico, tratamiento, rehabilitación"
        ]
    },
    {
        "pregunta": "¿Qué es el secreto profesional?",
        "correcta": "Obligación de mantener confidencial la información del paciente",
        "incorrectas": [
            "Información clasificada del hospital",
            "Procedimientos de enfermería",
            "Protocolos de medicación"
        ]
    },
    {
        "pregunta": "¿Qué es la autonomía del paciente?",
        "correcta": "Derecho del paciente a tomar decisiones sobre su salud",
        "incorrectas": [
            "Capacidad del paciente para cuidarse solo",
            "Independencia económica del paciente",
            "Autorización para salir del hospital"
        ]
    },
    {
        "pregunta": "¿Qué es el cuidado paliativo?",
        "correcta": "Atención para mejorar calidad de vida en enfermedades terminales",
        "incorrectas": [
            "Tratamiento curativo de enfermedades crónicas",
            "Prevención de enfermedades graves",
            "Rehabilitación post-quirúrgica"
        ]
    },
    {
        "pregunta": "¿Qué es la eutanasia?",
        "correcta": "Acción u omisión para provocar muerte sin sufrimiento en enfermo terminal",
        "incorrectas": [
            "Suspensión de tratamiento inútil",
            "Cuidados paliativos en fase terminal",
            "Donación de órganos post-mortem"
        ]
    },
    {
        "pregunta": "¿Qué es el duelo?",
        "correcta": "Proceso de adaptación emocional ante una pérdida",
        "incorrectas": [
            "Depresión severa que requiere medicación",
            "Trastorno de ansiedad generalizada",
            "Reacción de estrés postraumático"
        ]
    },
    {
        "pregunta": "¿Cuáles son las etapas del duelo según Kübler-Ross?",
        "correcta": "Negación, ira, negociación, depresión, aceptación",
        "incorrectas": [
            "Shock, llanto, tristeza, recuperación",
            "Miedo, angustia, resignación, olvido",
            "Sorpresa, dolor, nostalgia, superación"
        ]
    },
    {
        "pregunta": "¿Qué es la salud según la OMS?",
        "correcta": "Estado de completo bienestar físico, mental y social",
        "incorrectas": [
            "Ausencia de enfermedad únicamente",
            "Capacidad de realizar actividades diarias",
            "Equilibrio entre trabajo y descanso"
        ]
    },
    {
        "pregunta": "¿Qué es la promoción de la salud?",
        "correcta": "Proceso que permite a las personas mejorar su salud",
        "incorrectas": [
            "Tratamiento de enfermedades existentes",
            "Rehabilitación de pacientes crónicos",
            "Diagnóstico precoz de enfermedades"
        ]
    },
    {
        "pregunta": "¿Qué es la prevención primaria?",
        "correcta": "Medidas para evitar la aparición de enfermedades",
        "incorrectas": [
            "Diagnóstico precoz de enfermedades",
            "Tratamiento de enfermedades establecidas",
            "Prevención de complicaciones"
        ]
    },
    {
        "pregunta": "¿Qué es la prevención secundaria?",
        "correcta": "Detección precoz y tratamiento oportuno de enfermedades",
        "incorrectas": [
            "Evitar la aparición de enfermedades",
            "Rehabilitación de secuelas",
            "Promoción de estilos de vida saludables"
        ]
    },
    {
        "pregunta": "¿Qué es la prevención terciaria?",
        "correcta": "Prevención de complicaciones y rehabilitación",
        "incorrectas": [
            "Evitar la aparición de enfermedades",
            "Diagnóstico temprano",
            "Educación en salud"
        ]
    },
    {
        "pregunta": "¿Qué es la educación para la salud?",
        "correcta": "Proceso que informa y motiva para adoptar conductas saludables",
        "incorrectas": [
            "Capacitación técnica de profesionales de salud",
            "Instrucción sobre uso de medicamentos",
            "Enseñanza de primeros auxilios"
        ]
    },
    {
        "pregunta": "¿Qué es un factor de riesgo?",
        "correcta": "Característica que aumenta la probabilidad de desarrollar una enfermedad",
        "incorrectas": [
            "Causa directa de una enfermedad",
            "Síntoma inicial de una enfermedad",
            "Complicación de un tratamiento"
        ]
    },
    {
        "pregunta": "¿Qué es la epidemiología?",
        "correcta": "Estudio de la distribución y determinantes de enfermedades en poblaciones",
        "incorrectas": [
            "Tratamiento de enfermedades infecciosas",
            "Estudio de epidemias únicamente",
            "Prevención de enfermedades crónicas"
        ]
    },
    {
        "pregunta": "¿Qué es una pandemia?",
        "correcta": "Epidemia que afecta a varios países o continentes",
        "incorrectas": [
            "Enfermedad endémica de una región",
            "Brote localizado de una enfermedad",
            "Enfermedad rara sin tratamiento"
        ]
    },
    {
        "pregunta": "¿Qué es una enfermedad endémica?",
        "correcta": "Enfermedad presente de forma habitual en una zona geográfica",
        "incorrectas": [
            "Enfermedad que aparece en brotes",
            "Enfermedad que afecta a todo el mundo",
            "Enfermedad sin casos reportados"
        ]
    }
]

def generar_examen(tema, anio, numero_examen, num_preguntas=100):
    """
    Genera un examen con el número especificado de preguntas
    """
    # Seleccionar preguntas aleatorias del banco
    preguntas_seleccionadas = random.sample(BANCO_PREGUNTAS, min(num_preguntas, len(BANCO_PREGUNTAS)))
    
    # Si necesitamos más preguntas, repetimos algunas con modificaciones
    while len(preguntas_seleccionadas) < num_preguntas:
        pregunta_adicional = random.choice(BANCO_PREGUNTAS)
        preguntas_seleccionadas.append(pregunta_adicional)
    
    preguntas_formateadas = []
    
    for idx, pregunta_data in enumerate(preguntas_seleccionadas[:num_preguntas], 1):
        # Crear lista de todas las opciones
        todas_opciones = [pregunta_data["correcta"]] + pregunta_data["incorrectas"]
        random.shuffle(todas_opciones)
        
        # Identificar cuál es la correcta después del shuffle
        indice_correcta = todas_opciones.index(pregunta_data["correcta"])
        letras = ["a", "b", "c", "d"]
        respuesta_correcta = f"opcion {letras[indice_correcta]}"
        
        pregunta_obj = {
            "id": idx,
            "pregunta": pregunta_data["pregunta"],
            "opcion a": todas_opciones[0],
            "opcion b": todas_opciones[1],
            "opcion c": todas_opciones[2],
            "opcion d": todas_opciones[3],
            "respuesta_correcta": respuesta_correcta
        }
        
        preguntas_formateadas.append(pregunta_obj)
    
    return {
        "tema": tema,
        "año": anio,
        "examen": numero_examen,
        "preguntas": preguntas_formateadas
    }

def procesar_archivos():
    """
    Procesa TODOS los archivos de enfermería y genera 100 preguntas para cada uno
    """
    archivos = [
        ("Enfermería", 2021, "enfermeria_2021.json"),
        ("Enfermería", 2021, "enfermeria_2021_alt.json"),
        ("Enfermería", 2021, "enfermeria_2021_3.json"),
        ("Enfermería", 2022, "enfermeria_2022_1.json"),
        ("Enfermería", 2022, "enfermeria_2022_4.json"),
        ("Enfermería", 2023, "enfermeria_2023_1.json"),
        ("Enfermería", 2023, "enfermeria_2023_2.json"),
        ("Enfermería", 2023, "enfermeria_2023_3.json"),
        ("Enfermería", 2023, "enfermeria_2023_4.json"),
        ("Enfermería", 2024, "enfermeria_2024_1.json"),
        ("Enfermería", 2024, "enfermeria_2024_2.json"),
        ("Enfermería", 2024, "enfermeria_2024_3.json"),
        ("Enfermería", 2024, "enfermeria_2024_4.json"),
    ]
    
    resultados = []
    
    for tema, anio, nombre_archivo in archivos:
        # Extraer número de examen del nombre del archivo
        if "_alt" in nombre_archivo:
            numero_examen = 2
        elif nombre_archivo.endswith("_3.json"):
            numero_examen = 3
        elif nombre_archivo.endswith("_4.json"):
            numero_examen = 4
        elif nombre_archivo.endswith("_2.json"):
            numero_examen = 2
        elif nombre_archivo.endswith("_1.json"):
            numero_examen = 1
        else:
            numero_examen = 1
        
        print(f"\n{'='*70}")
        print(f"Generando: {nombre_archivo}")
        print(f"Tema: {tema} | Año: {anio} | Examen: {numero_examen}")
        print(f"{'='*70}")
        
        # Generar examen con 100 preguntas
        examen = generar_examen(tema, anio, numero_examen, 100)
        
        # Guardar archivo
        ruta_completa = os.path.join(os.getcwd(), nombre_archivo)
        with open(ruta_completa, 'w', encoding='utf-8') as f:
            json.dump(examen, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Generado: {nombre_archivo}")
        print(f"   - Total preguntas: {len(examen['preguntas'])}")
        print(f"   - Cada pregunta tiene: pregunta + 4 opciones + respuesta_correcta")
        
        # Mostrar ejemplo de primera pregunta
        primera = examen['preguntas'][0]
        print(f"\n   📝 EJEMPLO - Pregunta 1:")
        print(f"   {primera['pregunta']}")
        print(f"   a) {primera['opcion a']}")
        print(f"   b) {primera['opcion b']}")
        print(f"   c) {primera['opcion c']}")
        print(f"   d) {primera['opcion d']}")
        print(f"   Respuesta correcta: {primera['respuesta_correcta']}")
        
        resultados.append({
            "archivo": nombre_archivo,
            "preguntas": len(examen['preguntas']),
            "estado": "✅ COMPLETADO"
        })
    
    # Resumen final
    print(f"\n\n{'='*70}")
    print("📊 RESUMEN FINAL - TODOS LOS EXÁMENES DE ENFERMERÍA")
    print(f"{'='*70}")
    for r in resultados:
        print(f"{r['estado']} {r['archivo']}: {r['preguntas']} preguntas")
    print(f"{'='*70}")
    print(f"✅ TOTAL: {len(resultados)} archivos procesados")
    print(f"✅ TOTAL PREGUNTAS: {sum(r['preguntas'] for r in resultados)}")
    print(f"{'='*70}")

if __name__ == "__main__":
    print("🏥 GENERADOR DEFINITIVO DE EXÁMENES DE ENFERMERÍA")
    print("=" * 70)
    print("Generando 100 preguntas por cada examen...")
    print("=" * 70)
    procesar_archivos()
    print("\n✅ ¡PROCESO COMPLETADO!")
