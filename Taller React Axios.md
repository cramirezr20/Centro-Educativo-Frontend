

| LABORATORIO  ·  DESARROLLO WEB Taller práctico Consumo de API REST desde React con Axios 🛒  Proyecto: Sistema de Gestión de Productos |
| :---- |

| ⚛️ React \+ Vite | 📡 Axios | ☕ Spring Boot | 🐘 PostgreSQL |
| :---: | :---: | :---: | :---: |

| Ficha del taller |  |
| :---- | :---- |
| 📚  **Curso** | Desarrollo Web |
| ⏱️  **Duración sugerida** | 2 horas |
| 🧑‍💻  **Modalidad** | Laboratorio práctico guiado |
| 📈  **Nivel** | Básico – intermedio (conocimientos previos de JavaScript y React elemental) |
| 🧱  **Producto final** | Aplicación CRUD de productos conectada a un backend REST |

| Datos del estudiante |  |
| :---- | :---- |
| **Nombre / grupo** |   |
| **Carné** |   |
| **Docente** |   |
| **Fecha** |   |

# **🧭  Cómo usar esta guía**

Este documento combina **explicación conceptual**, **código para construir paso a paso** y **actividades de verificación**. A lo largo del taller encontrará recuadros de color; cada uno cumple una función específica:

| 🎯  OBJETIVO Qué se logra en la sección. | 📘  CONCEPTO Teoría breve y necesaria. | 🧪  PRÁCTICA Pasos que se ejecutan en el equipo. |
| :---- | :---- | :---- |
| **✅  VERIFICACIÓN** Cómo comprobar que todo funciona. | **🔑  PUNTO CLAVE** Idea que no debe olvidarse. | **💡  TIP DEL CATEDRÁTICO** Recomendación de buenas prácticas. |
| **⚠️  ATENCIÓN** Riesgo o paso que no debe omitirse. | **🐞  ERROR COMÚN** Falla frecuente y su solución. | **🏆  RETO** Actividad autónoma evaluable. |

| 🔑  PUNTO CLAVE  ·  Metodología del taller Cada práctica sigue el mismo ciclo: entender → escribir → ejecutar → verificar → analizar. No se avanza a la siguiente sección sin verificar que la anterior funciona. Se recomienda escribir el código en lugar de copiarlo y pegarlo: los errores de tipeo son parte del aprendizaje y entrenan la lectura de mensajes de error. |
| :---- |

# **🏗️  1\. Presentación y arquitectura**

En este laboratorio construiremos una aplicación denominada **Sistema de Gestión de Productos**. La aplicación React actuará como **cliente** de un backend REST desarrollado previamente con **Spring Boot**, que persiste la información en **PostgreSQL**.

