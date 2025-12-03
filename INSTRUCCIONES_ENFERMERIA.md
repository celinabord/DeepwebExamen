# Instrucciones para Completar Exámenes de Enfermería

## 📋 Archivos a Completar

- `data_final/enfermeria_2016.json` - Examen de Enfermería 2016
- `data_final/enfermeria_2019.json` - Examen de Enfermería 2019

## 📝 Estructura de Cada Pregunta

Cada archivo debe contener un array JSON con 100 preguntas siguiendo este formato:

```json
{
    "id": 1,
    "tema": "Fundamentos de Enfermería",
    "año": 2016,
    "caso_clínico": "Paciente de 60 años hospitalizado en el área de medicina interna.",
    "pregunta": "¿Cuál es el procedimiento correcto para la toma de presión arterial?",
    "opciones": {
        "opcion a": "Colocar el brazalete en el brazo dominante",
        "opcion b": "Colocar el brazalete 2-3 cm por encima de la fosa antecubital",
        "opcion c": "Inflar rápidamente hasta 200 mmHg",
        "opcion d": "Tomar la presión inmediatamente después del ejercicio"
    },
    "respuesta_correcta": "opcion b"
}
```

## ⚠️ Importante

1. **ID único**: Cada pregunta debe tener un id del 1 al 100
2. **Año**: Debe coincidir con el año del examen (2016 o 2019)
3. **Respuesta correcta**: Debe ser exactamente `"opcion a"`, `"opcion b"`, `"opcion c"` o `"opcion d"` (con minúsculas y espacio)
4. **Sintaxis JSON**: Asegúrate de que el JSON sea válido (usa comillas dobles, comas entre elementos, etc.)

## 🔄 Agregar Más Años

Si tienes exámenes de otros años (2017, 2018, 2020, etc.):

1. Crea un nuevo archivo: `data_final/enfermeria_XXXX.json` (reemplaza XXXX por el año)
2. Sigue la misma estructura con 100 preguntas
3. Agrega el año al selector en `index.html`:

```html
<option value="2017">2017</option>
<option value="2018">2018</option>
<!-- etc -->
```

## 📂 Fuentes de Datos

Los PDFs originales están en:
- `datos/choise/Enfermeria2016.pdf`
- `datos/choise/Enfermeria-2019.pdf`

## ✅ Validación

Antes de publicar, verifica que:
- [ ] Cada archivo tiene exactamente 100 preguntas
- [ ] Todos los IDs son únicos (1-100)
- [ ] Todas las preguntas tienen 4 opciones
- [ ] La respuesta_correcta es válida para cada pregunta
- [ ] El JSON es sintácticamente correcto (sin comas finales, comillas correctas, etc.)

## 🧪 Probar los Exámenes

1. Abre el sistema en tu navegador
2. Ingresa como alumno con la clave `DEMO2025`
3. Selecciona "Enfermería"
4. Elige el año
5. Inicia el examen y verifica que todo funcione correctamente

## 📚 Categorías Sugeridas para Clasificar Preguntas

- Fundamentos de Enfermería
- Enfermería Médico-Quirúrgica
- Enfermería Pediátrica
- Enfermería Materno-Infantil
- Enfermería en Salud Mental
- Administración de Medicamentos
- Cuidados Intensivos
- Enfermería Comunitaria
- Bioseguridad
- Proceso de Atención de Enfermería (PAE)
- Valoración de Signos Vitales
- Cuidados de Heridas
- Nutrición y Dietética
- Procedimientos de Enfermería
- Ética y Legislación en Enfermería
