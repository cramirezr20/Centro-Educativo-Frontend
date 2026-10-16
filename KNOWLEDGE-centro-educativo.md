# Conocimiento del proyecto: Centro Educativo

## Propósito

Aplicación Android para la gestión académica de un centro educativo. Permite consultar y administrar información de carreras, cursos, estudiantes, docentes, inscripciones y notas, según el rol del usuario autenticado.

Este documento reúne el contexto práctico para que el equipo pueda instalar, navegar y extender el proyecto. Se basa en el código y la configuración presentes en el repositorio; las reglas internas del backend y la configuración de Firebase deben confirmarse en sus respectivos proyectos.

## Equipo

- Pedro Chic
- Gabriela Villagran
- Cristian Ramírez
- Celeste Gómez

## Tecnologías

- Android nativo con Java 11.
- Gradle Wrapper 9.4.1 y Android Gradle Plugin 9.2.1.
- Android SDK: `compileSdk` 36 (minor API level 1), `targetSdk` 36 y `minSdk` 29.
- Retrofit 2.11.0 y Gson para consumir la API REST.
- OkHttp 4.12.0 para transporte HTTP e interceptores.
- Cloud Firestore para consultar los metadatos de actualización de la aplicación.
- AndroidX, Material Components, RecyclerView y ConstraintLayout para la interfaz.
- JUnit y Espresso para pruebas.

El identificador del paquete es `gt.com.ro.devumgapp`. La versión declarada en `app/build.gradle` es `1.3.0` (`versionCode` 4).

## Arquitectura y carpetas

El proyecto contiene un único módulo Android, `app/`.

- `app/src/main/java/gt/com/ro/devumgapp/`: Splash, login y menú principal.
- `activities/`: pantallas de listado, detalle y formularios de los módulos académicos.
- `network/`: contratos Retrofit (`ApiService`, `AuthService`) y creación del cliente (`RetrofitClient`).
- `network/model/`: modelos de solicitudes y respuestas de la API.
- `adapters/`: adaptadores de listas, por ejemplo los RecyclerView.
- `utils/`: sesión JWT, interceptor HTTP, manejo de errores, conversión JSON y actualización de la app.
- `app/src/main/res/layout/`: layouts XML de las pantallas y diálogos.
- `app/src/main/res/drawable/`, `values/` y `mipmap-*/`: recursos visuales, temas, textos e iconos.
- `app/src/test/`: pruebas unitarias locales.
- `app/src/androidTest/`: pruebas instrumentadas para dispositivo o emulador.

La interfaz se implementa principalmente con Activities y layouts XML. Las Activities consumen servicios de red de forma asíncrona con callbacks de Retrofit; los mappers convierten respuestas JSON a modelos de la aplicación.

## Flujos principales

### Inicio de sesión y sesión

1. `SplashActivity` consulta si hay una actualización y, al terminar, decide si abre el menú o el login según exista un JWT guardado.
2. `LoginActivity` envía usuario y contraseña a `POST /api/auth/login`.
3. La respuesta incluye un token JWT y puede incluir rol y usuario. Si estos datos no llegan, la app intenta extraerlos del JWT.
4. `TokenManager` guarda token, rol y usuario en `SharedPreferences` privadas de la app.
5. `AuthInterceptor` agrega `Authorization: Bearer <token>` a las solicitudes protegidas; excluye la ruta de login.
6. El cierre de sesión elimina los datos de sesión.

Un error HTTP 401 en una pantalla protegida se procesa con `ApiErrorHandler.handleUnauthorized(...)`.

### Acceso por rol

`MainActivity` filtra las opciones visibles de acuerdo con el rol obtenido de la sesión/JWT:

- **ADMIN**: estudiantes, docentes, carreras, cursos e inscripciones.
- **DOCENTE**: gestión de notas y consulta de cursos asignados.
- **ESTUDIANTE/ALUMNO**: consulta de notas y cursos.
- **Rol ausente o desconocido**: muestra el aviso de permisos y permite cerrar sesión.

La visibilidad del menú es una regla de presentación. La autorización real también debe aplicarse en el backend.

### Módulos académicos y API

`ApiService` agrupa endpoints REST para carreras, estudiantes, cursos, inscripciones, docentes y notas. Contiene operaciones CRUD para los recursos principales y algunas consultas específicas, como cursos por carrera, inscripciones paginadas y perfiles/datos asociados al usuario autenticado. Las respuestas se manejan como `JsonElement` y se convierten con clases `*JsonMapper`.

El cliente está configurado con esta URL base:

`https://sgau-backend-api-467280352705.us-central1.run.app/api/`

