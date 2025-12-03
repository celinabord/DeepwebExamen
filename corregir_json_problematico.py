#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

def corregir_json_raw(ruta_archivo):
    """
    Corrige un archivo JSON en texto plano antes de parsearlo
    """
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Contar cambios
    cambios = 0
    
    # 1. Eliminar símbolos $ alrededor de números/expresiones
    nuevo_contenido = re.sub(r'\$([^$]+?)\$', r'\1', contenido)
    if nuevo_contenido != contenido:
        cambios += contenido.count('$') - nuevo_contenido.count('$')
        contenido = nuevo_contenido
    
    # 2. Corregir barras invertidas en porcentajes \\% -> %
    nuevo_contenido = contenido.replace('\\\\%', '%')
    if nuevo_contenido != contenido:
        cambios += 1
        contenido = nuevo_contenido
    
    # 3. Corregir barra invertida simple en porcentajes \% -> %
    nuevo_contenido = contenido.replace('\\%', '%')
    if nuevo_contenido != contenido:
        cambios += 1
        contenido = nuevo_contenido
    
    # 4. Corregir \\times -> ×
    nuevo_contenido = contenido.replace('\\\\times', '×')
    if nuevo_contenido != contenido:
        cambios += 1
        contenido = nuevo_contenido
    
    nuevo_contenido = contenido.replace('\\times', '×')
    if nuevo_contenido != contenido:
        cambios += 1
        contenido = nuevo_contenido
    
    # 5. Eliminar // antes o después de números
    nuevo_contenido = re.sub(r'//(\d+)', r'\1', contenido)
    if nuevo_contenido != contenido:
        cambios += 1
        contenido = nuevo_contenido
    
    nuevo_contenido = re.sub(r'(\d+)//', r'\1', contenido)
    if nuevo_contenido != contenido:
        cambios += 1
        contenido = nuevo_contenido
    
    # Guardar archivo corregido
    with open(ruta_archivo, 'w', encoding='utf-8') as f:
        f.write(contenido)
    
    return cambios

# Procesar los dos archivos problemáticos
archivos = [
    '/workspaces/DeepwebExamen/data_final/enfermeria_2022_2_original.json',
    '/workspaces/DeepwebExamen/data_final/enfermeria_2022_3_original.json'
]

print("🔧 Corrigiendo archivos JSON problemáticos...\n")

for archivo in archivos:
    try:
        cambios = corregir_json_raw(archivo)
        print(f"✅ {archivo.split('/')[-1]}: {cambios} correcciones")
    except Exception as e:
        print(f"❌ {archivo.split('/')[-1]}: {str(e)}")

print("\n✨ Correcciones aplicadas directamente al texto")
