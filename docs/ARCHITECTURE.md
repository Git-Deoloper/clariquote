# Architecture

Clariquote deliberately keeps its first version small and inspectable.

```text
Browser tab
  ├── HTML + CSS: responsive editor and print-friendly preview
  ├── src/app.mjs: browser events, forms, import/export, DOM rendering
  └── src/model.mjs: pure calculations, validation, formatting, Markdown

Optional static host
  └── serves files only; receives no proposal data
```

## Trust boundaries

- **Untrusted inputs:** imported JSON and all fields entered by the user. The JSON parser checks root type, version, item count, numeric ranges and text lengths. User-supplied content enters the DOM through `textContent`.
- **Exports:** the document can be printed to PDF in the browser, copied/downloaded as Markdown, or downloaded as editable JSON. All actions are user-triggered and stay local unless the user chooses a destination.
- **No back end:** no upload endpoint, database, external analytics, AI provider, or hidden third-party assets.
- **Hosting:** HTML/CSS/JS/SVG assets are still requested from a static host. That host may collect ordinary access metadata; it does not receive form content from the app.

## Constraints

- Source uses browser ES modules and modern DOM APIs; serve over HTTP(S), not `file://`.
- PDF uses browser printing, so page breaks depend on browser versions and content length.
- No automatic saving is implemented: if the tab closes, the unsaved proposal is lost.
- Dependency-free source allows local inspection and very lightweight delivery, but limits advanced PDF pagination and third-party integrations.

## Quality gates

`npm run verify` runs syntax checks, Node.js tests, and a production static build. Additional real-browser tests before each public deployment should exercise: edit → export JSON → import → print and mobile/keyboard navigation.
