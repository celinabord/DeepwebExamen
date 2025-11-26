@echo off
REM Script de inicio rápido para Windows
REM Sistema de Examen Médico

setlocal enabledelayedexpansion

echo.
echo 🏥 Sistema de Examen Médico
echo ================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no encontrado. Por favor instálalo desde python.org
    pause
    exit /b 1
)

echo ✅ Python encontrado
echo.
echo 🚀 Iniciando servidor...
echo.
echo 📱 Accede a: http://localhost:8000
echo.
echo 🔐 Credenciales de prueba:
echo    Admin: admin123
echo.
echo ⏹️  Para detener, presiona Ctrl+C dos veces
echo ================================
echo.

REM Cambiar a la carpeta del script
cd /d "%~dp0"

REM Iniciar servidor Python
python -m http.server 8000

pause
