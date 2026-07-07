import { registerBlockType } from '@wordpress/blocks';
import React from 'react';
import ReactDOM from 'react-dom';
import Edit from './blocks/mirador-viewer/edit';
import Save from './blocks/mirador-viewer/save';
import MiradorWrapper from './components/MiradorWrapper';
import metadata from './blocks/mirador-viewer/block.json';

registerBlockType(metadata.name, {
  ...metadata,
  edit: Edit,
  save: Save,
});

// Frontend initialization
console.log('[Mirador IIIF] Script loaded');

if (typeof window !== 'undefined' && document.readyState === 'loading') {
  console.log('[Mirador IIIF] Waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', initFrontend);
} else if (typeof window !== 'undefined') {
  console.log('[Mirador IIIF] DOM already loaded, initializing now');
  initFrontend();
}

function initFrontend() {
  console.log('[Mirador IIIF] initFrontend called');
  const containers = document.querySelectorAll('.wp-av-mirador-iiif-viewer');

  containers.forEach((container) => {
    const manifestUrl = container.getAttribute('data-manifest-url');
    const width = container.getAttribute('data-width') || '100%';
    const height = container.getAttribute('data-height') || '600px';
    const appearance = container.getAttribute('data-appearance') || 'standard';
    const showZoomControls = container.getAttribute('data-zoom-controls') !== 'false';
    const showFullscreenButton = container.getAttribute('data-fullscreen') !== 'false';

    const root = ReactDOM.createRoot(container);
    root.render(
      React.createElement(MiradorWrapper, {
        manifestUrl,
        width,
        height,
        appearance,
        showZoomControls,
        showFullscreenButton,
      })
    );
  });
}
