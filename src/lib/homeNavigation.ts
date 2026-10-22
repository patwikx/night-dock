export interface HomeBand { groupId: string; start: number; count: number; }
export interface HomeFocus {
	band: number;
	column: number;
	/** Restore the intended column after moving through a short row. */
	preferredColumn: number;
}

export function makeHomeBands (groups: {id: string; items: unknown[]}[], columns: number): HomeBand[] {
	const bands: HomeBand[] = [];
	for (const group of groups) {
		for (let start = 0; start < group.items.length; start += columns) {
			bands.push({groupId: group.id, start, count: Math.min(columns, group.items.length - start)});
		}
	}
	return bands;
}

export function moveHomeFocus (bands: HomeBand[], focus: HomeFocus, direction: 'up' | 'down' | 'left' | 'right'): HomeFocus {
	if (!bands.length) return {band: 0, column: 0, preferredColumn: 0};
	const band = Math.max(0, Math.min(bands.length - 1, focus.band));
	const column = Math.max(0, Math.min(bands[band].count - 1, focus.column));
	if (direction === 'left' || direction === 'right') {
		const next = Math.max(0, Math.min(bands[band].count - 1, column + (direction === 'left' ? -1 : 1)));
		return {band, column: next, preferredColumn: next};
	}
	const nextBand = Math.max(0, Math.min(bands.length - 1, band + (direction === 'up' ? -1 : 1)));
	return {band: nextBand, column: Math.min(focus.preferredColumn, bands[nextBand].count - 1), preferredColumn: focus.preferredColumn};
}
