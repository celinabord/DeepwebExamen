#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
import os

def extraer_preguntas_de_txt(ruta_txt):
    """
    Extrae preguntas de un archivo TXT limpio.
    Formatos soportados:
    1) Número) Pregunta
       a) opción
       b) opción
       ...
    
    2) Número) Pregunta
       Opción sin letra
       Opción sin letra
       ...
    """
    with open(ruta_txt, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    preguntas = []
    
    # Patrón para detectar inicio de pregunta: número seguido de )
    patron_pregunta = r'(\d+)\)\s*(.+?)(?=\n\d+\)|$)'
    
    bloques = re.findall(patron_pregunta, contenido, re.DOTALL)
    
    for numero, bloque in bloques:
        lineas = bloque.strip().split('\n')
        
        # Primera línea(s) son la pregunta
        pregunta_texto = ""
        opciones = []
        
        i = 0
        # Recoger líneas de pregunta hasta encontrar opciones
        while i < len(lineas):
            linea = lineas[i].strip()
            
            # Si empieza con letra) es opción
            if re.match(r'^[a-d]\)', linea):
                # Extraer todas las opciones
                for j in range(i, len(lineas)):
                    opcion_linea = lineas[j].strip()
                    if opcion_linea:
                        # Quitar letra y paréntesis si existe
                        opcion_limpia = re.sub(r'^[a-d]\)\s*', '', opcion_linea)
                        if opcion_limpia:
                            opciones.append(opcion_limpia)
                break
            else:
                # Es parte de la pregunta
                if linea:
                    if pregunta_texto:
                        pregunta_texto += " " + linea
                    else:
                        pregunta_texto = linea
            i += 1
        
        # Si no encontramos opciones con formato a), b), 
        # asumir que son las siguientes 4 líneas no vacías después de la pregunta
        if len(opciones) == 0:
            opciones_sin_letra = []
            for linea in lineas[1:]:  # Saltar primera línea (pregunta)
                linea = linea.strip()
                if linea and not linea.endswith('?'):
                    opciones_sin_letra.append(linea)
            
            if len(opciones_sin_letra) >= 4:
                opciones = opciones_sin_letra[:4]
        
        # Validar que tengamos pregunta y 4 opciones
        if pregunta_texto and len(opciones) == 4:
            pregunta_obj = {
                "id": int(numero),
                "pregunta": pregunta_texto,
                "opcion a": opciones[0],
                "opcion b": opciones[1],
                "opcion c": opciones[2],
                "opcion d": opciones[3],
                "respuesta_correcta": "opcion a"  # Por defecto, se debe revisar manualmente
            }
            preguntas.append(pregunta_obj)
    
    return preguntas


def convertir_archivo_txt_a_json(ruta_txt, año, numero_examen, tema="Enfermería"):
    """Convierte un archivo TXT a formato JSON de examen"""
    
    preguntas = extraer_preguntas_de_txt(ruta_txt)
    
    if not preguntas:
        print(f"⚠️  No se pudieron extraer preguntas de {ruta_txt}")
        return None
    
    # Crear estructura del examen
    examen = {
        "tema": tema,
        "año": año,
        "examen": numero_examen,
        "preguntas": preguntas
    }
    
    return examen


# Mapeo de archivos TXT a convertir
archivos_mapeo = [
    ("enfermeria 1 año 2022.txt", 2022, 1),
    ("enfermeria 1 año 2023.txt", 2023, 1),
    ("enfermeria 1 año 2024.txt", 2024, 1),
    ("enfermeria 2 año 2022.txt", 2022, 2),
    ("enfermeria 2 año 2023.txt", 2023, 2),
    ("enfermeria 2 año 2024.txt", 2024, 2),
    ("enfermeria 3 año 2022.txt", 2022, 3),
    ("enfermeria 3 año 2023.txt", 2023, 3),
    ("enfermeria 3 año 2024.txt", 2024, 3),
    ("enfermeria 3 año2021.txt", 2021, 3),
    ("enfermeria 4 año 2022.txt", 2022, 4),
    ("enfermeria 4 año 2023.txt", 2023, 4),
    ("enfermeria 4 año 2024.txt", 2024, 4),
]

directorio = "/workspaces/DeepwebExamen/data_final"

print("🔄 Iniciando conversión de archivos TXT a JSON...\n")

convertidos = 0
errores = 0

for nombre_archivo, año, num_examen in archivos_mapeo:
    ruta_completa = os.path.join(directorio, nombre_archivo)
    
    if not os.path.exists(ruta_completa):
        print(f"⚠️  Archivo no encontrado: {nombre_archivo}")
        errores += 1
        continue
    
    # Convertir
    examen_json = convertir_archivo_txt_a_json(ruta_completa, año, num_examen)
    
    if examen_json:
        # Determinar nombre del archivo JSON de salida
        nombre_json = f"enfermeria_{año}_{num_examen}.json"
        ruta_json = os.path.join(directorio, nombre_json)
        
        # Guardar JSON
        with open(ruta_json, 'w', encoding='utf-8') as f:
            json.dump(examen_json, f, ensure_ascii=False, indent=2)
        
        num_preguntas = len(examen_json["preguntas"])
        print(f"✅ {nombre_archivo} → {nombre_json} ({num_preguntas} preguntas)")
        convertidos += 1
    else:
        print(f"❌ Error al convertir: {nombre_archivo}")
        errores += 1

print(f"\n{'='*60}")
print(f"✅ Archivos convertidos: {convertidos}")
print(f"❌ Errores: {errores}")
print(f"{'='*60}")
print("\n⚠️  IMPORTANTE: Las respuestas correctas están por defecto en 'opcion a'.")
print("   Debes revisar manualmente cada archivo JSON y corregir las respuestas.")
