import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../services/api.js";
import {
  createGrade,
  deleteGrade,
  listCourseEnrollments,
  listCourseGrades,
  listMyEnrollments,
  listMyGrades,
  listTeacherCourses,
  updateGrade,
} from "../services/educationService.js";

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const emptyGrade = {
  cicloAcademico: "Primer Semestre 2026",
  zona: "",
  examenFinal: "",
  estado: "REPROBADO",
  activo: true,
  fechaRegistro: localDate(),
  inscripcionId: "",
};

function courseLabel(course) {
  return [course.codigo, course.nombre].filter(Boolean).join(" · ") || `Curso ${course.id}`;
}

function toList(data) {
  return Array.isArray(data) ? data : [];
}

export default function PersonalPage({ section }) {
  if (section === "notas") return <TeacherGradesPage />;
  return <StudentPage section={section} />;
}

function StudentPage({ section }) {
  const isGrades = section === "mis-notas";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const load = isGrades ? listMyGrades : listMyEnrollments;
    load()
      .then((data) => {
        if (active) setItems(toList(data));
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isGrades]);

  const columns = isGrades
    ? [
        ["cursoNombre", "Curso"],
        ["cicloAcademico", "Ciclo académico"],
        ["zona", "Zona"],
        ["examenFinal", "Examen final"],
        ["notaFinal", "Nota final"],
        ["estado", "Estado"],
      ]
    : [
        ["codigoEstudiante", "Código"],
        ["nombreCurso", "Curso"],
        ["fechaInscripcion", "Fecha de inscripción"],
        ["activo", "Estado"],
      ];

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MI ESPACIO ACADÉMICO</p>
          <h2>{isGrades ? "Mis notas" : "Mis cursos"}</h2>
          <p>{isGrades ? "Consulta tu avance y resultados académicos." : "Consulta tus cursos e inscripciones activas."}</p>
        </div>
      </div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <div className="panel table-panel">
        {loading ? (
          <div className="empty-state"><span className="spinner" /> Cargando información…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">◇</span>
            <strong>No hay información para mostrar</strong>
            <span>Cuando existan registros, aparecerán en esta sección.</span>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id ?? index}>
                    {columns.map(([key]) => (
                      <td key={key}>{key === "activo" ? (
                        <span className={`status-pill ${item.activo === false ? "status-inactive" : "status-active"}`}>
                          {item.activo === false ? "Inactivo" : "Activo"}
                        </span>
                      ) : item[key] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function TeacherGradesPage() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyGrade);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    listTeacherCourses()
      .then((data) => {
        if (!active) return;
        const items = toList(data);
        setCourses(items);
        setCourseId(items.length ? String(items[0].id) : "");
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoadingCourses(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!courseId) {
      setEnrollments([]);
      setGrades([]);
      return;
    }
    let active = true;
    setLoadingGrades(true);
    setError("");
    Promise.all([listCourseGrades(courseId), listCourseEnrollments(courseId)])
      .then(([gradeData, enrollmentData]) => {
        if (!active) return;
        setGrades(toList(gradeData));
        setEnrollments(toList(enrollmentData));
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoadingGrades(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  function startCreate() {
    setEditing({ id: null });
    setForm({ ...emptyGrade, fechaRegistro: localDate() });
    setError("");
    setNotice("");
  }

  function startEdit(grade) {
    setEditing(grade);
    setForm({
      cicloAcademico: grade.cicloAcademico ?? "",
      zona: grade.zona ?? "",
      examenFinal: grade.examenFinal ?? "",
      estado: grade.estado ?? "CURSANDO",
      activo: grade.activo ?? true,
      fechaRegistro: grade.fechaRegistro?.slice(0, 10) || "",
      inscripcionId: grade.inscripcionId ?? "",
    });
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!form.inscripcionId || !form.cicloAcademico.trim()) {
      setError("Selecciona una inscripción e indica el ciclo académico.");
      return;
    }
    const zona = Number(form.zona);
    const examenFinal = Number(form.examenFinal);
    if (
      form.zona === "" ||
      form.examenFinal === "" ||
      !Number.isFinite(zona) ||
      !Number.isFinite(examenFinal) ||
      zona < 0 ||
      zona > 100 ||
      examenFinal < 0 ||
      examenFinal > 100
    ) {
      setError("La zona y el examen final son obligatorios y deben estar entre 0 y 100.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        cicloAcademico: form.cicloAcademico.trim(),
        zona,
        examenFinal,
        estado: form.estado.trim(),
        activo: Boolean(form.activo),
        fechaRegistro: form.fechaRegistro || null,
        inscripcionId: Number(form.inscripcionId),
      };
      if (editing.id == null) {
        await createGrade(payload);
        setNotice("Nota registrada correctamente.");
      } else {
        await updateGrade(editing.id, payload);
        setNotice("Nota actualizada correctamente.");
      }
      setEditing(null);
      const data = await listCourseGrades(courseId);
      setGrades(toList(data));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(grade) {
    if (!window.confirm("¿Eliminar esta nota?")) return;
    setError("");
    setNotice("");
    try {
      await deleteGrade(grade.id);
      setNotice("Nota eliminada correctamente.");
      setGrades(toList(await listCourseGrades(courseId)));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  const selectedCourse = courses.find((course) => String(course.id) === courseId);

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h2>Notas</h2>
          <p>Registra y actualiza las notas de las inscripciones de tus cursos.</p>
        </div>
      </div>
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <div className="panel course-selector-panel">
        <label className="field">
          <span>Curso asignado</span>
          <select
            disabled={loadingCourses || !courses.length}
            onChange={(event) => setCourseId(event.target.value)}
            value={courseId}
          >
            {!courses.length && <option value="">{loadingCourses ? "Cargando cursos…" : "No hay cursos asignados"}</option>}
            {courses.map((course) => <option key={course.id} value={course.id}>{courseLabel(course)}</option>)}
          </select>
        </label>
        {selectedCourse && (
          <div className="course-summary">
            <span className="course-summary-icon" aria-hidden="true">▤</span>
            <div><strong>{selectedCourse.nombre}</strong><span>{selectedCourse.codigo || "Curso asignado"} · {enrollments.length} inscripciones</span></div>
          </div>
        )}
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div><h3>Registro de notas</h3><p>{grades.length} {grades.length === 1 ? "registro" : "registros"}</p></div>
          <button className="button button-primary" disabled={!courseId || loadingGrades} onClick={startCreate}>
            <span aria-hidden="true">＋</span> Nueva nota
          </button>
        </div>
        {loadingCourses || loadingGrades ? (
          <div className="empty-state"><span className="spinner" /> Cargando información…</div>
        ) : !courseId ? (
          <div className="empty-state"><strong>No hay cursos asignados</strong><span>Cuando tengas cursos, podrás consultar sus inscripciones y notas.</span></div>
        ) : grades.length === 0 ? (
          <div className="empty-state"><strong>Aún no hay notas</strong><span>Agrega una nota para una inscripción de este curso.</span></div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Estudiante</th><th>Ciclo</th><th>Zona</th><th>Examen final</th><th>Nota final</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id}>
                    <td>{grade.estudianteNombre || `Inscripción ${grade.inscripcionId ?? "—"}`}</td>
                    <td>{grade.cicloAcademico || "—"}</td>
                    <td>{grade.zona ?? "—"}</td>
                    <td>{grade.examenFinal ?? "—"}</td>
                    <td><strong>{grade.notaFinal ?? grade.nota ?? "—"}</strong></td>
                    <td>{grade.estado || "—"}</td>
                    <td><div className="row-actions">
                      <button className="icon-button" onClick={() => startEdit(grade)}>Editar</button>
                      <button className="icon-button icon-button-danger" onClick={() => handleDelete(grade)}>Eliminar</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setEditing(null)}>
          <section aria-labelledby="grade-form-title" aria-modal="true" className="modal-card" role="dialog">
            <div className="modal-heading">
              <div><p className="eyebrow">{editing.id == null ? "NUEVO REGISTRO" : "ACTUALIZAR DATOS"}</p><h3 id="grade-form-title">{editing.id == null ? "Registrar nota" : "Editar nota"}</h3></div>
              <button className="close-button" onClick={() => setEditing(null)} aria-label="Cerrar">×</button>
            </div>
            <form className="resource-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="field field-wide"><span>Inscripción *</span>
                  <select disabled={editing.id != null} onChange={(event) => setForm((current) => ({ ...current, inscripcionId: event.target.value }))} required value={form.inscripcionId}>
                    <option value="">Selecciona una inscripción</option>
                    {enrollments.map((enrollment) => (
                      <option key={enrollment.id} value={enrollment.id}>
                        {enrollment.nombreEstudiante || enrollment.codigoEstudiante || `Estudiante ${enrollment.estudianteId}`} · {enrollment.nombreCurso || courseLabel(selectedCourse || {})}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field"><span>Ciclo académico *</span><input onChange={(event) => setForm((current) => ({ ...current, cicloAcademico: event.target.value }))} placeholder="Ej. 2026-1" required value={form.cicloAcademico} /></label>
                <label className="field"><span>Zona *</span><input max="100" min="0" onChange={(event) => setForm((current) => {
                  const next = { ...current, zona: event.target.value };
                  if (next.zona !== "" && next.examenFinal !== "") next.estado = Number(next.zona) + Number(next.examenFinal) >= 61 ? "APROBADO" : "REPROBADO";
                  return next;
                })} required type="number" value={form.zona} /></label>
                <label className="field"><span>Examen final *</span><input max="100" min="0" onChange={(event) => setForm((current) => {
                  const next = { ...current, examenFinal: event.target.value };
                  if (next.zona !== "" && next.examenFinal !== "") next.estado = Number(next.zona) + Number(next.examenFinal) >= 61 ? "APROBADO" : "REPROBADO";
                  return next;
                })} required type="number" value={form.examenFinal} /></label>
                <label className="field"><span>Estado</span>
                  <select onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value }))} value={form.estado}>
                    <option value="APROBADO">Aprobado</option><option value="REPROBADO">Reprobado</option>
                  </select>
                </label>
                <label className="field"><span>Fecha de registro</span><input onChange={(event) => setForm((current) => ({ ...current, fechaRegistro: event.target.value }))} type="date" value={form.fechaRegistro} /></label>
                <label className="field field-checkbox"><input checked={Boolean(form.activo)} onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))} type="checkbox" /><span>Nota activa</span></label>
              </div>
              {error && <p className="inline-error" role="alert">{error}</p>}
              <div className="modal-actions">
                <button className="button button-quiet" onClick={() => setEditing(null)} type="button">Cancelar</button>
                <button className="button button-primary" disabled={saving} type="submit">{saving ? "Guardando…" : editing.id == null ? "Registrar nota" : "Guardar cambios"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
