import { __ } from '@wordpress/i18n';
import { Button, ButtonGroup } from '@wordpress/components';

/**
 * One-click "look" combinations offered in every block's Style panel. Each
 * block only applies the subset of fields it actually has attributes for
 * (see the `fields` prop on <DesignPresetPicker>) - e.g. Banner has no
 * `cardStyle` attribute, so it omits that key when applying a preset.
 *
 * Values are matched to the reference mockups (4 preset boards covering
 * Pricing Table, Banner and Counter) as closely as this system's existing
 * fields allow - see the per-field comments below for the mockup values a
 * choice stands in for. `layout` and `iconPosition` exist only for blocks
 * that have those attributes (Banner and Counter respectively) and are
 * ignored by `fields` lists that don't request them. `popularStyle` isn't a
 * top-level block attribute at all - it belongs to the Pricing Table's
 * column children - so DesignPresetPicker passes the whole preset object
 * through to onApply, and only the pricing-table block reads it (see its
 * edit.js) to update any popular columns.
 */
export const DESIGN_PRESETS = {
	minimal: {
		label: __( 'Minimal', 'proofblocks' ),
		token: 'slate-gray',
		// Mockup: 6px card radius - a small, present rounding, not sharp
		// corners. 'rounded' (the shape system's ~8px default) is a closer
		// match than 'sharp' (0px).
		shape: 'rounded',
		// Mockup: 1px neutral border + a shadow too faint to read as one
		// (0 1px 2px, 4% opacity). 'bordered' keeps the visible border;
		// 'flat' would drop it entirely.
		cardStyle: 'bordered',
		animation: 'none',
		font: '',
		textStyle: 'normal',
		textAlign: 'left',
		// Mockup's Banner board: image on the right, text on the left.
		layout: 'img-right',
		// Mockup's Counter board: icon beside the number, not above it.
		iconPosition: 'inline',
		popularStyle: 'border-glow',
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
		// Mockup's Banner board: image stacked above the text.
		layout: 'img-top',
		// Mockup's Counter board: icon stacked above the number.
		iconPosition: 'stacked',
		popularStyle: 'border-glow',
	},
	corporate: {
		label: __( 'Corporate', 'proofblocks' ),
		token: 'classic-blue',
		shape: 'rounded',
		cardStyle: 'bordered',
		animation: 'fade',
		// Mockup: Source Serif 4 / Georgia, not a sans-serif.
		font: 'serif',
		textStyle: 'normal',
		textAlign: 'left',
		// Mockup's Banner board: image on the left, text on the right.
		layout: 'img-left',
		iconPosition: 'inline',
		popularStyle: 'border-glow',
	},
	playful: {
		label: __( 'Playful', 'proofblocks' ),
		// Mockup: pink accent (#ff6b9d) with a gold/amber border tint
		// (#ffd166) - Rose Pink's pink primary + amber accent is a much
		// closer read than Royal Purple's purple.
		token: 'rose-pink',
		shape: 'pill',
		cardStyle: 'shadow',
		animation: 'fade',
		font: 'sans',
		textStyle: 'bold',
		textAlign: 'center',
		layout: 'img-top',
		iconPosition: 'stacked',
		// Mockup: Playful is the only preset with a corner ribbon instead
		// of the pill badge the other three use.
		popularStyle: 'ribbon',
	},
};

/**
 * @param {string[]}  fields  Preset keys this block actually has attributes for.
 * @param {Function}  onApply Called with (values, preset): `values` holds only
 *                            `fields`, ready for setAttributes(); `preset` is
 *                            the full preset object, for callers that also
 *                            need a field with no matching top-level attribute
 *                            (e.g. Pricing Table reading `preset.popularStyle`
 *                            for its column children).
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
							onApply( values, preset );
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
