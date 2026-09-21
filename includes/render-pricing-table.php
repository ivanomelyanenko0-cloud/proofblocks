<?php
/**
 * render_callback for proofblocks/pricing-table.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @param array  $attributes Block attributes.
 * @param string $content    Pre-rendered InnerBlocks content (from save.js).
 * @return string
 */
function prfbl_render_pricing_table( $attributes, $content ) {
	do_action( 'proofblocks_before_render_block', 'proofblocks/pricing-table', $attributes );

	$requested_token = isset( $attributes['token'] ) ? sanitize_key( $attributes['token'] ) : 'classic-blue';
	$token           = PRFBL_Design_Tokens::resolve_active_slug( $requested_token, 'proofblocks/pricing-table', $attributes );

	PRFBL_Design_Tokens::maybe_inline_custom_css( $token, 'proofblocks-pricing-table-style' );

	$shape      = prfbl_validate_enum( isset( $attributes['shape'] ) ? $attributes['shape'] : 'rounded', array( 'sharp', 'rounded', 'pill' ), 'rounded' );
	$card_style = prfbl_validate_enum( isset( $attributes['cardStyle'] ) ? $attributes['cardStyle'] : 'bordered', array( 'flat', 'bordered', 'shadow' ), 'bordered' );
	$animation  = prfbl_validate_enum( isset( $attributes['animation'] ) ? $attributes['animation'] : 'none', array( 'none', 'fade', 'slide' ), 'none' );
	$font       = prfbl_validate_enum( isset( $attributes['font'] ) ? $attributes['font'] : '', array( 'sans', 'serif', 'mono', 'condensed' ), '' );
	$text_style = prfbl_validate_enum( isset( $attributes['textStyle'] ) ? $attributes['textStyle'] : 'normal', array( 'normal', 'bold', 'uppercase', 'italic' ), 'normal' );

	// 'rounded'/'bordered'/'none' are this block's pre-existing defaults and
	// stay class-less, matching save.js - see src/shared/_design-tokens.scss header.
	$classes = array( 'wp-block-proofblocks-pricing-table', 'proofblocks-token-' . $token );
	if ( 'rounded' !== $shape ) {
		$classes[] = 'proofblocks-shape-' . $shape;
	}
	if ( 'bordered' !== $card_style ) {
		$classes[] = 'proofblocks-card-' . $card_style;
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

	// This wrapper is built by hand rather than via
	// get_block_wrapper_attributes(), so the alignment class core would
	// otherwise add for supports.align (wide/full) has to be added here or
	// the editor's Wide/Full setting is silently ignored on the frontend.
	$align = prfbl_validate_enum( isset( $attributes['align'] ) ? $attributes['align'] : '', array( 'wide', 'full' ), '' );
	if ( $align ) {
		$classes[] = 'align' . $align;
	}

	$wrapper_attributes = array(
		'class' => implode( ' ', $classes ),
	);
	if ( 'none' !== $animation ) {
		$wrapper_attributes['data-pb-animation'] = $animation;
	}
	$wrapper_attributes = apply_filters( 'proofblocks_pricing_table_wrapper_attributes', $wrapper_attributes, $attributes );

	$attr_string = '';
	foreach ( $wrapper_attributes as $name => $value ) {
		$attr_string .= sprintf( ' %s="%s"', esc_attr( $name ), esc_attr( $value ) );
	}

	// Replace save.js's own wrapper class (still needed for the no-JS/no-PHP
	// HTML-fallback case) with the fully resolved attribute set for the live
	// render. Leading \s* matters: core's serialize_block() puts a newline
	// between the block comment and the content, so $content actually starts
	// "\n<div...", not "<div..." - without it this match silently fails and
	// the old <div> ends up double-wrapped inside the new one instead of replaced.
	$inner = preg_replace( '/^\s*<div[^>]*>/', '', $content, 1 );
	$inner = preg_replace( '/<\/div>\s*$/', '', $inner, 1 );
	$inner = wp_kses( $inner, prfbl_block_body_allowed_html() );

	do_action( 'proofblocks_after_render_block', 'proofblocks/pricing-table', $attributes );

	return sprintf( '<div%s>%s</div>', $attr_string, $inner );
}
