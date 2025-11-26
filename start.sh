#!/bin/bash

# Script de inicio rápido para el Sistema de Examen Médico

echo "🏥 Sistema de Examen Médico"
echo "================================"
echo ""

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no encontrado. Por favor instálalo."
    exit 1
fi

echo "✅ Python 3 encontrado"

# Detectar puerto disponible
PORT=8000
while netstat -tuln 2>/dev/null | grep -q ":$PORT "; do
    PORT=$((PORT + 1))
done

echo "✅ Usando puerto: $PORT"
echo ""
echo "🚀 Iniciando servidor..."
echo "📱 Accede a: http://localhost:$PORT"
echo ""
echo "🔐 Credenciales de prueba:"
echo "   Admin: admin123"
echo ""
echo "⏹️  Para detener, presiona Ctrl+C"
echo "================================"
echo ""

# Iniciar servidor
cd "$(dirname "$0")"
python3 -m http.server $PORT --bind 127.0.0.1
