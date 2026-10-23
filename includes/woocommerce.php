<?php
/**
 * Optional WooCommerce data sources for the Counter block: a countdown to
 * when this product's sale really ends, and a number showing how many are
 * really left in stock - both read from the product itself instead of
 * typed into the block.
 *
 * WooCommerce is never required. Every entry point here checks for it, and
 * without it a Counter set to one of these sources simply falls back
 * (hidden, or its fallback text) - it never falls back to a made-up date
 * or number.
 *
 * Read-only: nothing here writes to WooCommerce or stores state of its own.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return bool
 */
function prfbl_wc_active() {
	return function_exists( 'wc_get_product' );
}

/**
 * When the current sale on a product (or one of its variations) ends.
 *
 * - $variation_id > 0: that variation only (it must belong to $product_id).
 * - Variable product, $variation_id 0: the soonest end among variations that
 *   are on sale right now and have an end date.
 * - Anything else: the product's own sale.
 *
 * A sale that is scheduled but hasn't started, or has no end date, yields
 * null: there's no honest date to count down to.
 *
 * @param int $product_id
 * @param int $variation_id
 * @return int|null UTC timestamp, or null when there's nothing to count down to.
 */
function prfbl_wc_get_sale_end( $product_id, $variation_id = 0 ) {
	if ( ! prfbl_wc_active() || ! $product_id ) {
		return null;
	}

	$product = wc_get_product( $product_id );
	if ( ! $product || 'publish' !== $product->get_status() ) {
		return null;
	}

	if ( $variation_id ) {
		$variation = wc_get_product( $variation_id );
		if ( ! $variation || 'publish' !== $variation->get_status() || (int) $variation->get_parent_id() !== (int) $product->get_id() ) {
			return null;
		}
		return prfbl_wc_single_sale_end( $variation );
	}

	if ( $product->is_type( 'variable' ) ) {
		$soonest = null;
		// Visible children only: skips disabled variations (and, if the
		// store hides out-of-stock items, sold-out ones).
		foreach ( $product->get_visible_children() as $child_id ) {
			$end = prfbl_wc_single_sale_end( wc_get_product( $child_id ) );
			if ( null !== $end && ( null === $soonest || $end < $soonest ) ) {
				$soonest = $end;
			}
		}
		return $soonest;
	}

	return prfbl_wc_single_sale_end( $product );
}

/**
 * @param WC_Product|false|null $product
 * @return int|null
 */
function prfbl_wc_single_sale_end( $product ) {
	if ( ! $product || ! $product->is_on_sale() ) {
		return null;
	}

	$date = $product->get_date_on_sale_to();
	if ( ! $date || $date->getTimestamp() <= time() ) {
		return null;
	}

	return $date->getTimestamp();
}

/**
 * Whether the store shows stock amounts at all. With WooCommerce's "Stock
 * display format" set to never show the amount, the store owner has
 * decided stock levels are private, so ProofBlocks doesn't reveal them
 * either - not on the page, not through its REST endpoint.
 *
 * @return bool
 */
function prfbl_wc_stock_amounts_public() {
	return 'no_amount' !== get_option( 'woocommerce_stock_format', '' );
}

/**
 * How many of a product (or one of its variations) are left.
 *
 * - $variation_id > 0: that variation only (it must belong to $product_id).
 *   A variation whose stock is managed on the parent reports the parent's.
 * - Variable product, $variation_id 0: the parent's stock when it's
 *   managed on the parent, otherwise the total across visible variations -
 *   but only if every one of them tracks stock; one untracked variation
 *   makes the total unknowable.
 * - Anything else: the product's own stock.
 *
 * No stock tracking, nothing left, or amounts hidden by the store yields
 * null: there's no honest number to show.
 *
 * @param int $product_id
 * @param int $variation_id
 * @return int|null
 */
