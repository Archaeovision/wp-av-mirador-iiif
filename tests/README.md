# Testing

## Running the tests

```bash
npm run test:e2e
```

This rebuilds the plugin (`npm run build`) and then runs the Playwright suite
against the compiled bundle. To run Playwright directly without rebuilding
(e.g. while iterating on `tests/`, not on plugin source):

```bash
npx playwright test
npx playwright test --headed   # watch it run in a real browser window
npx playwright test --debug    # step through with the inspector
```

`playwright.config.js` starts a static file server (`python3 -m http.server
8791`) rooted at the project directory and points tests at it, so any file
under the project (fixtures, `build/`, `node_modules/`) is reachable by
relative URL.

## What this actually tests

There is no WordPress instance here — no `wp-env`, no database. Setting one
up (via `@wordpress/scripts test-e2e` + `wp-env`, which needs Docker) would
let us test inside a real Gutenberg editor and a real WP frontend, but is a
much heavier lift than what we need day-to-day. Until that's worth doing,
`tests/fixtures/mirador.html` is a **hand-built stand-in for a WordPress
page**: it loads the real compiled `build/index.js` and a real IIIF manifest,
but fakes the two WordPress-provided globals the bundle expects at runtime:

- `window.wp` — real WP pages expose `wp.blocks`, `wp.components`,
  `wp.i18n`, etc. as globals (that's what `@wordpress/*` imports compile down
  to via `DependencyExtractionWebpackPlugin`). The fixture stubs this with a
  permissive `Proxy` that returns a harmless no-op for any property access,
  so `registerBlockType(...)` doesn't throw. It does **not** implement real
  editor components — if a test ever needs to exercise the block-editor
  `Edit` UI (not just the frontend viewer), this stub isn't enough.
- `window.ReactJSXRuntime` — WordPress ships this as
  `wp-includes/js/dist/vendor/react-jsx-runtime.js`. The fixture reimplements
  it for real (`jsx`/`jsxs`/`Fragment` backed by `window.React.createElement`),
  since JSX needs to actually produce elements, not just avoid throwing.

If you see a new `Cannot read properties of undefined (reading 'X')` error
when running against a fresh build, it's almost always a third WP global the
bundle now depends on (check `build/index.asset.php`'s `dependencies` array
for what changed) — add a stub/shim for it in the fixture the same way.

The fixture calls out to the **live** manifest endpoint
(`https://uuringud.notke.eu/api/directus-manifest-dynamic/linnahall`), so the
test is an integration check against the real Notke API too, not just the
plugin bundle in isolation. If it starts failing, check that endpoint first.

## What the test asserts

`tests/mirador.spec.js` checks:
- A `<canvas>` (the OpenSeadragon image surface) becomes visible inside the
  `.mirador-container` div MiradorWrapper renders.
- The "Zoom in" toolbar button is visible (proof Mirador's UI mounted, not
  just an empty container).
- No uncaught `pageerror` events fired.

It deliberately does **not** assert on manifest-specific content (titles,
image content) — that would make the test fragile to editorial changes in
the Notke manifest, not to plugin bugs.

## Known benign noise

Mirador's own bundled code emits a React dev-mode warning:

```
Warning: Each child in a list should have a unique "key" prop.
```

This comes from inside `mirador`'s components, not from this plugin's code.
It's not asserted on and can be ignored.

## Debugging a failure

1. Run headed to see it visually: `npx playwright test --headed`.
2. Or open the HTML report after a run: `npx playwright show-report`.
3. Or open `tests/fixtures/mirador.html` directly via the dev server
   (`python3 -m http.server 8791` from the project root, then visit
   `http://127.0.0.1:8791/tests/fixtures/mirador.html`) and check the
   browser console by hand.
