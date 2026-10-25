import { useEffect, useMemo, useRef, useState } from "react";
import logo from "./assets/centro-educativo-logo.svg";
import LoginPage from "./components/LoginPage.jsx";
import PersonalPage from "./components/PersonalPage.jsx";
import ResourcePage from "./components/ResourcePage.jsx";
import { clearSession, readSession, roleLabel } from "./utils/auth.js";

const navByRole = {
  ADMIN: [
    { id: "inicio", label: "Resumen", icon: "⌂", group: "GENERAL" },
    { id: "estudiantes", label: "Estudiantes", icon: "♧", group: "GESTIÓN" },
    { id: "docentes", label: "Docentes", icon: "♙", group: "GESTIÓN" },
    { id: "carreras", label: "Carreras", icon: "◇", group: "GESTIÓN" },
    { id: "cursos", label: "Cursos", icon: "▤", group: "GESTIÓN" },
    { id: "inscripciones", label: "Inscripciones", icon: "▧", group: "GESTIÓN" },
  ],
  DOCENTE: [
    { id: "inicio", label: "Resumen", icon: "⌂", group: "GENERAL" },
    { id: "mis-cursos", label: "Mis cursos", icon: "▤", group: "ACADÉMICO" },
    { id: "notas", label: "Notas", icon: "▧", group: "ACADÉMICO" },
  ],
  ESTUDIANTE: [
    { id: "inicio", label: "Resumen", icon: "⌂", group: "GENERAL" },
    { id: "mis-cursos", label: "Mis cursos", icon: "▤", group: "ACADÉMICO" },
    { id: "mis-notas", label: "Mis notas", icon: "▧", group: "ACADÉMICO" },
  ],
};

