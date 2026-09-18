<?php
/**
 * render_callback for proofblocks/banner.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @param array  $attributes Block attributes.
 * @param string $content    Static content from save.js (used as the base body).
 * @return string
 */
function prfbl_render_banner( $attributes, $content ) {
	do_action( 'proofblocks_before_render_block', 'proofblocks/banner', $attributes );

	$requested_token = isset( $attributes['token'] ) ? sanitize_key( $attributes['token'] ) : 'classic-blue';
	$token           = PRFBL_Design_Tokens::resolve_active_slug( $requested_token, 'proofblocks/banner', $attributes );

	PRFBL_Design_Tokens::maybe_inline_custom_css( $token, 'proofblocks-banner-style' );

	$layout        = isset( $attributes['layout'] ) ? sanitize_key( $attributes['layout'] ) : 'img-left';
	$known_layouts = array_merge(
		array( 'img-left', 'img-right', 'img-top' ),
		array_keys( apply_filters( 'proofblocks_banner_layouts', array() ) )
	);
	if ( ! in_array( $layout, $known_layouts, true ) ) {
		$layout = 'img-left';
	}

	$text_align = prfbl_validate_enum( isset( $attributes['textAlign'] ) ? $attributes['textAlign'] : 'left', array( 'left', 'center' ), 'left' );
	$shape      = prfbl_validate_enum( isset( $attributes['shape'] ) ? $attributes['shape'] : 'rounded', array( 'sharp', 'rounded', 'pill' ), 'rounded' );
	$animation  = prfbl_validate_enum( isset( $attributes['animation'] ) ? $attributes['animation'] : 'none', array( 'none', 'fade', 'slide' ), 'none' );
	$font       = prfbl_validate_enum( isset( $attributes['font'] ) ? $attributes['font'] : '', array( 'sans', 'serif', 'mono', 'condensed' ), '' );
	$text_style = prfbl_validate_enum( isset( $attributes['textStyle'] ) ? $attributes['textStyle'] : 'normal', array( 'normal', 'bold', 'uppercase', 'italic' ), 'normal' );

	// 'left'/'rounded'/'none' are this block's pre-existing defaults and stay
	// class-less, matching save.js - see src/shared/_design-tokens.scss header.
	$classes = array( 'wp-block-proofblocks-banner', 'proofblocks-token-' . $token, 'proofblocks-banner--' . $layout );
	if ( 'center' === $text_align ) {
		$classes[] = 'proofblocks-align-center';
	}
	if ( 'rounded' !== $shape ) {
		$classes[] = 'proofblocks-shape-' . $shape;
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

	$wrapper_attributes = array(
		'class' => implode( ' ', $classes ),
	);
	if ( 'none' !== $animation ) {
		$wrapper_attributes['data-pb-animation'] = $animation;
	}
	$wrapper_attributes = apply_filters( 'proofblocks_banner_container_attributes', $wrapper_attributes, $attributes );

	$attr_string = '';
	foreach ( $wrapper_attributes as $name => $value ) {
		$attr_string .= sprintf( ' %s="%s"', esc_attr( $name ), esc_attr( $value ) );
	}

	// Re-wrap: strip save.js's own outer <div ...> and replace with the
	// fully resolved attribute set (token may differ due to site-wide sync,
	// layout may be a Pro-only value save.js didn't know about). Leading \s*
	// matters: core's serialize_block() puts a newline between the block
	// comment and the content, so $content actually starts "\n<div...", not
	// "<div..." - without it this match silently fails and the old <div>
	// ends up double-wrapped inside the new one instead of replaced.
	$inner = preg_replace( '/^\s*<div[^>]*>/', '', $content, 1 );
	$inner = preg_replace( '/<\/div>\s*$/', '', $inner, 1 );

	$inner = apply_filters( 'proofblocks_banner_render_body', $inner, $attributes );
	$inner = wp_kses( $inner, prfbl_block_body_allowed_html() );

	do_action( 'proofblocks_after_render_block', 'proofblocks/banner', $attributes );

	return sprintf( '<div%s>%s</div>', $attr_string, $inner );
}
