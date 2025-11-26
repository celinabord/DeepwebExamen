# 🚀 Guía de Instalación y Despliegue

## Instalación Local

### Requisitos
- Python 3.6+ (para servidor local)
- Node.js 12+ (opcional, para generar preguntas)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Opción 1: Servidor Simple (Recomendado)

```bash
# Navega a la carpeta del proyecto
cd /ruta/a/DeepwebExamen

# Inicia el servidor Python
python3 -m http.server 8000

# Abre en tu navegador
# http://localhost:8000
```

### Opción 2: Con Node.js

```bash
# Si tienes http-server instalado globalmente
http-server

# O instala localmente
npm install http-server
npx http-server
```

### Opción 3: Doble clic (Windows)

Crea un archivo `run.bat` en la carpeta del proyecto:

```batch
@echo off
cd /d "%~dp0"
python -m http.server 8000
pause
```

Luego haz doble clic en `run.bat`.

---

## Configuración de Credenciales

### Primera vez

1. Accede a http://localhost:8000
2. Ingresa la clave: `admin123`
3. Copia la clave que aparece para compartir con alumnos
4. Cierra sesión

### Para los alumnos

1. Comparten la clave del administrador
2. Seleccionan especialidad
3. Comienzan a responder 100 preguntas
4. El sistema califica automáticamente

---

## Despliegue en Producción

### Opción 1: GitHub Pages

```bash
# Sube el repositorio a GitHub
git add .
git commit -m "Sistema de examen médico completamente funcional"
git push origin main

# En GitHub:
# 1. Ve a Settings > Pages
# 2. Selecciona "Deploy from a branch"
# 3. Elige la rama "main" y carpeta "root"
# 4. Tu sitio estará en https://tu-usuario.github.io/DeepwebExamen
```

### Opción 2: Netlify

```bash
# Instala Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.

# Tu URL será como: https://nombre-aleatorio.netlify.app
```

### Opción 3: Vercel

```bash
# Instala Vercel CLI
npm install -g vercel

# Deploy
vercel

# Sigue los prompts
```

### Opción 4: Servidor Web Propio

```bash
# Copia todos los archivos a tu servidor
scp -r . usuario@servidor.com:/var/www/examen-medico/

# Configura Nginx o Apache para servir los archivos estáticos
# Reinicia el servidor web
```

---

## Variables de Entorno

Crea un archivo `.env` si necesitas configurar:

```env
ADMIN_PASSWORD=admin123
SESSION_TIMEOUT=14400
RESULTS_APPROVAL=70
CLAVE_EXPIRY_HOURS=48
```

**Nota**: En la versión actual, estas están codificadas en `app.js`.

---

## Estructura de Carpetas para Producción

```
depl-medico/
├── index.html
├── style.css
├── app.js
├── package.json
├── README.md
├── data_final/
│   ├── anestesiologia.json
│   ├── cardiologia.json
│   └── ... (el resto de JSON)
├── scripts/
│   └── generate_questions.js
└── .htaccess (si usas Apache)
```

---

## Optimizaciones Recomendadas

### Minificar archivos

```bash
# CSS
npx cssnano style.css -o style.min.css

# JavaScript
npx terser app.js -o app.min.js

# Actualiza los referencias en index.html
```

### Caché

Añade a `.htaccess` (Apache):

```apache
<FilesMatch "\.(jpg|jpeg|png|gif|css|js)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### HTTPS

- Usa certificado SSL/TLS
- Redirige HTTP a HTTPS
- Configura CORS si accedes desde otro dominio

---

## Troubleshooting

### Error: "CORS blocked"
- Asegúrate de que todos los archivos estén en la misma carpeta
- Verifica que los rutas JSON sean relativas: `./data_final/cardiologia.json`

### Preguntas no carga
- Abre la consola del navegador (F12)
- Verifica los errores en Network tab
- Confirma que los JSON están bien formados: `jq . data_final/cardiologia.json`

### Timer no funciona
- Verifica que JavaScript esté habilitado
- Recarga la página
- Prueba en otro navegador

### Clave expirada
- Ve al panel de admin
- Regenera la clave
- Distribuye la nueva clave a los alumnos

---

## Monitoreo

### Logs locales
Los logs se guardan en la consola del navegador:
- F12 > Console tab
- Busca mensajes de error

### Analytics (Opcional)
Puedes añadir Google Analytics en `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

---

## Actualizaciones

### Actualizar preguntas
1. Edita los archivos JSON en `data_final/`
2. Recarga el navegador (Ctrl+F5 para limpiar caché)
3. Los cambios se aplican inmediatamente

### Cambiar tiempo del examen
1. Abre `app.js`
2. Busca: `const TIEMPO_EXAMEN = 4 * 60 * 60`
3. Modifica los números (ej: 3 horas = `3 * 60 * 60`)
4. Guarda y recarga

---

## Soporte

Para problemas con:
- **Preguntas**: Edita directamente los JSON
- **Estilos**: Modifica `style.css`
- **Lógica**: Revisa `app.js`
- **Servidor**: Consulta documentación de Python/Node.js

---

**¡Tu sistema está listo para usar! 🎉**