Si cambia el ambiente del backend, hay que actualizar la URL base y verificar que las rutas, los modelos Gson y las reglas de autenticación coincidan con el contrato del servidor.

Patrón típico para una pantalla de listado:

1. Asociar vistas y configurar el RecyclerView en `onCreate`.
2. Solicitar datos en `onResume` para refrescar al regresar de un formulario.
3. Mostrar el indicador de carga mientras la llamada está activa.
4. Manejar respuestas no exitosas, 401 y errores de red.
5. Convertir JSON con el mapper del dominio y enviar la lista al adapter.
6. Abrir la pantalla de detalle usando el ID del modelo como extra del Intent.

### Actualizaciones de la aplicación

`AppUpdateChecker` consulta Firestore en la colección `versiones`, documento `actual`. El documento puede incluir `versionCode`, `minVersionCode`, `versionName` y `apkUrl`.

- Si la versión local es menor que `minVersionCode`, la actualización es obligatoria.
- Si hay una versión remota superior, la actualización es recomendada.
- `SplashActivity` ofrece descargar el APK y delega instalación y permisos al helper correspondiente.

La disponibilidad de esta función depende de Firestore, de que el documento esté publicado con esos campos y de que el APK sea accesible en la URL indicada.

## Preparar y ejecutar

Requisitos: Android Studio o Android SDK compatible con API 36, JDK 21 para Gradle (configurado mediante `gradle/gradle-daemon-jvm.properties`) y conexión a internet para resolver dependencias y acceder a servicios remotos. El código fuente y destino de Java del módulo están configurados en Java 11.

En Windows PowerShell, desde la raíz:

```powershell
.\gradlew.bat :app:assembleDebug
.\gradlew.bat :app:testDebugUnitTest
```

Para ejecutar pruebas instrumentadas, conectar un dispositivo o iniciar un emulador y ejecutar:

```powershell
.\gradlew.bat :app:connectedDebugAndroidTest
```

El APK de depuración se genera en `app/build/outputs/apk/debug/`.

El módulo aplica el plugin de Google Services y contiene `app/google-services.json`. Para usar Firebase en otro ambiente, debe existir un archivo de configuración que corresponda al application ID. No se deben compartir claves privadas, credenciales de cuentas ni secretos de despliegue; revisar también las reglas de acceso de Firestore y del backend.

## Pruebas

Hay pruebas unitarias para mappers, comprobaciones de actualización y contrato de endpoints, además de una prueba de ejemplo. Antes de cambiar un endpoint, conviene ajustar o agregar una prueba del contrato en `app/src/test/`. Las pruebas instrumentadas viven en `app/src/androidTest/`.

La cobertura existente es parcial: que compile o pasen las pruebas unitarias no valida por sí solo la comunicación con el backend real, los permisos por rol ni la instalación de APK en cada versión de Android.

## Convenciones para cambios

- Mantener las pantallas Android en `activities/` y sus layouts en `res/layout/`.
- Mantener las declaraciones de rutas REST en `ApiService`; centralizar la creación de Retrofit/OkHttp en `RetrofitClient`.
- Crear o actualizar un modelo `*Request` y un `*JsonMapper` cuando el contrato del backend lo requiera.
- Usar `TokenManager` y el interceptor existente para la sesión; no agregar tokens manualmente en cada llamada.
- Manejar llamadas Retrofit de forma asíncrona y contemplar carga, respuesta vacía/no exitosa, 401 y fallo de red.
- Al agregar una Activity, declararla en `AndroidManifest.xml` y registrar la navegación correspondiente.
- Añadir pruebas focalizadas para cambios de contrato, mappers o lógica de versiones.
- No asumir que ocultar un botón protege un endpoint: validar permisos en el servidor.

## Dependencias externas y puntos a confirmar

- El backend REST es externo a este repositorio; su disponibilidad y contrato no se pueden verificar solo con el código Android.
- Firebase Firestore se utiliza para la comprobación de versiones. Aunque la dependencia Firebase está configurada, confirmar el uso de otros servicios de Firebase antes de atribuirles funcionalidad.
- `RetrofitClient` tiene un `HttpLoggingInterceptor` configurado en nivel `BODY`. Revisar su nivel antes de distribuir builds para evitar registrar cuerpos de solicitudes o respuestas que contengan datos sensibles.
- La instalación de APK requiere que el archivo remoto sea confiable y que el flujo de permisos para instalar aplicaciones externas sea adecuado para la distribución prevista.
- La configuración de build desactiva la optimización en `release`; revisar minificación y reglas de `keepRules` antes de preparar una publicación de producción.
