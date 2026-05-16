# Exportar documentación a PDF u otros formatos

Útil para **anexos en convocatorias**, sobres físicos o envíos por plataforma que piden PDF.

## Opción A — Visualizar en GitHub e imprimir

1. Abre el `.md` en GitHub (renderizado).
2. Navegador: **Ctrl+P** → destino **Guardar como PDF**.
3. En Chrome/Edge revisa márgenes y escala (~100%).

Ventaja: sin herramientas extra. Limitación: poca control sobre tabla de contenidos automática.

## Opción B — Pandoc (control profesional)

Si tienes [Pandoc](https://pandoc.org/) instalado:

```bash
pandoc docs/executive_summary.md -o borrador-resumen.pdf --pdf-engine=xelatex -V lang=es
```

Sin LaTeX local, puedes generar HTML y luego imprimir a PDF:

```bash
pandoc docs/overview.md -o borrador-overview.html --standalone --metadata title="RWA EUDR"
```

## Opción C — VS Code / Cursor

- Extensiones tipo **Markdown PDF** o **Print** sobre el archivo abierto.
- Revisa que las tablas largas no se corten mal (reduce fuente o divide secciones).

## Paquete para una postulación

Suele incluirse:

| Pieza | Origen típico en este repo |
|-------|---------------------------|
| Resumen ejecutivo | `docs/executive_summary.md` |
| Descripción técnica | `docs/overview.md` + `docs/propuesta_integral.md` (extractos) |
| Requisitos / marco | `docs/requirements.md` (adaptar longitud) |
| Cronograma | `docs/roadmap.md` |
| Nota conceptual | `docs/convocatorias/plantilla-nota-conceptual.md` (rellenada) |

Renombra los PDF según el pliego (`Anexo_A_resumen.pdf`, etc.).
