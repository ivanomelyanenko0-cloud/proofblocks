<?php
/**
 * render_callback for proofblocks/counter.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @param array         $attributes Block attributes.
 * @param string        $content    Static content from save.js.
 * @param WP_Block|null $block      Block instance (for postId context).
 * @return string
 */
function prfbl_render_counter( $attributes, $content, $block = null ) {
	do_action( 'proofblocks_before_render_block', 'proofblocks/counter', $attributes );

	$style = isset( $attributes['style'] ) ? sanitize_key( $attributes['style'] ) : 'basic';

	$requested_token = isset( $attributes['token'] ) ? sanitize_key( $attributes['token'] ) : '';
	$token           = PRFBL_Design_Tokens::resolve_active_slug( $requested_token, 'proofblocks/counter', $attributes );

	PRFBL_Design_Tokens::maybe_inline_custom_css( $token, 'proofblocks-counter-style' );

	$card_style = prfbl_validate_enum( isset( $attributes['cardStyle'] ) ? $attributes['cardStyle'] : 'flat', array( 'flat', 'bordered', 'shadow' ), 'flat' );
	$animation  = prfbl_validate_enum( isset( $attributes['animation'] ) ? $attributes['animation'] : 'none', array( 'none', 'fade', 'slide' ), 'none' );
	$font       = prfbl_validate_enum( isset( $attributes['font'] ) ? $attributes['font'] : '', array( 'sans', 'serif', 'mono', 'condensed' ), '' );
	$text_style = prfbl_validate_enum( isset( $attributes['textStyle'] ) ? $attributes['textStyle'] : 'normal', array( 'normal', 'bold', 'uppercase', 'italic' ), 'normal' );

	$icon          = isset( $attributes['icon'] ) ? sanitize_key( $attributes['icon'] ) : '';
	$icon_position = prfbl_validate_enum( isset( $attributes['iconPosition'] ) ? $attributes['iconPosition'] : 'stacked', array( 'stacked', 'inline' ), 'stacked' );
	$position      = prfbl_validate_enum( isset( $attributes['position'] ) ? $attributes['position'] : 'left', array( 'left', 'center', 'right' ), 'left' );

	// 'flat'/'stacked'/'none' are this block's pre-existing defaults and
	// stay class-less, matching save.js - see
	// src/shared/_design-tokens.scss header.
	$classes = array( 'wp-block-proofblocks-counter', 'proofblocks-counter--' . $style );
	if ( $token ) {
		$classes[] = 'proofblocks-token-' . $token;
	}
	if ( 'flat' !== $card_style ) {
		$classes[] = 'proofblocks-card-' . $card_style;
	}
	if ( $icon && 'inline' === $icon_position ) {
		$classes[] = 'proofblocks-counter--icon-inline';
	}
	if ( 'none' !== $animation ) {
		$classes[] = 'proofblocks-anim-' . $animation;
	}
	if ( $font ) {
		$classes[] = 'proofblocks-font-' . $font;
	}
	if ( 'normal' !== $text_style ) {
		$classes[] = 'proofblocks-textstyle-' . $text_style;
	}
	// Always emitted, including the default 'left' (unlike the class-less
	// defaults above): left needs its own rule to line up with the content
	// column. save.js deliberately still omits it - changing what save()
	// serializes would invalidate every already-saved Counter - and this
	// render callback replaces the class list wholesale anyway.
	$classes[] = 'proofblocks-align-' . $position;

	// Extra data-* attributes for the wrapper. Each key replaces any
	// same-named attribute save.js wrote, so a WooCommerce countdown never
	// ticks toward a stale manual date left over from before the source
	// was switched.
	$wrapper_atts = array();

	$mode = isset( $attributes['mode'] ) ? $attributes['mode'] : 'number';
	if ( 'countdown' === $mode && isset( $attributes['countdownSource'] ) && 'wc_sale' === $attributes['countdownSource'] ) {
		$product_id   = isset( $attributes['productId'] ) ? absint( $attributes['productId'] ) : 0;
		$variation_id = $product_id && isset( $attributes['variationId'] ) ? absint( $attributes['variationId'] ) : 0;
		$product_id   = $product_id ? $product_id : prfbl_wc_current_product_id( $block );
		$end          = $product_id ? prfbl_wc_get_sale_end( $product_id, $variation_id ) : null;
		$fallback     = prfbl_validate_enum( isset( $attributes['wcFallback'] ) ? $attributes['wcFallback'] : 'hide', array( 'hide', 'expired-text' ), 'hide' );

		$wrapper_atts['data-pb-date']     = null === $end ? '' : gmdate( 'c', $end );
		$wrapper_atts['data-pb-source']   = 'wc_sale';
		$wrapper_atts['data-pb-fallback'] = $fallback;
		if ( $product_id && prfbl_wc_active() ) {
			$wrapper_atts['data-pb-sale-url'] = add_query_arg( 'variation', $variation_id, rest_url( 'proofblocks/v1/wc-product/' . $product_id ) );
		}

		// Hidden until view.js confirms a sale - and stays hidden without
		// JS - rather than showing an empty or zeroed-out timer.
		if ( null === $end && 'hide' === $fallback ) {
			$classes[] = 'proofblocks-counter--no-sale';
		}
	}

	// Live stock is printed as is, without the count-up: a stock level
	// isn't an achievement to animate, and counting up from zero would show
	// "0 left" first. The real number is in the HTML for visitors without
	// JS; view.js re-checks it, since a page cache can serve this markup
	// long after the stock changed.
	$value_text = null;
	if ( 'number' === $mode && isset( $attributes['numberSource'] ) && 'wc_stock' === $attributes['numberSource'] ) {
		$product_id   = isset( $attributes['productId'] ) ? absint( $attributes['productId'] ) : 0;
		$variation_id = $product_id && isset( $attributes['variationId'] ) ? absint( $attributes['variationId'] ) : 0;
		$product_id   = $product_id ? $product_id : prfbl_wc_current_product_id( $block );
		$stock        = $product_id ? prfbl_wc_get_stock( $product_id, $variation_id ) : null;
		$fallback     = prfbl_validate_enum( isset( $attributes['wcFallback'] ) ? $attributes['wcFallback'] : 'hide', array( 'hide', 'expired-text' ), 'hide' );
		$empty_text   = isset( $attributes['wcEmptyText'] ) ? (string) $attributes['wcEmptyText'] : '';
		$prefix       = isset( $attributes['numberPrefix'] ) ? (string) $attributes['numberPrefix'] : '';
		$suffix       = isset( $attributes['numberSuffix'] ) ? (string) $attributes['numberSuffix'] : '';

		$wrapper_atts['data-pb-value']      = null === $stock ? '' : (string) $stock;
		$wrapper_atts['data-pb-source']     = 'wc_stock';
		$wrapper_atts['data-pb-fallback']   = $fallback;
		$wrapper_atts['data-pb-empty-text'] = $empty_text;
		if ( $product_id && prfbl_wc_active() ) {
			$wrapper_atts['data-pb-stock-url'] = add_query_arg( 'variation', $variation_id, rest_url( 'proofblocks/v1/wc-product/' . $product_id ) );
		}

		$value_text = null === $stock ? $empty_text : $prefix . $stock . $suffix;

		// Same hiding class as a countdown without a sale: "no live
		// WooCommerce data to show".
		if ( null === $stock && 'hide' === $fallback ) {
			$classes[] = 'proofblocks-counter--no-sale';
		}
	}

	/**
	 * Lets Pro attach its own data-* attributes to the wrapper (e.g. the
	 * urgency window). Only data-* keys are kept.
	 */
	$wrapper_atts = apply_filters( 'proofblocks_counter_wrapper_attributes', $wrapper_atts, $attributes );

	// Replace save.js's own class list with the fully resolved set (token
	// may differ due to Pro's site-wide sync override), leaving the rest of
	// the wrapper's attributes (data-pb-*) untouched. Leading \s* matters:
	// core's serialize_block() puts a newline between the block comment and
	// the content, so $content actually starts "\n<div...", not "<div..." -
	// without it this match (and the icon-insertion one below, which relies
	// on the leading newline already being gone) silently fails.
	$content = preg_replace(
		'/^\s*<div class="[^"]*"/',
		'<div class="' . esc_attr( implode( ' ', $classes ) ) . '"',
		$content,
		1
	);

	if ( $wrapper_atts ) {
		$content = prfbl_counter_set_wrapper_attributes( $content, $wrapper_atts );
	}

	if ( null !== $value_text ) {
		$content = preg_replace(
			'/(<span class="proofblocks-counter__value">)[^<]*(<\/span>)/',
			'${1}' . str_replace( array( '\\', '$' ), array( '\\\\', '\\$' ), esc_html( $value_text ) ) . '${2}',
			$content,
			1
		);
	}

	// The icon glyph is rendered here, not baked into save.js's static
	// output, so that icons contributed by Pro via the proofblocks_counter_icons
	// filter render correctly regardless of what was available client-side
	// in the editor at save time.
	if ( $icon ) {
		$content = preg_replace(
			'/^(<div[^>]*>)/',
			'$1' . prfbl_render_counter_icon_svg( $icon ),
			$content,
			1
		);
	}

	// Pro's odometer/extended-effect styles hook in here - the filter both
	// returns extra markup/classes AND, as a side effect, may enqueue its
	// own view script only when a non-basic style is actually in use
	// (mirrors the enqueue-in-render_callback pattern core uses for blocks
	// like Query Loop - safe because this only runs when the block instance
	// actually renders).
	$extra = apply_filters( 'proofblocks_counter_render_extra', '', $attributes );
	$extra = wp_kses( $extra, prfbl_block_body_allowed_html() );

	do_action( 'proofblocks_after_render_block', 'proofblocks/counter', $attributes );

	// Insert extra markup (e.g. Pro's odometer digit wrapper) just before the closing tag.
	if ( $extra ) {
		$content = preg_replace( '/<\/div>\s*$/', $extra . '</div>', $content, 1 );
	}

	return wp_kses( $content, prfbl_block_body_allowed_html() );
}

/**
 * Set data-* attributes on the Counter's outer <div>, replacing any that
 * save.js already wrote under the same name.
 *
 * @param string $content Rendered markup, starting with the wrapper <div.
 * @param array  $atts    name => value; non-data-* names are ignored.
 * @return string
 */
function prfbl_counter_set_wrapper_attributes( $content, $atts ) {
	if ( ! preg_match( '/^<div\b[^>]*>/', $content, $match ) ) {
		return $content;
	}

	$tag = $match[0];
	foreach ( $atts as $name => $value ) {
		if ( ! preg_match( '/^data-[a-z0-9-]+$/', $name ) ) {
			continue;
		}
		$tag = preg_replace( '/\s' . preg_quote( $name, '/' ) . '="[^"]*"/', '', $tag );
		$tag = substr( $tag, 0, -1 ) . ' ' . $name . '="' . esc_attr( $value ) . '">';
	}

	return $tag . substr( $content, strlen( $match[0] ) );
}
