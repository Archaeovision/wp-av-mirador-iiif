# Archaeovision Mirador IIIF Viewer

WordPress block plugin that embeds [IIIF](https://iiif.io/) manifests with the [Mirador](https://projectmirador.org/) viewer.

Requires WordPress 6.2+.

## Usage

Add the **Mirador IIIF Viewer** block (category *Media*) to a page and set a manifest URL, or leave it empty and pass the manifest in the page URL (see below).

Block settings: width, height, appearance (standard/compact), zoom controls, fullscreen button, sidebar, workspace panel, manifest link, accent colour.

### Showing a manifest via the page URL

A page that contains a Mirador block can show any manifest from our API by adding `?manifest=` to its URL. Create a page (e.g. slug `iiif`) with one Mirador block, manifest left empty:

```
https://archaeovision.eu/iiif/?manifest=linnahall
https://archaeovision.eu/iiif/?manifest=7ea88a1c-86e3-4ea5-9e1f-a8810dace5d8
https://archaeovision.eu/iiif/?manifest=https://api.archaeovision.eu/iiif/manifest/linnahall
```

- A bare UUID or slug (`A-Z a-z 0-9 - _`, up to 200 characters) is resolved to `https://api.archaeovision.eu/iiif/manifest/<value>`.
- A full URL is accepted only if it is `https` and its host is in the allow-list (default: `api.archaeovision.eu`). Anything else is ignored and the block shows its own manifest.
- The override is applied server-side (`render_block`) to **every** Mirador block on the page. All other block settings stay as configured.
- If the page cache ignores query strings, it may serve one manifest to every visitor. Make the cache vary on the query string.

Filters (in a theme or mu-plugin):

```php
// Allow more hosts for full-URL manifests.
add_filter( 'wp_av_mirador_allowed_manifest_hosts', fn( $hosts ) => array_merge( $hosts, array( 'example.org' ) ) );

// Change the base URL that a bare id/slug is appended to.
add_filter( 'wp_av_mirador_manifest_base_url', fn() => 'https://api.archaeovision.eu/iiif/manifest/' );
```

## Development

```
npm ci
npm run start      # wp-scripts watch build
npm run build      # build into build/
npm run package    # build, sync assets to the plugin root, create wp-av-mirador-iiif-<version>.zip
npm run test:e2e   # Playwright (see tests/README.md)
```

- The plugin loads `index.js`, `index.css` and `blocks/` from the **plugin root**, not from `build/`. `npm run package` copies them there and the root copies are tracked in git.
- The zip name comes from the `Version:` header in `wp-av-mirador-iiif.php`. That header is the source of truth for the release version; `package.json` is not kept in sync.
- The viewer uses the OpenSeadragon **canvas drawer** (`osdConfig.drawer: 'canvas'` in `src/components/MiradorWrapper.jsx`).

## Changelog

### 1.0.7
- `?manifest=` also accepts a bare UUID or slug, resolved against the API manifest base URL.

### 1.0.6
- New `?manifest=<https url>` page parameter that overrides the manifest of Mirador blocks. Only `https` URLs on allowed hosts (default `api.archaeovision.eu`).
- Requires WordPress 6.2+ (`WP_HTML_Tag_Processor`).

### 1.0.5
- Fix: viewer crashed in some Safari versions with `WebGL: context lost` and showed only the thumbnail ([#1](https://github.com/Archaeovision/wp-av-mirador-iiif/issues/1)). Mirador now uses the OpenSeadragon canvas drawer instead of WebGL. Confirmed by the reporter on Safari 26.1.
- Build: added the missing `@wordpress/browserslist-config` devDependency so a clean `npm install` / `npm ci` can run `npm run build` and `npm run package`.

### Earlier
- Inspector controls (sidebar, workspace panel, manifest link, accent colour) wired to real Mirador configuration.
