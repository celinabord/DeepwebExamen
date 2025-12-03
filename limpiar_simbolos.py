#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
import os

def limpiar_simbolos_matematicos(texto):
    """
    Elimina símbolos matemáticos LaTeX y otros caracteres especiales
    """
    if not isinstance(texto, str):
        return texto
    
    # Eliminar $ alrededor de números y expresiones
    texto = re.sub(r'\$([^$]+)\$', r'\1', texto)
    
    # Eliminar doble barra invertida (LaTeX)
    texto = texto.replace('\\times', '×')
    texto = texto.replace('\\%', '%')
    texto = texto.replace('\\\\', '')
    
    # Limpiar // antes o después de números
    texto = re.sub(r'//(\d+)', r'\1', texto)
    texto = re.sub(r'(\d+)//', r'\1', texto)
    
    return texto

def procesar_objeto(obj):
    """
    Procesa recursivamente un objeto JSON limpiando símbolos
    """
    if isinstance(obj, dict):
        return {k: procesar_objeto(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [procesar_objeto(item) for item in obj]
    elif isinstance(obj, str):
        return limpiar_simbolos_matematicos(obj)
    else:
        return obj

def limpiar_archivo_json(ruta_json):
    """
    Limpia un archivo JSON completo
    """
    try:
        with open(ruta_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Procesar todo el contenido
        data_limpia = procesar_objeto(data)
        
        # Guardar el archivo limpio
        with open(ruta_json, 'w', encoding='utf-8') as f:
            json.dump(data_limpia, f, ensure_ascii=False, indent=2)
        
        return True
    except Exception as e:
        print(f"❌ Error procesando {ruta_json}: {str(e)}")
        return False

# Directorio con los archivos JSON
directorio = "/workspaces/DeepwebExamen/data_final"

# Obtener todos los archivos JSON de enfermería
archivos_json = [f for f in os.listdir(directorio) if f.startswith('enfermeria') and f.endswith('.json')]

print("🧹 Limpiando símbolos matemáticos de archivos JSON...\n")

procesados = 0
errores = 0

for archivo in sorted(archivos_json):
    ruta_completa = os.path.join(directorio, archivo)
    
    if limpiar_archivo_json(ruta_completa):
        print(f"✅ {archivo}")
        procesados += 1
    else:
        print(f"❌ {archivo}")
        errores += 1

print(f"\n{'='*60}")
print(f"✅ Archivos procesados: {procesados}")
print(f"❌ Errores: {errores}")
print(f"{'='*60}")
print("\n✨ Símbolos eliminados:")
print("   • $ alrededor de números y expresiones")
print("   • // antes o después de números")
print("   • \\\\ (doble barra invertida)")
print("   • \\% convertido a %")
print("   • \\times convertido a ×")
