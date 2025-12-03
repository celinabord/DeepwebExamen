#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORRECCIÓN FINAL - Cambiar estructura de enfermería para que funcione con app.js
"""

import json
import os

archivos = [
    "enfermeria_2021.json",
    "enfermeria_2021_alt.json",
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
    "enfermeria_2024_4.json"
]

print("="*70)
print("CORRECCIÓN FINAL - ESTRUCTURA PARA APP.JS")
print("="*70)

for archivo in archivos:
    if os.path.exists(archivo):
        print(f"\nProcesando: {archivo}")
        
        with open(archivo, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convertir cada pregunta al formato correcto
        for pregunta in data['preguntas']:
            # Si tiene "opcion a", "opcion b" directamente, moverlas a un objeto "opciones"
            if 'opcion a' in pregunta:
                pregunta['opciones'] = {
                    'opcion a': pregunta.pop('opcion a'),
                    'opcion b': pregunta.pop('opcion b'),
                    'opcion c': pregunta.pop('opcion c'),
                    'opcion d': pregunta.pop('opcion d')
                }
        
        # Guardar el archivo corregido
        with open(archivo, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ {archivo} - Estructura corregida")
        
        # Mostrar ejemplo
        p = data['preguntas'][0]
        print(f"   Estructura: {list(p.keys())}")
        print(f"   Opciones: {list(p['opciones'].keys())}")

print("\n" + "="*70)
print("✅ TODOS LOS ARCHIVOS CORREGIDOS")
print("="*70)
