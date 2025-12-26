# 🤖 Configuración del Generador de Preguntas con IA

## 🎯 ¿Qué hace esta función?

El **Modo Híbrido IA** genera **50 preguntas nuevas** con Inteligencia Artificial en cada examen, complementando las **50 preguntas del banco** existente. Las preguntas generadas están:

- ✅ Contextualizadas para **Argentina** (hospitales, protocolos, terminología local)
- ✅ Nivel universitario (medicina/enfermería)
- ✅ Basadas en casos clínicos realistas
- ✅ Nunca se repiten (cada examen es diferente)

---

## 🚀 Configuración Paso a Paso

### 1️⃣ Obtener API Key de Gemini (GRATIS)

1. Ve a: **https://makersuite.google.com/app/apikey**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Get API Key"** o **"Create API Key"**
4. Copia la clave que se genera (ejemplo: `AIzaSyD...abc123`)

> 💡 **Nota:** La API de Gemini es **100% GRATIS** con límite de 60 requests por minuto (más que suficiente).

---

### 2️⃣ Configurar en la Aplicación

**Opción A: Desde la interfaz**
1. Ingresa como alumno
2. En la selección de especialidad, verás la sección **"🤖 Preguntas con IA"**
3. Activa el interruptor (toggle)
4. Si no está configurada, aparecerá un botón **"Configurar ahora"**
5. Haz clic y pega tu API Key
6. ¡Listo! El modo híbrido está activado

**Opción B: Manualmente**
1. Abre la consola del navegador (F12)
2. Ejecuta: `window.generadorIA.configurarAPIKey('TU_API_KEY_AQUI')`
3. Refresca la página

---

### 3️⃣ Usar el Modo Híbrido

1. **Activa el toggle** "Preguntas con IA" 
2. Selecciona la especialidad
3. Haz clic en **"Iniciar Examen"**
4. El sistema mostrará:
   - ⏳ "Generando preguntas con IA..." (10-15 segundos)
   - ✅ Examen con 100 preguntas (50 banco + 50 IA)

---

## 🔧 Troubleshooting

### ❌ "Necesitas configurar tu API Key"
**Solución:** Sigue el paso 1 para obtener tu API Key gratuita.

### ❌ Error de conexión con Gemini
**Solución:** 
- Verifica tu conexión a internet
- Revisa que la API Key sea correcta
- Si persiste, el sistema usará automáticamente el banco completo (fallback)

### ❌ Las preguntas tardan mucho
**Normal:** Generar 50 preguntas con IA puede tomar 10-20 segundos la primera vez. Es esperado.

### ❌ No se generan preguntas
**Solución:**
- El sistema tiene **fallback automático**: si la IA falla, usa 100% del banco actual
- Revisa la consola del navegador (F12) para ver logs de error
- Verifica que no hayas excedido el límite de requests (60/min)

---

## 📊 Comparación: Banco vs IA vs Híbrido

| Característica | Banco Solo | Híbrido (Recomendado) | IA Solo |
|----------------|------------|----------------------|---------|
| **Velocidad** | ⚡ Instantáneo | 🔄 10-15 seg | ⏳ 20-30 seg |
| **Variedad** | 🔁 Limitada | ✅ Alta | ✅✅ Infinita |
| **Calidad** | ✅✅ Verificada | ✅ Excelente | ⚠️ Puede variar |
| **Requiere Internet** | ❌ No | ✅ Sí | ✅ Sí |
| **Fallback** | - | ✅ Banco completo | ❌ Sin examen |
| **Contexto Argentino** | ❓ Varía | ✅ Garantizado | ✅ Garantizado |

---

## 🛡️ Seguridad

- ✅ Tu API Key se guarda **solo en tu navegador** (localStorage)
- ✅ No se comparte con nadie
- ✅ No se envía a ningún servidor excepto Google Gemini
- ✅ Puedes borrarla en cualquier momento desde la consola:
  ```javascript
  localStorage.removeItem('gemini_api_key')
  ```

---

## 💡 Tips

1. **Primera vez:** Configura la API key y prueba con un examen corto
2. **Sin internet:** Desactiva el toggle IA para usar el banco offline
3. **Variedad máxima:** Activa el modo IA para nunca repetir preguntas
4. **Rendimiento:** El híbrido balancea velocidad y variedad perfectamente

---

## 📞 Soporte

Si tienes problemas:
1. Revisa este documento
2. Mira la consola del navegador (F12) para ver errores específicos
3. Contacta a: **deepwebcb@gmail.com**

---

**¡Disfruta de exámenes siempre diferentes con IA! 🚀**
