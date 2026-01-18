/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-18 12:21:21
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-01-18 15:27:48
 * @FilePath: src/dateTime.ts
 * @Description: 本地时间的格式化/解析工具，以及最早时间的选择规则。
 */

// Note: we keep the runtime format stable (YYYY-MM-DD HH:mm:ss),
// but don't over-constrain the type because components are built from strings.
export type LocalDateTimeString = string;

/**
 * 将 Date 格式化为本地时间字符串：`YYYY-MM-DD HH:mm:ss`。
 *
 * @param date 本地时区的时间对象
 * @returns 固定格式的本地时间字符串
 */
export function formatLocalDateTime(date: Date): LocalDateTimeString {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 解析本地时间字符串：`YYYY-MM-DD HH:mm:ss`。
 *
 * @param value 待解析字符串（允许前后空白）
 * @returns 解析成功返回 Date（本地时区）；失败返回 null
 */
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

/**
 * 从两个候选时间中选择更早的那个。
 *
 * 用途：在“Git 原始提交时间”与“文件系统 birthtime”之间选择更保守（更早）的创建时间。
 *
 * @param a 候选时间 A
 * @param b 候选时间 B
 * @returns 更早的时间；两者都为空则返回 null
 */
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