const moduleDescriptions = {
  estudiantes: "Administra los expedientes de estudiantes.",
  docentes: "Mantén actualizada la información del equipo docente.",
  carreras: "Organiza la oferta académica del centro.",
  cursos: "Gestiona cursos, docentes asignados y carreras.",
  inscripciones: "Consulta y administra las inscripciones a cursos.",
  "mis-cursos": "Consulta los cursos disponibles para tu perfil.",
  "mis-notas": "Revisa tus resultados académicos.",
  notas: "Administra las calificaciones de tus cursos.",
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const [activeSection, setActiveSection] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectionHistory, setSectionHistory] = useState([]);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const mobileMenuOpenerRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    function updateViewport() {
      setIsMobileViewport(window.matchMedia("(max-width: 760px)").matches);
    }
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      if (mobileMenuOpenerRef.current?.isConnected) mobileMenuOpenerRef.current.focus();
      return undefined;
    }

    sidebarRef.current?.querySelector(".sidebar-close")?.focus();
    function handleMenuKeyDown(event) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", handleMenuKeyDown);
    return () => window.removeEventListener("keydown", handleMenuKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleExpiredSession() {
      clearSession();
      setSession(null);
      setActiveSection("inicio");
      setSectionHistory([]);
      setMobileMenuOpen(false);
    }
    window.addEventListener("centro-educativo:session-expired", handleExpiredSession);
    return () => window.removeEventListener("centro-educativo:session-expired", handleExpiredSession);
  }, []);

  const navigation = useMemo(() => navByRole[session?.role] || [], [session?.role]);

  function signOut() {
    clearSession();
    setSession(null);
    setActiveSection("inicio");
    setSectionHistory([]);
    setMobileMenuOpen(false);
  }

  function selectSection(section) {
    if (section !== activeSection) {
      setSectionHistory((history) => [...history, activeSection]);
    }
    setActiveSection(section);
    setMobileMenuOpen(false);
  }

  function goBack() {
    if (!sectionHistory.length) return;
    setActiveSection(sectionHistory[sectionHistory.length - 1]);
    setSectionHistory((history) => history.slice(0, -1));
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  if (!session) return <LoginPage onLogin={(nextSession) => {
    setSession(nextSession);
    setActiveSection("inicio");
    setSectionHistory([]);
  }} />;

  const currentItem = navigation.find((item) => item.id === activeSection);
  const currentTitle = currentItem?.label || "Acceso restringido";

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button aria-label="Cerrar menú" className="mobile-menu-backdrop" onClick={closeMobileMenu} />}
      <aside
        className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}
        inert={isMobileViewport && !mobileMenuOpen}
        ref={sidebarRef}
      >
        <div className="sidebar-brand">
          <div className="brand-mark"><img alt="" src={logo} /></div>
          <div className="brand-copy"><strong>Centro Educativo</strong><span>Portal académico</span></div>
          <button className="sidebar-close" onClick={closeMobileMenu} aria-label="Cerrar menú">×</button>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">{(session.username || "U").slice(0, 1).toUpperCase()}</div>
          <div className="profile-copy"><strong>{session.username || "Usuario"}</strong><span>{roleLabel(session.role)}</span></div>
          <span className="online-dot" title="Sesión activa" />
        </div>

        <nav className="sidebar-nav" id="primary-navigation" aria-label="Navegación principal">
          {navigation.map((item, index) => (
            <div key={item.id}>
              {(index === 0 || navigation[index - 1].group !== item.group) && <p className="nav-group">{item.group}</p>}
              <button
                aria-current={activeSection === item.id ? "page" : undefined}
                className={`nav-item ${activeSection === item.id ? "nav-item-active" : ""}`}
                onClick={() => selectSection(item.id)}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                {activeSection === item.id && <span className="nav-active-indicator" />}
              </button>
            </div>
          ))}
          {!navigation.length && <p className="no-permission">Tu cuenta no tiene un rol reconocido para mostrar módulos.</p>}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card"><span aria-hidden="true">✦</span><div><strong>¿Necesitas ayuda?</strong><p>Contacta al equipo académico.</p></div></div>
          <button className="signout-button" onClick={signOut}><span aria-hidden="true">↪</span> Cerrar sesión</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            aria-controls="primary-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label="Abrir menú"
            className="mobile-menu-button"
            onClick={(event) => {
              mobileMenuOpenerRef.current = event.currentTarget;
              setMobileMenuOpen(true);
            }}
          >
            ☰
          </button>
          <button
            aria-label="Regresar a la sección anterior"
            className="back-button"
            disabled={!sectionHistory.length}
            onClick={goBack}
            type="button"
          >
            <span aria-hidden="true">←</span> Atrás
          </button>
          <div className="breadcrumb"><span>Portal</span><span className="breadcrumb-separator">/</span><strong>{currentTitle}</strong></div>
          <div className="topbar-right">
            <span className="topbar-date">{new Intl.DateTimeFormat("es-GT", { dateStyle: "medium" }).format(new Date())}</span>
            <div className="topbar-avatar">{(session.username || "U").slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <div className="main-content">
          {activeSection === "inicio" ? (
            <section className="page-content overview-page">
              <div className="welcome-banner">
                <div>
                  <p className="eyebrow">PORTAL ACADÉMICO · {roleLabel(session.role).toUpperCase()}</p>
                  <h1>{greeting()}, {session.username || "bienvenido"}.</h1>
                  <p>Todo lo que necesitas para tu jornada académica, en un solo lugar.</p>
                </div>
                <div className="welcome-art" aria-hidden="true"><div className="art-book">✦</div><span className="art-dot dot-a" /><span className="art-dot dot-b" /><span className="art-dot dot-c" /></div>
              </div>

              {navigation.length ? (
                <>
                  <div className="section-intro"><div><p className="eyebrow">ACCESOS RÁPIDOS</p><h2>¿Qué deseas hacer?</h2></div></div>
                  <div className="module-grid">
                    {navigation.filter((item) => item.id !== "inicio").map((item, index) => (
                      <button className="module-card" key={item.id} onClick={() => selectSection(item.id)}>
                        <span className={`module-icon module-icon-${index % 4}`} aria-hidden="true">{item.icon}</span>
                        <span className="module-card-copy"><strong>{item.label}</strong><span>{moduleDescriptions[item.id]}</span></span>
                        <span className="module-arrow" aria-hidden="true">↗</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="alert alert-error">No hay opciones disponibles para el rol recibido. Cierra sesión y consulta con administración.</div>
              )}
              <div className="overview-note"><span className="note-icon" aria-hidden="true">✦</span><p><strong>Tu espacio académico</strong><br />La información y las herramientas visibles dependen de tu perfil institucional.</p></div>
            </section>
          ) : resourceSection(activeSection) ? (
            <ResourcePage key={activeSection} resource={activeSection} />
          ) : navigation.some((item) => item.id === activeSection) ? (
            <PersonalPage key={`${session.role}-${activeSection}`} section={activeSection} role={session.role} />
          ) : (
            <section className="page-content"><div className="alert alert-error">Tu rol no tiene acceso a esta sección.</div></section>
          )}
          <footer className="app-footer"><span>© {new Date().getFullYear()} Centro Educativo</span><span>Portal de gestión académica</span></footer>
        </div>
      </main>
    </div>
  );
}

function resourceSection(section) {
  return ["carreras", "estudiantes", "docentes", "cursos", "inscripciones"].includes(section);
}
