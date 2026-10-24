import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

test("Mis cursos renders assigned courses for teachers and enrollments for students", async () => {
  const vite = await createServer({
    appType: "custom",
    configFile: false,
    logLevel: "silent",
    plugins: [react()],
    server: { hmr: { port: 24680 }, middlewareMode: true },
  });

  try {
    const { default: PersonalPage } = await vite.ssrLoadModule(
      "/src/components/PersonalPage.jsx",
    );
    const teacherMarkup = renderToStaticMarkup(
      React.createElement(PersonalPage, { section: "mis-cursos", role: "DOCENTE" }),
    );
    const studentMarkup = renderToStaticMarkup(
      React.createElement(PersonalPage, { section: "mis-cursos", role: "ESTUDIANTE" }),
    );

    assert.match(teacherMarkup, /Consulta los cursos que tienes asignados/);
    assert.match(studentMarkup, /Consulta tus cursos e inscripciones activas/);
  } finally {
    await vite.close();
  }
});
