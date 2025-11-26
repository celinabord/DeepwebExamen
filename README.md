# 📋 Sistema de Examen Médico

Una plataforma web moderna para exámenes de especialidades médicas con cronómetro integrado, navegación intuitiva y análisis de resultados.

## 🎯 Características

✅ **13 Especialidades Médicas**
- Anestesiología
- Cardiología  
- Dermatología
- Diagnóstico por Imágenes
- Hematología
- Neumonología
- Neurología
- Ortopedia
- Otorrinolaringología
- Pediatría
- Psiquiatría
- Tocoginecología
- Urología

✅ **100 Preguntas por Especialidad** - Cuestionarios completos con 4 opciones cada una

✅ **Cronómetro de 4 Horas** - Cuenta regresiva con alertas visuales

✅ **Navegación Intuitiva**
- Selector visual de preguntas con círculos de progreso
- Navegación hacia adelante y hacia atrás
- Salto directo a cualquier pregunta

✅ **Sistema de Respuestas**
- Guardado automático de respuestas
- Visualización de estado (respondida/no respondida)
- Edición en cualquier momento

✅ **Análisis de Resultados**
- Porcentaje de aciertos
- Respuestas correctas e incorrectas
- Preguntas sin responder
- Criterio de aprobación: 70%
- Tiempo utilizado en el examen

✅ **Panel Administrativo**
- Generación de claves para alumnos
- Regeneración de claves con validez de 48 horas
- Visualización de clave actual

✅ **Diseño Responsivo**
- Interfaz completa en desktop
- Optimizado para tablets
- Versión móvil completa

## 🚀 Cómo Usar

### Para Administradores

1. **Ingresar al panel**: Ingresa la clave `admin123`
2. **Generar clave para alumnos**: Haz clic en "Regenerar Clave"
3. **Compartir clave**: Usa el botón "Copiar" para copiar la clave
4. Las claves tienen validez de 48 horas

### Para Alumnos

1. **Acceder**: Ingresa la clave proporcionada por el administrador
2. **Seleccionar especialidad**: Elige una de las 13 especialidades disponibles
3. **Comenzar examen**: Haz clic en "Comenzar Examen"
4. **Responder preguntas**:
   - Haz clic en una opción para seleccionar
   - Usa los botones "Anterior" y "Siguiente" para navegar
   - O haz clic en los círculos del navegador para saltar a una pregunta específica
5. **Finalizar**: Al llegar a la última pregunta, el botón se convierte en "Finalizar Examen"
6. **Ver resultados**: La plataforma calcula automáticamente tu desempeño

## 📊 Criterio de Calificación

- **Aprobado**: 70% o más de aciertos ✓
- **No Aprobado**: Menos del 70% de aciertos ✗

## 🏗️ Estructura del Proyecto

```
DeepwebExamen/
├── index.html           # Página principal
├── app.js              # Lógica principal de la aplicación
├── style.css           # Estilos CSS modernos
├── data_final/         # Archivos JSON de preguntas
│   ├── anestesiologia.json
│   ├── cardiologia.json
│   ├── dermatologia.json
│   ├── diagnostico_imagenes.json
│   ├── hematologia.json
│   ├── neumonologia.json
│   ├── neurologia.json
│   ├── ortopedia.json
│   ├── otorrinolaringologia.json
│   ├── pediatria.json
│   ├── psiquiatria.json
│   ├── tocoginecologia.json
│   └── urologia.json
├── scripts/            # Scripts de utilidad
│   └── generate_questions.js
└── README.md           # Esta documentación
```

## 🛠️ Desarrollo

### Generar nuevas preguntas

Para regenerar todas las preguntas con datos de prueba:

```bash
node scripts/generate_questions.js
```

### Agregar preguntas reales

Edita los archivos JSON en `data_final/` con el siguiente formato:

```json
[
  {
    "question": "¿Cuál es la pregunta?",
    "options": [
      "Opción A",
      "Opción B",
      "Opción C",
      "Opción D"
    ],
    "answer": 0
  }
]
```

El índice `answer` indica la opción correcta (0-3).

## 📱 Compatibilidad

- ✓ Chrome, Firefox, Safari, Edge (últimas versiones)
- ✓ Desktop (1920x1080 y superiores)
- ✓ Tablet (768px - 1024px)
- ✓ Mobile (320px - 767px)

## 🔐 Seguridad

- Las claves se regeneran cada 48 horas
- Cada alumno tiene su propia sesión
- Los datos se almacenan localmente en el navegador
- Prevención de cierre accidental durante el examen

## 💾 Almacenamiento

- Clave de alumnos: localStorage
- Tiempo de expiración: localStorage
- Respuestas del usuario: Sesión en memoria (se pierden al salir)

## 📝 Notas Técnicas

- **Framework**: JavaScript vanilla (sin dependencias externas)
- **Diseño**: CSS Grid y Flexbox
- **API**: Fetch API para cargar preguntas
- **Persistencia**: localStorage para credenciales
- **Responsividad**: Mobile-first approach

## 🎨 Características Visuales

- Gradientes modernos en colores azul/púrpura
- Animaciones suaves y transiciones
- Indicadores visuales de progreso
- Estados de los botones adaptativos
- Navegador de preguntas con círculos codificados por color

## 📞 Soporte

Para reportar problemas o sugerencias, contacta con el administrador.

---

**Versión**: 1.0.0  
**Último actualización**: Noviembre 2025  
**Estado**: ✅ Funcional y Operativo
