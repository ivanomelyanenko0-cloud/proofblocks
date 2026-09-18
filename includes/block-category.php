<?php
/**
 * Registers a dedicated block category so ProofBlocks blocks don't get
 * dumped into "Common" (DoD requirement).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function prfbl_register_block_category( $categories ) {
	return array_merge(
		array(
			array(
				'slug'  => 'proofblocks',
				'title' => __( 'ProofBlocks', 'proofblocks' ),
				'icon'  => 'chart-bar',
			),
		),
		$categories
	);
}
add_filter( 'block_categories_all', 'prfbl_register_block_category' );
