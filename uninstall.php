<?php
/**
 * Uninstall handler.
 *
 * ProofBlocks has no custom post type - block content lives in ordinary
 * page/post content and is never touched by uninstall (it remains as
 * standard Gutenberg HTML, satisfying the DoD's "stays as HTML fallback"
 * requirement automatically). Only plugin-specific options are removed,
 * and only when the admin has explicitly opted in.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

if ( ! get_option( 'prfbl_remove_data_on_uninstall' ) ) {
	return;
}

delete_option( 'prfbl_remove_data_on_uninstall' );
