<?php
/**
 * Registers all ProofBlocks blocks from their compiled build/ output.
 * Explicit per-block registration (not a directory scan) - matches the
 * "everything explicit" style established in the sibling Heralda project.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function prfbl_register_blocks() {
	register_block_type(
		PRFBL_PLUGIN_DIR . 'build/blocks/pricing-table',
		array( 'render_callback' => 'prfbl_render_pricing_table' )
	);

	// Static only - no render_callback (see plan: pricing-column never
	// needs server-side rendering, the toggle interaction is client-side).
	register_block_type( PRFBL_PLUGIN_DIR . 'build/blocks/pricing-table/column' );

	register_block_type(
		PRFBL_PLUGIN_DIR . 'build/blocks/banner',
		array( 'render_callback' => 'prfbl_render_banner' )
	);

	register_block_type(
		PRFBL_PLUGIN_DIR . 'build/blocks/counter',
		array( 'render_callback' => 'prfbl_render_counter' )
	);
}
add_action( 'init', 'prfbl_register_blocks' );
