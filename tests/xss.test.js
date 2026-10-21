import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

test("session username is escaped in the rendered portal", async () => {
  const server = await createServer({ configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: "custom" });
  try {
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const token = `${encode({ alg: "HS256" })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;
    const username = "<img src=x onerror=alert(1)>";
    globalThis.localStorage = {
      getItem: () => JSON.stringify({ token, role: "ADMIN", username }),
    };

    const html = renderToStaticMarkup(createElement(App));
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
    assert.doesNotMatch(html, /<img src=x onerror=/);
  } finally {
    await server.close();
    delete globalThis.localStorage;
  }
});

test("entry page and components contain no active HTML injection sinks", () => {
  for (const file of ["index.html", "src/App.jsx", "src/components/LoginPage.jsx", "src/components/ResourcePage.jsx", "src/components/PersonalPage.jsx"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|\beval\s*\(|new Function\s*\(/, file);
  }
});
