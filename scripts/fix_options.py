#!/usr/bin/env python3
"""
fix_options.py
Script rápido para crear un backup de `data_final/` y diferenciar visualmente
las opciones de cada pregunta añadiendo un sufijo con el número de pregunta.

Uso: python3 scripts/fix_options.py
"""
import os
import json
import glob
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(ROOT, 'data_final')

def backup_data(dirpath):
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    dest = dirpath + '_backup_' + ts
    os.makedirs(dest, exist_ok=True)
    for f in glob.glob(os.path.join(dirpath, '*.json')):
        with open(f, 'rb') as fh:
            data = fh.read()
        with open(os.path.join(dest, os.path.basename(f)), 'wb') as out:
            out.write(data)
    return dest

def fix_file(path):
    with open(path, encoding='utf-8') as fh:
        data = json.load(fh)

    changed = False
    for idx, q in enumerate(data, start=1):
        suffix = f" (pregunta {idx})"
        new_options = []
        for opt in q.get('options', []):
            if isinstance(opt, str) and not opt.endswith(suffix):
                new_options.append(opt + suffix)
                changed = True
            else:
                new_options.append(opt)
        q['options'] = new_options

    if changed:
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)

    return changed

def main():
    if not os.path.isdir(DATA_DIR):
        print('No se encontró data_final/ en', DATA_DIR)
        return

    print('Creando backup de data_final/...')
    dest = backup_data(DATA_DIR)
    print('Backup creado en', dest)

    changed_files = []
    for f in sorted(glob.glob(os.path.join(DATA_DIR, '*.json'))):
        print('Procesando', os.path.basename(f))
        if fix_file(f):
            changed_files.append(os.path.basename(f))

    print('\nArchivos modificados:')
    for cf in changed_files:
        print('-', cf)

    if not changed_files:
        print('Ningún cambio necesario (ya estaban diferenciadas).')

if __name__ == '__main__':
    main()
