import React, { useEffect, useId, useState } from 'react';
import Mirador from 'mirador';

export default function MiradorWrapper({ manifestUrl, width = '100%', height = '600px', appearance = 'standard', showZoomControls = true, showFullscreenButton = true }) {
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
      const config = {
        id: containerId,
        windows: [
          {
            manifestId: manifestUrl,
          },
        ],
        manifests: {
          [manifestUrl]: {
            provider: 'https://iiif.io/api/presentation/3/context.json',
          },
        },
      };

      console.log('[Mirador] Config:', config);
      instance = Mirador.viewer(config);
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
