// Adapters from data (apps, inputs) to what the Tile component draws.

import type {AppEntry} from './apps';
import type {InputSource} from './inputs';
import type {TileModel} from '../components/Tile';

const INPUT_ICON_DIR = 'icons/inputs/';

const BRANDS: Record<string, {logo?: string; image?: string; color: string}> = {
	netflix: {logo: 'netflix', color: '#111113'},
	'youtube.leanback.v4': {logo: 'youtube', color: '#ffffff'},
	amazon: {color: '#0578ff'},
	'com.disney.disneyplus-prod': {image: 'icons/brands/disneyplus.jpg', color: '#001c28'},
	'com.apple.appletv': {logo: 'appletv', color: '#141416'},
	'com.wbd.stream': {logo: 'max', color: '#111113'},
	'cdp-30': {logo: 'plex', color: '#202124'},
	'spotify-beehive': {logo: 'spotify', color: '#1ed760'},
	'tv.twitch.tv.starshot.lg': {logo: 'twitch', color: '#9146ff'},
	'org.jellyfin.webos': {logo: 'jellyfin', color: '#222b44'}
};

export function appTile (app: AppEntry): TileModel {
	const brand = BRANDS[app.id];
	if (brand) return {
		key: app.id, label: app.title, color: brand.color, logo: !!brand.logo,
		imageUrl: brand.logo ? `icons/brands/${brand.logo}.svg` : brand.image || app.iconUrl
	};
	return {key: app.id, label: app.title, imageUrl: app.iconUrl, color: app.color};
}

export function inputTile (input: InputSource): TileModel {
	return {key: input.appId, label: input.label, glyphImageUrl: INPUT_ICON_DIR + input.icon};
}

/** Order `items` by an ID list, dropping IDs that no longer exist. */
export function pickInOrder<T> (items: T[], ids: string[], idOf: (item: T) => string): T[] {
	const byId: Record<string, T> = {};
	for (const item of items) byId[idOf(item)] = item;
	return ids.map((id) => byId[id]).filter((x): x is T => x !== undefined);
}
