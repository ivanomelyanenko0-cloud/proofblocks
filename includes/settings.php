<?php
/**
 * Single-option settings screen: "remove data on uninstall" opt-in.
 * Mirrors heralda/includes/settings.php - ProofBlocks has no CPT admin
 * screen to attach to, so this lives under Settings instead.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function prfbl_register_settings() {
	register_setting(
		'prfbl_settings',
		'prfbl_remove_data_on_uninstall',
		array(
			'type'              => 'boolean',
			'default'           => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
		)
	);
}
add_action( 'admin_init', 'prfbl_register_settings' );

function prfbl_register_settings_page() {
	add_options_page(
		__( 'ProofBlocks Settings', 'proofblocks' ),
		__( 'ProofBlocks', 'proofblocks' ),
		'manage_options',
		'prfbl_settings',
		'prfbl_render_settings_page'
	);
}
add_action( 'admin_menu', 'prfbl_register_settings_page' );

function prfbl_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'ProofBlocks Settings', 'proofblocks' ); ?></h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'prfbl_settings' ); ?>
			<table class="form-table">
				<tr>
					<th scope="row"><?php esc_html_e( 'Uninstall', 'proofblocks' ); ?></th>
					<td>
						<label>
							<input type="checkbox" name="prfbl_remove_data_on_uninstall" value="1" <?php checked( get_option( 'prfbl_remove_data_on_uninstall' ) ); ?> />
							<?php esc_html_e( 'Remove ProofBlocks options when the plugin is deleted', 'proofblocks' ); ?>
						</label>
						<p class="description"><?php esc_html_e( 'Unchecked by default. Block content in your pages is never removed by uninstall - it stays as standard content either way.', 'proofblocks' ); ?></p>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
