#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import random
import os

def redistribuir_respuestas_en_json(ruta_json):
    """
    Lee un archivo JSON y redistribuye aleatoriamente las respuestas correctas
    """
    with open(ruta_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'preguntas' not in data:
        print(f"⚠️  {ruta_json} no tiene estructura de preguntas válida")
        return False
    
    cambios = 0
    for pregunta in data['preguntas']:
        # Solo procesar si la respuesta actual es "opcion a"
        if pregunta.get('respuesta_correcta') == 'opcion a':
            # Opciones disponibles
            opciones = ['opcion a', 'opcion b', 'opcion c', 'opcion d']
            
            # Elegir una opción aleatoria para la respuesta correcta
            nueva_respuesta = random.choice(opciones)
            
            # Si la nueva respuesta es diferente, intercambiar las opciones
            if nueva_respuesta != 'opcion a':
                # Guardar el texto de la opción a (la correcta actual)
                texto_correcto = pregunta['opcion a']
                texto_nueva_posicion = pregunta[nueva_respuesta]
                
                # Intercambiar
                pregunta['opcion a'] = texto_nueva_posicion
                pregunta[nueva_respuesta] = texto_correcto
                
                # Actualizar la respuesta correcta
                pregunta['respuesta_correcta'] = nueva_respuesta
                cambios += 1
    
    # Guardar el archivo actualizado
    with open(ruta_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return cambios

# Lista de archivos a procesar (los recién convertidos)
archivos_a_procesar = [
    "enfermeria_2021_3.json",
    "enfermeria_2022_1.json",
    "enfermeria_2022_4.json",
    "enfermeria_2023_1.json",
    "enfermeria_2023_2.json",
    "enfermeria_2023_3.json",
    "enfermeria_2023_4.json",
    "enfermeria_2024_1.json",
    "enfermeria_2024_2.json",
    "enfermeria_2024_3.json",
    "enfermeria_2024_4.json",
]

directorio = "/workspaces/DeepwebExamen/data_final"

print("🔄 Redistribuyendo respuestas correctas...\n")

total_cambios = 0
archivos_procesados = 0

for nombre_archivo in archivos_a_procesar:
    ruta_completa = os.path.join(directorio, nombre_archivo)
    
    if not os.path.exists(ruta_completa):
        print(f"⚠️  Archivo no encontrado: {nombre_archivo}")
        continue
    
    cambios = redistribuir_respuestas_en_json(ruta_completa)
    
    if cambios is not False:
        print(f"✅ {nombre_archivo}: {cambios} respuestas redistribuidas")
        total_cambios += cambios
        archivos_procesados += 1
    else:
        print(f"❌ Error procesando: {nombre_archivo}")

print(f"\n{'='*60}")
print(f"✅ Archivos procesados: {archivos_procesados}")
print(f"🔀 Total de respuestas redistribuidas: {total_cambios}")
print(f"{'='*60}")
print("\n✨ Las respuestas correctas ahora están distribuidas aleatoriamente")
print("   entre las opciones a, b, c y d en cada pregunta.")
