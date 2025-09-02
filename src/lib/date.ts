import { format as formatDateFns, parseISO, isValid, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export function parseDateSafe(input: unknown): Date | null {
	if (!input) return null;
	if (input instanceof Date) return isValid(input) ? input : null;
	if (typeof input === 'number') {
		const d = new Date(input);
		return isValid(d) ? d : null;
	}
	if (typeof input === 'string') {
		const trimmed = input.trim();
		if (!trimmed) return null;
		// Try ISO first
		let d = parseISO(trimmed);
		if (isValid(d)) return d;
		// Fallback to native Date parsing as last resort
		d = new Date(trimmed);
		return isValid(d) ? d : null;
	}
	return null;
}

export function safeFormatDate(input: unknown, pattern: string = 'MMM d, yyyy', fallback: string = '--'): string {
	const d = parseDateSafe(input);
	if (!d) return fallback;
	try {
		return formatDateFns(d, pattern);
	} catch {
		return fallback;
	}
}

export function isWithinIntervalSafe(dateLike: unknown, fromLike: unknown, toLike: unknown): boolean {
	const d = parseDateSafe(dateLike);
	const from = parseDateSafe(fromLike);
	const to = parseDateSafe(toLike);
	if (!d || !from || !to) return false;
	try {
		return isWithinInterval(d, { start: startOfDay(from), end: endOfDay(to) });
	} catch {
		return false;
	}
}

export function compareDatesSafe(aLike: unknown, bLike: unknown): number {
	const a = parseDateSafe(aLike);
	const b = parseDateSafe(bLike);
	if (a && b) return b.getTime() - a.getTime();
	if (a && !b) return -1; // a first, b invalid goes last
	if (!a && b) return 1; // b first
	return 0; // both invalid
}


