import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, Button, ButtonGroup, TextControl, RangeControl, SelectControl } from '@wordpress/components';
import { FREE_TOKEN_PRESETS } from '../../shared/design-tokens';
import { COUNTER_ICONS } from '../../shared/icons';
import { DesignPresetPicker } from '../../shared/design-presets';

function TokenSwatches( { value, onChange, allowNone = false } ) {
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

const CARD_STYLES = [
	{ value: 'flat', label: __( 'Flat', 'proofblocks' ) },
	{ value: 'bordered', label: __( 'Bordered', 'proofblocks' ) },
	{ value: 'shadow', label: __( 'Shadow', 'proofblocks' ) },
];

function CardStylePicker( { value, onChange } ) {
	return (
		<ButtonGroup>
			{ CARD_STYLES.map( ( option ) => (
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

function getCounterIcons() {
	return applyFilters( 'proofblocks.counter.icons', COUNTER_ICONS );
}

function IconGlyph( { slug } ) {
	const icon = getCounterIcons()[ slug ];
	if ( ! icon ) {
		return null;
	}
	return (
		<svg
			className="proofblocks-icon proofblocks-counter__icon-svg"
			width="28"
			height="28"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d={ icon.path } />
		</svg>
	);
}

function IconPicker( { value, onChange } ) {
	return (
		<div className="proofblocks-icon-picker">
			<Button
				className={ 'proofblocks-icon-picker__option' + ( value ? '' : ' is-active' ) }
				label={ __( 'No icon', 'proofblocks' ) }
				onClick={ () => onChange( '' ) }
			>
				{ __( 'None', 'proofblocks' ) }
			</Button>
			{ Object.entries( getCounterIcons() ).map( ( [ slug, icon ] ) => (
				<Button
					key={ slug }
					className={ 'proofblocks-icon-picker__option' + ( value === slug ? ' is-active' : '' ) }
					label={ icon.label }
					onClick={ () => onChange( slug ) }
				>
					<IconGlyph slug={ slug } />
				</Button>
			) ) }
		</div>
	);
}

const ANIMATIONS = [
	{ value: 'none', label: __( 'None', 'proofblocks' ) },
	{ value: 'fade', label: __( 'Fade in', 'proofblocks' ) },
	{ value: 'slide', label: __( 'Slide up', 'proofblocks' ) },
];

function AnimationPicker( { value, onChange } ) {
	return (
		<ButtonGroup>
			{ ANIMATIONS.map( ( option ) => (
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

function FontPicker( { value, onChange } ) {
	const options = [
		{ value: '', label: __( 'Default (matches your theme)', 'proofblocks' ) },
		{ value: 'sans', label: __( 'Sans-serif', 'proofblocks' ) },
		{ value: 'serif', label: __( 'Serif', 'proofblocks' ) },
		{ value: 'mono', label: __( 'Monospace', 'proofblocks' ) },
		{ value: 'condensed', label: __( 'Bold condensed (display)', 'proofblocks' ) },
	];
	return <SelectControl label={ __( 'Font', 'proofblocks' ) } value={ value } options={ options } onChange={ onChange } />;
}

function TextStylePicker( { value, onChange } ) {
	const options = [
		{ value: 'normal', label: __( 'Normal', 'proofblocks' ) },
		{ value: 'bold', label: __( 'Bold', 'proofblocks' ) },
		{ value: 'uppercase', label: __( 'Uppercase, spaced out', 'proofblocks' ) },
		{ value: 'italic', label: __( 'Italic', 'proofblocks' ) },
	];
	return <SelectControl label={ __( 'Text style', 'proofblocks' ) } value={ value } options={ options } onChange={ onChange } />;
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		mode,
		numberValue,
		numberPrefix,
		numberSuffix,
		numberDuration,
		countdownDate,
		countdownExpiredText,
		label,
		icon,
		iconPosition,
		token,
		cardStyle,
		animation,
		font,
		textStyle,
	} = attributes;

	const className = [
		token ? `proofblocks-token-${ token }` : null,
		'flat' !== cardStyle ? `proofblocks-card-${ cardStyle }` : null,
		icon && 'inline' === iconPosition ? 'proofblocks-counter--icon-inline' : null,
		'none' !== animation ? `proofblocks-anim-${ animation }` : null,
		font ? `proofblocks-font-${ font }` : null,
		'normal' !== textStyle ? `proofblocks-textstyle-${ textStyle }` : null,
	].filter( Boolean ).join( ' ' );

	const blockProps = useBlockProps( { className } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Mode', 'proofblocks' ) }>
					<ButtonGroup>
						<Button variant={ 'number' === mode ? 'primary' : 'secondary' } onClick={ () => setAttributes( { mode: 'number' } ) }>
							{ __( 'Number', 'proofblocks' ) }
						</Button>
						<Button variant={ 'countdown' === mode ? 'primary' : 'secondary' } onClick={ () => setAttributes( { mode: 'countdown' } ) }>
							{ __( 'Countdown', 'proofblocks' ) }
						</Button>
					</ButtonGroup>
				</PanelBody>

				{ 'number' === mode ? (
					<PanelBody title={ __( 'Number settings', 'proofblocks' ) }>
						<TextControl
							label={ __( 'Value', 'proofblocks' ) }
							type="number"
							value={ numberValue }
							onChange={ ( value ) => setAttributes( { numberValue: Number( value ) || 0 } ) }
						/>
						<TextControl
							label={ __( 'Prefix', 'proofblocks' ) }
							value={ numberPrefix }
							onChange={ ( value ) => setAttributes( { numberPrefix: value } ) }
						/>
						<TextControl
							label={ __( 'Suffix', 'proofblocks' ) }
							value={ numberSuffix }
							onChange={ ( value ) => setAttributes( { numberSuffix: value } ) }
						/>
						<RangeControl
							label={ __( 'Animation duration (ms)', 'proofblocks' ) }
							min={ 500 }
							max={ 6000 }
							step={ 100 }
							value={ numberDuration }
							onChange={ ( value ) => setAttributes( { numberDuration: value } ) }
						/>
					</PanelBody>
				) : (
					<PanelBody title={ __( 'Countdown settings', 'proofblocks' ) }>
						<TextControl
							label={ __( 'Target date/time', 'proofblocks' ) }
							type="datetime-local"
							value={ countdownDate }
							onChange={ ( value ) => setAttributes( { countdownDate: value } ) }
						/>
						<TextControl
							label={ __( 'Expired text', 'proofblocks' ) }
							value={ countdownExpiredText }
							onChange={ ( value ) => setAttributes( { countdownExpiredText: value } ) }
						/>
					</PanelBody>
				) }

				<PanelBody title={ __( 'Style', 'proofblocks' ) }>
					<p>{ __( 'Design preset', 'proofblocks' ) }</p>
					<DesignPresetPicker
						fields={ [ 'token', 'cardStyle', 'animation', 'font', 'textStyle' ] }
						onApply={ ( picked ) => setAttributes( picked ) }
					/>
					<TokenSwatches value={ token } onChange={ ( value ) => setAttributes( { token: value } ) } allowNone />
					<p>{ __( 'Card style', 'proofblocks' ) }</p>
					<CardStylePicker value={ cardStyle } onChange={ ( value ) => setAttributes( { cardStyle: value } ) } />
					<p>{ __( 'Entrance animation', 'proofblocks' ) }</p>
					<AnimationPicker value={ animation } onChange={ ( value ) => setAttributes( { animation: value } ) } />
					<FontPicker value={ font } onChange={ ( value ) => setAttributes( { font: value } ) } />
					<TextStylePicker value={ textStyle } onChange={ ( value ) => setAttributes( { textStyle: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Icon', 'proofblocks' ) }>
					<IconPicker value={ icon } onChange={ ( value ) => setAttributes( { icon: value } ) } />
					{ icon && (
						<>
							<p>{ __( 'Icon position', 'proofblocks' ) }</p>
							<ButtonGroup>
								<Button
									variant={ 'stacked' === iconPosition ? 'primary' : 'secondary' }
									onClick={ () => setAttributes( { iconPosition: 'stacked' } ) }
								>
									{ __( 'Above number', 'proofblocks' ) }
								</Button>
								<Button
									variant={ 'inline' === iconPosition ? 'primary' : 'secondary' }
									onClick={ () => setAttributes( { iconPosition: 'inline' } ) }
								>
									{ __( 'Beside number', 'proofblocks' ) }
								</Button>
							</ButtonGroup>
						</>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ icon && <IconGlyph slug={ icon } /> }
				<span className="proofblocks-counter__value">
					{ 'number' === mode ? `${ numberPrefix }${ numberValue }${ numberSuffix }` : __( '00:00:00:00', 'proofblocks' ) }
				</span>
				<RichText
					tagName="span"
					className="proofblocks-counter__label"
					placeholder={ __( 'Label', 'proofblocks' ) }
					value={ label }
					onChange={ ( value ) => setAttributes( { label: value } ) }
					allowedFormats={ [] }
				/>
			</div>
		</>
	);
}
