<?php
/**
 * Small shared validation helper used across the block render files to
 * avoid repeating the same in_array() whitelist check for each of the
 * fixed-choice style attributes (shape, cardStyle, popularStyle, textAlign).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @param mixed  $value    Value to validate.
 * @param array  $allowed  Whitelist of accepted values.
 * @param string $fallback Fallback when $value isn't in the whitelist.
 * @return string
 */
function prfbl_validate_enum( $value, array $allowed, $fallback ) {
	return in_array( $value, $allowed, true ) ? $value : $fallback;
}

/**
 * Allowed HTML for markup inserted by the proofblocks_banner_render_body and
 * proofblocks_counter_render_extra extension points, applied right before
 * output. Extends the standard "post" kses tag set with the extra
 * elements/attributes ProofBlocks' own rendering (the counter icon SVG) and
 * Pro's registered slots are known to add, so this final pass doesn't strip
 * them. Filterable so Pro (or any other extension) can register its own
 * tags/attrs instead of Free having to hardcode every one.
 *
 * @return array
 */
function prfbl_block_body_allowed_html() {
	$allowed = wp_kses_allowed_html( 'post' );

	$allowed['svg']  = array(
		'class'           => true,
		'width'           => true,
		'height'          => true,
		'viewbox'         => true,
		'fill'            => true,
		'stroke'          => true,
		'stroke-width'    => true,
		'stroke-linecap'  => true,
		'stroke-linejoin' => true,
		'xmlns'           => true,
		'aria-hidden'     => true,
	);
	$allowed['path']  = array(
		'd' => true,
	);

	foreach ( array( 'span', 'div', 'a' ) as $tag ) {
		$allowed[ $tag ]['data-pb-animation'] = true;
	}

	return apply_filters( 'proofblocks_block_body_allowed_html', $allowed );
}
