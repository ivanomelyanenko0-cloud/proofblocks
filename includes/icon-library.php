<?php
/**
 * Counter icon library: server-side source of truth for icon SVG paths,
 * mirrored by hand in src/shared/icons.js (COUNTER_ICONS). Rendering lives
 * here (not in save.js) so Pro's icons - contributed via the
 * proofblocks_counter_icons filter - render correctly on the frontend
 * regardless of what was available in the editor at save time.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The 8 Free counter icons: slug => array( 'label' => ..., 'path' => ... ).
 *
 * @return array<string,array>
 */
function prfbl_get_free_counter_icons() {
	return array(
		'clock'  => array(
			'label' => __( 'Clock', 'proofblocks' ),
			'path'  => 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
		),
		'check'  => array(
			'label' => __( 'Check', 'proofblocks' ),
			'path'  => 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.5 2.5L16 9',
		),
		'rocket' => array(
			'label' => __( 'Rocket', 'proofblocks' ),
			'path'  => 'M12 2c3 2 5 6 5 10 0 2-.5 3.5-1.2 4.8L12 22l-3.8-5.2C7.5 15.5 7 14 7 12c0-4 2-8 5-10zM12 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM8 16l-3 3M16 16l3 3',
		),
		'target' => array(
			'label' => __( 'Target', 'proofblocks' ),
			'path'  => 'M3 12A9 9 0 1 0 21 12A9 9 0 1 0 3 12M7 12A5 5 0 1 0 17 12A5 5 0 1 0 7 12M10.5 12A1.5 1.5 0 1 0 13.5 12A1.5 1.5 0 1 0 10.5 12',
		),
		'shield' => array(
			'label' => __( 'Shield', 'proofblocks' ),
			'path'  => 'M12 2.5l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10v-6l7-3zM9 12l2 2 4-4',
		),
		'gift'   => array(
			'label' => __( 'Gift', 'proofblocks' ),
			'path'  => 'M4 8h16v4H4zM4 12h16v9H4zM12 8v13M8 8c-1.5 0-2.5-1-2.5-2S6.5 4 8 4c1.5 0 3 1.5 4 4M16 8c1.5 0 2.5-1 2.5-2S17.5 4 16 4c-1.5 0-3 1.5-4 4',
		),
		'bolt'   => array(
			'label' => __( 'Bolt', 'proofblocks' ),
			'path'  => 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
		),
		'flag'   => array(
			'label' => __( 'Flag', 'proofblocks' ),
			'path'  => 'M5 21V4M5 4h13l-3 4 3 4H5',
		),
	);
}

/**
 * Free's 8 icons plus whatever Pro (or any 3rd party) contributes via the
 * documented proofblocks_counter_icons filter.
 *
 * @return array<string,array>
 */
function prfbl_get_counter_icons() {
	return apply_filters( 'proofblocks_counter_icons', prfbl_get_free_counter_icons() );
}

/**
 * @param string $slug
 * @return string SVG markup, or '' for an unknown/empty slug.
 */
function prfbl_render_counter_icon_svg( $slug ) {
	$icons = prfbl_get_counter_icons();

	if ( empty( $slug ) || ! isset( $icons[ $slug ]['path'] ) ) {
		return '';
	}

	return sprintf(
		'<svg class="proofblocks-icon proofblocks-counter__icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="%s" /></svg>',
		esc_attr( $icons[ $slug ]['path'] )
	);
}
