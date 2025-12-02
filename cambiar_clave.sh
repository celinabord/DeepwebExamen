#!/bin/bash

# Script para cambiar la clave de acceso de alumnos
# Uso: ./cambiar_clave.sh [nueva_clave] [horas_validez]

echo "==================================="
echo "  Cambiar Clave de Acceso Alumnos"
echo "==================================="
echo ""

# Solicitar nueva clave
if [ -z "$1" ]; then
    read -p "Ingrese la nueva clave (o Enter para generar automática): " NUEVA_CLAVE
else
    NUEVA_CLAVE=$1
fi

# Si está vacía, generar automática
if [ -z "$NUEVA_CLAVE" ]; then
    NUEVA_CLAVE=$(cat /dev/urandom | tr -dc 'A-Z0-9' | fold -w 8 | head -n 1)
    echo "✓ Clave generada automáticamente: $NUEVA_CLAVE"
fi

# Solicitar duración
if [ -z "$2" ]; then
    read -p "¿Cuántas horas será válida? [48]: " HORAS
    HORAS=${HORAS:-48}
else
    HORAS=$2
fi

# Calcular timestamp de expiración (en milisegundos)
EXPIRACION=$(($(date +%s) * 1000 + HORAS * 3600 * 1000))

# Crear el archivo JSON
cat > clave_config.json << EOF
{
  "claveAlumno": "$NUEVA_CLAVE",
  "fechaExpiracion": $EXPIRACION,
  "activo": true
}
EOF

echo ""
echo "✓ Archivo clave_config.json actualizado"
echo ""
echo "📋 CLAVE PARA ALUMNOS: $NUEVA_CLAVE"
echo "⏰ Válida por: $HORAS horas"
echo ""
echo "Para publicar los cambios ejecuta:"
echo "  git add clave_config.json"
echo "  git commit -m \"Actualizar clave de acceso\""
echo "  git push"
echo ""

# Preguntar si quiere hacer commit automáticamente
read -p "¿Deseas hacer commit y push automáticamente? (s/n): " AUTOPUSH

if [ "$AUTOPUSH" = "s" ] || [ "$AUTOPUSH" = "S" ]; then
    git add clave_config.json
    git commit -m "Actualizar clave de acceso alumnos"
    git push
    echo ""
    echo "✓ Cambios publicados. En 1-2 minutos estará activo en Netlify"
fi
