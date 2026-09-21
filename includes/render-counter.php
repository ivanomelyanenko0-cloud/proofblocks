<?php
/**
 * render_callback for proofblocks/counter.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @param array  $attributes Block attributes.
 * @param string $content    Static content from save.js.
 * @return string
 */
function prfbl_render_counter( $attributes, $content ) {
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

	if ( ! $extra ) {
		return $content;
	}

	// Insert extra markup (e.g. Pro's odometer digit wrapper) just before the closing tag.
	return preg_replace( '/<\/div>\s*$/', $extra . '</div>', $content, 1 );
}
