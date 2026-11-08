<?php
/**
 * Optional WooCommerce data sources for the Counter block: a countdown to
 * when this product's sale really ends, and numbers for how many are
 * really left in stock, how many have sold, how many reviews it has and its
 * average rating - all read from the product itself instead of typed into
 * the block.
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
 * Whether the store shows reviews (and, for $ratings, star ratings) at all.
 * With them turned off in WooCommerce, ProofBlocks doesn't show counts or
 * averages the store itself keeps off its pages.
 *
 * @param bool $ratings Also require star ratings to be enabled.
 * @return bool
 */
function prfbl_wc_reviews_public( $ratings = false ) {
	if ( 'no' === get_option( 'woocommerce_enable_reviews', 'yes' ) ) {
		return false;
	}
	return ! $ratings || 'no' !== get_option( 'woocommerce_enable_review_rating', 'yes' );
}

/**
 * A published, visible-to-everyone product, or null.
 *
 * @param int $product_id
 * @return WC_Product|null
 */
function prfbl_wc_public_product( $product_id ) {
	if ( ! prfbl_wc_active() || ! $product_id ) {
		return null;
	}
	$product = wc_get_product( $product_id );
	if ( ! $product || 'publish' !== $product->get_status() || $product->is_type( 'variation' ) ) {
		return null;
	}
	return $product;
}

/**
 * How many units of a product have sold, as WooCommerce counts them
 * (paid orders; cancelled and refunded orders are taken back out). Per
 * product, never per variation: WooCommerce keeps the count on the parent.
 *
 * Nothing sold yet yields null: "0 sold" is not proof of anything.
 *
 * @param int $product_id
 * @return int|null
 */
function prfbl_wc_get_units_sold( $product_id ) {
	$product = prfbl_wc_public_product( $product_id );
	if ( ! $product ) {
		return null;
	}
	$sold = (int) $product->get_total_sales();
	return $sold > 0 ? $sold : null;
}

/**
 * Approved review count and average star rating, as the product page shows
 * them. Null when the store has reviews (or ratings) turned off, or the
 * product has none yet.
 *
 * @param int $product_id
 * @return array{count: int, rating: float}|null
 */
function prfbl_wc_get_review_stats( $product_id ) {
	$product = prfbl_wc_public_product( $product_id );
	if ( ! $product || ! prfbl_wc_reviews_public() ) {
		return null;
	}
	$count = (int) $product->get_review_count();
	if ( $count < 1 ) {
		return null;
	}
	return array(
		'count'  => $count,
		'rating' => prfbl_wc_reviews_public( true ) ? round( (float) $product->get_average_rating(), 2 ) : 0.0,
	);
}

/**
 * The live number for one of the Counter's product-data sources.
 *
 * @param string $source wc_sold | wc_reviews | wc_rating.
 * @param int    $product_id
 * @return array{value: float|int, text: string}|null
 */
function prfbl_wc_get_live_number( $source, $product_id ) {
	if ( 'wc_sold' === $source ) {
		$sold = prfbl_wc_get_units_sold( $product_id );
		return null === $sold ? null : array( 'value' => $sold, 'text' => (string) $sold );
	}

	$stats = prfbl_wc_get_review_stats( $product_id );
	if ( null === $stats ) {
		return null;
	}
	if ( 'wc_reviews' === $source ) {
		return array( 'value' => $stats['count'], 'text' => (string) $stats['count'] );
	}
	if ( 'wc_rating' === $source && $stats['rating'] > 0 ) {
		return array( 'value' => $stats['rating'], 'text' => prfbl_wc_format_rating( $stats['rating'] ) );
	}
	return null;
}

/**
 * @param float $rating
 * @return string One decimal in the site's number format, e.g. "4.8" or "4,8".
 */
function prfbl_wc_format_rating( $rating ) {
	return number_format_i18n( (float) $rating, 1 );
}

/**
 * Units sold isn't something WooCommerce shows visitors, so the public
 * endpoint only reveals it for a product a published Counter asks about:
 * the block's markup carries this signature, and the endpoint checks it.
 * Anyone else asking about any other product gets no sales figure.
 *
 * @param int $product_id
 * @return string
 */
function prfbl_wc_sold_signature( $product_id ) {
	return substr( hash_hmac( 'sha256', 'proofblocks-sold|' . (int) $product_id, wp_salt( 'nonce' ) ), 0, 20 );
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
				'sig'       => array(
					'default'           => '',
					'sanitize_callback' => 'sanitize_key',
				),
			),
			'callback'            => function ( WP_REST_Request $request ) {
				$product_id = (int) $request['id'];
				$product    = wc_get_product( $product_id );

				if ( ! $product || 'publish' !== $product->get_status() || post_password_required( $product_id ) ) {
					return new WP_Error( 'proofblocks_no_product', __( 'Product not found.', 'proofblocks' ), array( 'status' => 404 ) );
				}

				$end    = prfbl_wc_get_sale_end( $product_id, (int) $request['variation'] );
				$stats  = prfbl_wc_get_review_stats( $product_id );
				$signed = hash_equals( prfbl_wc_sold_signature( $product_id ), (string) $request['sig'] );
				// Editors see it in the block sidebar before the block is published.
				$editor = ! $signed && current_user_can( 'edit_posts' );

				$response = new WP_REST_Response(
					array(
						'saleEnd'    => null === $end ? null : gmdate( 'c', $end ),
						'stock'      => prfbl_wc_get_stock( $product_id, (int) $request['variation'] ),
						'sold'       => $signed || $editor ? prfbl_wc_get_units_sold( $product_id ) : null,
						'reviews'    => null === $stats ? null : $stats['count'],
						'rating'     => null === $stats || ! $stats['rating'] ? null : $stats['rating'],
						'ratingText' => null === $stats || ! $stats['rating'] ? null : prfbl_wc_format_rating( $stats['rating'] ),
					)
				);
				// Short enough that a changed sale or stock shows up within a minute,
				// long enough that a busy page doesn't hit PHP on every view. An
				// editor's answer includes the sales figure without a signature, so
				// it must not land in a shared cache.
				$response->header( 'Cache-Control', $editor ? 'private, no-store' : 'public, max-age=60' );

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
		'active'        => prfbl_wc_active(),
		'stockHidden'   => prfbl_wc_active() && ! prfbl_wc_stock_amounts_public(),
		'reviewsHidden' => prfbl_wc_active() && ! prfbl_wc_reviews_public(),
		'ratingsHidden' => prfbl_wc_active() && ! prfbl_wc_reviews_public( true ),
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
