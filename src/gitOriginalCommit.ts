/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-21 16:10:00
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-01-21 16:10:00
 * @FilePath: /insertGitOriginalHeader/src/gitOriginalCommit.ts
 * @Description: 构造获取“文件最早提交信息”的 git log 参数，并解析输出（可独立单测）。
 */

import * as path from 'path';
import { toPosixPath } from './filePath';

export interface GitCommitInfo {
	author: string;
	date: string; // `YYYY-MM-DD HH:mm:ss`
}

export interface BuildGitOriginalCommitArgsOptions {
	followRenames?: boolean;
}

/**
 * 将文件路径转换为适合传给 `git log -- <path>` 的 pathspec。
 *
 * 规则：
 * - 若 `filePath` 位于 `repoRoot` 之内，则返回相对路径（更符合 Git 的路径预期，尤其是 `--follow`）。
 * - 否则回退为原始路径。
 * - 始终将分隔符规范化为 `/`。
 */
export function toGitPathSpec(filePath: string, repoRoot: string): string {
	const relative = path.relative(repoRoot, filePath);
	const isInsideRepo =
		relative !== '' &&
		!relative.startsWith('..' + path.sep) &&
		relative !== '..' &&
		!path.isAbsolute(relative);

	const pathSpec = isInsideRepo ? relative : filePath;
	return toPosixPath(pathSpec);
}

/**
 * 构造用于获取“最早提交信息（作者+时间）”的 git log 参数。
 *
 * 说明：
 * - `--follow` 用于跟随重命名历史（只在单路径查询下生效）
 * - 不使用 `--reverse`：在部分平台/版本上 `--follow --reverse` 会丢失重命名前历史
 * - 默认输出顺序是从新到旧，解析器取最后一条即可得到“最早提交”
 */
export function buildGitOriginalCommitArgs(
	pathSpec: string,
	options: BuildGitOriginalCommitArgsOptions = {}
): string[] {
	const followRenames = options.followRenames ?? true;

	return [
		'--no-pager',
		'log',
		...(followRenames ? ['--follow'] : []),
		'--pretty=format:%an|||%ad',
		'--date=format:%Y-%m-%d %H:%M:%S',
		'--',
		pathSpec,
	];
}

/**
 * 解析 git log 的单行输出：`<author>|||<date>`。
 *
 * @returns 无可用输出时返回空字段（由上层做兜底）
 */
export function parseGitOriginalCommitStdout(stdout: string): GitCommitInfo {
	const trimmed = stdout.trim();
	if (!trimmed) {
		return { author: '', date: '' };
	}

	// git log 多条记录时按行输出；默认顺序是从新到旧，因此取最后一条即可。
	const lines = trimmed.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
	const lastLine = lines.length > 0 ? lines[lines.length - 1] : '';
	if (!lastLine) {
		return { author: '', date: '' };
	}

	const delimiter = '|||';
	const delimiterIndex = lastLine.indexOf(delimiter);
	if (delimiterIndex < 0) {
		return { author: lastLine.trim(), date: '' };
	}

	const author = lastLine.slice(0, delimiterIndex).trim();
	const date = lastLine.slice(delimiterIndex + delimiter.length).trim();
	return { author, date };
}
