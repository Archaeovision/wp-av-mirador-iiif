import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, ToggleControl } from '@wordpress/components';
import MiradorWrapper from '../../components/MiradorWrapper';
import './editor.css';

export default function Edit({ attributes, setAttributes }) {
  const { manifestUrl, width, height, appearance, showZoomControls, showFullscreenButton, showSidebar, showWorkspacePanel, showManifestLink, accentColor } = attributes;
  const blockProps = useBlockProps({ style: { width: width || '100%', height: height || '600px' } });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__('IIIF Manifest', 'wp-av-mirador-iiif')}>
          <TextControl
            label={__('Manifest URL', 'wp-av-mirador-iiif')}
            value={manifestUrl}
            onChange={(value) => setAttributes({ manifestUrl: value })}
            placeholder="https://uuringud.notke.eu/api/directus-manifest-dynamic/page-slug"
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        </PanelBody>

        <PanelBody title={__('Sizing', 'wp-av-mirador-iiif')}>
          <TextControl
            label={__('Width', 'wp-av-mirador-iiif')}
            value={width}
            onChange={(value) => setAttributes({ width: value })}
            placeholder="100%"
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
          <TextControl
            label={__('Height', 'wp-av-mirador-iiif')}
            value={height}
            onChange={(value) => setAttributes({ height: value })}
            placeholder="600px"
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        </PanelBody>

        <PanelBody title={__('Appearance', 'wp-av-mirador-iiif')}>
          <SelectControl
            label={__('Mode', 'wp-av-mirador-iiif')}
            value={appearance}
            options={[
              { label: 'Standard', value: 'standard' },
              { label: 'Compact', value: 'compact' },
            ]}
            onChange={(value) => setAttributes({ appearance: value })}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        </PanelBody>

        <PanelColorSettings
          title={__('Color', 'wp-av-mirador-iiif')}
          colorSettings={[
            {
              value: accentColor,
              onChange: (value) => setAttributes({ accentColor: value || '#1967d2' }),
              label: __('Accent Color', 'wp-av-mirador-iiif'),
            },
          ]}
        />

        <PanelBody title={__('Controls', 'wp-av-mirador-iiif')}>
          <ToggleControl
            label={__('Show Zoom Controls', 'wp-av-mirador-iiif')}
            checked={showZoomControls}
            onChange={(value) => setAttributes({ showZoomControls: value })}
            __nextHasNoMarginBottom
          />
          <ToggleControl
            label={__('Show Fullscreen Button', 'wp-av-mirador-iiif')}
            checked={showFullscreenButton}
            onChange={(value) => setAttributes({ showFullscreenButton: value })}
            __nextHasNoMarginBottom
          />
          <ToggleControl
            label={__('Show Sidebar', 'wp-av-mirador-iiif')}
            checked={showSidebar}
            onChange={(value) => setAttributes({ showSidebar: value })}
            __nextHasNoMarginBottom
          />
          <ToggleControl
            label={__('Show Workspace Panel', 'wp-av-mirador-iiif')}
            checked={showWorkspacePanel}
            onChange={(value) => setAttributes({ showWorkspacePanel: value })}
            __nextHasNoMarginBottom
          />
          <ToggleControl
            label={__('Show Manifest Link', 'wp-av-mirador-iiif')}
            checked={showManifestLink}
            onChange={(value) => setAttributes({ showManifestLink: value })}
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        {manifestUrl ? (
          <MiradorWrapper
            manifestUrl={manifestUrl}
            width={width}
            height={height}
            appearance={appearance}
            showZoomControls={showZoomControls}
            showFullscreenButton={showFullscreenButton}
            showSidebar={showSidebar}
            showWorkspacePanel={showWorkspacePanel}
            showManifestLink={showManifestLink}
            accentColor={accentColor}
          />
        ) : (
          <div className="wp-av-mirador-placeholder">{__('Enter a manifest URL in the block settings', 'wp-av-mirador-iiif')}</div>
        )}
      </div>
    </>
  );
}
