<?php
/**
 * Free extension API consumed by ProofBlocks Pro.
 *
 * prfbl_register_pro_slot() is a validated wrapper over add_filter()/add_action()
 * against a documented registry of extension points below. It never carries
 * any conditional "is premium" logic - it fires unconditionally for whoever
 * hooks in, keeping the Free plugin fully self-contained.
 *
 * Hooks use the full `proofblocks_` prefix (matching the one hook name the
 * spec itself fixes verbatim, `proofblocks_register_token_set`); plain PHP
 * function/constant/option names elsewhere in this plugin use the short
 * `prfbl_`/`PRFBL_` prefix.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Documented extension points a Pro (or any third-party) plugin can hook into.
 *
 * @return array<string,string> hook name => 'filter'|'action'
 */
function prfbl_get_extension_points() {
	return apply_filters(
		'proofblocks_extension_points_registry',
		array(
			// (array $sets) => array   extra slug => token-set definitions.
			'proofblocks_register_token_set'               => 'filter',
			// (?string $slug, string $block, array $attrs) => ?string   site-wide sync override.
			'proofblocks_active_token_set'                 => 'filter',
			// (array $atts, array $block_attrs) => array   Pricing Table wrapper HTML attributes.
			// Pro also uses this as its enqueue seam for pricing-table-only
			// assets (badge animation CSS, billing-toggle script) - the
			// pricing-column child block is static-only (no render_callback),
			// so there is no PHP-side hook that fires per-column; anything
			// Pro needs applied to columns (badge animation, etc.) is done
			// via CSS targeting .wp-block-proofblocks-pricing-column, enqueued
			// from here instead.
			'proofblocks_pricing_table_wrapper_attributes' => 'filter',
			// (array $layouts) => array   extra Banner layout slug => label pairs.
			'proofblocks_banner_layouts'                   => 'filter',
			// (string $html, array $attrs) => string   Banner body markup.
			'proofblocks_banner_render_body'               => 'filter',
			// (array $atts, array $attrs) => array   Banner wrapper HTML attributes.
			'proofblocks_banner_container_attributes'      => 'filter',
			// (string $html, array $attrs) => string   Counter extra markup; also where Pro enqueues its odometer script.
			'proofblocks_counter_render_extra'             => 'filter',
			// (array $icons) => array   extended icon library for the Counter
			// picker; each entry is slug => array('label' => ..., 'path' => ...
			// SVG path data), rendered server-side by
			// prfbl_render_counter_icon_svg() in includes/icon-library.php.
			'proofblocks_counter_icons'                    => 'filter',
			// Fires with the block name and attributes just before render.
			'proofblocks_before_render_block'              => 'action',
			// Fires with the block name and attributes just after render.
			'proofblocks_after_render_block'               => 'action',
		)
	);
}

/**
 * Register a callback against a documented ProofBlocks extension point.
 *
 * @param string   $hook     One of the keys returned by prfbl_get_extension_points().
 * @param callable $callback Callback to attach.
 * @return bool True on success, false if the hook is undocumented or the callback isn't callable.
 */
function prfbl_register_pro_slot( $hook, $callback ) {
	$points = prfbl_get_extension_points();

	if ( ! isset( $points[ $hook ] ) || ! is_callable( $callback ) ) {
		return false;
	}

	if ( 'action' === $points[ $hook ] ) {
		return add_action( $hook, $callback, 10, 10 );
	}

	return add_filter( $hook, $callback, 10, 10 );
}
