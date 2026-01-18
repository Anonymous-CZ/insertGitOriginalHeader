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

export function normalizeExtension(ext: string): string {
	const trimmed = ext.trim().toLowerCase();
	if (!trimmed) {
		return '';
	}
	return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

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

export function getUnknownFileBehavior(config?: CommentStyleConfig): UnknownFileBehavior {
	return config?.unknownFileBehavior ?? 'skip';
}
