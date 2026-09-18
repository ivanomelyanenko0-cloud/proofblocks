import { __ } from '@wordpress/i18n';
import { Button, ButtonGroup } from '@wordpress/components';

/**
 * One-click "look" combinations offered in every block's Style panel. Each
 * block only applies the subset of fields it actually has attributes for
 * (see the `fields` prop on <DesignPresetPicker>) - e.g. Banner has no
 * `cardStyle` attribute, so it omits that key when applying a preset.
 */
export const DESIGN_PRESETS = {
	minimal: {
		label: __( 'Minimal', 'proofblocks' ),
		token: 'slate-gray',
		shape: 'sharp',
		cardStyle: 'flat',
		animation: 'none',
		font: '',
		textStyle: 'normal',
		textAlign: 'left',
	},
	bold: {
		label: __( 'Bold', 'proofblocks' ),
		token: 'warm-sunset',
		shape: 'pill',
		cardStyle: 'shadow',
		animation: 'slide',
		font: 'condensed',
		textStyle: 'uppercase',
		textAlign: 'center',
	},
	corporate: {
		label: __( 'Corporate', 'proofblocks' ),
		token: 'classic-blue',
		shape: 'rounded',
		cardStyle: 'bordered',
		animation: 'fade',
		font: 'sans',
		textStyle: 'normal',
		textAlign: 'left',
	},
	playful: {
		label: __( 'Playful', 'proofblocks' ),
		token: 'royal-purple',
		shape: 'pill',
		cardStyle: 'shadow',
		animation: 'fade',
		font: 'sans',
		textStyle: 'bold',
		textAlign: 'center',
	},
};

/**
 * @param {string[]}  fields  Preset keys this block actually has attributes for.
 * @param {Function}  onApply Called with an attributes object containing only `fields`.
 */
export function DesignPresetPicker( { fields, onApply } ) {
	return (
		<>
			<ButtonGroup>
				{ Object.entries( DESIGN_PRESETS ).map( ( [ slug, preset ] ) => (
					<Button
						key={ slug }
						variant="secondary"
						onClick={ () => {
							const values = {};
							fields.forEach( ( field ) => {
								values[ field ] = preset[ field ];
							} );
							onApply( values );
						} }
					>
						{ preset.label }
					</Button>
				) ) }
			</ButtonGroup>
			<p className="components-base-control__help">
				{ __( 'One-click starting point: fills in the color, style, font, and animation controls below. You can still change any of them afterward.', 'proofblocks' ) }
			</p>
		</>
	);
}
