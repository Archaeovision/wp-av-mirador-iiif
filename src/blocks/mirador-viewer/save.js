export default function Save({ attributes }) {
  const { manifestUrl, width, height, appearance, showZoomControls, showFullscreenButton } = attributes;
  return (
    <div
      className="wp-av-mirador-iiif-viewer"
      data-manifest-url={manifestUrl}
      data-width={width}
      data-height={height}
      data-appearance={appearance}
      data-zoom-controls={showZoomControls}
      data-fullscreen={showFullscreenButton}
      style={{ width: width || '100%', height: height || '600px' }}
    />
  );
}
