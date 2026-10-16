import { useEffect, useMemo, useState } from "react";
import {
  createResource,
  deleteResource,
  listResource,
  resourceConfig,
  restoreCourse,
  updateResource,
} from "../services/educationService.js";
import { getApiErrorMessage } from "../services/api.js";

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Activo" : "Inactivo";
  return String(value);
}

function recordLabel(record) {
  return (
    record.nombreCompleto ||
    [record.nombre, record.apellido].filter(Boolean).join(" ") ||
    record.nombre ||
    record.codigo ||
    record.carnet ||
    record.id
  );
}

function getFormValues(fields, record) {
  return Object.fromEntries(
    fields.map(({ name, type }) => {
      const value = record?.[name];
      if (type === "checkbox") return [name, value ?? true];
      if (type === "date" && typeof value === "string") return [name, value.slice(0, 10)];
      return [name, value ?? ""];
    }),
  );
}

function buildPayload(fields, values) {
  return Object.fromEntries(
    fields.map(({ name, type }) => {
      const value = values[name];
      if (type === "checkbox") return [name, Boolean(value)];
      if (type === "number" || type === "select") {
        return [name, value === "" ? null : Number(value)];
      }
      return [name, typeof value === "string" ? value.trim() : value];
    }),
  );
}

export default function ResourcePage({ resource }) {
  const config = resourceConfig[resource];
  const [records, setRecords] = useState([]);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});

  async function loadPage() {
    setLoading(true);
    setError("");
    try {
      const [items, ...lookupResults] = await Promise.all([
        listResource(resource),
        ...(config.lookups || []).map((lookup) => listResource(lookup)),
      ]);
      setRecords(items);
      setLookups(
        Object.fromEntries((config.lookups || []).map((key, index) => [key, lookupResults[index]])),
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditing(null);
    setValues({});
    setSearch("");
    loadPage();
  }, [resource]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return records;
    return records.filter((record) =>
      Object.values(record).some((value) => String(value ?? "").toLocaleLowerCase().includes(query)),
    );
  }, [records, search]);

  function startCreate() {
    setEditing({ id: null });
    setValues(getFormValues(config.fields));
    setError("");
    setNotice("");
  }

  function startEdit(record) {
    setEditing(record);
    setValues(getFormValues(config.fields, record));
    setError("");
    setNotice("");
  }

  function closeForm() {
    setEditing(null);
    setValues({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    const missing = config.fields.find(
      (field) => field.required && String(values[field.name] ?? "").trim() === "",
    );
    if (missing) {
      setError(`${missing.label} es obligatorio.`);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(config.fields, values);
      if (editing.id == null) {
        await createResource(resource, payload);
        setNotice(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} creado correctamente.`);
      } else {
        await updateResource(resource, editing.id, payload);
        setNotice(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} actualizado correctamente.`);
      }
      closeForm();
      await loadPage();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record) {
    const label = recordLabel(record);
    if (!window.confirm(`¿Eliminar "${label}"? Esta acción se enviará al servidor.`)) return;
    setError("");
    setNotice("");
    try {
      await deleteResource(resource, record.id);
      setNotice(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} eliminado correctamente.`);
      await loadPage();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  async function handleRestore(record) {
    setError("");
    setNotice("");
    try {
      await restoreCourse(record.id);
      setNotice("Curso reactivado correctamente.");
      await loadPage();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h2>{config.title}</h2>
          <p>Administra los registros del centro educativo.</p>
        </div>
        <button className="button button-primary" onClick={startCreate}>
          <span aria-hidden="true">＋</span> Nueva {config.singular}
        </button>
      </div>

      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Listado de {config.title.toLocaleLowerCase()}</h3>
            <p>{records.length} {records.length === 1 ? "registro" : "registros"}</p>
          </div>
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Buscar ${config.title.toLocaleLowerCase()}…`}
              value={search}
            />
          </label>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner" /> Cargando {config.title.toLocaleLowerCase()}…</div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">⌕</span>
            <strong>{records.length ? "No hay coincidencias" : "Aún no hay registros"}</strong>
            <span>{records.length ? "Prueba con otro término de búsqueda." : "Crea el primer registro para comenzar."}</span>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column}>{columnLabel(column)}</th>
                  ))}
                  <th className="actions-heading">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    {config.columns.map((column) => (
                      <td key={column}>
                        {column === "activo" ? (
                          <span className={`status-pill ${record.activo === false ? "status-inactive" : "status-active"}`}>
                            {record.activo === false ? "Inactivo" : "Activo"}
                          </span>
                        ) : (
                          displayValue(record[column])
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="row-actions">
                        <button className="icon-button" onClick={() => startEdit(record)} title="Editar" aria-label={`Editar ${recordLabel(record)}`}>
                          Editar
                        </button>
                        {resource === "cursos" && record.activo === false ? (
                          <button className="icon-button icon-button-success" onClick={() => handleRestore(record)} title="Reactivar curso">
                            Reactivar
                          </button>
                        ) : (
                          <button className="icon-button icon-button-danger" onClick={() => handleDelete(record)} title="Eliminar" aria-label={`Eliminar ${recordLabel(record)}`}>
                            Eliminar
                          </button>
                        )}
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
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}>
          <section aria-labelledby="resource-form-title" aria-modal="true" className="modal-card" role="dialog">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{editing.id == null ? "NUEVO REGISTRO" : "ACTUALIZAR DATOS"}</p>
                <h3 id="resource-form-title">{editing.id == null ? `Nueva ${config.singular}` : `Editar ${config.singular}`}</h3>
              </div>
              <button className="close-button" onClick={closeForm} aria-label="Cerrar">×</button>
            </div>
            <form className="resource-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {config.fields.map((field) => (
                  <label className={`field ${field.type === "checkbox" ? "field-checkbox" : ""}`} key={field.name}>
                    {field.type === "checkbox" ? (
                      <>
                        <input
                          checked={Boolean(values[field.name])}
                          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                          type="checkbox"
                        />
                        <span>{field.label}</span>
                      </>
                    ) : (
                      <>
                        <span>{field.label}{field.required && <b className="required-mark"> *</b>}</span>
                        {field.type === "select" ? (
                          <select
                            onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                            required={field.required}
                            value={values[field.name] ?? ""}
                          >
                            <option value="">Selecciona una opción</option>
                            {(lookups[field.lookup] || []).map((option) => (
                              <option key={option.id} value={option.id}>{recordLabel(option)}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            max={field.max}
                            min={field.min}
                            onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                            required={field.required}
                            type={field.type || "text"}
                            value={values[field.name] ?? ""}
                          />
                        )}
                      </>
                    )}
                  </label>
                ))}
              </div>
              {error && <p className="inline-error" role="alert">{error}</p>}
              <div className="modal-actions">
                <button className="button button-quiet" onClick={closeForm} type="button">Cancelar</button>
                <button className="button button-primary" disabled={saving} type="submit">
                  {saving ? "Guardando…" : editing.id == null ? "Crear registro" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

function columnLabel(column) {
  const labels = {
    codigoEstudiante: "Código",
    carnet: "Carné",
    nombre: "Nombre",
    apellido: "Apellido",
    email: "Correo",
    emailInstitucional: "Correo institucional",
    especialidad: "Especialidad",
    creditos: "Créditos",
    carreraNombre: "Carrera",
    docenteNombre: "Docente",
    nombreEstudiante: "Estudiante",
    nombreCurso: "Curso",
    fechaInscripcion: "Fecha de inscripción",
    activo: "Estado",
  };
  return labels[column] || column;
}
