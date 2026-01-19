/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-18 13:29:07
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-01-19 14:58:57
 * @FilePath: /insertGitOriginalHeader/src/commentStyle.ts
 * @Description: 根据语言/扩展名解析注释风格，并提供默认映射与兜底策略。
 */

export type CommentStyle =
	| 'htmlBlock'
	| 'cBlock'
	| 'slashLine'
	| 'hashLine'
	| 'powershellBlock'
	| 'luaBlock';

export type UnknownFileBehavior = 'prompt' | 'skip' | 'fallback';

export interface CommentStyleConfig {
	commentStyleByLanguage?: Record<string, CommentStyle>;
	commentStyleByExtension?: Record<string, CommentStyle>;
	unknownFileBehavior?: UnknownFileBehavior;
}

/**
 * 规范化扩展名：小写、去空白，并保证以 `.` 开头。
 *
 * @example
 * normalizeExtension('TS') => '.ts'
 *
 * @param ext 原始扩展名（可含/不含 `.`）
 * @returns 规范化后的扩展名；空输入返回空字符串
 */
export function normalizeExtension(ext: string): string {
	const trimmed = ext.trim().toLowerCase();
	if (!trimmed) {
		return '';
	}
	return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

/**
 * 从文件名中提取扩展名（含 `.`，小写）。
 *
 * 规则：
 * - 仅识别最后一个 `.` 后缀
 * - `.gitignore` 这类“点文件”不视为有扩展名（返回空字符串）
 *
 * @param fileName 文件名或路径
 * @returns 规范化扩展名（含 `.`）；无扩展名则返回空字符串
 */
export function getFileExtension(fileName: string): string {
	const normalized = fileName.replace(/\\/g, '/');
	const baseName = normalized.split('/').pop() ?? '';
	const lastDotIndex = baseName.lastIndexOf('.');
	if (lastDotIndex <= 0 || lastDotIndex === baseName.length - 1) {
		return '';
	}
	return normalizeExtension(baseName.slice(lastDotIndex));
}

const DEFAULT_STYLE_BY_LANGUAGE: Record<string, CommentStyle> = {
	// Markup-ish
	html: 'htmlBlock',
	markdown: 'htmlBlock',
	xml: 'htmlBlock',

	// C-family & friends (block comments work well for multi-line headers)
	javascript: 'cBlock',
	typescript: 'cBlock',
	javascriptreact: 'cBlock',
	typescriptreact: 'cBlock',
	java: 'cBlock',
	c: 'cBlock',
	cpp: 'cBlock',
	csharp: 'cBlock',
	go: 'cBlock',
	rust: 'cBlock',
	css: 'cBlock',
	scss: 'cBlock',
	less: 'cBlock',
	jsonc: 'cBlock',

	// Hash-line languages
	python: 'hashLine',
	shellscript: 'hashLine',
	ruby: 'hashLine',
	yaml: 'hashLine',
	toml: 'hashLine',
	dockerfile: 'hashLine',

	// Special blocks
	powershell: 'powershellBlock',
	lua: 'luaBlock',
};

const DEFAULT_STYLE_BY_EXTENSION: Record<string, CommentStyle> = {
	// Markup
	'.html': 'htmlBlock',
	'.htm': 'htmlBlock',
	'.md': 'htmlBlock',
	'.markdown': 'htmlBlock',
	'.xml': 'htmlBlock',
	'.svg': 'htmlBlock',
	'.vue': 'htmlBlock',

	// C-like
	'.js': 'cBlock',
	'.ts': 'cBlock',
	'.jsx': 'cBlock',
	'.tsx': 'cBlock',
	'.java': 'cBlock',
	'.c': 'cBlock',
	'.h': 'cBlock',
	'.cc': 'cBlock',
	'.cpp': 'cBlock',
	'.hpp': 'cBlock',
	'.cs': 'cBlock',
	'.go': 'cBlock',
	'.rs': 'cBlock',
	'.css': 'cBlock',
	'.scss': 'cBlock',
	'.less': 'cBlock',
	'.jsonc': 'cBlock',

	// Hash-line
	'.py': 'hashLine',
	'.sh': 'hashLine',
	'.bash': 'hashLine',
	'.zsh': 'hashLine',
	'.rb': 'hashLine',
	'.yml': 'hashLine',
	'.yaml': 'hashLine',
	'.toml': 'hashLine',
	'.dockerfile': 'hashLine',

	// Special
	'.ps1': 'powershellBlock',
	'.lua': 'luaBlock',
};

export const NO_COMMENT_LANGUAGES = new Set<string>(['json']);

export interface ResolveCommentStyleInput {
	languageId: string;
	fileName: string;
	config?: CommentStyleConfig;
}

export interface ResolveCommentStyleResult {
	style: CommentStyle | null;
	reason:
		| 'configuredByLanguage'
		| 'configuredByExtension'
		| 'defaultByLanguage'
		| 'defaultByExtension'
		| 'noCommentLanguage'
		| 'unknown';
}

/**
 * 解析当前文件应使用的注释风格。
 *
 * 优先级（从高到低）：
 * 1) `NO_COMMENT_LANGUAGES`：明确不支持注释的语言直接返回 null
 * 2) 配置 `commentStyleByLanguage[languageId]`
 * 3) 配置 `commentStyleByExtension[.ext]` 或 `[ext]`
 * 4) 内置默认映射（按 languageId）
 * 5) 内置默认映射（按扩展名）
 *
 * @param input 解析所需的语言标识、文件名与可选配置
 * @returns 解析结果；`style=null` 表示“无法安全确定注释方式”，交由上层按 unknown 行为处理
 */
export function resolveCommentStyle(input: ResolveCommentStyleInput): ResolveCommentStyleResult {
	const languageId = input.languageId.trim().toLowerCase();
	if (NO_COMMENT_LANGUAGES.has(languageId)) {
		return { style: null, reason: 'noCommentLanguage' };
	}

	const extension = getFileExtension(input.fileName);
	const config = input.config;

	const byLanguage = config?.commentStyleByLanguage?.[languageId];
	if (byLanguage) {
		return { style: byLanguage, reason: 'configuredByLanguage' };
	}

	if (extension) {
		const byExtension = config?.commentStyleByExtension?.[extension] ??
			config?.commentStyleByExtension?.[extension.slice(1)];
		if (byExtension) {
			return { style: byExtension, reason: 'configuredByExtension' };
		}
	}

	const defaultByLanguage = DEFAULT_STYLE_BY_LANGUAGE[languageId];
	if (defaultByLanguage) {
		return { style: defaultByLanguage, reason: 'defaultByLanguage' };
	}

	if (extension) {
		const defaultByExtension = DEFAULT_STYLE_BY_EXTENSION[extension];
		if (defaultByExtension) {
			return { style: defaultByExtension, reason: 'defaultByExtension' };
		}
	}

	return { style: null, reason: 'unknown' };
}

/**
 * 获取无法识别注释风格时的处理策略。
 *
 * 默认值为 `skip`：宁可不插入，也不破坏文件语法。
 *
 * @param config 可选配置
 * @returns 未知文件处理策略
 */
export function getUnknownFileBehavior(config?: CommentStyleConfig): UnknownFileBehavior {
	return config?.unknownFileBehavior ?? 'skip';
}
