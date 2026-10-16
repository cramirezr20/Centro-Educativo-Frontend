import { api } from "./api.js";

export const resourceConfig = {
  carreras: {
    title: "Carreras",
    singular: "carrera",
    endpoint: "/carreras",
    fields: [
      { name: "codigo", label: "Código", required: true },
      { name: "nombre", label: "Nombre", required: true },
    ],
    columns: ["codigo", "nombre", "activo"],
  },
  estudiantes: {
    title: "Estudiantes",
    singular: "estudiante",
    endpoint: "/estudiantes",
    fields: [
      { name: "codigoEstudiante", label: "Código de estudiante", required: true },
      { name: "carnet", label: "Carné", required: true },
      { name: "nombre", label: "Nombre", required: true },
      { name: "apellido", label: "Apellido", required: true },
      { name: "email", label: "Correo electrónico", type: "email", required: true },
    ],
    columns: ["codigoEstudiante", "carnet", "nombre", "apellido", "email", "activo"],
  },
  docentes: {
    title: "Docentes",
    singular: "docente",
    endpoint: "/docentes",
    fields: [
      { name: "nombre", label: "Nombre", required: true },
      { name: "apellido", label: "Apellido", required: true },
      { name: "emailInstitucional", label: "Correo institucional", type: "email", required: true },
      { name: "emailPersonal", label: "Correo personal", type: "email" },
      { name: "dpi", label: "DPI" },
      { name: "telefono", label: "Teléfono" },
      { name: "especialidad", label: "Especialidad" },
      { name: "fechaContratacion", label: "Fecha de contratación", type: "date" },
      { name: "activo", label: "Activo", type: "checkbox" },
    ],
    columns: ["nombre", "apellido", "emailInstitucional", "especialidad", "activo"],
  },
  cursos: {
    title: "Cursos",
    singular: "curso",
    endpoint: "/cursos",
    fields: [
      { name: "codigo", label: "Código", required: true },
      { name: "nombre", label: "Nombre", required: true },
      { name: "creditos", label: "Créditos", type: "number", min: 1, required: true },
      {
        name: "docenteId",
        label: "Docente",
        type: "select",
        lookup: "docentes",
        required: true,
      },
      {
        name: "carreraId",
        label: "Carrera",
        type: "select",
        lookup: "carreras",
        required: true,
      },
    ],
    columns: ["codigo", "nombre", "creditos", "carreraNombre", "docenteNombre", "activo"],
    lookups: ["docentes", "carreras"],
  },
  inscripciones: {
    title: "Inscripciones",
    singular: "inscripción",
    endpoint: "/inscripciones",
    fields: [
      {
        name: "estudianteId",
        label: "Estudiante",
        type: "select",
        lookup: "estudiantes",
        required: true,
      },
      {
        name: "cursoId",
        label: "Curso",
        type: "select",
        lookup: "cursos",
        required: true,
      },
      { name: "fechaInscripcion", label: "Fecha de inscripción", type: "date", required: true },
    ],
    columns: ["codigoEstudiante", "nombreEstudiante", "nombreCurso", "fechaInscripcion", "activo"],
    lookups: ["estudiantes", "cursos"],
  },
};

const collectionKeys = ["content", "data", "carreras", "estudiantes", "docentes", "cursos", "inscripciones", "notas"];

export function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") {
    throw new Error("El servidor devolvió una lista con formato no válido.");
  }
  for (const key of collectionKeys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object" && Array.isArray(value.content)) {
      return value.content;
    }
  }
  throw new Error("No se encontró una lista de registros en la respuesta del servidor.");
}

export async function login(credentials) {
  const response = await api.post("/auth/login", credentials);
  return response.data;
}

export async function listResource(resource) {
  const response = await api.get(resourceConfig[resource].endpoint);
  return normalizeList(response.data);
}

export async function createResource(resource, body) {
  const response = await api.post(resourceConfig[resource].endpoint, body);
  return response.data;
}

export async function updateResource(resource, id, body) {
  const response = await api.put(`${resourceConfig[resource].endpoint}/${id}`, body);
  return response.data;
}

export async function deleteResource(resource, id) {
  await api.delete(`${resourceConfig[resource].endpoint}/${id}`);
}

export async function restoreCourse(id) {
  const response = await api.put(`/cursos/${id}/restaurar`);
  return response.data;
}

export async function listTeacherCourses() {
  const response = await api.get("/docentes/me/cursos");
  return normalizeList(response.data);
}

export async function listCourseEnrollments(courseId) {
  const response = await api.get(`/inscripciones/curso/${courseId}`);
  return normalizeList(response.data);
}

export async function listCourseGrades(courseId) {
  const response = await api.get(`/notas/curso/${courseId}`);
  return normalizeList(response.data);
}

export async function createGrade(body) {
  const response = await api.post("/notas", body);
  return response.data;
}

export async function updateGrade(id, body) {
  const response = await api.put(`/notas/${id}`, body);
  return response.data;
}

export async function deleteGrade(id) {
  await api.delete(`/notas/${id}`);
}

export async function listMyEnrollments() {
  const response = await api.get("/estudiantes/me/inscripciones");
  return normalizeList(response.data);
}

export async function listMyGrades() {
  const response = await api.get("/estudiantes/me/notas");
  return normalizeList(response.data);
}
