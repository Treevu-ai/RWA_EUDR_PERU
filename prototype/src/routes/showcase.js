import { Router } from "express";

export const showcaseRouter = Router();

const page = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ForestTrace Prototype Showcase</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #0b1220; color: #e5e7eb; }
      .wrap { max-width: 880px; margin: 0 auto; padding: 32px 20px; }
      h1 { margin: 0 0 12px; font-size: 28px; }
      p { color: #cbd5e1; line-height: 1.5; }
      .card { background: #111827; border: 1px solid #334155; border-radius: 10px; padding: 18px; margin-top: 14px; }
      .row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
      a.btn { display: inline-block; text-decoration: none; background: #2563eb; color: white; padding: 10px 14px; border-radius: 8px; font-weight: 600; }
      a.btn.alt { background: #475569; }
      code { background: #1f2937; border-radius: 6px; padding: 2px 6px; color: #f8fafc; }
      ul { margin-top: 8px; }
      li { margin-bottom: 6px; color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>ForestTrace AI - Prototype Showcase</h1>
      <p>Demo funcional para mostrar flujo EUDR: ingesta, scoring v1, reporte PDF, simulacion financiera y API enterprise.</p>

      <div class="card">
        <strong>Landing comercial</strong>
        <div class="row">
          <a class="btn" href="https://landing-five-teal-76-eta.vercel.app" target="_blank" rel="noreferrer">Abrir landing</a>
        </div>
      </div>

      <div class="card">
        <strong>Prototype API (demo tecnica)</strong>
        <ul>
          <li>API docs: <code>/api/docs</code></li>
          <li>Metricas: <code>/api/metrics</code></li>
          <li>Health: <code>/api/health</code></li>
        </ul>
        <div class="row">
          <a class="btn" href="/api/docs" target="_blank" rel="noreferrer">Ver API docs</a>
          <a class="btn alt" href="/api/metrics" target="_blank" rel="noreferrer">Ver metricas</a>
          <a class="btn alt" href="/api/health" target="_blank" rel="noreferrer">Ver health</a>
        </div>
      </div>

      <div class="card">
        <strong>Nota de estado</strong>
        <p>El backend esta desplegado y estable. Los endpoints que escriben/leen datos operan en modo degradado hasta configurar <code>DATABASE_URL</code> en Vercel.</p>
      </div>
    </div>
  </body>
</html>`;

showcaseRouter.get("/", (_req, res) => {
  res.status(200).type("html").send(page);
});

