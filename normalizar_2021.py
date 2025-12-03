#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

def normalizar_estructura_2021(ruta_json):
    """
    Normaliza archivos de 2021 que tienen estructura diferente
    """
    with open(ruta_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Si es un array directo (no tiene campo "preguntas")
    if isinstance(data, list):
        preguntas_normalizadas = []
        
        for p in data:
            # Si tiene el campo "opciones" como objeto anidado, desanidar
            if 'opciones' in p and isinstance(p['opciones'], dict):
                pregunta_normalizada = {
                    'id': p.get('id', 0),
                    'pregunta': p.get('pregunta', ''),
                    'opcion a': p['opciones'].get('opcion a', ''),
                    'opcion b': p['opciones'].get('opcion b', ''),
                    'opcion c': p['opciones'].get('opcion c', ''),
                    'opcion d': p['opciones'].get('opcion d', ''),
                    'respuesta_correcta': p.get('respuesta_correcta', 'opcion a')
                }
                
                if p.get('caso_clinico'):
                    pregunta_normalizada['caso_clinico'] = p['caso_clinico']
                
                preguntas_normalizadas.append(pregunta_normalizada)
            else:
                # Ya tiene formato correcto
                preguntas_normalizadas.append(p)
        
        # Crear estructura con campo "preguntas"
        data_normalizada = {
            "tema": "Enfermería",
            "año": 2021,
            "examen": 1,
            "preguntas": preguntas_normalizadas
        }
        
        # Guardar
        with open(ruta_json, 'w', encoding='utf-8') as f:
            json.dump(data_normalizada, f, ensure_ascii=False, indent=2)
        
        return len(preguntas_normalizadas)
    
    return 0

# Archivos a normalizar
archivos = [
    "enfermeria_2021.json",
    "enfermeria_2021_alt.json"
]

directorio = "/workspaces/DeepwebExamen/data_final"

print("🔄 Normalizando estructura de archivos 2021...\n")

for nombre_archivo in archivos:
    ruta_completa = os.path.join(directorio, nombre_archivo)
    
    if not os.path.exists(ruta_completa):
        print(f"⚠️  Archivo no encontrado: {nombre_archivo}")
        continue
    
    preguntas = normalizar_estructura_2021(ruta_completa)
    
    if preguntas > 0:
        print(f"✅ {nombre_archivo}: {preguntas} preguntas normalizadas")
    else:
        print(f"❌ Error procesando: {nombre_archivo}")

print(f"\n{'='*60}")
print("✅ Normalización completada")
print(f"{'='*60}")
