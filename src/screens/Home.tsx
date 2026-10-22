import {useCallback, useEffect, useMemo, useRef, useState} from 'preact/hooks';
import {Clock} from '../components/Clock';
import {Glyph} from '../components/Glyph';
import {Tile, type TileModel} from '../components/Tile';
import {useKeys, type NavKey} from '../hooks/useKeys';
import {useClock} from '../hooks/useClock';
import {useTimeFormat} from '../hooks/useTimeFormat';
import {makeHomeBands, moveHomeFocus, type HomeFocus} from '../lib/homeNavigation';
import {LAYOUT} from '../theme/tokens';

export interface HomeRow { id: string; label: string; items: TileModel[]; emptyText?: string; }
interface Props { rows: HomeRow[]; active: boolean; loading?: boolean; onActivate: (rowId: string, item: TileModel) => void; }

export function Home ({rows, active, loading, onActivate}: Props) {
	const now = useClock(active);
	const timeFormat = useTimeFormat();
	const groups = rows.filter((row) => row.id !== 'misc');
	const toolbar = rows.find((row) => row.id === 'misc');
	const bands = useMemo(() => makeHomeBands(groups, LAYOUT.homeColumns), [rows]);
	const [focus, setFocus] = useState<HomeFocus>({band: 0, column: 0, preferredColumn: 0});
	const [zone, setZone] = useState<'grid' | 'toolbar'>('grid');
	const [toolIndex, setToolIndex] = useState(1);
	const viewport = useRef<HTMLDivElement>(null);
	const bandIndex = Math.max(0, Math.min(focus.band, bands.length - 1));
	const band = bands[bandIndex];
	const column = band ? Math.min(focus.column, band.count - 1) : 0;
	const inToolbar = zone === 'toolbar' || !bands.length;

	useEffect(() => {
		if (!active || loading) return;
		const root = viewport.current;
		const target = document.querySelector<HTMLButtonElement>('.home .tile--focused, .home__utility--focused');
		if (!target) return;
		target.focus({preventScroll: true});
		if (!root || inToolbar) return;
		const box = target.getBoundingClientRect();
		const frame = root.getBoundingClientRect();
		const scale = frame.width / root.offsetWidth;
		const top = root.scrollTop + (box.top - frame.top) / scale - 28;
		const bottom = root.scrollTop + (box.bottom - frame.bottom) / scale + 28;
		if (box.top < frame.top + 28 * scale) root.scrollTop = Math.max(0, top);
		else if (box.bottom > frame.bottom - 28 * scale) root.scrollTop = bottom;
	}, [active, loading, bandIndex, column, inToolbar, toolIndex, bands]);

	const handleKey = useCallback((key: NavKey): boolean => {
		if (key === 'back') {
			setZone('grid');
			setFocus({band: 0, column: 0, preferredColumn: 0});
			if (viewport.current) viewport.current.scrollTop = 0;
			return true;
		}
		if (inToolbar) {
			const count = toolbar ? toolbar.items.length : 0;
			if (key === 'left') setToolIndex((i) => Math.max(0, i - 1));
			else if (key === 'right') setToolIndex((i) => Math.min(count - 1, i + 1));
			else if (key === 'down' && bands.length) setZone('grid');
			else if (key === 'enter' && toolbar && toolbar.items[toolIndex]) onActivate(toolbar.id, toolbar.items[toolIndex]);
			return true;
		}
		if (!band) return true;
		if (key === 'enter') {
			const group = groups.find((row) => row.id === band.groupId);
			const item = group && group.items[band.start + column];
			if (group && item) onActivate(group.id, item);
		} else if (key === 'up' && bandIndex === 0) setZone('toolbar');
		else setFocus(moveHomeFocus(bands, {...focus, band: bandIndex, column}, key));
		return true;
	}, [rows, bands, focus, bandIndex, column, inToolbar, toolIndex, onActivate]);
	useKeys(handleKey, active);

	const select = (groupId: string, index: number) => {
		const next = bands.findIndex((b) => b.groupId === groupId && index >= b.start && index < b.start + b.count);
		if (next < 0) return;
		const col = index - bands[next].start;
		setFocus({band: next, column: col, preferredColumn: col});
		setZone('grid');
	};

	return (
		<div class="screen home" aria-hidden={!active}>
			<header class="home__header">
				<h1 class="home__title">Home</h1>
				<Clock now={now} format={timeFormat} />
				<nav class="home__utilities" aria-label="Launcher controls">
					{toolbar && toolbar.items.map((item, i) => (
						<button type="button" key={item.key} aria-label={item.label}
							class={`home__utility${active && inToolbar && toolIndex === i ? ' home__utility--focused' : ''}`}
							tabIndex={active && inToolbar && toolIndex === i ? 0 : -1}
							onFocus={() => { setZone('toolbar'); setToolIndex(i); }}
							onMouseMove={() => { setZone('toolbar'); setToolIndex(i); }}
							onClick={() => onActivate(toolbar.id, item)}>
							{item.glyph && <Glyph name={item.glyph} />}
							<span class="home__utility-label">{item.label}</span>
						</button>
					))}
				</nav>
			</header>
			{loading && <div class="home__loading" role="status" aria-label="Loading apps">
				<span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
			</div>}
			<main ref={viewport} class="home__viewport" aria-label="Apps and sources" aria-busy={loading}>
				{!loading && groups.map((group) => (
					<section key={group.id} class={`home__group home__group--${group.id}`} aria-labelledby={`heading-${group.id}`}>
						<h2 id={`heading-${group.id}`} class="home__group-title">{group.label}</h2>
						{group.items.length === 0
								? <div class="home__empty">{group.emptyText || 'No sources selected. Add them in Settings.'}</div>
								: <div class="home__grid">{group.items.map((item, i) => (
									<Tile key={item.key} model={item}
										focused={active && !inToolbar && !!band && band.groupId === group.id && band.start + column === i}
										onHover={() => select(group.id, i)} onActivate={() => onActivate(group.id, item)} />
								))}</div>}
					</section>
				))}
			</main>
			<footer class="home__footer">
				<span>Apps &amp; inputs</span>
				<span><span class="home__key">OK</span> Open <span class="home__footer-divider" /> Up for controls</span>
			</footer>
		</div>
	);
}