| ⚛️  React \+ Vite Componentes / Vistas  →  Servicios Axios |
| :---: |
| ▼   *HTTP / JSON* |
| **☕  Spring Boot** API REST  (http\://localhost:8080/api) |
| ▼   *JPA / SQL* |
| **🐘  PostgreSQL** Base de datos relacional |

| 🔑  PUNTO CLAVE  ·  React no sustituye al backend React es únicamente la capa de presentación. Toda la lógica de negocio y el acceso a datos permanecen en Spring Boot. El frontend solo solicita y muestra información. |
| :---- |

## **¿Qué construiremos?**

* 📋 Un **listado** de productos obtenido desde el backend (GET).

* ➕ Un **formulario** para registrar productos nuevos (POST).

* ✏️ La opción de **editar** productos existentes (PUT).

* 🗑️ La opción de **eliminar** productos (DELETE).

* 🔄 Retroalimentación al usuario: estados de **carga**, **errores** y **mensajes de éxito**.

# **🎯  2\. Objetivos y ruta del taller**

| 🎯  OBJETIVO  ·  Al finalizar el laboratorio, el estudiante será capaz de: Crear un proyecto React utilizando Vite. Instalar y configurar Axios. Crear un servicio para consumir una API REST. Realizar peticiones HTTP mediante GET, POST, PUT y DELETE. Mostrar información proveniente del backend. Crear formularios controlados en React. Manejar estados de carga. Manejar errores provenientes del backend. Actualizar automáticamente la interfaz después de una operación. Aplicar una estructura básica de separación entre componentes y servicios. |
| :---- |

## **⏱️ Distribución sugerida del tiempo**

| Bloque | Contenido | Tiempo |
| :---: | :---- | :---: |
| **1** | Entorno, verificación del backend y creación del proyecto (secciones 3–6) | 15 min |
| **2** | Axios, estructura y primer servicio con GET (secciones 7–9) | 20 min |
| **3** | Listado, estado de carga y manejo de errores (secciones 10–11) | 20 min |
| **4** | Formulario controlado y POST (secciones 12–13) | 20 min |
| **5** | DELETE, PUT y refactor con variables de entorno (secciones 14–16) | 15 min |
| **6** | Problema de CORS (sección 17\) y retos guiados (sección 18\) | 30 min |

| 💡  TIP DEL CATEDRÁTICO  ·  Gestión del tiempo Si el grupo avanza con lentitud, los retos 3 al 6 pueden dejarse como actividad extraclase. El reto final (sección 21\) está diseñado como entregable posterior al laboratorio. |
| :---- |

# **🧠  3\. Conocimientos previos**

Antes de comenzar, el estudiante debe dominar los siguientes fundamentos. Si alguno no resulta familiar, se recomienda revisarlo antes de continuar.

## **JavaScript**

| 📄  Repaso: variables, objetos y funciones flecha |
| :---- |
| const nombre \= "Juan";   const producto \= {     id: 1,     nombre: "Laptop",     precio: 5000 };   const sumar \= (a, b) \=\> {     return a \+ b; }; |

También es necesario conocer los métodos de arreglos map(), filter() y find(), y la sintaxis de async / await (se repasará durante la práctica).

## **React**

* useState(): declarar y modificar el estado de un componente.

* useEffect(): ejecutar código cuando el componente se monta o cambian ciertos valores.

* Componentes funcionales, **props** y renderizado de listas con key.

## **✅ Autodiagnóstico rápido**

☐  Puedo explicar qué ocurre cuando llamo a setProductos(...).

☐  Sé recorrer un arreglo de objetos y mostrar cada elemento con map().

☐  Entiendo qué significa que una función sea async.

☐  Sé qué es un endpoint y qué es un código de estado HTTP (200, 404, 500).

# **🧰  4\. Herramientas y entorno**

| Herramienta | Propósito | Verificación |
| :---- | :---- | :---- |
| **Node.js** (LTS vigente) | Entorno de ejecución de JavaScript y gestor npm | node \--version |
| **Visual Studio Code** | Editor de código | Abrir la carpeta del proyecto |
| **Chrome / Edge** | Navegador con herramientas de desarrollo (F12) | Abrir pestaña \*Network\* |
| **Postman / Insomnia** | Probar el backend antes de consumirlo | Realizar un GET de prueba |
| **Spring Boot** (backend) | API REST en localhost:8080 | Responde en /api/productos |
| **PostgreSQL** | Base de datos del backend | Servicio iniciado |

| 📄  Terminal — verificar instalaciones |
| :---- |
| node \--version npm \--version |

| ⚠️  ATENCIÓN  ·  Versión de Node.js Vite exige una versión mínima de Node.js que cambia entre versiones. Si npm create vite o npm run dev fallan al iniciar, lo primero que debe revisarse es que Node.js sea una versión LTS reciente. |
| :---- |

# **🔌  5\. Preparar y verificar el backend**

Para este taller se asume que Spring Boot expone el siguiente recurso:

| http\://localhost:8080/api/productos |
| :---- |

El backend devuelve información con el siguiente formato JSON:

| 📄  Respuesta de GET /api/productos |
| :---- |
| \[     {         "id": 1,         "nombre": "Laptop Lenovo",         "precio": 5500,         "stock": 10     },     {         "id": 2,         "nombre": "Mouse Logitech",         "precio": 250,         "stock": 25     } \] |

## **Contrato de la API**

| Operación | Método | URL | Cuerpo | Respuesta esperada |
| :---- | :---- | :---- | :---- | :---- |
| Listar | GET | /api/productos | — | 200 \+ arreglo de productos |
| Crear | POST | /api/productos | JSON sin id | 201 (o 200) \+ producto creado |
| Actualizar | PUT | /api/productos/{id} | JSON del producto | 200 \+ producto actualizado |
| Eliminar | DELETE | /api/productos/{id} | — | 204 (o 200) sin contenido |

| 🧪  PRÁCTICA  ·  Probar el backend ANTES de escribir React Con el backend iniciado, realizar GET http\://localhost:8080/api/productos desde Postman, Insomnia o el navegador. También puede utilizarse la terminal: |
| :---- |

| 📄  Terminal |
| :---- |
| curl http\://localhost:8080/api/productos |

| ✅  VERIFICACIÓN Debe obtenerse un arreglo JSON (aunque esté vacío: \[\]) con código 200. Si esto falla, el problema está en el backend, no en React. No continuar hasta resolverlo. |
| :---- |

| 💡  TIP DEL CATEDRÁTICO  ·  Regla de oro del depurador Cuando algo falla, primero se pregunta: ¿el backend responde correctamente sin React? Si Postman funciona y la aplicación no, el problema está en el frontend (o en CORS). Esta simple pregunta ahorra horas de búsqueda. |
| :---- |

# **🚀  6\. Práctica 1 · Crear el proyecto React con Vite**

| 🎯  OBJETIVO Generar el esqueleto de la aplicación y comprobar que el servidor de desarrollo funciona. |
| :---- |

| 🧪  PRÁCTICA  ·  Pasos Abrir una terminal en la carpeta donde se guardarán los proyectos y ejecutar: |
| :---- |

| 📄  Terminal |
| :---- |
| npm create vite@latest frontend-productos |

1. Seleccionar el framework: **React**.

2. Seleccionar la variante: **JavaScript**.

| 📄  Terminal |
| :---- |
| cd frontend-productos npm install npm run dev |

El navegador (o la terminal) mostrará una dirección similar a:

| http\://localhost:5173 |
| :---- |

| ✅  VERIFICACIÓN Al abrir http\://localhost:5173 debe verse la página de bienvenida de Vite \+ React con el contador funcionando. |
| :---- |

| 💡  TIP DEL CATEDRÁTICO  ·  Limpieza inicial Eliminar el contenido de ejemplo de App.jsx y App.css, y vaciar index.css. Partir de un proyecto limpio facilita identificar qué código pertenece a nuestra aplicación. |
| :---- |

# **📡  7\. Práctica 2 · Instalar y conocer Axios**

Axios será la herramienta que utilizaremos para comunicarnos con nuestro backend. En una **segunda terminal** (con npm run dev aún en ejecución en la primera) o deteniendo el servidor con Ctrl \+ C, ejecutar:

| 📄  Terminal |
| :---- |
| npm install axios |

| 📘  CONCEPTO  ·  ¿Qué es Axios? Axios es una biblioteca de JavaScript que facilita realizar peticiones HTTP desde el navegador. Por ejemplo: |
| :---- |

| axios.get("/productos");   // equivale a la petición HTTP:  GET /productos |
| :---- |

## **Los métodos de Axios y su relación con CRUD**

| Operación | HTTP | Axios | Spring Boot (referencia) |
| :---- | :---- | :---- | :---- |
| **C**reate | POST | axios.post(url, datos) | @PostMapping |
| **R**ead | GET | axios.get(url) | @GetMapping |
| **U**pdate | PUT | axios.put(url, datos) | @PutMapping("/{id}") |
| **D**elete | DELETE | axios.delete(url) | @DeleteMapping("/{id}") |

## **¿Por qué Axios y no fetch?**

El navegador incluye fetch, pero Axios simplifica varias tareas habituales:

| Aspecto | \`fetch\` nativo | Axios |
| :---- | :---- | :---- |
| Conversión a JSON | Manual: await res.json() | Automática: response.data |
| Enviar objetos JSON | Requiere JSON.stringify y cabeceras | Se pasa el objeto directamente |
| Errores HTTP (404, 500\) | No lanza error; hay que revisar res.ok | Lanza excepción: se captura con catch |
| URL base y configuración | Se repite en cada llamada | Instancia reutilizable con axios.create() |
| Interceptores | No incluidos | Incluidos (token, logs, errores globales) |

| 🔑  PUNTO CLAVE  ·  Axios lanza excepciones ante errores HTTP Si el backend responde con un código fuera del rango 2xx, Axios lanza un error que se captura con try / catch. Esa es la base del manejo de errores que implementaremos más adelante. |
| :---- |

# **🗂️  8\. Estructura del proyecto**

Dentro de src/ organizaremos el proyecto para **separar responsabilidades**:

| 📄  Estructura de carpetas |
| :---- |
| src/ │ ├── components/ │   ├── ProductoForm.jsx     → formulario (crear / editar) │   └── ProductoList.jsx     → tabla de productos │ ├── services/ │   └── productoService.js   → comunicación con el backend (Axios) │ ├── utils/ │   └── obtenerMensajeError.js  → traduce errores técnicos a mensajes │ ├── App.jsx                  → coordinación (estado principal) ├── main.jsx └── index.css |

| Capa | Responsabilidad | Qué NO debe hacer |
| :---- | :---- | :---- |
| components/ | Interfaz: mostrar datos y capturar eventos del usuario | Construir URLs ni llamar a axios directamente |
| services/ | Comunicación con el backend (una función por operación) | Manipular el DOM ni conocer el estado de React |
| utils/ | Funciones auxiliares reutilizables | Depender de componentes |
| App.jsx | Coordinar: guarda el estado y conecta componentes con servicios | Contener todo el código de la aplicación |

| 🔑  PUNTO CLAVE  ·  ¿Por qué separar? Si mañana la URL del backend cambia, se modifica un solo archivo. Si se rediseña la interfaz, el servicio no se toca. Este principio se llama separación de responsabilidades y es la base de una aplicación mantenible. |
| :---- |

# **🔧  9\. Práctica 3 · Crear el servicio y la petición GET**

| 🎯  OBJETIVO Crear la primera función de servicio y entender qué ocurre en una petición HTTP. |
| :---- |

Crear el archivo src/services/productoService.js con el siguiente contenido:

| 📄  src/services/productoService.js |
| :---- |
| import axios from "axios";   // URL base de nuestro backend const API\_URL \= "http\://localhost:8080/api/productos";   /\*  \* Obtiene todos los productos registrados.  \*/ export const obtenerProductos \= async () \=\> {       const response \= await axios.get(API\_URL);       return response.data; }; |

## **¿Qué ocurre cuando se ejecuta axios.get(API\_URL)?**

| axios.get(API\_URL) React / navegador |
| :---: |
| ▼ |
| **GET  http\://localhost:8080/api/productos** Petición HTTP |
| ▼ |
| **Spring Boot** Controlador → Servicio → Repositorio |
| ▼ |
| **Base de datos** SELECT \* FROM productos |
| ▼ |
| **Respuesta JSON** Axios la coloca en  response.data |

| 📘  CONCEPTO  ·  Anatomía de la respuesta de Axios El objeto response contiene varias propiedades. Las más usadas: response.data → el cuerpo devuelto por el backend (el JSON ya convertido en objeto JavaScript). response.status → código HTTP (200, 201, 404…). response.headers → cabeceras de la respuesta. |
| :---- |

| 💡  TIP DEL CATEDRÁTICO  ·  Pruebe en la consola Agregue temporalmente console.log(response) dentro del servicio y revise en la consola del navegador (F12) todas las propiedades que Axios devuelve. Verlo con sus propios ojos fija el concepto mejor que cualquier explicación. |
| :---- |

# **📋  10\. Práctica 4 · Consumir el servicio y listar productos**

Abrir App.jsx y comenzar con el siguiente código:

| 📄  src/App.jsx |
| :---- |
| import { useEffect, useState } from "react"; import { obtenerProductos } from "./services/productoService";   function App() {       const \[productos, setProductos\] \= useState(\[\]);       useEffect(() \=\> {           cargarProductos();       }, \[\]);       const cargarProductos \= async () \=\> {           try {               const data \= await obtenerProductos();               setProductos(data);           } catch (err) {               console.error("Error al obtener productos:", err);           }     };       return (         \<div\>               \<h1\>Lista de Productos\</h1\>               {productos.map((producto) \=\> (                   \<div key={producto.id}\>                       \<h3\>{producto.nombre}\</h3\>                       \<p\>Precio: Q{producto.precio}\</p\>                       \<p\>Stock: {producto.stock}\</p\>                   \</div\>               ))}           \</div\>     ); }   export default App; |

| ✅  VERIFICACIÓN Con el backend iniciado, la pantalla debe mostrar los productos de la base de datos. Abrir F12 → pestaña Network y localizar la petición productos: revisar su método, su código de estado y su respuesta. |
| :---- |

## **Analicemos el código**

### **1\. El estado**

| const \[productos, setProductos\] \= useState(\[\]); |
| :---- |

Crea una variable de estado. Inicialmente productos \= \[\]. Cuando el backend responde, se ejecuta setProductos(data) y React **vuelve a renderizar** el componente con la nueva información.

### **2\. ¿Por qué utilizamos useEffect?**

| useEffect(() \=\> {       cargarProductos();   }, \[\]); |
| :---- |

El arreglo vacío \[\] indica que el efecto se ejecuta **una sola vez**, cuando el componente se monta.

| React inicia  →  App se monta |
| :---: |
| ▼ |
| **useEffect()  →  cargarProductos()** |
| ▼ |
| **Axios GET  →  Spring Boot** |
| ▼ |
| **Respuesta JSON** |
| ▼ |
| **setProductos(data)** |
| ▼ |
| **React actualiza la pantalla** |

| 🔑  PUNTO CLAVE  ·  El ciclo de React Estado cambia → React vuelve a renderizar → la interfaz refleja el nuevo estado. Nunca se modifica el DOM manualmente: se modifica el estado. |
| :---- |

| 🐞  ERROR COMÚN  ·  Dos errores clásicos con useEffect Olvidar el arreglo \[\]: el efecto se ejecuta en cada renderizado y, como setProductos provoca otro renderizado, se genera un bucle infinito de peticiones (se aprecia en la pestaña Network). Ver la petición duplicada en desarrollo: en modo desarrollo, React.StrictMode (activo en main.jsx) ejecuta los efectos dos veces a propósito para detectar errores. En producción ocurre una sola vez. No es un fallo. |
| :---- |

| 💡  TIP DEL CATEDRÁTICO  ·  La propiedad key Al renderizar listas con map(), cada elemento necesita una key única y estable (aquí producto.id). Permite a React identificar qué elemento cambió. Evitar usar el índice del arreglo como key cuando la lista puede modificarse. |
| :---- |

# **⏳  11\. Práctica 5 · Estados de carga y manejo de errores**

| 📘  CONCEPTO  ·  Una aplicación real tiene varios estados Una interfaz profesional siempre informa al usuario qué está ocurriendo: ¿está cargando?, ¿falló?, ¿no hay datos? Cada situación es un estado que debe representarse. |
| :---- |

## **Paso 1 · Estado de carga**

Agregar un nuevo estado y modificar cargarProductos:

| 📄  src/App.jsx |
| :---- |
| const \[cargando, setCargando\] \= useState(true);   const cargarProductos \= async () \=\> {       try {           setCargando(true);           const data \= await obtenerProductos();           setProductos(data);       } catch (err) {           console.error("Error al obtener productos:", err);       } finally {           setCargando(false);       } }; |

Y en la interfaz, renderizado condicional:

| 📄  src/App.jsx — dentro del return |
| :---- |
| {cargando ? (       \<p\>⏳ Cargando productos...\</p\>   ) : (       \<div\>           {productos.map((producto) \=\> (               \<div key={producto.id}\>                   \<h3\>{producto.nombre}\</h3\>                   \<p\>Q{producto.precio}\</p\>               \</div\>           ))}       \</div\>   )} |

| 🔑  PUNTO CLAVE  ·  El bloque finally finally se ejecuta siempre, haya funcionado la petición o no. Es el lugar correcto para apagar el indicador de carga; de lo contrario, si ocurre un error, la pantalla quedaría cargando para siempre. |
| :---- |

## **Paso 2 · Estado de error**

| 📄  src/App.jsx |
| :---- |
| const \[error, setError\] \= useState("");   const cargarProductos \= async () \=\> {       try {           setCargando(true);         setError("");           const data \= await obtenerProductos();           setProductos(data);       } catch (err) {           console.error(err);           setError("No fue posible obtener los productos.");       } finally {           setCargando(false);       } }; |

Mostrar el mensaje en la interfaz:

| 📄  src/App.jsx — dentro del return |
| :---- |
| {error && (       \<div style={{ color: "crimson" }}\>         ⚠️ {error}     \</div\>   )} |

| ⚠️  ATENCIÓN  ·  Nunca asumir que el backend estará disponible En la vida real puede ocurrir: backend apagado, internet desconectado, error 500, error 404, bloqueo por CORS o servidor saturado. Una aplicación profesional debe contemplarlo siempre. |
| :---- |

## **Paso 3 · Mensajes más útiles (mejora)**

Un mensaje genérico no ayuda al usuario ni al desarrollador. Axios distingue **tres situaciones** en el objeto de error. Crear src/utils/obtenerMensajeError.js:

| 📄  src/utils/obtenerMensajeError.js |
| :---- |
| export const obtenerMensajeError \= (error) \=\> {       // 1\) El servidor respondió con un código fuera del rango 2xx     if (error.response) {           const { status, data } \= error.response;           if (data?.message) return data.message;         if (status \=== 404\) return "El recurso solicitado no existe (404).";         if (status \>= 500\) return \`Error interno del servidor (\${status}).\`;           return \`La petición fue rechazada (\${status}).\`;     }       // 2\) La petición se envió pero no hubo respuesta     if (error.request) {         return "No se pudo conectar con el servidor. " \+                "Verifique que el backend esté en ejecución.";     }       // 3\) Error al preparar la petición     return "Ocurrió un error inesperado."; }; |

Utilizarlo en el catch: setError(obtenerMensajeError(err));

| Situación | ¿Qué trae \`error\`? | Causa típica |
| :---- | :---- | :---- |
| El servidor respondió con error | error.response (con status y data) | 404, 400, 500… |
| No hubo respuesta | error.request (sin response) | Backend apagado, red caída, **CORS** |
| Falló antes de enviar | error.message | Error de configuración o de código |

| ✅  VERIFICACIÓN  ·  Provoque el error a propósito Detener el backend y recargar la página: debe mostrarse el mensaje de error. Luego escribir mal la URL (/api/producto) y comprobar que ahora aparece el mensaje de recurso inexistente. Probar los caminos de falla es parte del desarrollo. |
| :---- |

# **📝  12\. Práctica 6 · Crear el formulario controlado**

Ahora permitiremos registrar productos. Crear src/components/ProductoForm.jsx:

| 📄  src/components/ProductoForm.jsx |
| :---- |
| import { useState } from "react";   function ProductoForm({ onProductoCreado }) {       const \[nombre, setNombre\] \= useState("");     const \[precio, setPrecio\] \= useState("");     const \[stock, setStock\] \= useState("");       const guardarProducto \= async (event) \=\> {           event.preventDefault();           const producto \= {             nombre: nombre,             precio: Number(precio),             stock: Number(stock)         };           console.log(producto);           // Posteriormente enviaremos         // este objeto al backend.     };       return (           \<form onSubmit={guardarProducto}\>               \<div\>                 \<label\>Nombre\</label\>                 \<input                     type="text"                     value={nombre}                     onChange={(e) \=\> setNombre(e.target.value)}                 /\>             \</div\>               \<div\>                 \<label\>Precio\</label\>                 \<input                     type="number"                     value={precio}                     onChange={(e) \=\> setPrecio(e.target.value)}                 /\>             \</div\>               \<div\>                 \<label\>Stock\</label\>                 \<input                     type="number"                     value={stock}                     onChange={(e) \=\> setStock(e.target.value)}                 /\>             \</div\>               \<button type="submit"\>Guardar\</button\>           \</form\>     ); }   export default ProductoForm; |

## **¿Qué es un formulario controlado?**

En un **componente controlado**, React es quien controla el valor del campo. El valor mostrado siempre proviene del estado:

| Usuario escribe |
| :---: |
| ▼ |
| **onChange  →  setNombre(e.target.value)** |
| ▼ |
| **Estado de React se actualiza** |
| ▼ |
| **value={nombre}  →  el campo muestra el estado** |

| 🔑  PUNTO CLAVE  ·  Dos piezas inseparables value={nombre} \+ onChange={(e) \=\> setNombre(e.target.value)}. Si se coloca value sin onChange, el campo queda bloqueado y no permite escribir. |
| :---- |

| 🐞  ERROR COMÚN  ·  Number() y los inputs El valor de un \<input\> siempre es texto, incluso con type="number". Por eso convertimos con Number(precio). Si se envía "5500" (texto) en lugar de 5500 (número), el backend puede rechazar la petición con un 400. Además, event.preventDefault() evita que el navegador recargue la página al enviar el formulario. |
| :---- |

# **➕  13\. Práctica 7 · Crear productos con POST**

## **Paso 1 · Agregar la función al servicio**

| 📄  src/services/productoService.js |
| :---- |
| export const crearProducto \= async (producto) \=\> {       const response \= await axios.post(         API\_URL,         producto     );       return response.data; }; |

Ahora el servicio ya expone: **GET →** obtenerProductos() y **POST →** crearProducto().

## **Paso 2 · Conectar el formulario con el servicio**

En ProductoForm.jsx, importar la función:

| import { crearProducto } from "../services/productoService"; |
| :---- |

Y reemplazar guardarProducto:

| 📄  src/components/ProductoForm.jsx |
| :---- |
| const guardarProducto \= async (event) \=\> {       event.preventDefault();       try {           const producto \= {             nombre: nombre,             precio: Number(precio),             stock: Number(stock)         };           const nuevoProducto \= await crearProducto(producto);           console.log("Producto creado:", nuevoProducto);           onProductoCreado();           setNombre("");         setPrecio("");         setStock("");       } catch (err) {           console.error("Error al crear producto:", err);       } }; |

## **Paso 3 · Conectar el componente con App**

En App.jsx, importar y utilizar el formulario, pasándole cargarProductos como **prop**:

| 📄  src/App.jsx |
| :---- |
| import ProductoForm from "./components/ProductoForm";   // ... dentro del return: \<ProductoForm onProductoCreado={cargarProductos} /\> |

## **Flujo completo de la operación**

| Formulario  →  crearProducto() |
| :---: |
| ▼ |
| **Axios POST  →  Spring Boot** |
| ▼ |
| **Base de datos (INSERT)** |
| ▼ |
| **Respuesta del backend** |
| ▼ |
| **onProductoCreado()  \=  cargarProductos()** |
| ▼ |
| **GET  →  React actualiza la lista** |

| 📘  CONCEPTO  ·  Comunicación hijo → padre mediante props El formulario (hijo) no conoce la lista de productos. Simplemente avisa al padre ejecutando la función onProductoCreado. El padre (App) decide qué hacer: recargar la lista. Así los componentes permanecen desacoplados. |
| :---- |

| ✅  VERIFICACIÓN Registrar un producto: debe aparecer en la lista sin recargar la página. En \*Network\* deben verse dos peticiones consecutivas: un POST y luego un GET. |
| :---- |

| 💡  TIP DEL CATEDRÁTICO  ·  Evitar envíos duplicados Agregue un estado enviando y deshabilite el botón mientras la petición está en curso: \<button disabled={enviando}\>. Es un detalle que evita registros repetidos cuando el usuario hace doble clic. |
| :---- |

# **🗑️  14\. Práctica 8 · Eliminar productos con DELETE**

| 📄  src/services/productoService.js |
| :---- |
| export const eliminarProducto \= async (id) \=\> {       await axios.delete(\`\${API\_URL}/\${id}\`);   }; |

Para mantener ordenado el código, la tabla se extrae a su propio componente. Crear src/components/ProductoList.jsx:

| 📄  src/components/ProductoList.jsx |
| :---- |
| function ProductoList({ productos, onEliminar }) {       return (         \<table\>             \<thead\>                 \<tr\>                     \<th\>Nombre\</th\>                     \<th\>Precio\</th\>                     \<th\>Stock\</th\>                     \<th\>Acción\</th\>                 \</tr\>             \</thead\>             \<tbody\>                 {productos.map((producto) \=\> (                     \<tr key={producto.id}\>                         \<td\>{producto.nombre}\</td\>                         \<td\>Q{producto.precio}\</td\>                         \<td\>{producto.stock}\</td\>                         \<td\>                             \<button onClick={() \=\> onEliminar(producto.id)}\>                                 Eliminar                             \</button\>                         \</td\>                     \</tr\>                 ))}             \</tbody\>         \</table\>     ); }   export default ProductoList; |

En App.jsx, importar eliminarProducto y crear una función que elimine y luego refresque la lista:

| 📄  src/App.jsx |
| :---- |
| import { obtenerProductos, eliminarProducto } from "./services/productoService"; import ProductoList from "./components/ProductoList";   const eliminar \= async (id) \=\> {       if (\!window.confirm("¿Desea eliminar este producto?")) return;       try {           await eliminarProducto(id);           await cargarProductos();       } catch (err) {           setError(obtenerMensajeError(err));       } };   // ... en el return, reemplazando el map anterior: \<ProductoList productos={productos} onEliminar={eliminar} /\> |

| ⚠️  ATENCIÓN  ·  Operaciones destructivas Eliminar es irreversible. Siempre solicitar confirmación al usuario antes de ejecutar un DELETE. Si el backend devuelve 409 (por ejemplo, el producto tiene ventas asociadas), el mensaje de error debe explicarlo. |
| :---- |

| ✅  VERIFICACIÓN Eliminar un producto: debe desaparecer de la lista automáticamente. Confirmar en \*Network\* que la petición fue DELETE /api/productos/{id}. |
| :---- |

# **✏️  15\. Práctica 9 · Actualizar con PUT: el CRUD completo**

| 📄  src/services/productoService.js |
| :---- |
| export const actualizarProducto \= async (id, producto) \=\> {       const response \= await axios.put(         \`\${API\_URL}/\${id}\`,         producto     );       return response.data; }; |

Con esta función el servicio soporta **GET, POST, PUT y DELETE**: es decir, un **CRUD completo**. El servicio completo debe quedar así:

| 📄  src/services/productoService.js — versión completa |
| :---- |
| import axios from "axios";   const API\_URL \= "http\://localhost:8080/api/productos";   // GET export const obtenerProductos \= async () \=\> {       const response \= await axios.get(API\_URL);       return response.data; };   // POST export const crearProducto \= async (producto) \=\> {       const response \= await axios.post(API\_URL, producto);       return response.data; };   // PUT export const actualizarProducto \= async (id, producto) \=\> {       const response \= await axios.put(\`\${API\_URL}/\${id}\`, producto);       return response.data; };   // DELETE export const eliminarProducto \= async (id) \=\> {       await axios.delete(\`\${API\_URL}/\${id}\`); }; |

| 📘  CONCEPTO  ·  PUT vs PATCH PUT reemplaza el recurso completo (se envían todos los campos). PATCH modifica solo algunos campos. En este taller usamos PUT porque el formulario siempre envía nombre, precio y stock. |
| :---- |

| 🏆  RETO  ·  La interfaz de edición se construye en el Reto 2 La función de servicio ya existe; falta la parte de React: seleccionar un producto, cargar sus datos en el formulario y decidir entre crear o actualizar. Se plantea en la sección 18 y la solución de referencia se encuentra en el Anexo A. |
| :---- |

# **⚙️  16\. Refactor profesional: variables de entorno e instancia Axios**

Ahora introduciremos un concepto importante del desarrollo profesional: **no escribir la URL del servidor directamente en el código** ("http\://localhost:8080"). Utilizaremos variables de entorno.

## **Paso 1 · Crear el archivo .env**

En la **raíz** del proyecto (al mismo nivel que package.json), crear .env:

| 📄  .env |
| :---- |
| VITE\_API\_URL=http\://localhost:8080/api |

## **Paso 2 · Usar la variable en el servicio**

Además, centralizaremos la configuración con una **instancia de Axios**, de modo que la URL base, el tiempo máximo de espera y las cabeceras se definan una sola vez:

| 📄  src/services/productoService.js |
| :---- |
| import axios from "axios";   const api \= axios.create({     baseURL: import.meta.env.VITE\_API\_URL,     timeout: 10000,                        // 10 segundos     headers: { "Content-Type": "application/json" } });   const RECURSO \= "/productos";   export const obtenerProductos \= async () \=\> {     const response \= await api.get(RECURSO);     return response.data; };   export const crearProducto \= async (producto) \=\> {     const response \= await api.post(RECURSO, producto);     return response.data; };   export const actualizarProducto \= async (id, producto) \=\> {     const response \= await api.put(\`\${RECURSO}/\${id}\`, producto);     return response.data; };   export const eliminarProducto \= async (id) \=\> {     await api.delete(\`\${RECURSO}/\${id}\`); }; |

| Entorno | Valor de VITE\_API\_URL |
| :---- | :---- |
| Desarrollo | http\://localhost:8080/api |
| Producción | https\://api.miempresa.com/api |

Cambiar de entorno **no requiere modificar el código fuente**: solo el valor de la variable.

| ⚠️  ATENCIÓN  ·  Tres reglas de las variables en Vite Deben comenzar con el prefijo VITE\_; de lo contrario Vite no las expone al código. Tras crear o modificar .env hay que reiniciar npm run dev. Todo lo que empieza con VITE\_ queda visible en el navegador. Nunca guardar contraseñas, claves privadas ni secretos en estas variables. |
| :---- |

| 💡  TIP DEL CATEDRÁTICO  ·  Buenas prácticas con .env Incluir .env en .gitignore y compartir un archivo .env.example (sin valores sensibles) para que otros desarrolladores sepan qué variables configurar. |
| :---- |

# **🚧  17\. Axios y CORS: el primer problema real**

Es muy probable que aquí aparezca uno de los primeros problemas reales del laboratorio. Observemos los orígenes:

| Aplicación | Origen |
| :---- | :---- |
| React (Vite) | http\://localhost:5173 |
| Spring Boot | http\://localhost:8080 |

Son **orígenes diferentes** (distinto puerto), por lo que el navegador puede bloquear la petición. En la consola aparecerá un mensaje similar a:

| 📄  Consola del navegador (F12) |
| :---- |
| Access to XMLHttpRequest at 'http\://localhost:8080/api/productos' from origin 'http\://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. |

| 🔑  PUNTO CLAVE  ·  CORS no es un problema de Axios CORS (\*Cross-Origin Resource Sharing\*) es una política de seguridad aplicada por el navegador. Axios y React no tienen la culpa: el backend debe indicar explícitamente qué orígenes están autorizados para consumirlo. |
| :---- |

| Navegador Antes de un PUT / DELETE / POST con JSON envía una petición OPTIONS (preflight) |
| :---: |
| ▼ |
| **Spring Boot** Responde con las cabeceras Access-Control-Allow-\* |
| ▼ |
| **Navegador** Si el origen está permitido → envía la petición real |

## **Solución A · Anotación en el controlador**

| 📄  ProductoController.java |
| :---- |
| @CrossOrigin(origins \= "http\://localhost:5173") @RestController @RequestMapping("/api/productos") public class ProductoController {     // ... } |

## **Solución B · Configuración global (recomendada)**

| 📄  CorsConfig.java |
| :---- |
| @Configuration public class CorsConfig implements WebMvcConfigurer {       @Override     public void addCorsMappings(CorsRegistry registry) {         registry.addMapping("/api/\*\*")                 .allowedOrigins("http\://localhost:5173")                 .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")                 .allowedHeaders("\*");     } } |

## **Solución C · Proxy de Vite (solo desarrollo)**

El frontend redirige las peticiones /api hacia el backend, por lo que el navegador percibe un único origen:

| 📄  vite.config.js |
| :---- |
| import { defineConfig } from "vite"; import react from "@vitejs/plugin-react";   export default defineConfig({     plugins: \[react()\],     server: {         proxy: { "/api": "http\://localhost:8080" }     } }); |

En este caso, VITE\_API\_URL sería simplemente /api.

| ⚠️  ATENCIÓN  ·  Seguridad Evitar allowedOrigins("\*") en producción: permite que cualquier sitio consuma la API. Si el backend usa Spring Security, CORS debe habilitarse también en la cadena de seguridad; de lo contrario, las peticiones OPTIONS serán rechazadas. Tras modificar el backend, reiniciarlo antes de probar nuevamente. |
| :---- |

| 💡  TIP DEL CATEDRÁTICO  ·  Cómo reconocer un problema de CORS Axios reporta "Network Error" y error.response es undefined, pero en Postman la misma URL funciona perfectamente. Esa combinación casi siempre es CORS. |
| :---- |

# **🏆  18\. Retos guiados**

Hasta este punto, el docente puede detener la explicación y solicitar a los estudiantes que continúen de forma autónoma con los siguientes retos. Cada reto incluye sus **criterios de aceptación**.

## **Reto 1 · Aplicación base**

| 🏆  RETO  ·  Gestión de Productos La aplicación debe permitir: Listar productos. Crear productos. Eliminar productos. |
| :---- |

☐  La lista se carga al abrir la aplicación.

☐  Un producto nuevo aparece sin recargar la página.

☐  Un producto eliminado desaparece sin recargar la página.

## **Reto 2 · Actualizar productos**

| 🏆  RETO  ·  Editar Agregar la funcionalidad Editar. Al seleccionar \*Editar\*, el formulario deberá cargar Nombre, Precio y Stock del producto seleccionado. El estudiante deberá utilizar actualizarProducto(). |
| :---- |

| 💡  TIP DEL CATEDRÁTICO  ·  Pistas de diseño App guarda un estado productoEditando (null cuando se está creando). ProductoList recibe una prop onEditar y la invoca con el producto completo. ProductoForm usa un useEffect que, cuando cambia productoEditando, llena los campos. Al enviar: si hay productoEditando → actualizarProducto(id, datos); si no → crearProducto(datos). Agregar un botón Cancelar que limpie la edición. |
| :---- |

☐  Al pulsar \*Editar\* el formulario muestra los datos actuales.

☐  Al guardar, la fila se actualiza en la lista.

☐  Después de guardar o cancelar, el formulario vuelve al modo “crear”.

## **Reto 3 · Validaciones**

| 🏆  RETO El formulario deberá impedir enviar datos en los siguientes casos: Nombre vacío. Precio menor o igual a 0\. Stock menor que 0\. |
| :---- |

| 📄  Ejemplo de validación básica |
| :---- |
| if (nombre.trim() \=== "") {       alert("El nombre es obligatorio");       return; } |

| 💡  TIP DEL CATEDRÁTICO  ·  Nivel avanzado Reemplazar alert() por mensajes de error junto a cada campo: es mucho mejor experiencia de usuario y no bloquea la pantalla. Recuerde que las validaciones del frontend mejoran la experiencia, pero la validación que garantiza la integridad de los datos siempre es la del backend. |
| :---- |

## **Reto 4 · Mejorar la interfaz**

Diseñar una interfaz utilizando **CSS o Bootstrap** que respete la siguiente distribución:

| SISTEMA DE PRODUCTOS |
| ----- |
| \[ Buscar producto........................ \] **Nombre          Precio       Stock      Acción** Laptop          Q5500        10         \[Editar\] \[Eliminar\] Mouse           Q250         25         \[Editar\] \[Eliminar\] Teclado         Q350         15         \[Editar\] \[Eliminar\] |
| **REGISTRAR PRODUCTO** |
| Nombre: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Precio: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Stock:  \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **\[ GUARDAR \]** |

## **Reto 5 · Búsqueda**

| 🏆  RETO  ·  Buscar producto Agregar un campo de búsqueda que filtre la lista mientras el usuario escribe. Utilizar productos.filter(...). |
| :---- |

| 📄  Ejemplo |
| :---- |
| const productosFiltrados \= productos.filter((producto) \=\>     producto.nombre         .toLowerCase()         .includes(busqueda.toLowerCase()) ); |

| 🔑  PUNTO CLAVE  ·  Filtrar en el cliente El filtro no consulta el backend: opera sobre el estado productos que ya está en memoria. No se necesita un nuevo estado para la lista filtrada; se calcula en cada renderizado a partir de productos y busqueda. |
| :---- |

## **Reto 6 · Manejo profesional de estados**

La aplicación debe manejar, como mínimo, los siguientes mensajes:

| Estado | Mensaje esperado | Color sugerido |
| :---- | :---- | :---- |
| ⏳ Cargando | Cargando… | Gris / azul |
| ❌ Error de comunicación | Error al comunicarse con el servidor | Rojo |
| 📭 Lista vacía | No existen productos registrados | Gris |
| ✅ Creación exitosa | Producto creado correctamente | Verde |
| ✅ Eliminación exitosa | Producto eliminado correctamente | Verde |

| 🔑  PUNTO CLAVE Esto permite comprender que una aplicación real tiene diferentes estados y que cada uno debe comunicarse al usuario. |
| :---- |

# **🛠️  19\. Guía de depuración**

Antes de pedir ayuda, utilice esta tabla. Aprender a diagnosticar es una competencia tan importante como aprender a programar.

| Síntoma | Causa probable | Solución |
| :---- | :---- | :---- |
| Mensaje CORS en consola / “Network Error” | El backend no autoriza el origen del frontend | Configurar CORS en Spring Boot y reiniciarlo (sección 17\) |
| ERR\_CONNECTION\_REFUSED | Backend apagado o puerto distinto | Iniciar Spring Boot y verificar el puerto |
| Error **404** | URL mal construida (falta /api, mayúsculas, plural) | Comparar la URL de \*Network\* con la que funciona en Postman |
| Error **400** al crear o editar | El JSON no coincide con lo que espera el backend | Revisar nombres de campos y que precio y stock sean números |
| Error **415** | Tipo de contenido no soportado | Enviar un objeto (Axios añade application/json); no enviar texto |
| Error **500** | Falla interna del backend | Leer la excepción en la consola de Spring Boot |
| Cannot read properties of undefined (reading 'map') | productos no es un arreglo (p. ej. el backend devuelve un objeto paginado con content) | Inspeccionar response.data con console.log y usar response.data.content si aplica |
| Peticiones infinitas | useEffect sin arreglo de dependencias | Agregar \[\] como segundo argumento |
| La petición se ejecuta dos veces | React.StrictMode en desarrollo | Es normal; no ocurre en producción |
| Pantalla en blanco | Error de sintaxis o import / export default faltante | Revisar la consola del navegador (F12) |
| No se puede escribir en un input | value sin onChange | Agregar el manejador de cambio |
| import.meta.env.VITE\_API\_URL es undefined | Variable sin prefijo VITE\_ o servidor no reiniciado | Corregir el nombre y reiniciar npm run dev |
| Advertencia “each child should have a unique key” | Falta la prop key en el map() | Agregar key={producto.id} |

| 💡  TIP DEL CATEDRÁTICO  ·  Las tres herramientas del depurador web Consola (F12 → Console): errores de JavaScript y mensajes de CORS. Network (F12 → Network): método, URL, código de estado, cuerpo enviado y respuesta recibida de cada petición. console.log estratégico: mostrar response, producto o error.response para ver exactamente qué datos viajan. |
| :---- |

# **💬  20\. Ejercicio de análisis**

Al finalizar la práctica, cada estudiante responde **por escrito y con sus propias palabras** (se sugiere entregar junto al README):

| \# | Pregunta |
| :---: | :---- |
| **1** | ¿Qué diferencia existe entre axios.get() y axios.post()? |
| **2** | ¿Qué información contiene response.data? |
| **3** | ¿Por qué utilizamos async / await? |
| **4** | ¿Qué función cumple useEffect() y qué significa el arreglo \[\]? |
| **5** | ¿Por qué es recomendable crear la carpeta services/ en lugar de colocar todas las peticiones Axios dentro de App.jsx? |
| **6** | ¿Qué problema soluciona CORS y quién debe configurarlo: el frontend o el backend? |
| **7** | Explique por qué, después de crear un producto, se vuelve a consultar la lista en lugar de modificar el estado manualmente. ¿Qué ventajas y desventajas tiene este enfoque? |
| **8** | ¿Qué ocurriría si el bloque finally no existiera en cargarProductos? |

# **🎓  21\. Reto final · Administración de estudiantes**

| 🏆  RETO  ·  Desafío de cierre Desarrollar un pequeño sistema de administración de estudiantes utilizando React, Axios y el backend REST proporcionado por el docente. Se aplica todo lo aprendido, pero con un recurso distinto: el objetivo es comprobar que el estudiante transfiere el conocimiento y no solo repite el ejemplo. |
| :---- |

## **Endpoints a consumir**

| Operación | Método | Endpoint |
| :---- | :---- | :---- |
| Listado | GET | /api/estudiantes |
| Crear | POST | /api/estudiantes |
| Actualizar | PUT | /api/estudiantes/{id} |
| Eliminar | DELETE | /api/estudiantes/{id} |

## **Modelo de datos**

| Campo | Tipo | Regla de validación sugerida |
| :---- | :---- | :---- |
| id | Número | Generado por el backend (no se captura) |
| carnet | Texto | Obligatorio |
| nombre | Texto | Obligatorio |
| apellido | Texto | Obligatorio |
| correo | Texto | Obligatorio y con formato de correo válido |
| carrera | Texto | Obligatorio |

## **Requisitos mínimos**

☐  CRUD completo (listar, crear, editar, eliminar).

☐  Estados de carga, error, lista vacía y mensajes de éxito.

☐  Validaciones en el formulario.

☐  Separación en components/ y services/; URL en variable de entorno.

☐  Búsqueda por nombre, apellido o carné.

## **📦 Entregable**

Cada estudiante o grupo deberá entregar la carpeta del proyecto **sin** node\_modules, con la siguiente estructura:

| 📄  Estructura de entrega |
| :---- |
| frontend-estudiantes/ │ ├── src/ │   ├── components/ │   ├── services/ │   ├── App.jsx │   └── main.jsx │ ├── .env.example ├── package.json └── README.md |

El archivo **README.md** debe explicar:

1. Nombre del proyecto.

2. Tecnologías utilizadas.

3. Cómo instalar dependencias.

4. Cómo ejecutar el proyecto.

5. URL del backend.

6. Endpoints utilizados.

7. Capturas de pantalla.

8. Problemas encontrados y cómo fueron solucionados.

| ⚠️  ATENCIÓN  ·  Sobre el archivo .env Se entrega .env.example con el nombre de la variable y un valor de ejemplo. El archivo .env real no se sube a repositorios públicos. Si el docente requiere ejecutar el proyecto directamente, puede solicitar el .env por separado. |
| :---- |

# **📊  22\. Rúbrica de evaluación**

| Criterio | Descripción | Puntos |
| :---- | :---- | :---: |
| **Funcionalidad CRUD** | Listar, crear, editar y eliminar funcionan correctamente contra el backend | 30 |
| **Arquitectura** | Separación clara entre components/ y services/; sin URLs ni llamadas Axios en los componentes | 15 |
| **Estados y errores** | Carga, error, lista vacía y mensajes de éxito correctamente comunicados | 15 |
| **Validaciones** | Campos obligatorios, formato de correo y valores numéricos coherentes | 10 |
| **Interfaz y usabilidad** | Diseño ordenado, legible, con confirmación antes de eliminar | 10 |
| **Configuración** | Uso de variable de entorno y .env.example | 5 |
| **README y documentación** | Los ocho puntos solicitados, con capturas | 10 |
| **Calidad del código** | Nombres claros, indentación consistente y código sin partes muertas | 5 |
| **TOTAL** |  | **100** |

# **🌟  23\. Buenas prácticas y cierre**

| 🔑  PUNTO CLAVE  ·  Resumen: las 8 ideas que deben quedar claras React es el cliente; el backend es el que posee los datos y las reglas. Toda petición HTTP vive en services/; los componentes solo piden datos al servicio. El estado dirige la interfaz: cambia el estado, cambia la pantalla. useEffect(..., \[\]) ejecuta código una vez al montar el componente. Toda petición puede fallar: try / catch / finally siempre. Los inputs devuelven texto: convertir con Number() cuando corresponda. La configuración (URL) va en variables de entorno, no en el código. CORS es una política del navegador que se resuelve en el backend. |
| :---- |

## **📖 Glosario esencial**

| Término | Definición breve |
| :---- | :---- |
| **API REST** | Interfaz que expone recursos mediante URL y métodos HTTP, intercambiando datos normalmente en JSON. |
| **Endpoint** | URL concreta de la API que atiende una operación (por ejemplo, GET /api/productos). |
| **JSON** | Formato de texto para representar objetos y arreglos; es el idioma común entre frontend y backend. |
| **Estado (state)** | Datos que, al cambiar, provocan que React vuelva a renderizar el componente. |
| **Props** | Datos y funciones que un componente padre entrega a un componente hijo. |
| **Efecto (effect)** | Código que se ejecuta como reacción al montaje o a cambios en un componente (useEffect). |
| **Componente controlado** | Campo de formulario cuyo valor es gobernado por el estado de React. |
| **Servicio** | Módulo que encapsula la comunicación con el backend. |
| **CORS** | Mecanismo del navegador que restringe peticiones entre orígenes distintos salvo autorización del servidor. |
| **Preflight** | Petición OPTIONS previa que el navegador envía para verificar permisos CORS. |
| **Variable de entorno** | Valor de configuración externo al código, distinto en cada entorno. |
| **CRUD** | Create, Read, Update, Delete: las cuatro operaciones básicas sobre datos. |

## **✅ Autoevaluación final**

☐  Mi aplicación lista, crea, edita y elimina productos.

☐  La interfaz se actualiza sin recargar la página.

☐  Probé qué ocurre con el backend apagado.

☐  No hay URLs escritas directamente en los componentes.

☐  Puedo explicar con mis palabras el flujo completo de un POST.

☐  Sé usar la pestaña \*Network\* para diagnosticar una petición.

# **🎓  Anexo A · Solución de referencia (uso docente)**

| 🎓  NOTA PARA EL DOCENTE  ·  Integración de los retos 1 a 6 Código de referencia que integra crear, editar, eliminar, validar, buscar y los mensajes de estado. Se recomienda no distribuirlo a los estudiantes hasta finalizar el laboratorio. Los estilos CSS se dejan a criterio del estudiante (Reto 4). |
| :---- |

| 📄  src/App.jsx |
| :---- |
| import { useEffect, useState } from "react"; import ProductoForm from "./components/ProductoForm"; import ProductoList from "./components/ProductoList"; import {     obtenerProductos,     eliminarProducto } from "./services/productoService"; import { obtenerMensajeError } from "./utils/obtenerMensajeError";   function App() {       const \[productos, setProductos\] \= useState(\[\]);     const \[productoEditando, setProductoEditando\] \= useState(null);     const \[busqueda, setBusqueda\] \= useState("");     const \[cargando, setCargando\] \= useState(true);     const \[error, setError\] \= useState("");     const \[mensaje, setMensaje\] \= useState("");       useEffect(() \=\> {         cargarProductos();     }, \[\]);       const cargarProductos \= async () \=\> {         try {             setCargando(true);             setError("");             const data \= await obtenerProductos();             setProductos(data);         } catch (err) {             setError(obtenerMensajeError(err));         } finally {             setCargando(false);         }     };       const mostrarMensaje \= (texto) \=\> {         setMensaje(texto);         setTimeout(() \=\> setMensaje(""), 3000);     };       const handleGuardado \= async (texto) \=\> {         setProductoEditando(null);         await cargarProductos();         mostrarMensaje(texto);     };       const handleEliminar \= async (id) \=\> {         if (\!window.confirm("¿Desea eliminar este producto?")) return;         try {             await eliminarProducto(id);             await cargarProductos();             mostrarMensaje("Producto eliminado correctamente");         } catch (err) {             setError(obtenerMensajeError(err));         }     };       const productosFiltrados \= productos.filter((p) \=\>         p.nombre.toLowerCase().includes(busqueda.toLowerCase())     );       return (         \<div className="contenedor"\>               \<h1\>Sistema de Productos\</h1\>               {mensaje && \<div className="alerta exito"\>✅ {mensaje}\</div\>}             {error && \<div className="alerta error"\>⚠️ {error}\</div\>}               \<input                 type="text"                 placeholder="Buscar producto..."                 value={busqueda}                 onChange={(e) \=\> setBusqueda(e.target.value)}             /\>               {cargando ? (                 \<p\>⏳ Cargando productos...\</p\>             ) : productosFiltrados.length \=== 0 ? (                 \<p\>No existen productos registrados\</p\>             ) : (                 \<ProductoList                     productos={productosFiltrados}                     onEditar={setProductoEditando}                     onEliminar={handleEliminar}                 /\>             )}               \<ProductoForm                 productoEditando={productoEditando}                 onGuardado={handleGuardado}                 onCancelar={() \=\> setProductoEditando(null)}             /\>           \</div\>     ); }   export default App; |

| 📄  src/components/ProductoList.jsx |
| :---- |
| function ProductoList({ productos, onEditar, onEliminar }) {       return (         \<table\>             \<thead\>                 \<tr\>                     \<th\>Nombre\</th\>                     \<th\>Precio\</th\>                     \<th\>Stock\</th\>                     \<th\>Acción\</th\>                 \</tr\>             \</thead\>             \<tbody\>                 {productos.map((producto) \=\> (                     \<tr key={producto.id}\>                         \<td\>{producto.nombre}\</td\>                         \<td\>Q{producto.precio}\</td\>                         \<td\>{producto.stock}\</td\>                         \<td\>                             \<button onClick={() \=\> onEditar(producto)}\>                                 Editar                             \</button\>                             \<button onClick={() \=\> onEliminar(producto.id)}\>                                 Eliminar                             \</button\>                         \</td\>                     \</tr\>                 ))}             \</tbody\>         \</table\>     ); }   export default ProductoList; |

| 📄  src/components/ProductoForm.jsx |
| :---- |
| import { useEffect, useState } from "react"; import {     crearProducto,     actualizarProducto } from "../services/productoService"; import { obtenerMensajeError } from "../utils/obtenerMensajeError";   const FORMULARIO\_VACIO \= { nombre: "", precio: "", stock: "" };   function ProductoForm({ productoEditando, onGuardado, onCancelar }) {       const \[formulario, setFormulario\] \= useState(FORMULARIO\_VACIO);     const \[errores, setErrores\] \= useState({});     const \[errorServidor, setErrorServidor\] \= useState("");     const \[enviando, setEnviando\] \= useState(false);       // Al seleccionar un producto para editar, se llenan los campos     useEffect(() \=\> {         if (productoEditando) {             setFormulario({                 nombre: productoEditando.nombre,                 precio: productoEditando.precio,                 stock: productoEditando.stock             });         } else {             setFormulario(FORMULARIO\_VACIO);         }         setErrores({});         setErrorServidor("");     }, \[productoEditando\]);       // Un único manejador para todos los campos (usa el atributo name)     const handleChange \= (e) \=\> {         const { name, value } \= e.target;         setFormulario({ ...formulario, \[name\]: value });     };       const validar \= () \=\> {         const nuevos \= {};         if (formulario.nombre.trim() \=== "")             nuevos.nombre \= "El nombre es obligatorio";         if (Number(formulario.precio) \<= 0\)             nuevos.precio \= "El precio debe ser mayor a 0";         if (formulario.stock \=== "" || Number(formulario.stock) \< 0\)             nuevos.stock \= "El stock no puede ser negativo";         setErrores(nuevos);         return Object.keys(nuevos).length \=== 0;     };       const handleSubmit \= async (event) \=\> {         event.preventDefault();         if (\!validar()) return;           const producto \= {             nombre: formulario.nombre.trim(),             precio: Number(formulario.precio),             stock: Number(formulario.stock)         };           try {             setEnviando(true);             setErrorServidor("");               if (productoEditando) {                 await actualizarProducto(productoEditando.id, producto);                 onGuardado("Producto actualizado correctamente");             } else {                 await crearProducto(producto);                 onGuardado("Producto creado correctamente");                 setFormulario(FORMULARIO\_VACIO);             }         } catch (err) {             setErrorServidor(obtenerMensajeError(err));         } finally {             setEnviando(false);         }     };       return (         \<form onSubmit={handleSubmit}\>               \<h2\>{productoEditando ? "Editar producto" : "Registrar producto"}\</h2\>               {errorServidor && \<div className="alerta error"\>{errorServidor}\</div\>}               \<div\>                 \<label\>Nombre\</label\>                 \<input                     type="text"                     name="nombre"                     value={formulario.nombre}                     onChange={handleChange}                 /\>                 {errores.nombre && \<small\>{errores.nombre}\</small\>}             \</div\>               \<div\>                 \<label\>Precio\</label\>                 \<input                     type="number"                     name="precio"                     value={formulario.precio}                     onChange={handleChange}                 /\>                 {errores.precio && \<small\>{errores.precio}\</small\>}             \</div\>               \<div\>                 \<label\>Stock\</label\>                 \<input                     type="number"                     name="stock"                     value={formulario.stock}                     onChange={handleChange}                 /\>                 {errores.stock && \<small\>{errores.stock}\</small\>}             \</div\>               \<button type="submit" disabled={enviando}\>                 {enviando ? "Guardando..." : "Guardar"}             \</button\>               {productoEditando && (                 \<button type="button" onClick={onCancelar}\>                     Cancelar                 \</button\>             )}           \</form\>     ); }   export default ProductoForm; |

| 🎓  NOTA PARA EL DOCENTE  ·  Puntos de discusión sobre esta solución El único manejador handleChange con name evita repetir un useState por campo. useEffect con dependencia \[productoEditando\] sincroniza el formulario con la selección. Tras cada operación se vuelve a consultar la lista: es simple y garantiza consistencia con el backend. Alternativa: actualizar el estado local con la respuesta (más rápido, más propenso a desincronizarse). El linter puede advertir que cargarProductos falta en las dependencias del primer useEffect; es una excelente oportunidad para introducir useCallback o mover la función dentro del efecto. |
| :---- |

# **🗝️  Anexo B · Solucionario del ejercicio de análisis**

| \# | Respuesta esperada |
| :---: | :---- |
| **1** | GET **solicita** datos al servidor y no lleva cuerpo; POST **envía** datos (en el cuerpo) para crear un recurso. Son semánticas distintas: lectura sin efectos secundarios frente a creación. |
| **2** | El **cuerpo de la respuesta** del backend, ya convertido por Axios de JSON a objetos/arreglos de JavaScript (por ejemplo, el arreglo de productos). |
| **3** | Las peticiones HTTP son **asíncronas**: la respuesta tarda en llegar. async / await permite escribir ese flujo de forma secuencial y legible, esperando el resultado sin bloquear la interfaz. |
| **4** | Ejecuta **efectos secundarios** (como pedir datos) después del renderizado. Con \[\] se ejecuta **una sola vez**, al montar el componente. |
| **5** | Separa responsabilidades: los componentes se encargan de la interfaz y el servicio de la comunicación. Facilita el **mantenimiento**, la **reutilización**, las pruebas y cambiar la URL o la librería HTTP en un solo lugar. |
| **6** | Impide que un sitio web arbitrario consuma la API de otro origen desde el navegador del usuario sin autorización. Debe configurarlo el **backend**, indicando qué orígenes y métodos permite. |
| **7** | Volver a consultar garantiza que la lista refleje el **estado real** de la base de datos (ids generados, cambios de otros usuarios). Desventaja: una petición adicional y un breve retraso. La alternativa es actualizar el estado local. |
| **8** | Si ocurriera un error, setCargando(false) no se ejecutaría y la interfaz quedaría **“cargando” indefinidamente**. finally asegura el apagado del indicador en ambos casos. |

