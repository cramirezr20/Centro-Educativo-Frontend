import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";
import { paginateRecords, settleLookups } from "../src/utils/resourcePageUtils.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resourcePageSource = fs.readFileSync(
  path.join(projectRoot, "src", "components", "ResourcePage.jsx"),
  "utf8",
);
const appSource = fs.readFileSync(path.join(projectRoot, "src", "App.jsx"), "utf8");
const stylesheet = fs.readFileSync(path.join(projectRoot, "src", "index.css"), "utf8");

test("ResourcePage renders the primary listing before data arrives", async () => {
  const vite = await createServer({
    appType: "custom",
    configFile: false,
    logLevel: "silent",
    plugins: [react()],
    root: projectRoot,
    server: { hmr: { port: 24679 }, middlewareMode: true },
  });

  try {
    const { default: ResourcePage } = await vite.ssrLoadModule(
      "/src/components/ResourcePage.jsx",
    );
    const markup = renderToStaticMarkup(
      React.createElement(ResourcePage, { resource: "cursos" }),
    );

    assert.match(markup, /Listado de cursos/);
    assert.match(markup, /Cargando cursos/);
    assert.match(markup, /aria-label="Buscar cursos"/);
  } finally {
    await vite.close();
  }
});

test("ResourcePage keeps the main listing independent from auxiliary catalogs", () => {
  assert.match(resourcePageSource, /Promise\.allSettled/);
  assert.match(resourcePageSource, /itemsResult\.status === "rejected"/);
  assert.match(resourcePageSource, /setRecords\(itemsResult\.value\)/);
  assert.match(resourcePageSource, /role="status"/);
});

test("catalog failures stay separate from successful lookup data", () => {
  const failedRequest = new Error("Catálogo no disponible");
  const result = settleLookups(
    ["docentes", "carreras"],
    [
      { status: "fulfilled", value: [{ id: 1, nombre: "Ana" }] },
      { status: "rejected", reason: failedRequest },
    ],
  );

  assert.deepEqual(result.values, { docentes: [{ id: 1, nombre: "Ana" }] });
  assert.deepEqual(result.errors, { carreras: failedRequest });
});

test("pagination bounds the rendered list and clamps invalid pages", () => {
  const records = Array.from({ length: 61 }, (_, index) => index + 1);
  const secondPage = paginateRecords(records, 2, 25);
  assert.equal(secondPage.pageCount, 3);
  assert.equal(secondPage.startIndex, 26);
  assert.equal(secondPage.endIndex, 50);
  assert.deepEqual(secondPage.items, records.slice(25, 50));

  const lastPage = paginateRecords(records, 99, 25);
  assert.equal(lastPage.currentPage, 3);
  assert.equal(lastPage.items.length, 11);
});

test("pagination represents an empty list without invalid ranges", () => {
  assert.deepEqual(paginateRecords([], 1, 25), {
    currentPage: 1,
    pageCount: 1,
    items: [],
    startIndex: 0,
    endIndex: 0,
  });
});

test("ResourcePage provides keyboard dialog handling and bounded page rendering", () => {
  assert.match(resourcePageSource, /event\.key === "Escape"/);
  assert.match(resourcePageSource, /event\.key !== "Tab"/);
  assert.match(resourcePageSource, /aria-modal="true"/);
  assert.match(resourcePageSource, /pageRecords\.map/);
  assert.match(resourcePageSource, /aria-label="Paginación de registros"/);
});

test("App supports section back navigation and a keyboard-accessible mobile menu", () => {
  assert.match(appSource, /function goBack\(\)/);
  assert.match(appSource, /aria-controls="primary-navigation"/);
  assert.match(appSource, /aria-expanded={mobileMenuOpen}/);
  assert.match(appSource, /inert={isMobileViewport && !mobileMenuOpen}/);
  assert.match(appSource, /event\.key === "Escape"/);
  assert.match(stylesheet, /\.sidebar \{[^}]*overflow-y: auto/s);
});
