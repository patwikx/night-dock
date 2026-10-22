import {useEffect, useState} from 'preact/hooks';

/** Refresh at minute boundaries, and stop ticking while the clock is hidden. */
export function useClock (active = true): Date {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		if (!active) return;
		let timer = 0;
		const refresh = () => {
			window.clearTimeout(timer);
			if (document.hidden) return;
			setNow(new Date());
			timer = window.setTimeout(refresh, 60000 - Date.now() % 60000);
		};
		refresh();
		document.addEventListener('visibilitychange', refresh);
		return () => {
			window.clearTimeout(timer);
			document.removeEventListener('visibilitychange', refresh);
		};
	}, [active]);
	return now;
}
