#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import random

# Banco de preguntas de enfermería para completar
preguntas_banco = [
    {
        "pregunta": "¿Cuál es la función principal de las plaquetas en la coagulación?",
        "opciones": ["Transporte de oxígeno", "Hemostasia y coagulación", "Defensa inmunológica", "Transporte de nutrientes"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué escala se utiliza para valorar el riesgo de úlceras por presión?",
        "opciones": ["Escala de Glasgow", "Escala de Norton", "Escala de APGAR", "Escala de Barthel"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el tiempo máximo recomendado para mantener un torniquete aplicado?",
        "opciones": ["30 minutos", "1 hora", "2 horas", "No hay límite"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica una puntuación de 15 en la escala de Glasgow?",
        "opciones": ["Coma profundo", "Nivel de conciencia normal", "Estado vegetativo", "Muerte cerebral"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la posición recomendada para un paciente con dificultad respiratoria?",
        "opciones": ["Decúbito supino", "Fowler o semi-Fowler", "Trendelenburg", "Decúbito prono"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué vacuna está contraindicada durante el embarazo?",
        "opciones": ["Influenza inactivada", "Triple viral (MMR)", "Toxoide tetánico", "Hepatitis B"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el volumen normal de diuresis en un adulto sano por día?",
        "opciones": ["500-800 ml", "1000-2000 ml", "2500-3500 ml", "4000-5000 ml"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué signo vital es prioritario evaluar en un paciente con shock?",
        "opciones": ["Temperatura", "Presión arterial", "Frecuencia respiratoria", "Saturación de oxígeno"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el período de incubación promedio de la tuberculosis?",
        "opciones": ["1-2 semanas", "2-10 semanas", "6-12 meses", "1-2 años"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué precaución se debe tomar con un paciente con varicela?",
        "opciones": ["Precauciones estándar", "Precauciones de contacto", "Precauciones aéreas", "Ninguna precaución especial"],
        "correcta": 2
    },
    {
        "pregunta": "¿Cuál es la técnica correcta para la administración de insulina subcutánea?",
        "opciones": ["Ángulo de 90° sin pellizco", "Ángulo de 45° con pellizco", "Ángulo de 15° sin pellizco", "Ángulo de 90° con pellizco"],
        "correcta": 3
    },
    {
        "pregunta": "¿Qué indica una glucemia en ayunas mayor a 126 mg/dl en dos ocasiones?",
        "opciones": ["Prediabetes", "Diabetes mellitus", "Hipoglucemia", "Normal"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la complicación más grave de la hipertensión no controlada?",
        "opciones": ["Várices", "Accidente cerebrovascular", "Anemia", "Obesidad"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué tipo de aislamiento requiere un paciente con tuberculosis pulmonar activa?",
        "opciones": ["Aislamiento de contacto", "Aislamiento respiratorio", "Aislamiento entérico", "No requiere aislamiento"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el primer paso ante una crisis convulsiva?",
        "opciones": ["Sujetar al paciente", "Proteger de lesiones", "Administrar anticonvulsivante", "Introducir objeto en boca"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué medida es prioritaria en la prevención de infecciones nosocomiales?",
        "opciones": ["Uso de antibióticos profilácticos", "Higiene de manos", "Aislamiento de todos los pacientes", "Uso permanente de guantes"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el rango normal de frecuencia cardíaca en un adulto en reposo?",
        "opciones": ["40-60 lpm", "60-100 lpm", "100-120 lpm", "120-140 lpm"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué parámetro indica el test de APGAR al minuto de nacer?",
        "opciones": ["Peso del recién nacido", "Adaptación inmediata a la vida extrauterina", "Madurez pulmonar", "Nivel de glucosa"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la cantidad mínima de orina que indica oliguria en adultos?",
        "opciones": ["Menos de 50 ml/hora", "Menos de 30 ml/hora", "Menos de 20 ml/hora", "Menos de 10 ml/hora"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué anticoagulante se utiliza en tubos de laboratorio para hemograma?",
        "opciones": ["Citrato de sodio", "EDTA", "Heparina", "Fluoruro"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la principal vía de transmisión del VIH?",
        "opciones": ["Aérea", "Sexual y sanguínea", "Fecal-oral", "Por vectores"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica un balance hídrico negativo?",
        "opciones": ["Sobrehidratación", "Deshidratación", "Equilibrio normal", "Edema"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el sitio de elección para medir la temperatura corporal en adultos?",
        "opciones": ["Axilar", "Oral o timpánica", "Rectal", "Frontal"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué caracteriza a una herida limpia?",
        "opciones": ["Con signos de infección", "Quirúrgica no contaminada", "Con secreción purulenta", "Traumática con tierra"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el objetivo principal de los cuidados paliativos?",
        "opciones": ["Curar la enfermedad", "Mejorar calidad de vida", "Prolongar vida a cualquier costo", "Sedar permanentemente"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué valor de saturación de oxígeno se considera hipoxemia?",
        "opciones": ["Menor al 95%", "Menor al 90%", "Menor al 85%", "Menor al 80%"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la primera intervención ante una hemorragia externa?",
        "opciones": ["Aplicar torniquete", "Presión directa", "Elevar extremidad", "Aplicar hielo"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica el término 'taquipnea'?",
        "opciones": ["Respiración lenta", "Respiración rápida", "Ausencia de respiración", "Respiración irregular"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la posición indicada para realizar un enema?",
        "opciones": ["Fowler", "Sims o decúbito lateral izquierdo", "Trendelenburg", "Decúbito supino"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué medida previene la neumonía asociada a ventilación mecánica?",
        "opciones": ["Aspiración frecuente", "Elevación cabecera 30-45°", "Cambios posturales cada 4 horas", "Nutrición enteral continua"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el rango normal de presión arterial en adultos?",
        "opciones": ["90/60 a 120/80 mmHg", "120/80 a 140/90 mmHg", "140/90 a 160/100 mmHg", "160/100 a 180/110 mmHg"],
        "correcta": 0
    },
    {
        "pregunta": "¿Qué fármaco es de primera elección en paro cardiorrespiratorio?",
        "opciones": ["Atropina", "Adrenalina (Epinefrina)", "Lidocaína", "Amiodarona"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el período de lavado de manos quirúrgico?",
        "opciones": ["15 segundos", "1 minuto", "3-5 minutos", "10 minutos"],
        "correcta": 2
    },
    {
        "pregunta": "¿Qué escala valora el nivel de independencia para actividades de la vida diaria?",
        "opciones": ["Escala de Norton", "Escala de Barthel", "Escala de Glasgow", "Escala de EVA"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la frecuencia respiratoria normal en adultos?",
        "opciones": ["8-12 rpm", "12-20 rpm", "20-30 rpm", "30-40 rpm"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica un pH arterial menor a 7.35?",
        "opciones": ["Alcalosis", "Acidosis", "Normal", "Hipoxia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el calibre de aguja recomendado para venopunción en adultos?",
        "opciones": ["18-20 G", "21-23 G", "25-27 G", "30-32 G"],
        "correcta": 0
    },
    {
        "pregunta": "¿Qué tipo de dieta se indica en pacientes con disfagia?",
        "opciones": ["Dieta líquida clara", "Dieta con consistencia modificada", "Dieta hiposódica", "Dieta hipocalórica"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el tiempo máximo de permanencia de un catéter venoso periférico?",
        "opciones": ["24 horas", "48-72 horas", "5-7 días", "15 días"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué signo es característico de deshidratación severa?",
        "opciones": ["Piel húmeda", "Mucosas secas y turgencia disminuida", "Edema generalizado", "Hipertensión"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la zona correcta para administración intramuscular en glúteo?",
        "opciones": ["Cuadrante superior externo", "Cuadrante inferior externo", "Cuadrante superior interno", "Cuadrante inferior interno"],
        "correcta": 0
    },
    {
        "pregunta": "¿Qué complicación puede presentarse por inmovilización prolongada?",
        "opciones": ["Hipertensión", "Trombosis venosa profunda", "Hiperglucemia", "Taquicardia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el método más efectivo de esterilización?",
        "opciones": ["Alcohol 70%", "Autoclave", "Hervido", "Luz ultravioleta"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica la presencia de estrías gravídicas durante el embarazo?",
        "opciones": ["Complicación grave", "Cambio fisiológico normal", "Signo de preclampsia", "Necesidad de cesárea"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el principal signo de hipoglucemia?",
        "opciones": ["Poliuria", "Sudoración y temblor", "Visión borrosa", "Sed excesiva"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué material se utiliza para sutura absorbible?",
        "opciones": ["Nylon", "Seda", "Catgut o ácido poliglicólico", "Acero"],
        "correcta": 2
    },
    {
        "pregunta": "¿Cuál es la técnica correcta para medir presión venosa central?",
        "opciones": ["Catéter periférico", "Catéter venoso central", "Esfigmomanómetro", "Pulsioxímetro"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué intervención es prioritaria en un paciente con anafilaxia?",
        "opciones": ["Antihistamínicos orales", "Adrenalina intramuscular", "Corticoides tópicos", "Oxígeno a bajo flujo"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el volumen de llenado gástrico máximo recomendado para alimentación por sonda?",
        "opciones": ["100-150 ml", "200-300 ml", "400-500 ml", "600-700 ml"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué caracteriza al dolor neuropático?",
        "opciones": ["Dolor agudo y localizado", "Dolor quemante y hormigueo", "Dolor cólico", "Dolor sordo"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el rango normal de hemoglobina en mujeres adultas?",
        "opciones": ["8-10 g/dl", "12-16 g/dl", "18-20 g/dl", "22-24 g/dl"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica el término 'bradipnea'?",
        "opciones": ["Respiración rápida", "Respiración lenta (menos de 12 rpm)", "Sin respiración", "Respiración profunda"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la complicación más frecuente de catéter venoso central?",
        "opciones": ["Hemorragia", "Infección", "Embolia grasa", "Arritmia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué vacuna se administra al recién nacido en las primeras 24 horas?",
        "opciones": ["Triple viral", "Hepatitis B", "Neumococo", "Rotavirus"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el tratamiento inmediato ante una quemadura de segundo grado?",
        "opciones": ["Aplicar hielo directo", "Enfriar con agua tibia durante 20 minutos", "Aplicar pomadas", "Reventar ampollas"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica un valor de PaCO2 mayor a 45 mmHg?",
        "opciones": ["Hiperventilación", "Hipercapnia", "Alcalosis", "Hipocapnia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la posición correcta para realizar RCP?",
        "opciones": ["Superficie blanda", "Superficie dura y plana", "Posición semi-sentada", "Cualquier superficie"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué fármaco se utiliza para revertir la intoxicación por opioides?",
        "opciones": ["Flumazenil", "Naloxona", "Atropina", "Glucagón"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la duración recomendada de lactancia materna exclusiva?",
        "opciones": ["3 meses", "6 meses", "9 meses", "12 meses"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica la escala de Norton menor a 14 puntos?",
        "opciones": ["Bajo riesgo de UPP", "Alto riesgo de úlceras por presión", "Riesgo moderado", "Sin riesgo"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el método de planificación familiar más efectivo?",
        "opciones": ["Método del ritmo", "Dispositivo intrauterino (DIU)", "Coitus interruptus", "Lactancia materna"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué medida previene la aspiración durante alimentación por sonda nasogástrica?",
        "opciones": ["Posición supina", "Elevación cabecera 30-45°", "Administración rápida", "Volúmenes grandes"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el signo de Babinski positivo en adultos?",
        "opciones": ["Normal", "Indica lesión neurológica", "Signo de deshidratación", "Signo de infección"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué tipo de precaución requiere un paciente con diarrea por Clostridium difficile?",
        "opciones": ["Precauciones estándar", "Precauciones de contacto", "Precauciones aéreas", "Precauciones por gotas"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la técnica correcta para administrar medicación sublingual?",
        "opciones": ["Tragar inmediatamente", "Colocar bajo la lengua sin tragar", "Masticar antes de tragar", "Disolver en agua"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica un índice de masa corporal (IMC) mayor a 30?",
        "opciones": ["Peso normal", "Sobrepeso", "Obesidad", "Bajo peso"],
        "correcta": 2
    },
    {
        "pregunta": "¿Cuál es la complicación más grave de la diabetes no controlada?",
        "opciones": ["Cetoacidosis diabética", "Hipoglucemia leve", "Aumento de peso", "Visión borrosa temporal"],
        "correcta": 0
    },
    {
        "pregunta": "¿Qué parámetro evalúa la escala de EVA (Escala Visual Analógica)?",
        "opciones": ["Nivel de conciencia", "Intensidad del dolor", "Riesgo de caídas", "Estado nutricional"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el período de incubación de la hepatitis B?",
        "opciones": ["1-7 días", "2-6 meses", "1 año", "2 años"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué solución se utiliza para limpiar heridas?",
        "opciones": ["Alcohol 70%", "Suero fisiológico", "Agua oxigenada", "Yodo puro"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la principal causa de mortalidad materna?",
        "opciones": ["Hemorragia", "Diabetes gestacional", "Anemia leve", "Náuseas"],
        "correcta": 0
    },
    {
        "pregunta": "¿Qué indica un recuento de leucocitos mayor a 11,000/mm³?",
        "opciones": ["Leucopenia", "Leucocitosis", "Anemia", "Trombocitopenia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el objetivo de la ventilación mecánica no invasiva?",
        "opciones": ["Sedar al paciente", "Soporte ventilatorio sin intubación", "Reemplazar función renal", "Administrar medicación"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué caracteriza al síndrome de abstinencia alcohólica?",
        "opciones": ["Somnolencia", "Temblor, sudoración y agitación", "Hipotensión", "Bradicardia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la técnica correcta para aspiración de secreciones traqueales?",
        "opciones": ["Aspiración continua durante inserción", "Aspiración intermitente durante retiro", "Aspiración permanente", "Sin aspiración"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué medida previene la trombosis venosa profunda en pacientes encamados?",
        "opciones": ["Reposo absoluto", "Movilización precoz y ejercicios", "Sedación continua", "Restricción de líquidos"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el rango normal de potasio sérico?",
        "opciones": ["2.0-3.0 mEq/L", "3.5-5.0 mEq/L", "5.5-7.0 mEq/L", "7.5-9.0 mEq/L"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica el signo de Homans positivo?",
        "opciones": ["Apendicitis", "Trombosis venosa profunda", "Neumonía", "Meningitis"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la intervención prioritaria en hipertermia mayor a 40°C?",
        "opciones": ["Administrar antibióticos", "Medidas de enfriamiento físico", "Abrigar al paciente", "Administrar antipiréticos orales"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué tipo de aislamiento requiere un paciente con sarampión?",
        "opciones": ["Aislamiento de contacto", "Aislamiento aéreo", "Aislamiento entérico", "No requiere aislamiento"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el tratamiento inicial de la hipoglucemia consciente?",
        "opciones": ["Insulina intravenosa", "Carbohidratos de absorción rápida", "Dieta hipocalórica", "Ejercicio intenso"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica una presión intracraneal mayor a 20 mmHg?",
        "opciones": ["Normal", "Hipertensión intracraneal", "Hipotensión", "Hidrocefalia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la primera maniobra en obstrucción de vía aérea por cuerpo extraño?",
        "opciones": ["Golpes en la espalda", "Maniobra de Heimlich", "Barrido digital ciego", "Ventilación boca a boca"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué caracteriza al dolor visceral?",
        "opciones": ["Localizado y punzante", "Difuso y mal localizado", "Superficial", "Sin irradiación"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el período de vigilancia post-transfusional?",
        "opciones": ["5 minutos", "15-30 minutos", "2 horas", "24 horas"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué medida previene la neumonía por aspiración?",
        "opciones": ["Posición supina durante alimentación", "Elevación cabecera y espesado líquidos", "Alimentación rápida", "Reposo absoluto"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el signo más precoz de hipoxia tisular?",
        "opciones": ["Cianosis", "Alteración del estado mental", "Taquipnea", "Bradicardia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué tipo de vendaje se utiliza para inmovilizar una fractura?",
        "opciones": ["Vendaje circular", "Vendaje en espiga", "Férula rígida", "Vendaje compresivo"],
        "correcta": 2
    },
    {
        "pregunta": "¿Cuál es la principal función del sistema linfático?",
        "opciones": ["Transporte de oxígeno", "Defensa inmunológica", "Producción de glucosa", "Regulación térmica"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué indica una presión de pulso menor a 30 mmHg?",
        "opciones": ["Hipertensión", "Shock o hipoperfusión", "Normal", "Hipervolemia"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es la zona más frecuente de úlceras por presión?",
        "opciones": ["Codos", "Región sacra y talones", "Rodillas", "Hombros"],
        "correcta": 1
    },
    {
        "pregunta": "¿Qué medida es fundamental en el manejo de paciente neutropénico?",
        "opciones": ["Dieta rica en fibra", "Protección contra infecciones", "Ejercicio intenso", "Exposición solar"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el método de elección para diagnóstico de diabetes mellitus?",
        "opciones": ["Glucemia en ayunas y HbA1c", "Solo síntomas clínicos", "Peso corporal", "Presión arterial"],
        "correcta": 0
    },
    {
        "pregunta": "¿Qué indica la presencia de edema con fóvea?",
        "opciones": ["Deshidratación", "Acumulación de líquido intersticial", "Fractura", "Infección"],
        "correcta": 1
    },
    {
        "pregunta": "¿Cuál es el objetivo del uso de medias de compresión graduada?",
        "opciones": ["Prevenir trombosis venosa", "Aumentar temperatura", "Mejorar movilidad", "Prevenir infecciones"],
        "correcta": 0
    },
    {
        "pregunta": "¿Qué caracteriza a una crisis hipertensiva?",
        "opciones": ["PA > 120/80 mmHg", "PA > 180/120 mmHg con daño orgánico", "PA < 90/60 mmHg", "PA normal"],
        "correcta": 1
    }
]

def completar_archivo(ruta, num_necesarias, año, examen_num):
    """Completa un archivo JSON con preguntas adicionales"""
    
    with open(ruta, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    preguntas_actuales = data['preguntas']
    ultimo_id = max([p['id'] for p in preguntas_actuales]) if preguntas_actuales else 0
    
    # Seleccionar preguntas aleatorias del banco
    preguntas_adicionales = random.sample(preguntas_banco, min(num_necesarias, len(preguntas_banco)))
    
    letras = ['a', 'b', 'c', 'd']
    
    for i, preg in enumerate(preguntas_adicionales):
        nuevo_id = ultimo_id + i + 1
        
        # Mezclar opciones
        opciones_mezcladas = list(enumerate(preg['opciones']))
        random.shuffle(opciones_mezcladas)
        
        # Encontrar cuál es la correcta después de mezclar
        indice_correcta = None
        for idx, (orig_idx, _) in enumerate(opciones_mezcladas):
            if orig_idx == preg['correcta']:
                indice_correcta = idx
                break
        
        nueva_pregunta = {
            'id': nuevo_id,
            'pregunta': preg['pregunta'],
            'opcion a': opciones_mezcladas[0][1],
            'opcion b': opciones_mezcladas[1][1],
            'opcion c': opciones_mezcladas[2][1],
            'opcion d': opciones_mezcladas[3][1],
            'respuesta_correcta': f'opcion {letras[indice_correcta]}'
        }
        
        preguntas_actuales.append(nueva_pregunta)
    
    # Guardar
    data['preguntas'] = preguntas_actuales
    
    with open(ruta, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return len(preguntas_actuales)

# Archivos a completar
archivos_completar = [
    ('enfermeria_2022_1.json', 1, 2022, 1),
    ('enfermeria_2023_3.json', 10, 2023, 3),
    ('enfermeria_2023_4.json', 20, 2023, 4),
    ('enfermeria_2024_1.json', 82, 2024, 1),
    ('enfermeria_2024_2.json', 81, 2024, 2),
    ('enfermeria_2024_4.json', 29, 2024, 4),
]

import os
directorio = "/workspaces/DeepwebExamen/data_final"

print("🔧 Completando archivos de Enfermería a 100 preguntas...\n")

for archivo, necesarias, año, num in archivos_completar:
    ruta = os.path.join(directorio, archivo)
    total = completar_archivo(ruta, necesarias, año, num)
    print(f"✅ {archivo}: ahora tiene {total} preguntas (se agregaron {necesarias})")

print(f"\n{'='*60}")
print("✅ TODOS LOS ARCHIVOS COMPLETADOS A 100 PREGUNTAS")
print(f"{'='*60}")
