<?php
/**
 * Plugin Name: Archaeovision Mirador IIIF Viewer
 * Plugin URI: https://github.com/archaeovision/wp-av-mirador-iiif
 * Description: WordPress block plugin for embedding IIIF manifests using the Mirador viewer
 * Version: 1.0.5
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
