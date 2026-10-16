# Centro Educativo — Frontend

Aplicación web en React + Vite que consume con Axios el mismo backend REST utilizado por la aplicación Android de Centro Educativo.

## Requisitos

- Node.js 20.19+ o 22.12+.
- El backend SGAU accesible desde el navegador y configurado para permitir CORS desde el origen de Vite (`http://localhost:5173`).

## Instalación y ejecución

Desde esta carpeta, en PowerShell:

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

La configuración inicial usa el proxy de desarrollo de Vite (`VITE_API_URL=/api`) y reenvía las solicitudes al backend SGAU sin el encabezado `Origin` del navegador, evitando que CORS del backend rechace la petición local. `VITE_PROXY_TARGET` permite cambiar el host remoto. Para cambiar de ambiente, edita `.env` y reinicia Vite. No coloques credenciales ni tokens en variables `VITE_*`.

El proxy solo se ejecuta durante el desarrollo. En una publicación, configura `VITE_API_URL` con la URL completa del backend y habilita CORS en el backend para el dominio de la aplicación web.

Para generar y previsualizar el build:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Funcionalidad por rol

- **ADMIN**: gestión CRUD de carreras, estudiantes, docentes, cursos e inscripciones.
- **DOCENTE**: consulta de cursos asignados y gestión de notas vinculadas a inscripciones de sus cursos.
- **ESTUDIANTE / ALUMNO**: consulta de sus cursos y notas.

El frontend adapta la navegación según el rol de la respuesta de login o los claims del JWT. Esto solo controla la presentación: el backend debe continuar validando cada permiso.

## Contrato de API

Axios usa `VITE_API_URL` como base y envía `Authorization: Bearer <token>` en solicitudes protegidas.

- `POST /auth/login` con `{ "username": "...", "password": "..." }`.
- Recursos administrativos: `/carreras`, `/estudiantes`, `/docentes`, `/cursos` e `/inscripciones`, con GET, POST, PUT `/{id}` y DELETE `/{id}`.
- Cursos: `GET /docentes/me/cursos`; cursos por carrera con `GET /cursos/carrera/{carreraId}`.
- Notas: `/notas`, `/notas/curso/{cursoId}`, `POST /notas`, PUT `/{id}` y DELETE `/{id}`.
- Consultas personales: `/estudiantes/me/inscripciones` y `/estudiantes/me/notas`.

Los nombres de propiedades enviados corresponden a los DTO usados por la app Android. Las respuestas de listados aceptan arreglos directos y envoltorios `content`, `data` o el nombre del recurso.

## CORS

El proxy de desarrollo evita el bloqueo CORS del navegador al trabajar localmente. En producción, si el navegador reporta `Network Error`, habilita CORS en el backend para el dominio publicado y los métodos `GET`, `POST`, `PUT`, `DELETE` y `OPTIONS`, incluyendo la cabecera `Authorization`.
