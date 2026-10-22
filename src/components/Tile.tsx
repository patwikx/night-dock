import {useState} from 'preact/hooks';
import {CheckMark, Glyph, type GlyphName} from './Glyph';

/** Everything a tile needs to draw itself; rows and grids build these from app/input data. */
export interface TileModel {
	key: string;
	label: string;
	/** full-bleed artwork (app icons) */
	imageUrl?: string;
	/** LG's grey line-art input icons, drawn smaller and lightened */
	glyphImageUrl?: string;
	/** built-in vector icon */
	glyph?: GlyphName;
	/** monogram background when there is no artwork */
	color?: string;
	logo?: boolean;
}

interface Props {
	model: TileModel;
	focused: boolean;
	/** picked up in re-order mode */
	lifted?: boolean;
	/** shown with a tick badge (settings picker) */
	checked?: boolean;
	/** greyed out (settings picker: not on the home screen) */
	dimmed?: boolean;
	onHover?: () => void;
	onActivate?: () => void;
}

export function Tile ({model, focused, lifted, checked, dimmed, onHover, onActivate}: Props) {
	const [failedImage, setFailedImage] = useState<string | undefined>();
	const classes = ['tile', focused && 'tile--focused', lifted && 'tile--lifted', dimmed && 'tile--dimmed'].filter(Boolean).join(' ');
	return (
		<button type="button" class={classes} aria-label={model.label} aria-pressed={checked === undefined ? undefined : checked}
			tabIndex={focused ? 0 : -1} onFocus={() => { if (!focused && onHover) onHover(); }} onMouseMove={onHover} onClick={onActivate}>
			<div class="tile__box" style={model.color ? {background: model.color} : undefined}>
				{model.imageUrl && failedImage !== model.imageUrl
					? <img class={`tile__image${model.logo ? ' tile__image--logo' : ''}`} src={model.imageUrl} alt="" onError={() => setFailedImage(model.imageUrl)} />
					: model.glyphImageUrl
						? <img class="tile__image tile__image--glyph" src={model.glyphImageUrl} alt="" />
						: model.glyph
							? <Glyph name={model.glyph} />
							: <div class="tile__monogram">{model.label.charAt(0).toUpperCase()}</div>}
				{checked && <div class="tile__badge"><CheckMark /></div>}
			</div>
			<div class="tile__label">{model.label}</div>
		</button>
	);
}
