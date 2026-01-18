/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-18 17:18:58
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-01-18 17:23:22
 * @FilePath: /insertGitOriginalHeader/src/filePath.ts
 * @Description: 生成文件头中的 @FilePath（从项目根目录开始、统一使用 / 分隔符）。
 */
import * as vscode from 'vscode';

/**
 * 将任意路径字符串规范化为使用 `/` 分隔符。
 */
export function toPosixPath(inputPath: string): string {
	return inputPath.replace(/\\/g, '/');
}

/**
 * 生成文件头字段 `@FilePath` 的值。
 *
 * 规则：
 * - 优先使用工作区相对路径，并包含 workspace folder name（multi-root 场景避免歧义）
 * - 始终以 `/` 开头
 * - 始终使用 `/` 作为分隔符（即使在 Windows 上）
 *
 * 若文件不在当前工作区内，则回退为 `vscode.workspace.asRelativePath(filePath)` 的结果，
 * 并仅做分隔符规范化；此时不强制添加前导 `/`，避免把绝对路径变成“看似项目内路径”。
 */
export function formatProjectRootFilePath(filePath: string): string {
	const workspaceRelativeWithFolder = vscode.workspace.asRelativePath(filePath, true);
	const normalized = toPosixPath(workspaceRelativeWithFolder);

	// 当文件不属于工作区时，asRelativePath 可能直接返回原始路径（例如 C:/... 或 /... 或 \\server\...）。
	const looksAbsolute = /^[a-zA-Z]:\//.test(normalized) || normalized.startsWith('/') || normalized.startsWith('//');
	if (looksAbsolute) {
		return normalized;
	}

	return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
