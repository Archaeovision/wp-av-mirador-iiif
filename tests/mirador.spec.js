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

  expect(pageErrors).toEqual([]);
});
