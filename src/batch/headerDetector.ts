/*
 * @Author: Anonymous-CZ
 * @Date: 2026-05-14 11:01:04
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-14 11:06:38
 * @FilePath: /insertGitOriginalHeader/src/batch/headerDetector.ts
 * @Description: 检测文件是否已包含本扩展插入的文件头（只检查文件前 N 行）
 */

/**
 * 检测给定文本前 N 行是否包含本扩展插入的文件头特征字段。
 *
 * 规则：同时包含 `@Author`、`@Date`、`@FilePath` 即视为“已存在文件头”。
 */
export function hasExistingGitOriginalAuthorHeader(text: string, checkLines: number): boolean {
	const safeLines = Math.max(1, Math.min(200, Math.floor(checkLines)));
	const head = text.split(/\r?\n/).slice(0, safeLines).join('\n');
	return head.includes('@Author') && head.includes('@Date') && head.includes('@FilePath');
}
