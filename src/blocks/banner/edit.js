import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
	URLInput,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody, ButtonGroup, Button, ToggleControl } from '@wordpress/components';
import { TokenSwatches, ShapeControl, AnimationControl, FontControl, TextStyleControl } from '../../shared/editor-controls';
import { DesignPresetPicker } from '../../shared/design-presets';

export default function Edit( { attributes, setAttributes } ) {
	const {
		mediaId,
		mediaUrl,
		mediaAlt,
		heading,
		text,
		ctaText,
		ctaUrl,
		ctaNewTab,
		layout,
		token,
		textAlign,
		shape,
		animation,
		font,
		textStyle,
	} = attributes;

	const className = [
		`proofblocks-token-${ token }`,
		`proofblocks-banner--${ layout }`,
		'center' === textAlign ? 'proofblocks-align-center' : null,
		'rounded' !== shape ? `proofblocks-shape-${ shape }` : null,
		'none' !== animation ? `proofblocks-anim-${ animation }` : null,
		font ? `proofblocks-font-${ font }` : null,
		'normal' !== textStyle ? `proofblocks-textstyle-${ textStyle }` : null,
	].filter( Boolean ).join( ' ' );

	const blockProps = useBlockProps( { className } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'proofblocks' ) }>
					<ButtonGroup>
						<Button variant={ 'img-left' === layout ? 'primary' : 'secondary' } onClick={ () => setAttributes( { layout: 'img-left' } ) }>
							{ __( 'Image left', 'proofblocks' ) }
						</Button>
						<Button variant={ 'img-right' === layout ? 'primary' : 'secondary' } onClick={ () => setAttributes( { layout: 'img-right' } ) }>
							{ __( 'Image right', 'proofblocks' ) }
						</Button>
						<Button variant={ 'img-top' === layout ? 'primary' : 'secondary' } onClick={ () => setAttributes( { layout: 'img-top' } ) }>
							{ __( 'Image top', 'proofblocks' ) }
						</Button>
					</ButtonGroup>
					<p>{ __( 'Text alignment', 'proofblocks' ) }</p>
					<ButtonGroup>
						<Button variant={ 'left' === textAlign ? 'primary' : 'secondary' } onClick={ () => setAttributes( { textAlign: 'left' } ) }>
							{ __( 'Left', 'proofblocks' ) }
						</Button>
						<Button variant={ 'center' === textAlign ? 'primary' : 'secondary' } onClick={ () => setAttributes( { textAlign: 'center' } ) }>
							{ __( 'Center', 'proofblocks' ) }
						</Button>
					</ButtonGroup>
				</PanelBody>
				<PanelBody title={ __( 'Style', 'proofblocks' ) }>
					<p>{ __( 'Design preset', 'proofblocks' ) }</p>
					<DesignPresetPicker
						fields={ [ 'token', 'shape', 'animation', 'font', 'textStyle', 'textAlign' ] }
						onApply={ ( values ) => setAttributes( values ) }
					/>
					<TokenSwatches value={ token } onChange={ ( value ) => setAttributes( { token: value } ) } />
					<p>{ __( 'Corners', 'proofblocks' ) }</p>
					<ShapeControl value={ shape } onChange={ ( value ) => setAttributes( { shape: value } ) } />
					<p>{ __( 'Entrance animation', 'proofblocks' ) }</p>
					<AnimationControl value={ animation } onChange={ ( value ) => setAttributes( { animation: value } ) } />
					<FontControl value={ font } onChange={ ( value ) => setAttributes( { font: value } ) } />
					<TextStyleControl value={ textStyle } onChange={ ( value ) => setAttributes( { textStyle: value } ) } />
				</PanelBody>
				<PanelBody title={ __( 'Call to Action', 'proofblocks' ) }>
					<p>{ __( 'Link URL', 'proofblocks' ) }</p>
					<URLInput value={ ctaUrl } onChange={ ( value ) => setAttributes( { ctaUrl: value } ) } />
					<ToggleControl
						label={ __( 'Open in new tab', 'proofblocks' ) }
						checked={ !! ctaNewTab }
						onChange={ ( value ) => setAttributes( { ctaNewTab: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div className="proofblocks-banner__media">
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) => setAttributes( { mediaId: media.id, mediaUrl: media.url, mediaAlt: media.alt || '' } ) }
							allowedTypes={ [ 'image' ] }
							value={ mediaId }
							render={ ( { open } ) =>
								mediaUrl
									? <img src={ mediaUrl } alt={ mediaAlt } onClick={ open } style={ { cursor: 'pointer' } } />
									: <Button variant="secondary" onClick={ open }>{ __( 'Choose image', 'proofblocks' ) }</Button>
							}
						/>
					</MediaUploadCheck>
				</div>
				<div className="proofblocks-banner__body">
					<RichText
						tagName="h2"
						className="proofblocks-banner__heading"
						placeholder={ __( 'Banner heading', 'proofblocks' ) }
						value={ heading }
						onChange={ ( value ) => setAttributes( { heading: value } ) }
						allowedFormats={ [] }
					/>
					<RichText
						tagName="p"
						className="proofblocks-banner__text"
						placeholder={ __( 'Banner text…', 'proofblocks' ) }
						value={ text }
						onChange={ ( value ) => setAttributes( { text: value } ) }
					/>
					<RichText
						tagName="span"
						className="proofblocks-banner__cta"
						placeholder={ __( 'Call to action', 'proofblocks' ) }
						value={ ctaText }
						onChange={ ( value ) => setAttributes( { ctaText: value } ) }
						allowedFormats={ [] }
					/>
				</div>
			</div>
		</>
	);
}
