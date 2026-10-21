
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
  cicloAcademico: "",
  zona: "",
  examenFinal: "",
  estado: "",
  activo: true,
  fechaRegistro: localDate(),
  inscripcionId: "",
};

function courseLabel(course) {
  return (
    [course.codigo, course.nombre].filter(Boolean).join(" · ") ||
    `Curso ${course.id ?? ""}`
  );
}

function toList(data) {
  return Array.isArray(data) ? data : [];
}

function calculateGradeState(zona, examenFinal) {
  if (zona === "" || examenFinal === "") return "";

  return Number(zona) + Number(examenFinal) >= 61
    ? "APROBADO"
    : "REPROBADO";
}

export default function PersonalPage({ section, role }) {
  if (role === "DOCENTE" && section === "mis-cursos") {
    return <TeacherCoursesPage />;
  }

  if (role === "DOCENTE" && section === "notas") {
    return <TeacherGradesPage />;
  }

  return <StudentPage section={section} />;
}

// H1: cursos asignados al docente autenticado.
function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      setLoading(true);
      setError("");

      try {
        const data = await listTeacherCourses();

        if (active) {
          setCourses(toList(data));
        }
      } catch (requestError) {
        if (!active) return;

        setCourses([]);
        setError(getApiErrorMessage(requestError));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MI ESPACIO ACADÉMICO</p>
          <h2>Mis cursos</h2>
          <p>Consulta los cursos que tienes asignados como docente.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="panel table-panel">
        {loading ? (
          <div className="empty-state" role="status">
            <span className="spinner" />
            Cargando tus cursos…
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <strong>No tienes cursos asignados</strong>
            <span>
              Cuando tengas cursos asignados, aparecerán en esta sección.
            </span>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del curso</th>
                  <th>Créditos</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={course.id ?? index}>
                    <td>{course.codigo ?? "—"}</td>
                    <td>{course.nombre ?? "—"}</td>
                    <td>{course.creditos ?? "—"}</td>
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

function StudentPage({ section }) {
  const isGrades = section === "mis-notas";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setItems([]);
    setLoading(true);
    setError("");

    const load = isGrades ? listMyGrades : listMyEnrollments;

    load()
      .then((data) => {
        if (active) setItems(toList(data));
      })
      .catch((requestError) => {
        if (!active) return;

        setItems([]);
        setError(getApiErrorMessage(requestError));
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
          <p>
            {isGrades
              ? "Consulta tu avance y resultados académicos."
              : "Consulta tus cursos e inscripciones activas."}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="panel table-panel">
        {loading ? (
          <div className="empty-state" role="status">
            <span className="spinner" /> Cargando información…
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">◇</span>
            <strong>No hay información para mostrar</strong>
            <span>
              Cuando existan registros, aparecerán en esta sección.
            </span>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map(([, label]) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id ?? index}>
                    {columns.map(([key]) => (
                      <td key={key}>
                        {key === "activo" ? (
                          <span
                            className={`status-pill ${
                              item.activo === false
                                ? "status-inactive"
                                : "status-active"
                            }`}
                          >
                            {item.activo === false ? "Inactivo" : "Activo"}
                          </span>
                        ) : (
                          item[key] ?? "—"
                        )}
                      </td>
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
  const [courseDataReady, setCourseDataReady] = useState(false);
  const [courseDataError, setCourseDataError] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyGrade);
  const [saving, setSaving] = useState(false);

  // Cargar solamente los cursos del docente autenticado.
  useEffect(() => {
    let active = true;

    setLoadingCourses(true);
    setError("");

    listTeacherCourses()
      .then((data) => {
        if (!active) return;

        const items = toList(data);
        setCourses(items);
        setCourseId(
          items.length && items[0].id != null
            ? String(items[0].id)
            : "",
        );
      })
      .catch((requestError) => {
        if (!active) return;

        setCourses([]);
        setCourseId("");
        setCourseDataReady(false);
        setCourseDataError(true);
        setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoadingCourses(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // H2: al cambiar de curso, invalidar inmediatamente los datos anteriores.
  useEffect(() => {
    let active = true;

    setCourseDataReady(false);
    setCourseDataError(false);

    if (!courseId) {
      setEnrollments([]);
      setGrades([]);
      setLoadingGrades(false);

      return () => {
        active = false;
      };
    }

    setEnrollments([]);
    setGrades([]);
    setEditing(null);
    setForm({ ...emptyGrade, fechaRegistro: localDate() });
    setLoadingGrades(true);
    setError("");
    setNotice("");

    async function loadCourseData() {
      const results = await Promise.allSettled([
        listCourseGrades(courseId),
        listCourseEnrollments(courseId),
      ]);

      if (!active) return;

      const [gradeResult, enrollmentResult] = results;

      const bothRequestsSucceeded =
        gradeResult.status === "fulfilled" &&
        enrollmentResult.status === "fulfilled";

      setCourseDataReady(bothRequestsSucceeded);
      setCourseDataError(!bothRequestsSucceeded);

      const errors = [];

      if (gradeResult.status === "fulfilled") {
        setGrades(toList(gradeResult.value));
      } else {
        setGrades([]);
        errors.push(getApiErrorMessage(gradeResult.reason));
      }

      if (enrollmentResult.status === "fulfilled") {
        setEnrollments(toList(enrollmentResult.value));
      } else {
        setEnrollments([]);
        errors.push(getApiErrorMessage(enrollmentResult.reason));
      }

      if (errors.length > 0) {
        setError(errors.join(" "));
      }

      setLoadingGrades(false);
    }

    loadCourseData().catch((requestError) => {
      if (!active) return;

      setGrades([]);
      setEnrollments([]);
      setCourseDataReady(false);
      setCourseDataError(true);
      setError(getApiErrorMessage(requestError));
      setLoadingGrades(false);
    });

    return () => {
      active = false;
    };
  }, [courseId]);

  function handleCourseChange(event) {
    const nextCourseId = event.target.value;

    setCourseDataReady(false);
    setCourseDataError(false);
    setGrades([]);
    setEnrollments([]);
    setEditing(null);
    setForm({ ...emptyGrade, fechaRegistro: localDate() });
    setError("");
    setNotice("");
    setLoadingGrades(Boolean(nextCourseId));
    setCourseId(nextCourseId);
  }

  function startCreate() {
    if (
      !courseId ||
      loadingGrades ||
      saving ||
      !courseDataReady ||
      courseDataError
    ) {
      return;
    }

    setEditing({ id: null });
    setForm({ ...emptyGrade, fechaRegistro: localDate() });
    setError("");
    setNotice("");
  }

  function startEdit(grade) {
    if (
      loadingGrades ||
      saving ||
      !courseId ||
      !courseDataReady ||
      courseDataError
    ) {
      return;
    }

    const currentGrade = grades.find(
      (item) => String(item.id) === String(grade.id),
    );

    if (!currentGrade) {
      setError("La nota no pertenece al curso seleccionado.");
      return;
    }

    setEditing(currentGrade);
    setForm({
      cicloAcademico: currentGrade.cicloAcademico ?? "",
      zona: currentGrade.zona ?? "",
      examenFinal: currentGrade.examenFinal ?? "",
      estado: currentGrade.estado ?? "",
      activo: currentGrade.activo ?? true,
      fechaRegistro: currentGrade.fechaRegistro?.slice(0, 10) || "",
      inscripcionId: String(currentGrade.inscripcionId ?? ""),
    });
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      saving ||
      loadingGrades ||
      !courseId ||
      !courseDataReady ||
      courseDataError
    ) {
      setError("Espera a que las notas e inscripciones carguen correctamente.");
      return;
    }

    setError("");
    setNotice("");

    if (!form.inscripcionId || !form.cicloAcademico.trim()) {
      setError("Selecciona una inscripción e indica el ciclo académico.");
      return;
    }

    const enrollmentBelongsToCourse = enrollments.some(
      (item) => String(item.id) === String(form.inscripcionId),
    );

    if (!enrollmentBelongsToCourse) {
      setError(
        "La inscripción no pertenece al curso seleccionado. Vuelve a seleccionarla.",
      );
      return;
    }

    if (
      editing?.id != null &&
      !grades.some((item) => String(item.id) === String(editing.id))
    ) {
      setError("No puedes modificar una nota de otro curso.");
      return;
    }

    if (form.zona === "" || form.examenFinal === "") {
      setError("La zona y el examen final son obligatorios.");
      return;
    }

    const zona = Number(form.zona);
    const examenFinal = Number(form.examenFinal);

    if (
      !Number.isFinite(zona) ||
      !Number.isFinite(examenFinal) ||
      zona < 0 ||
      zona > 100 ||
      examenFinal < 0 ||
      examenFinal > 100
    ) {
      setError("La zona y el examen final deben estar entre 0 y 100.");
      return;
    }

    // H4: la suma nunca debe superar 100.
    const notaFinal = zona + examenFinal;

    if (notaFinal > 100) {
      setError(
        "La suma de la zona y el examen final no puede superar 100 puntos.",
      );
      return;
    }

    const payload = {
      cicloAcademico: form.cicloAcademico.trim(),
      zona,
      examenFinal,
      estado: calculateGradeState(zona, examenFinal),
      activo: Boolean(form.activo),
      fechaRegistro: form.fechaRegistro || null,
      inscripcionId: Number(form.inscripcionId),
    };

    const selectedCourseId = courseId;
    setSaving(true);

    try {
      if (editing.id == null) {
        await createGrade(payload);
      } else {
        await updateGrade(editing.id, payload);
      }

      const updatedGrades = await listCourseGrades(selectedCourseId);

      setGrades(toList(updatedGrades));
      setEditing(null);
      setNotice(
        editing.id == null
          ? "Nota registrada correctamente."
          : "Nota actualizada correctamente.",
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(grade) {
    if (
      saving ||
      loadingGrades ||
      !courseId ||
      !courseDataReady ||
      courseDataError
    ) {
      return;
    }

    const currentGrade = grades.find(
      (item) => String(item.id) === String(grade.id),
    );

    if (!currentGrade) {
      setError("No puedes eliminar una nota de otro curso.");
      return;
    }

    if (!window.confirm("¿Eliminar esta nota?")) return;

    const selectedCourseId = courseId;

    setError("");
    setNotice("");
    setSaving(true);

    try {
      await deleteGrade(currentGrade.id);

      const updatedGrades = await listCourseGrades(selectedCourseId);

      setGrades(toList(updatedGrades));
      setNotice("Nota eliminada correctamente.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  const selectedCourse = courses.find(
    (course) => String(course.id) === courseId,
  );

  const calculatedState = calculateGradeState(
    form.zona,
    form.examenFinal,
  );

  const actionsDisabled =
    loadingGrades ||
    saving ||
    !courseDataReady ||
    courseDataError;

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h2>Notas</h2>
          <p>
            Registra y actualiza las notas de las inscripciones de tus cursos.
          </p>
        </div>
      </div>

      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="panel course-selector-panel">
        <label className="field">
          <span>Curso asignado</span>
          <select
            disabled={loadingCourses || !courses.length || saving}
            onChange={handleCourseChange}
            value={courseId}
          >
            {!courses.length && (
              <option value="">
                {loadingCourses
                  ? "Cargando cursos…"
                  : "No hay cursos asignados"}
              </option>
            )}

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {courseLabel(course)}
              </option>
            ))}
          </select>
        </label>

        {selectedCourse && (
          <div className="course-summary">
            <span className="course-summary-icon" aria-hidden="true">
              ▤
            </span>
            <div>
              <strong>{selectedCourse.nombre}</strong>
              <span>
                {selectedCourse.codigo || "Curso asignado"} ·{" "}
                {loadingGrades
                  ? "Cargando inscripciones…"
                  : `${enrollments.length} inscripciones`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Registro de notas</h3>
            <p>
              {loadingGrades
                ? "Cargando registros…"
                : `${grades.length} ${
                    grades.length === 1 ? "registro" : "registros"
                  }`}
            </p>
          </div>

          <button
            className="button button-primary"
            disabled={
              !courseId ||
              loadingCourses ||
              actionsDisabled
            }
            onClick={startCreate}
            type="button"
          >
            <span aria-hidden="true">＋</span> Nueva nota
          </button>
        </div>

        {loadingCourses || loadingGrades ? (
          <div className="empty-state" role="status">
            <span className="spinner" /> Cargando información…
          </div>
        ) : !courseId ? (
          <div className="empty-state">
            <strong>No hay cursos asignados</strong>
            <span>
              Cuando tengas cursos, podrás consultar sus inscripciones y notas.
            </span>
          </div>
        ) : courseDataError ? (
          <div className="empty-state" role="alert">
            <strong>No se pudieron cargar todos los datos del curso</strong>
            <span>
              Revisa el mensaje de error. Las operaciones están bloqueadas
              hasta que los datos se carguen correctamente.
            </span>
          </div>
        ) : grades.length === 0 ? (
          <div className="empty-state">
            <strong>Aún no hay notas para mostrar</strong>
            <span>
              Puedes registrar una nota cuando la carga de notas e inscripciones
              haya finalizado correctamente.
            </span>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Ciclo</th>
                  <th>Zona</th>
                  <th>Examen final</th>
                  <th>Nota final</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id}>
                    <td>
                      {grade.estudianteNombre ||
                        `Inscripción ${grade.inscripcionId ?? "—"}`}
                    </td>
                    <td>{grade.cicloAcademico || "—"}</td>
                    <td>{grade.zona ?? "—"}</td>
                    <td>{grade.examenFinal ?? "—"}</td>
                    <td>
                      <strong>
                        {grade.notaFinal ?? grade.nota ?? "—"}
                      </strong>
                    </td>
                    <td>{grade.estado || "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          disabled={actionsDisabled}
                          onClick={() => startEdit(grade)}
                          type="button"
                        >
                          Editar
                        </button>

                        <button
                          className="icon-button icon-button-danger"
                          disabled={actionsDisabled}
                          onClick={() => handleDelete(grade)}
                          type="button"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setEditing(null);
            }
          }}
        >
          <section
            aria-labelledby="grade-form-title"
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">
                  {editing.id == null
                    ? "NUEVO REGISTRO"
                    : "ACTUALIZAR DATOS"}
                </p>
                <h3 id="grade-form-title">
                  {editing.id == null ? "Registrar nota" : "Editar nota"}
                </h3>
              </div>

              <button
                className="close-button"
                disabled={saving}
                onClick={() => setEditing(null)}
                aria-label="Cerrar"
                type="button"
              >
                ×
              </button>
            </div>

            <form className="resource-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="field field-wide">
                  <span>Inscripción *</span>
                  <select
                    disabled={
                      editing.id != null ||
                      saving ||
                      actionsDisabled
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        inscripcionId: event.target.value,
                      }))
                    }
                    required
                    value={form.inscripcionId}
                  >
                    <option value="">Selecciona una inscripción</option>
                    {enrollments.map((enrollment) => (
                      <option key={enrollment.id} value={enrollment.id}>
                        {enrollment.nombreEstudiante ||
                          enrollment.codigoEstudiante ||
                          `Estudiante ${enrollment.estudianteId ?? ""}`}{" "}
                        ·{" "}
                        {enrollment.nombreCurso ||
                          courseLabel(selectedCourse || {})}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Ciclo académico *</span>
                  <input
                    disabled={saving || actionsDisabled}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        cicloAcademico: event.target.value,
                      }))
                    }
                    placeholder="Ej. 2027-1"
                    required
                    value={form.cicloAcademico}
                  />
                </label>

                <label className="field">
                  <span>Zona *</span>
                  <input
                    disabled={saving || actionsDisabled}
                    max="100"
                    min="0"
                    onChange={(event) =>
                      setForm((current) => {
                        const next = {
                          ...current,
                          zona: event.target.value,
                        };

                        next.estado = calculateGradeState(
                          next.zona,
                          next.examenFinal,
                        );

                        return next;
                      })
                    }
                    required
                    step="any"
                    type="number"
                    value={form.zona}
                  />
                </label>

                <label className="field">
                  <span>Examen final *</span>
                  <input
                    disabled={saving || actionsDisabled}
                    max="100"
                    min="0"
                    onChange={(event) =>
                      setForm((current) => {
                        const next = {
                          ...current,
                          examenFinal: event.target.value,
                        };

                        next.estado = calculateGradeState(
                          next.zona,
                          next.examenFinal,
                        );

                        return next;
                      })
                    }
                    required
                    step="any"
                    type="number"
                    value={form.examenFinal}
                  />
                </label>

                <label className="field">
                  <span>Estado calculado</span>
                  <select disabled value={calculatedState}>
                    <option value="">Ingresa ambas notas</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="REPROBADO">Reprobado</option>
                  </select>
                </label>

                <label className="field">
                  <span>Fecha de registro</span>
                  <input
                    disabled={saving || actionsDisabled}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fechaRegistro: event.target.value,
                      }))
                    }
                    type="date"
                    value={form.fechaRegistro}
                  />
                </label>

                <label className="field field-checkbox">
                  <input
                    checked={Boolean(form.activo)}
                    disabled={saving || actionsDisabled}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        activo: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>Nota activa</span>
                </label>
              </div>

              {form.zona !== "" && form.examenFinal !== "" && (
                <p role="status">
                  Total calculado:{" "}
                  {Number(form.zona) + Number(form.examenFinal)} / 100
                </p>
              )}

              {error && (
                <p className="inline-error" role="alert">
                  {error}
                </p>
              )}

              <div className="modal-actions">
                <button
                  className="button button-quiet"
                  disabled={saving}
                  onClick={() => setEditing(null)}
                  type="button"
                >
                  Cancelar
                </button>

                <button
                  className="button button-primary"
                  disabled={saving || actionsDisabled}
                  type="submit"
                >
                  {saving
                    ? "Guardando…"
                    : editing.id == null
                      ? "Registrar nota"
                      : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
