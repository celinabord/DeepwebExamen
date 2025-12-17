// ===== CONFIGURACIÓN DE FIREBASE =====
// IMPORTANTE: Debes reemplazar estos valores con los de tu proyecto Firebase
// Para obtener tu configuración:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un proyecto nuevo o usa uno existente
// 3. Ve a "Project Settings" > "General"
// 4. En "Your apps", click en "Web app" (</>) 
// 5. Copia la configuración y reemplaza los valores abajo

const firebaseConfig = {
    apiKey: "AIzaSyAZncg80zZ-DvM8q5XljGC2Vh4ZKDp6cZQ",
    authDomain: "deepweb-examenes.firebaseapp.com",
    databaseURL: "https://deepweb-examenes-default-rtdb.firebaseio.com",
    projectId: "deepweb-examenes",
    storageBucket: "deepweb-examenes.firebasestorage.app",
    messagingSenderId: "136422691134",
    appId: "1:136422691134:web:770299289077b6d9ab9c6f"
};

// Variable para controlar si Firebase está habilitado
let firebaseEnabled = false;
let database = null;

// Inicializar Firebase
function initFirebase() {
    try {
        // Verificar si la configuración fue actualizada
        if (firebaseConfig.apiKey === "TU_API_KEY_AQUI") {
            console.warn('⚠️ Firebase no configurado. Usando solo localStorage.');
            console.warn('📖 Lee FIREBASE_SETUP.md para configurar Firebase');
            firebaseEnabled = false;
            return false;
        }

        // Inicializar Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        database = firebase.database();
        firebaseEnabled = true;
        console.log('✅ Firebase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        console.warn('📝 Usando solo localStorage como respaldo');
        firebaseEnabled = false;
        return false;
    }
}

// Función para guardar estadística en Firebase
async function guardarEstadisticaFirebase(estadistica) {
    if (!firebaseEnabled || !database) {
        return false;
    }

    try {
        const timestamp = Date.now();
        const estadisticaRef = database.ref('estadisticas/' + timestamp);
        await estadisticaRef.set(estadistica);
        console.log('✅ Estadística guardada en Firebase');
        return true;
    } catch (error) {
        console.error('❌ Error al guardar en Firebase:', error);
        return false;
    }
}

// Función para obtener todas las estadísticas desde Firebase
async function obtenerEstadisticasFirebase() {
    if (!firebaseEnabled || !database) {
        return null;
    }

    try {
        const estadisticasRef = database.ref('estadisticas');
        const snapshot = await estadisticasRef.once('value');
        
        if (snapshot.exists()) {
            const datos = snapshot.val();
            // Convertir objeto a array
            const estadisticas = Object.values(datos);
            console.log(`✅ ${estadisticas.length} estadísticas obtenidas desde Firebase`);
            return estadisticas;
        } else {
            console.log('ℹ️ No hay estadísticas en Firebase');
            return [];
        }
    } catch (error) {
        console.error('❌ Error al obtener estadísticas desde Firebase:', error);
        return null;
    }
}

// Función para limpiar todas las estadísticas en Firebase
async function limpiarEstadisticasFirebase() {
    if (!firebaseEnabled || !database) {
        return false;
    }

    try {
        const estadisticasRef = database.ref('estadisticas');
        await estadisticasRef.remove();
        console.log('✅ Estadísticas eliminadas de Firebase');
        return true;
    } catch (error) {
        console.error('❌ Error al limpiar estadísticas en Firebase:', error);
        return false;
    }
}

// Función para sincronizar localStorage con Firebase
async function sincronizarConFirebase() {
    if (!firebaseEnabled) {
        return false;
    }

    try {
        // Obtener datos de localStorage
        const localData = JSON.parse(localStorage.getItem('estadisticasExamenes') || '[]');
        
        if (localData.length === 0) {
            console.log('ℹ️ No hay datos locales para sincronizar');
            return true;
        }

        // Subir cada estadística a Firebase
        for (const estadistica of localData) {
            await guardarEstadisticaFirebase(estadistica);
        }

        console.log(`✅ ${localData.length} estadísticas sincronizadas con Firebase`);
        return true;
    } catch (error) {
        console.error('❌ Error al sincronizar con Firebase:', error);
        return false;
    }
}

// Inicializar Firebase cuando se carga el script
if (typeof firebase !== 'undefined') {
    initFirebase();
} else {
    console.warn('⚠️ Firebase SDK no cargado. Asegúrate de incluir los scripts de Firebase en el HTML.');
}
