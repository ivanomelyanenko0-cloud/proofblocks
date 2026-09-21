<?php
/**
 * Plugin Name:       ProofBlocks
 * Plugin URI:        https://cognitolab.net/products/proofblocks
 * Description:       Pricing tables, banners/CTAs, and counters for the Block Editor.
 * Version:           1.0.2
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            CognitoLab
 * Author URI:        https://cognitolab.net
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       proofblocks
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PRFBL_VERSION', '1.0.2' );
define( 'PRFBL_PLUGIN_FILE', __FILE__ );
define( 'PRFBL_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PRFBL_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once PRFBL_PLUGIN_DIR . 'includes/helpers.php';
require_once PRFBL_PLUGIN_DIR . 'includes/extension-api.php';
require_once PRFBL_PLUGIN_DIR . 'includes/class-prfbl-design-tokens.php';
require_once PRFBL_PLUGIN_DIR . 'includes/icon-library.php';
require_once PRFBL_PLUGIN_DIR . 'includes/block-category.php';
require_once PRFBL_PLUGIN_DIR . 'includes/editor-assets.php';
require_once PRFBL_PLUGIN_DIR . 'includes/render-pricing-table.php';
require_once PRFBL_PLUGIN_DIR . 'includes/render-banner.php';
require_once PRFBL_PLUGIN_DIR . 'includes/render-counter.php';
require_once PRFBL_PLUGIN_DIR . 'includes/block-registration.php';
require_once PRFBL_PLUGIN_DIR . 'includes/settings.php';

/**
 * No load_plugin_textdomain() call: discouraged since WP 4.6 for plugins
 * hosted on wordpress.org - core auto-loads translations for wp.org-hosted
 * plugins using the plugin slug, no manual loading needed.
 */
