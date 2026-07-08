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

### Testing block settings via query-string parameterization

The fixture's `data-*` attributes are hardcoded, so by default it only
exercises the block's default settings. To test non-default settings against
this same fixture/manifest (rather than maintaining several near-duplicate
fixture files), `tests/fixtures/mirador.html` has an inline `<script>` that
runs before `build/index.js` and copies query-string params onto the
`.wp-av-mirador-iiif-viewer` div's `data-*` attributes before
`DOMContentLoaded` fires (when `initFrontend()` reads them). With no query
params, behavior is unchanged from the default-settings test.

Supported params and the block setting each maps to:

| Query param       | `data-*` attribute      | Block setting                  |
|-------------------|---------------------------|---------------------------------|
| `fullscreen`      | `data-fullscreen`         | Show Fullscreen Button          |
| `sidebar`         | `data-sidebar`            | Show Sidebar                    |
| `workspace-panel` | `data-workspace-panel`    | Show Workspace Panel            |
| `manifest-link`   | `data-manifest-link`      | Show Manifest Link              |
| `appearance`      | `data-appearance`         | Appearance (standard/compact)   |
| `zoom`            | `data-zoom-controls`      | Show Zoom Controls              |
| `accent-color`    | `data-accent-color`       | Accent Color (color picker)     |

`showManifestLink` isn't a plain Mirador config flag — Mirador always
renders a link to the raw manifest JSON in the sidebar's "Related" section
whenever a manifest loads (`ManifestRelatedLinks.jsx`), with no built-in
toggle. `MiradorWrapper.jsx` suppresses it via a small Mirador plugin
(`mode: 'wrap'`, `target: 'ManifestRelatedLinks'`) that drops the
`manifestUrl` prop, and skips rendering the whole "Related" section if
nothing else (`homepage`/`renderings`/`related`/`seeAlso`) is left to show —
otherwise toggling this off would leave an empty "Related" header behind for
manifests (like the test fixture's) that have no other related links.

Note: "Show Sidebar" and "Show Workspace Panel" control two visually
distinct pieces of Mirador chrome — `showSidebar` (`window.allowWindowSideBar`)
toggles the per-window info/canvas/annotations drawer and its hamburger
button; `showWorkspacePanel` (`workspaceControlPanel.enabled`) toggles the
narrow persistent left-edge strip (add-resource "+", jump-to-window,
workspace settings, workspace options). They're independent — disabling one
doesn't affect the other. The workspace-level "Full screen" button
(`WorkspaceControlPanelButtons`, always rendered by Mirador regardless of
`window.allowFullscreen`) lives inside the workspace panel, so it's only
removable by disabling `showWorkspacePanel`, not `showFullscreenButton`.

Example: `mirador.html?appearance=compact&accent-color=%23ff0000`.

The counts asserted in these tests (e.g. the "Full screen" button count of 2
at baseline, dropping to 1 when `showFullscreenButton` is off) were measured
directly against a real render, not assumed — Mirador renders one
workspace-level "Full screen" button unrelated to any block setting, plus
one per-window "Full screen" button gated by `window.allowFullscreen`, so
disabling the block setting removes only the second one. If you add a new
parameterized test, verify the expected count the same way (run headed, or
evaluate `getByRole('button', ...).count()`) rather than guessing.

These tests only cover the **frontend** runtime path (`initFrontend`
reading `data-*` attributes and mounting `MiradorWrapper`). The equivalent
editor-side Inspector Controls (the "Show Sidebar" toggle and "Accent Color"
picker in `edit.js`) aren't covered here, since the fixture's `window.wp`
stub is a permissive no-op Proxy — it only needs the frontend init path to
run without `registerBlockType()` throwing, it doesn't implement real
`@wordpress/block-editor` components. Verifying the editor UI itself
requires a real WordPress install.

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
