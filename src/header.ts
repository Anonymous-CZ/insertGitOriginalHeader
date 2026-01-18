/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-18 13:29:07
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-01-18 15:27:56
 * @FilePath: src/header.ts
 * @Description: 文件头内容行生成与注释包裹（纯字符串渲染）。
 */

import type { CommentStyle } from './commentStyle';

export interface HeaderData {
	author: string;
	date: string;
	lastEditors: string;
	lastEditTime: string;
	filePath: string;
	description?: string;
}

/**
 * 将结构化文件头数据渲染为“内容行”（不包含外层注释符号）。
 *
 * 注意：
 * - 字段顺序固定，便于人读与工具处理。
 * - `description` 若为空，会渲染为空字符串（保留该字段行）。
 *
 * @param data 结构化文件头数据
 * @returns 不带外层注释符号的内容行数组
 */
export function renderHeaderBodyLines(data: HeaderData): string[] {
	return [
		`@Author: ${data.author}`,
		`@Date: ${data.date}`,
		`@LastEditors: ${data.lastEditors}`,
		`@LastEditTime: ${data.lastEditTime}`,
		`@FilePath: ${data.filePath}`,
		`@Description: ${data.description ?? ''}`,
	];
}

/**
 * 使用指定注释风格包裹多行内容，并以换行结尾。
 *
 * 约定：
 * - 当 `lines` 为空时，会输出一个“空内容行”，以确保得到合法注释块。
 * - 返回值总是以 `\n` 结尾，便于直接插入到文件顶部。
 *
 * @param style 注释风格
 * @param lines 需要包裹的内容行（不含换行）
 * @returns 包裹后的完整注释文本（以换行结尾）
 */
export function wrapWithComment(style: CommentStyle, lines: string[]): string {
	const safeLines = lines.length > 0 ? lines : [''];

	switch (style) {
		case 'htmlBlock': {
			const body = safeLines.map(line => ` * ${line}`).join('\n');
			return `<!--\n${body}\n-->\n`;
		}
		case 'cBlock': {
			const body = safeLines.map(line => ` * ${line}`).join('\n');
			return `/*\n${body}\n */\n`;
		}
		case 'powershellBlock': {
			const body = safeLines.map(line => ` * ${line}`).join('\n');
			return `<#\n${body}\n#>\n`;
		}
		case 'luaBlock': {
			const body = safeLines.map(line => ` * ${line}`).join('\n');
			return `--[[\n${body}\n]]\n`;
		}
		case 'slashLine': {
			return safeLines.map(line => `// ${line}`).join('\n') + '\n';
		}
		case 'hashLine': {
			return safeLines.map(line => `# ${line}`).join('\n') + '\n';
		}
		default: {
			// Exhaustiveness safeguard
			return safeLines.join('\n') + '\n';
		}
	}
}
