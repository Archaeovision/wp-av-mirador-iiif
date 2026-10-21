<?php
/**
 * Plugin Name: Archaeovision Mirador IIIF Viewer
 * Plugin URI: https://github.com/archaeovision/wp-av-mirador-iiif
 * Description: WordPress block plugin for embedding IIIF manifests using the Mirador viewer
 * Version: 1.0.7
 * Requires at least: 6.2
 * Author: Hembo Pagi
 * Author URI: https://archaeovision.eu
 * License: MIT
 * Text Domain: wp-av-mirador-iiif
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function wp_av_mirador_register_block() {
	$block_dir = plugin_dir_path( __FILE__ );
	$block_url = plugin_dir_url( __FILE__ );

	$assets_file = $block_dir . 'index.asset.php';
	if ( file_exists( $assets_file ) ) {
		$asset_data = include $assets_file;
	} else {
		$asset_data = array(
			'dependencies' => array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor' ),
			'version'      => filemtime( $block_dir . 'index.js' ) ?: false,
		);
	}

	wp_register_script(
		'wp-av-mirador-iiif-block',
		$block_url . 'index.js',
		$asset_data['dependencies'],
		$asset_data['version']
	);

	wp_register_style(
		'wp-av-mirador-iiif-styles',
		$block_url . 'index.css',
		array(),
		$asset_data['version']
	);

	register_block_type( $block_dir . 'blocks/mirador-viewer/' );
}

function wp_av_mirador_enqueue_scripts() {
	wp_enqueue_script( 'wp-av-mirador-iiif-block' );
	wp_enqueue_style( 'wp-av-mirador-iiif-styles' );
}

add_action( 'init', 'wp_av_mirador_register_block' );
add_action( 'wp_enqueue_scripts', 'wp_av_mirador_enqueue_scripts' );

function wp_av_mirador_load_textdomain() {
	load_plugin_textdomain(
		'wp-av-mirador-iiif',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
}
add_action( 'init', 'wp_av_mirador_load_textdomain' );

/**
 * Manifest hosts that may be passed in via the ?manifest= URL parameter.
 * Extend with the `wp_av_mirador_allowed_manifest_hosts` filter.
 */
function wp_av_mirador_allowed_manifest_hosts() {
	return apply_filters( 'wp_av_mirador_allowed_manifest_hosts', array( 'api.archaeovision.eu' ) );
}

/**
 * Base URL that a bare id/slug in ?manifest= is appended to.
 * Override with the `wp_av_mirador_manifest_base_url` filter.
 */
function wp_av_mirador_manifest_base_url() {
	return trailingslashit( apply_filters( 'wp_av_mirador_manifest_base_url', 'https://api.archaeovision.eu/iiif/manifest/' ) );
}

/**
 * Returns the manifest URL requested via ?manifest=, or '' when it is missing
 * or not acceptable. Accepts either a bare UUID/slug (e.g. "linnahall"),
 * which is resolved against the manifest base URL, or a full https URL on an
 * allowed host.
 */
function wp_av_mirador_requested_manifest_url() {
	if ( empty( $_GET['manifest'] ) || ! is_string( $_GET['manifest'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return '';
	}

	$value = trim( wp_unslash( $_GET['manifest'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	if ( preg_match( '/^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/', $value ) ) {
		return wp_av_mirador_manifest_base_url() . $value;
	}

	$url   = esc_url_raw( $value, array( 'https' ) );
	$parts = wp_parse_url( $url );

	if ( empty( $parts['host'] ) || ! empty( $parts['user'] ) || ! empty( $parts['pass'] ) ) {
		return '';
	}
	if ( ! in_array( strtolower( $parts['host'] ), array_map( 'strtolower', wp_av_mirador_allowed_manifest_hosts() ), true ) ) {
		return '';
	}

	return $url;
}

/**
 * Lets ?manifest=<url> override the manifest of every Mirador block on
 * the page; all other block settings (size, sidebar, colour...) are kept.
 */
function wp_av_mirador_override_manifest( $block_content, $block ) {
	if ( 'wp-av-mirador/iiif-viewer' !== $block['blockName'] || ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
		return $block_content;
	}

	$manifest_url = wp_av_mirador_requested_manifest_url();
	if ( '' === $manifest_url ) {
		return $block_content;
	}

	$tags = new WP_HTML_Tag_Processor( $block_content );
	if ( $tags->next_tag( array( 'class_name' => 'wp-av-mirador-iiif-viewer' ) ) ) {
		$tags->set_attribute( 'data-manifest-url', $manifest_url );
	}

	return $tags->get_updated_html();
}
add_filter( 'render_block', 'wp_av_mirador_override_manifest', 10, 2 );
