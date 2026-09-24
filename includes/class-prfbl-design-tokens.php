<?php
/**
 * Shared design-token (color palette/gradient) presets consumed by all
 * three blocks. The one class in this otherwise-procedural codebase.
 *
 * Static methods, not a singleton instance: the only state that needs to
 * persist across a request is "which custom token slugs have already had
 * their inline CSS printed" (see maybe_inline_custom_css()), which a
 * private static array handles without any instance lifecycle.
 *
 * Free's 8 presets are fixed at build time, so their CSS lives as ordinary
 * compiled rules in each block's style.scss (.proofblocks-token-{slug}
 * classes) - PHP only ever needs to output the class name. Runtime
 * wp_add_inline_style() is reserved for Pro's genuinely dynamic,
 * admin-configured custom token sets, whose values aren't known at build
 * time. Keep src/shared/design-tokens.js in sync by hand with
 * get_free_presets() below - see the cross-reference comment there.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PRFBL_Design_Tokens {

	/**
	 * @var array<string,bool> Custom (non-Free) token slugs already inlined this request.
	 */
	private static $inlined = array();

	/**
	 * The 8 hardcoded Free presets. Kept in sync BY HAND with
	 * src/shared/design-tokens.js - each file has a comment pointing at
	 * the other.
	 *
	 * @return array<string,array>
	 */
	public static function get_free_presets() {
		return array(
			'classic-blue' => array(
				'label'     => __( 'Classic Blue', 'proofblocks' ),
				'primary'   => '#2563eb',
				'secondary' => '#1e3a8a',
				'accent'    => '#f59e0b',
				'text'      => '#0f172a',
				'bg'        => '#ffffff',
			),
			'warm-sunset'  => array(
				'label'     => __( 'Warm Sunset', 'proofblocks' ),
				'primary'   => '#f97316',
				'secondary' => '#c2410c',
				'accent'    => '#facc15',
				'text'      => '#1c1917',
				'bg'        => '#fffbeb',
			),
			'mono-dark'    => array(
				'label'     => __( 'Mono Dark', 'proofblocks' ),
				'primary'   => '#e5e7eb',
				'secondary' => '#9ca3af',
				'accent'    => '#22d3ee',
				'text'      => '#f9fafb',
				'bg'        => '#111827',
			),
			'fresh-mint'   => array(
				'label'     => __( 'Fresh Mint', 'proofblocks' ),
				'primary'   => '#10b981',
				'secondary' => '#047857',
				'accent'    => '#a3e635',
				'text'      => '#052e2b',
				'bg'        => '#ecfdf5',
			),
			'royal-purple' => array(
				'label'     => __( 'Royal Purple', 'proofblocks' ),
				'primary'   => '#7c3aed',
				'secondary' => '#5b21b6',
				'accent'    => '#f472b6',
				'text'      => '#1e1b3a',
				'bg'        => '#faf5ff',
			),
			'rose-pink'    => array(
				'label'     => __( 'Rose Pink', 'proofblocks' ),
				'primary'   => '#ec4899',
				'secondary' => '#be185d',
				'accent'    => '#fbbf24',
				'text'      => '#500724',
				'bg'        => '#fdf2f8',
			),
			'slate-gray'   => array(
				'label'     => __( 'Slate Gray', 'proofblocks' ),
				'primary'   => '#64748b',
				'secondary' => '#334155',
				'accent'    => '#06b6d4',
				'text'      => '#0f172a',
				'bg'        => '#f8fafc',
			),
			'amber-gold'   => array(
				'label'     => __( 'Amber Gold', 'proofblocks' ),
				'primary'   => '#d97706',
				'secondary' => '#92400e',
				'accent'    => '#16a34a',
				'text'      => '#451a03',
				'bg'        => '#fffbeb',
			),
		);
	}

	/**
	 * Free presets plus whatever Pro (or any 3rd party) contributes via the
	 * documented proofblocks_register_token_set filter. Defensively
	 * validates shape before trusting external data.
	 *
	 * @return array<string,array>
	 */
	public static function get_token_sets() {
		$sets  = self::get_free_presets();
		$extra = apply_filters( 'proofblocks_register_token_set', array() );

		foreach ( (array) $extra as $slug => $set ) {
			if ( self::is_valid_token_set( $set ) ) {
				$sets[ sanitize_key( $slug ) ] = $set;
			}
		}

		return $sets;
	}

	/**
	 * @param mixed $set
	 * @return bool
	 */
	private static function is_valid_token_set( $set ) {
		if ( ! is_array( $set ) ) {
			return false;
		}
		foreach ( array( 'label', 'primary', 'secondary', 'accent', 'text', 'bg' ) as $key ) {
			if ( ! isset( $set[ $key ] ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Resolve the token slug actually in effect for a given block instance,
	 * honoring Pro's site-wide sync override when present.
	 *
	 * @param string $requested_slug Slug requested by the block's own attribute.
	 * @param string $block_name     e.g. 'proofblocks/pricing-table'.
	 * @param array  $attrs          Full block attributes.
	 * @return string
	 */
	public static function resolve_active_slug( $requested_slug, $block_name, $attrs ) {
		$resolved = apply_filters( 'proofblocks_active_token_set', $requested_slug, $block_name, $attrs );
		return $resolved ? sanitize_key( $resolved ) : sanitize_key( $requested_slug );
	}

	/**
	 * Print (once per request) the inline CSS custom properties for a
	 * non-Free token slug, if it has one registered. No-ops for Free's 4
	 * built-in presets, which already have compiled CSS.
	 *
	 * @param string $slug        Token slug in effect.
	 * @param string $style_handle Registered stylesheet handle to attach the inline CSS to.
	 */
	public static function maybe_inline_custom_css( $slug, $style_handle ) {
		$slug = sanitize_key( $slug );

		if ( isset( self::get_free_presets()[ $slug ] ) || isset( self::$inlined[ $slug ] ) ) {
			return;
		}

		$sets = self::get_token_sets();
		if ( ! isset( $sets[ $slug ] ) ) {
			return;
		}

		$set = $sets[ $slug ];
		$css = sprintf(
			'.proofblocks-token-%1$s{--pb-color-primary:%2$s;--pb-color-secondary:%3$s;--pb-color-accent:%4$s;--pb-color-text:%5$s;--pb-color-bg:%6$s;}',
			esc_attr( $slug ),
			esc_attr( $set['primary'] ),
			esc_attr( $set['secondary'] ),
			esc_attr( $set['accent'] ),
			esc_attr( $set['text'] ),
			esc_attr( $set['bg'] )
		);

		wp_add_inline_style( $style_handle, $css );
		self::$inlined[ $slug ] = true;
	}
}
