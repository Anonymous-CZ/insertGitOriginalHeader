// Note: we keep the runtime format stable (YYYY-MM-DD HH:mm:ss),
// but don't over-constrain the type because components are built from strings.
export type LocalDateTimeString = string;

export function formatLocalDateTime(date: Date): LocalDateTimeString {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function parseLocalDateTimeString(value: string): Date | null {
	// Expected: YYYY-MM-DD HH:mm:ss (local time)
	const trimmed = value.trim();
	const match = /^\s*(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s*$/.exec(trimmed);
	if (!match) {
		return null;
	}

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const hour = Number(match[4]);
	const minute = Number(match[5]);
	const second = Number(match[6]);

	if (
		Number.isNaN(year) ||
		Number.isNaN(month) ||
		Number.isNaN(day) ||
		Number.isNaN(hour) ||
		Number.isNaN(minute) ||
		Number.isNaN(second)
	) {
		return null;
	}

	const date = new Date(year, month - 1, day, hour, minute, second);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function pickEarliestDate(a: Date | null, b: Date | null): Date | null {
	if (!a && !b) {
		return null;
	}
	if (!a) {
		return b;
	}
	if (!b) {
		return a;
	}
	return a.getTime() <= b.getTime() ? a : b;
}
