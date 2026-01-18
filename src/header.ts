import type { CommentStyle } from './commentStyle';

export interface HeaderData {
	author: string;
	date: string;
	lastEditors: string;
	lastEditTime: string;
	filePath: string;
	description?: string;
}

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
