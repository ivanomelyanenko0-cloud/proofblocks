<?php
/**
 * Helpers for injecting dynamic data into block editor scripts.
 *
 * Free's own editor data (the 4 fixed token presets, layout options, etc.)
 * is hardcoded directly in each block's JS (src/shared/design-tokens.js)
 * since it's static and known at build time - nothing to inject here for
 * Free. This file exists as the shared helper Pro uses to reliably attach
 * its own dynamic data (custom token sets, extended icon library) to the
 * right editor script handle, since WP core's auto-generated handle naming
 * is easy to get subtly wrong by guessing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The editor script handle WP core registers for a given block name via
 * register_block_type(), per WP_Block_Type::get_default_editor_script()
 * and generate_block_asset_handle(): "{sanitized-block-name}-editor-script".
 *
 * @param string $block_name e.g. 'proofblocks/pricing-table'.
 * @return string
 */
function prfbl_get_block_editor_script_handle( $block_name ) {
	return str_replace( '/', '-', $block_name ) . '-editor-script';
}
