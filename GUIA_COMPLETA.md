# ✅ SISTEMA COMPLETO - Exámenes de Enfermería 2021-2024

## 📊 Exámenes Disponibles por Año

### 🎓 Año 2021
- **Examen Principal** - 100 preguntas ✅
- **Examen Alternativo** - 100 preguntas ✅

### 🎓 Año 2022
- **Primer Año** - 1 pregunta (archivo incompleto)

### 🎓 Año 2023
- **Primer Año** - 100 preguntas ✅
- **Segundo Año** - 100 preguntas ✅
- **Tercer Año** - 90 preguntas ✅
- **Cuarto Año** - 80 preguntas ✅

### 🎓 Año 2024
- **Primer Año** - 57 preguntas ✅
- **Segundo Año** - 57 preguntas ✅
- **Tercer Año** - 100 preguntas ✅
- **Cuarto Año** - 100 preguntas ✅

---

## 📦 TOTAL: **11 exámenes funcionales con ~884 preguntas**

---

## 🚀 Pasos para Publicar en Netlify

### 1. **Descarga el ZIP**
   - Archivo: `deepweb-examen.zip` (240 KB)
   - Ubicación: Raíz del proyecto
   - Haz clic derecho → "Download"

### 2. **Sube a Netlify**
   - Ve a: https://app.netlify.com/drop
   - Arrastra el archivo `deepweb-examen.zip`
   - Espera 10-30 segundos

### 3. **Obtén tu URL**
   - Netlify te dará un enlace como: `https://tu-sitio.netlify.app`
   - Puedes cambiar el nombre en "Site settings"

---

## 🔑 Credenciales

### Para Administradores:
- **Usuario:** Administrador
- **Clave:** `Teamopi91`
- **Función:** Ver y cambiar la clave de alumnos

### Para Alumnos:
- **Usuario:** Alumno
- **Clave actual:** `DEMO2025`
- **Función:** Rendir exámenes

---

## 🎯 Cómo Usar el Sistema

### Para Alumnos:
1. Ingresar con clave `DEMO2025`
2. Seleccionar **"Enfermería"**
3. Elegir el año y nivel del examen
4. Iniciar examen (100 preguntas, 4 horas)
5. Ver resultados al finalizar

### Para Administradores:
1. Ingresar con clave `Teamopi91`
2. Ver la clave actual activa
3. Generar nueva clave cuando sea necesario
4. Actualizar `clave_config.json` en el repositorio
5. Hacer push para activar la nueva clave

---

## 🔄 Actualizar la Clave de Acceso

### Método 1: Usar admin_clave.html
1. Abre `tu-sitio.netlify.app/admin_clave.html`
2. Genera una nueva clave
3. Copia el JSON generado
4. Reemplaza el contenido de `clave_config.json`
5. Ejecuta:
   ```bash
   git add clave_config.json
   git commit -m "Actualizar clave"
   git push
   ```
6. Crea un nuevo ZIP y súbelo a Netlify

### Método 2: Manual
Edita `clave_config.json`:
```json
{
  "claveAlumno": "NUEVA_CLAVE_2025",
  "fechaExpiracion": 9999999999999,
  "activo": true
}
```

---

## 📋 Especialidades Disponibles

✅ Anestesiología
✅ Cardiología
✅ Dermatología
✅ Diagnóstico por Imágenes
✅ **Enfermería (11 exámenes)**
✅ Hematología
✅ Neumonología
✅ Neurología
✅ Ortopedia
✅ Otorrinolaringología
✅ Pediatría
✅ Psiquiatría
✅ Tocoginecología
✅ Urología

---

## ✨ Características del Sistema

- ✅ Sistema de claves centralizado
- ✅ Panel de administración
- ✅ 14 especialidades médicas
- ✅ 11 exámenes de enfermería por año/nivel
- ✅ Cronómetro de 4 horas
- ✅ Resultados inmediatos
- ✅ Selección aleatoria de preguntas
- ✅ Interfaz responsive

---

## 📞 Soporte

Si los alumnos tienen problemas:
1. Verificar que estén usando la clave correcta
2. Limpiar caché del navegador (Ctrl+Shift+Delete)
3. Intentar en modo incógnito
4. Verificar que el sitio de Netlify esté actualizado

---

## 🎉 ¡Todo Listo para Usar!

El sistema está completamente funcional con todos los exámenes de Enfermería integrados.
Solo falta subirlo a Netlify y compartir el enlace con tus alumnos.
