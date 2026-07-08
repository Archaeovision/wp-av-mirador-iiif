const { test, expect } = require('@playwright/test');

// Standalone smoke test for the Mirador viewer integration (MiradorWrapper).
// Mounts the real compiled frontend bundle (build/index.js) against a real
// IIIF manifest, in
// a minimal page that stubs the WordPress globals (`window.wp`,
// `window.ReactJSXRuntime`) the bundle expects at runtime. See
// tests/fixtures/mirador.html and tests/README.md for why those stubs exist.
test('Mirador viewer renders a IIIF manifest', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('/tests/fixtures/mirador.html');

  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
  // window.allowClose is hardcoded off in MiradorWrapper.jsx (not a block
  // setting) since closing the single embedded window is never useful.
  await expect(page.getByRole('button', { name: 'Close window' })).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});

// The following tests exercise the block's Inspector Controls settings by
// parameterizing tests/fixtures/mirador.html via query string (see the
// fixture's inline bootstrap script and tests/README.md). Counts below were
// verified directly against a real render rather than assumed: Mirador
// always renders one workspace-level "Full screen" button (unrelated to any
// block setting) plus one per-window "Full screen" button gated by
// showFullscreenButton, so the baseline count is 2, not 1.

test('fullscreen button hidden when showFullscreenButton is false', async ({ page }) => {
  await page.goto('/tests/fixtures/mirador.html?fullscreen=false');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Full screen' })).toHaveCount(1); // workspace-level button only
});

test('sidebar toggle hidden when showSidebar is false', async ({ page }) => {
  await page.goto('/tests/fixtures/mirador.html?sidebar=false');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Show sidebar' })).toHaveCount(0);
});

test('manifest link hidden when showManifestLink is false', async ({ page }) => {
  await page.goto('/tests/fixtures/mirador.html');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  // baseline: this manifest has no homepage/renderings/related/seeAlso, so
  // the only "Related" panel content is the manifest link itself.
  await expect(page.locator('.mirador-container a[href*="directus-manifest-dynamic"]')).toHaveCount(1);

  await page.goto('/tests/fixtures/mirador.html?manifest-link=false');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.mirador-container a[href*="directus-manifest-dynamic"]')).toHaveCount(0);
  // with no other related metadata, the whole "Related" section should be
  // suppressed too, not left behind empty.
  await expect(page.getByRole('button', { name: /Related.*section/i })).toHaveCount(0);
});

test('workspace panel hidden when showWorkspacePanel is false', async ({ page }) => {
  await page.goto('/tests/fixtures/mirador.html?workspace-panel=false');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Add resource' })).toHaveCount(0);
  // The workspace-level "Full screen" button (WorkspaceControlPanelButtons,
  // unrelated to window.allowFullscreen) lives inside this same panel, so
  // hiding the panel also removes it, leaving only the per-window one.
  await expect(page.getByRole('button', { name: 'Full screen' })).toHaveCount(1);
});

test('compact appearance hides window title and top menu button', async ({ page }) => {
  await page.goto('/tests/fixtures/mirador.html?appearance=compact');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Window views & thumbnail display' })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
});

test('standard appearance keeps window title and top menu button', async ({ page }) => {
  await page.goto('/tests/fixtures/mirador.html?appearance=standard');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Window views & thumbnail display' })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(1);
});

test('zoom controls hidden when showZoomControls is false', async ({ page }) => {
  await page.goto('/tests/fixtures/mirador.html?zoom=false');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Zoom in' })).toHaveCount(0);
});

test('accent color retheme applies to Mirador chrome', async ({ page }) => {
  await page.goto('/tests/fixtures/mirador.html?accent-color=%23ff0000');
  await expect(page.locator('.mirador-container canvas').first()).toBeVisible({ timeout: 15_000 });
  const addButton = page.getByRole('button', { name: 'Add resource' });
  await expect(addButton).toBeVisible();
  await expect(addButton).toHaveCSS('background-color', 'rgb(255, 0, 0)');
});
