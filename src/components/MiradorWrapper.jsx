import React, { useEffect, useId, useState } from 'react';
import Mirador from 'mirador';

// Mirador has no config flag for the manifest-URL link in the sidebar's
// "Related" section (WindowSideBarInfoPanel > ManifestRelatedLinks) — it's
// always shown whenever a manifest loads, unlike homepage/seeAlso/renderings
// which are conditional on manifest metadata. Suppressing it needs a plugin
// that wraps that component and drops the `manifestUrl` prop; if nothing
// else in the section has content either, skip rendering the section too so
// toggling this off doesn't leave behind an empty "Related" panel.
function manifestLinkPlugin(showManifestLink) {
  return {
    component: function ManifestLinkVisibility({ TargetComponent, targetProps }) {
      if (showManifestLink) {
        return <TargetComponent {...targetProps} />;
      }
      const { homepage, related, renderings, seeAlso } = targetProps;
      const hasOtherLinks = homepage || (renderings && renderings.length > 0) || related || seeAlso;
      if (!hasOtherLinks) return null;
      return <TargetComponent {...targetProps} manifestUrl={null} />;
    },
    mode: 'wrap',
    target: 'ManifestRelatedLinks',
  };
}

export default function MiradorWrapper({ manifestUrl, width = '100%', height = '600px', appearance = 'standard', showZoomControls = true, showFullscreenButton = true, showSidebar = true, showWorkspacePanel = true, showManifestLink = true, accentColor = '#1967d2' }) {
  const containerId = `mirador-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[Mirador] Initializing with manifest URL:', manifestUrl);

    if (!manifestUrl) {
      console.log('[Mirador] Missing URL');
      return;
    }

    let instance;
    try {
      const isCompact = appearance === 'compact';
      const config = {
        id: containerId,
        windows: [
          {
            manifestId: manifestUrl,
            maximized: true,
          },
        ],
        manifests: {
          [manifestUrl]: {
            provider: 'https://iiif.io/api/presentation/3/context.json',
          },
        },
        osdConfig: {
          drawer: 'canvas',
        },
        window: {
          allowClose: false, // always on: closing the only window leaves an empty viewer, not a useful state
          allowFullscreen: showFullscreenButton,
          allowWindowSideBar: showSidebar,
          hideWindowTitle: isCompact,
          allowTopMenuButton: !isCompact,
        },
        workspace: {
          showZoomControls,
        },
        workspaceControlPanel: {
          enabled: showWorkspacePanel,
        },
        theme: {
          palette: {
            primary: { main: accentColor },
            secondary: { main: accentColor },
          },
        },
      };

      console.log('[Mirador] Config:', config);
      instance = Mirador.viewer(config, [manifestLinkPlugin(showManifestLink)]);
      console.log('[Mirador] Initialized');
    } catch (err) {
      console.error('[Mirador] Error initializing:', err);
      setError(err.message);
    }

    return () => instance?.unmount();
  }, [manifestUrl, containerId]);

  if (error) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ color: '#d32f2f', textAlign: 'center' }}>
          <p>Error loading viewer</p>
          <p style={{ fontSize: '0.9em' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id={containerId}
      style={{ width, height, overflow: 'hidden' }}
      className={`wp-av-mirador-viewer--${appearance} mirador-container`}
    />
  );
}
