import { __ } from '@wordpress/i18n';
import { Button, ButtonGroup, SelectControl } from '@wordpress/components';
import { FREE_TOKEN_PRESETS } from './design-tokens';

/**
 * Color-token picker shared by every block with a `token` attribute. Pro's
 * custom token sets aren't selectable here - Free only ever shows its own
 * fixed 8, Pro extends this component separately.
 *
 * @param {string}   value     Selected token slug, or '' for none.
 * @param {Function} onChange
 * @param {boolean}  allowNone Whether to show a "no color" swatch (default false).
 */
export function TokenSwatches( { value, onChange, allowNone = false } ) {
	return (
		<div className="proofblocks-token-swatches">
			{ allowNone && (
				<Button
					className={ 'proofblocks-token-swatch proofblocks-token-swatch--none' + ( value ? '' : ' is-active' ) }
					label={ __( 'Default (no color)', 'proofblocks' ) }
					onClick={ () => onChange( '' ) }
				/>
			) }
			{ Object.entries( FREE_TOKEN_PRESETS ).map( ( [ slug, preset ] ) => (
				<Button
					key={ slug }
					className={ 'proofblocks-token-swatch' + ( value === slug ? ' is-active' : '' ) }
					style={ { backgroundColor: preset.primary } }
					label={ preset.label }
					onClick={ () => onChange( slug ) }
				/>
			) ) }
		</div>
	);
}

const SHAPE_OPTIONS = [
	{ value: 'sharp', label: __( 'Sharp', 'proofblocks' ) },
	{ value: 'rounded', label: __( 'Rounded', 'proofblocks' ) },
	{ value: 'pill', label: __( 'Pill', 'proofblocks' ) },
];

export function ShapeControl( { value, onChange } ) {
	return (
		<ButtonGroup>
			{ SHAPE_OPTIONS.map( ( option ) => (
				<Button
					key={ option.value }
					variant={ value === option.value ? 'primary' : 'secondary' }
					onClick={ () => onChange( option.value ) }
				>
					{ option.label }
				</Button>
			) ) }
		</ButtonGroup>
	);
}

const CARD_STYLE_OPTIONS = [
	{ value: 'flat', label: __( 'Flat', 'proofblocks' ) },
	{ value: 'bordered', label: __( 'Bordered', 'proofblocks' ) },
	{ value: 'shadow', label: __( 'Shadow', 'proofblocks' ) },
];

export function CardStyleControl( { value, onChange } ) {
	return (
		<ButtonGroup>
			{ CARD_STYLE_OPTIONS.map( ( option ) => (
				<Button
					key={ option.value }
					variant={ value === option.value ? 'primary' : 'secondary' }
					onClick={ () => onChange( option.value ) }
				>
					{ option.label }
				</Button>
			) ) }
		</ButtonGroup>
	);
}

const ANIMATION_OPTIONS = [
	{ value: 'none', label: __( 'None', 'proofblocks' ) },
	{ value: 'fade', label: __( 'Fade in', 'proofblocks' ) },
	{ value: 'slide', label: __( 'Slide up', 'proofblocks' ) },
];

export function AnimationControl( { value, onChange } ) {
	return (
		<ButtonGroup>
			{ ANIMATION_OPTIONS.map( ( option ) => (
				<Button
					key={ option.value }
					variant={ value === option.value ? 'primary' : 'secondary' }
					onClick={ () => onChange( option.value ) }
				>
					{ option.label }
				</Button>
			) ) }
		</ButtonGroup>
	);
}

export function FontControl( { value, onChange } ) {
	const options = [
		{ value: '', label: __( 'Default (matches your theme)', 'proofblocks' ) },
		{ value: 'sans', label: __( 'Sans-serif', 'proofblocks' ) },
		{ value: 'serif', label: __( 'Serif', 'proofblocks' ) },
		{ value: 'mono', label: __( 'Monospace', 'proofblocks' ) },
		{ value: 'condensed', label: __( 'Bold condensed (display)', 'proofblocks' ) },
	];
	return (
		<SelectControl
			label={ __( 'Font', 'proofblocks' ) }
			value={ value }
			options={ options }
			onChange={ onChange }
		/>
	);
}

export function TextStyleControl( { value, onChange } ) {
	const options = [
		{ value: 'normal', label: __( 'Normal', 'proofblocks' ) },
		{ value: 'bold', label: __( 'Bold', 'proofblocks' ) },
		{ value: 'uppercase', label: __( 'Uppercase, spaced out', 'proofblocks' ) },
		{ value: 'italic', label: __( 'Italic', 'proofblocks' ) },
	];
	return (
		<SelectControl
			label={ __( 'Text style', 'proofblocks' ) }
			value={ value }
			options={ options }
			onChange={ onChange }
		/>
	);
}
