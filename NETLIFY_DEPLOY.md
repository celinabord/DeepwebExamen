# 🌐 Desplegar en Netlify

## 🚀 Opción 1: Desde GitHub (Recomendado)

### Paso 1: Ve a Netlify
1. Abre: https://www.netlify.com/
2. Click en **"Sign up"** o **"Log in"**
3. Elige **"GitHub"** para autenticarte

### Paso 2: Importar desde GitHub
1. Click en **"Add new site"** → **"Import an existing project"**
2. Selecciona **"Deploy with GitHub"**
3. Autoriza a Netlify a acceder a tus repositorios
4. Busca y selecciona: **`DeepwebExamen`**

### Paso 3: Configurar despliegue
```
Build command: (dejar vacío)
Publish directory: .
```

### Paso 4: Deploy!
1. Click en **"Deploy site"**
2. Espera 1-2 minutos
3. ✅ **¡Tu sitio está en línea!**

Tu URL será algo como:
```
https://random-name-123456.netlify.app
```

### Paso 5: Cambiar nombre (Opcional)
1. Ve a **Site settings** → **Site details**
2. Click en **"Change site name"**
3. Elige un nombre: `deepweb-examenes`
4. Tu nueva URL será:
```
https://deepweb-examenes.netlify.app
```

---

## ⚡ Opción 2: Deploy Manual (Rápido)

### Con Netlify CLI:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd /workspaces/DeepwebExamen
netlify deploy --prod
```

### Con Drag & Drop:
1. Ve a: https://app.netlify.com/drop
2. Arrastra la carpeta del proyecto
3. ✅ ¡Listo!

---

## 🔥 Configurar Firebase para Netlify

Una vez desplegado en Netlify:

1. **Obtén tu URL de Netlify**:
   ```
   https://tu-sitio.netlify.app
   ```

2. **En Firebase Console**:
   - Ve a Project Settings
   - Agrega tu dominio de Netlify a "Authorized domains"

3. **Listo**: Firebase funcionará en Netlify

---

## ✅ Ventajas de Netlify

- ✅ **Gratis** para proyectos personales
- ✅ **HTTPS automático**
- ✅ **Deploy automático** cuando haces push a GitHub
- ✅ **CDN global** (super rápido)
- ✅ **Dominio personalizado** gratis

---

## 🎯 Después del Deploy

1. **Prueba tu sitio**:
   ```
   https://tu-sitio.netlify.app
   ```

2. **Configura Firebase** (si aún no lo hiciste):
   - Sigue `FIREBASE_SETUP.md`
   - Edita `firebase-config.js` con tu configuración

3. **Comparte el link**:
   - Cualquiera podrá acceder
   - Con Firebase: Verán las mismas estadísticas
   - Sin Firebase: Solo verán su localStorage

---

## 🆘 Solución de Problemas

### ❌ "Page not found"
**Solución**: Asegúrate de que `netlify.toml` esté en el repositorio

### ❌ Archivos JSON no cargan
**Solución**: Verifica que los archivos `.json` estén en el repositorio

### ❌ Firebase no funciona
**Solución**: 
1. Abre la consola del navegador (F12)
2. Verifica si hay errores
3. Agrega tu dominio de Netlify a Firebase Console

---

## 📊 Autodeploy

Cada vez que hagas `git push`, Netlify automáticamente:
1. Detecta los cambios
2. Hace un nuevo deploy
3. Actualiza tu sitio

No necesitas hacer nada más! 🎉

---

## 🌐 URLs Importantes

- **Netlify Dashboard**: https://app.netlify.com/
- **Tu sitio**: https://tu-sitio.netlify.app
- **Documentación**: https://docs.netlify.com/

---

_¿Listo para deployar? Solo sigue el paso 1!_
