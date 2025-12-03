#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
import os

def limpiar_pregunta(pregunta_obj):
    """
    Limpia el texto de la pregunta quitando las opciones que están dentro
    """
    pregunta_texto = pregunta_obj['pregunta']
    
    # Si la pregunta contiene las opciones concatenadas, separarlas
    # Patrón: pregunta seguida de opciones sin letra
    partes = pregunta_texto.split('?')
    
    if len(partes) >= 2:
        # La pregunta es solo hasta el primer ?
        pregunta_limpia = partes[0].strip() + '?'
        
        # Actualizar
        pregunta_obj['pregunta'] = pregunta_limpia
    
    return pregunta_obj

def procesar_archivo_json(ruta_json):
    """
    Procesa un archivo JSON para limpiar las preguntas
    """
    with open(ruta_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'preguntas' not in data:
        return False
    
    cambios = 0
    for pregunta in data['preguntas']:
        pregunta_original = pregunta['pregunta']
        pregunta_limpia = limpiar_pregunta(pregunta)
        
        if pregunta_limpia['pregunta'] != pregunta_original:
            cambios += 1
    
    # Guardar el archivo actualizado
    with open(ruta_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return cambios

# Lista de archivos a procesar
archivos = [
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

print("🔄 Limpiando preguntas de enfermería...\n")

total_cambios = 0
archivos_procesados = 0

for nombre_archivo in archivos:
    ruta_completa = os.path.join(directorio, nombre_archivo)
    
    if not os.path.exists(ruta_completa):
        print(f"⚠️  Archivo no encontrado: {nombre_archivo}")
        continue
    
    cambios = procesar_archivo_json(ruta_completa)
    
    if cambios is not False:
        print(f"✅ {nombre_archivo}: {cambios} preguntas limpiadas")
        total_cambios += cambios
        archivos_procesados += 1

print(f"\n{'='*60}")
print(f"✅ Archivos procesados: {archivos_procesados}")
print(f"🧹 Total de preguntas limpiadas: {total_cambios}")
print(f"{'='*60}")