function prfbl_wc_get_stock( $product_id, $variation_id = 0 ) {
	if ( ! prfbl_wc_active() || ! $product_id || ! prfbl_wc_stock_amounts_public() ) {
		return null;
	}

	$product = wc_get_product( $product_id );
	if ( ! $product || 'publish' !== $product->get_status() ) {
		return null;
	}

	if ( $variation_id ) {
		$variation = wc_get_product( $variation_id );
		if ( ! $variation || 'publish' !== $variation->get_status() || (int) $variation->get_parent_id() !== (int) $product->get_id() ) {
			return null;
		}
		return prfbl_wc_single_stock( $variation );
	}

	if ( $product->is_type( 'variable' ) && ! $product->managing_stock() ) {
		$total = 0;
		foreach ( $product->get_visible_children() as $child_id ) {
			$child = wc_get_product( $child_id );
			if ( ! $child || ! $child->managing_stock() ) {
				return null;
			}
			$total += max( 0, (int) $child->get_stock_quantity() );
		}
		return $total > 0 ? $total : null;
	}

	return prfbl_wc_single_stock( $product );
}

/**
 * @param WC_Product|false|null $product
 * @return int|null
 */
function prfbl_wc_single_stock( $product ) {
	if ( ! $product || ! $product->managing_stock() ) {
		return null;
	}

	$quantity = $product->get_stock_quantity();
	return ( null !== $quantity && $quantity > 0 ) ? (int) $quantity : null;
}

/**
 * The product a Counter with productId 0 ("current product") belongs to:
 * the post in block context (product templates, Query Loop), else the
 * single product page being viewed.
 *
 * @param WP_Block|null $block
 * @return int
 */
function prfbl_wc_current_product_id( $block = null ) {
	if ( $block instanceof WP_Block && ! empty( $block->context['postId'] ) && 'product' === get_post_type( (int) $block->context['postId'] ) ) {
		return (int) $block->context['postId'];
	}

	if ( is_singular( 'product' ) ) {
		return (int) get_queried_object_id();
	}

	return 0;
}

/**
 * Public, read-only sale-end and stock lookup the Counter's view script
 * calls on page load, so a page served from a full-page cache still shows
 * the product's current sale end and stock instead of whatever was true
 * when the page was cached. Exposes only what the store already shows
 * publicly (stock only when the store displays stock amounts).
 */
function prfbl_wc_register_rest_route() {
	if ( ! prfbl_wc_active() ) {
		return;
	}

	register_rest_route(
		'proofblocks/v1',
		'/wc-product/(?P<id>\d+)',
		array(
			'methods'             => 'GET',
			'permission_callback' => '__return_true',
			'args'                => array(
				'id'        => array(
					'sanitize_callback' => 'absint',
				),
				'variation' => array(
					'default'           => 0,
					'sanitize_callback' => 'absint',
				),
			),
			'callback'            => function ( WP_REST_Request $request ) {
				$product_id = (int) $request['id'];
				$product    = wc_get_product( $product_id );

				if ( ! $product || 'publish' !== $product->get_status() || post_password_required( $product_id ) ) {
					return new WP_Error( 'proofblocks_no_product', __( 'Product not found.', 'proofblocks' ), array( 'status' => 404 ) );
				}

				$end      = prfbl_wc_get_sale_end( $product_id, (int) $request['variation'] );
				$response = new WP_REST_Response(
					array(
						'saleEnd' => null === $end ? null : gmdate( 'c', $end ),
						'stock'   => prfbl_wc_get_stock( $product_id, (int) $request['variation'] ),
					)
				);
				// Short enough that a changed sale or stock shows up within a minute,
				// long enough that a busy page doesn't hit PHP on every view.
				$response->header( 'Cache-Control', 'public, max-age=60' );

				return $response;
			},
		)
	);
}
add_action( 'rest_api_init', 'prfbl_wc_register_rest_route' );

/**
 * Tells the Counter editor whether to offer the WooCommerce sources at all,
 * and whether the store hides stock amounts.
 */
function prfbl_wc_editor_data() {
	$data = array(
		'active'      => prfbl_wc_active(),
		'stockHidden' => prfbl_wc_active() && ! prfbl_wc_stock_amounts_public(),
	);
	wp_add_inline_script(
		prfbl_get_block_editor_script_handle( 'proofblocks/counter' ),
		'window.proofblocksWoo = ' . wp_json_encode( $data ) . ';',
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'prfbl_wc_editor_data' );

/**
 * ProofBlocks never touches orders or checkout, so it's compatible with
 * both; declaring it keeps WooCommerce from listing it as "uncertain".
 */
function prfbl_wc_declare_compatibility() {
	if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', PRFBL_PLUGIN_FILE, true );
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', PRFBL_PLUGIN_FILE, true );
	}
}
add_action( 'before_woocommerce_init', 'prfbl_wc_declare_compatibility' );
