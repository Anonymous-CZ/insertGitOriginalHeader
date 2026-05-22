/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-18 13:30:06
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-22 15:09:15
 * @FilePath: /insertGitOriginalHeader/src/extension.ts
 * @Description: VS Code 扩展入口：获取 Git 原始作者/时间并按注释风格插入文件头。
 */

import * as vscode from 'vscode';
import type { CommentStyle } from './commentStyle';
import { readAutoUpdateLastEditOnSave, readBatchConfig, readCommentStyleConfig } from './settings';
import { getCurrentGitUserName, insertGitOriginalHeaderForDocument } from './insertHeader';
import { batchInsertMissingHeadersInFolder } from './batch/batchInsertMissingHeadersInFolder';
import { batchUpdateHeaderLastEditMetaInFolder } from './batch/batchUpdateHeaderLastEditMetaInFolder';
import { formatLocalDateTime } from './dateTime';
import { collectLastEditMetaLineUpdates, updateHeaderLastEditMetaForDocument } from './updateLastEditMeta';
const DEBUG_LOG_ENABLED = process.env.GIT_ORIGINAL_AUTHOR_HEADER_DEBUG === '1'; // 设为 "1" 时输出调试日志
const KORO_FILE_HEADER_EXTENSION_ID = 'OBKoro1.korofileheader';
const KORO_CONFLICT_WARNING_SHOWN_KEY = 'git-original-author-header.koroConflictWarningShown';
const GIT_USER_CACHE_TTL_MS = 5 * 60 * 1000;
const WILL_SAVE_GIT_USER_TIMEOUT_MS = 120;

const gitUserNameCache = new Map<string, { value: string; expiresAt: number }>();
const gitUserNamePending = new Map<string, Promise<string>>();
const skipNextDidSaveForUri = new Set<string>();

let logChannel: vscode.LogOutputChannel | undefined;

function logDebug(message: string, ...optionalParams: unknown[]): void {
	if (!DEBUG_LOG_ENABLED) {
		return;
	}
	logChannel?.debug(message, ...optionalParams);
}

function logWarn(message: string, ...optionalParams: unknown[]): void {
	logChannel?.warn(message, ...optionalParams);
}

function getGitUserCacheKey(uri: vscode.Uri): string {
	const folder = vscode.workspace.getWorkspaceFolder(uri);
	return folder?.uri.toString() ?? '__default__';
}

function getCachedGitUserName(uri: vscode.Uri): string {
	const key = getGitUserCacheKey(uri);
	const cached = gitUserNameCache.get(key);
	if (!cached) {
		return '';
	}
	if (cached.expiresAt <= Date.now()) {
		gitUserNameCache.delete(key);
		return '';
	}
	return cached.value;
}

function cacheGitUserName(uri: vscode.Uri, userName: string): void {
	if (!userName) {
		return;
	}
	const key = getGitUserCacheKey(uri);
	gitUserNameCache.set(key, {
		value: userName,
		expiresAt: Date.now() + GIT_USER_CACHE_TTL_MS,
	});
}

async function refreshGitUserName(uri: vscode.Uri): Promise<string> {
	const key = getGitUserCacheKey(uri);
	const pending = gitUserNamePending.get(key);
	if (pending) {
		return pending;
	}

	const task = (async () => {
		const userName = (await getCurrentGitUserName(uri)).trim();
		cacheGitUserName(uri, userName);
		return userName;
	})()
		.catch(() => '')
		.finally(() => {
			gitUserNamePending.delete(key);
		});

	gitUserNamePending.set(key, task);
	return task;
}

function resolveCheckLines(): number {
	const batchConfig = readBatchConfig();
	return Math.max(1, Math.min(200, Math.floor(batchConfig.commentCheckLines)));
}

function collectLastEditOnSaveTextEdits(input: {
	document: vscode.TextDocument;
	checkLines: number;
	lastEditors: string;
	lastEditTime: string;
}): vscode.TextEdit[] {
	const lineCount = Math.min(input.document.lineCount, input.checkLines);
	const lines = Array.from({ length: lineCount }, (_, index) => input.document.lineAt(index).text);
	const collected = collectLastEditMetaLineUpdates({
		lines,
		checkLines: input.checkLines,
		lastEditors: input.lastEditors,
		lastEditTime: input.lastEditTime,
	});
	if (collected.kind !== 'updatable') {
		return [];
	}

	const edits: vscode.TextEdit[] = [];
	for (const update of collected.updates) {
		const line = input.document.lineAt(update.line);
		if (line.text === update.text) {
			continue;
		}
		edits.push(vscode.TextEdit.replace(new vscode.Range(update.line, 0, update.line, line.text.length), update.text));
	}

	return edits;
}

async function resolveLastEditorsForWillSave(uri: vscode.Uri): Promise<string> {
	const cached = getCachedGitUserName(uri);
	const refreshPromise = refreshGitUserName(uri);
	const timeoutPromise = new Promise<string>(resolve => {
		const timer = setTimeout(() => resolve(cached), WILL_SAVE_GIT_USER_TIMEOUT_MS);
		void refreshPromise.finally(() => clearTimeout(timer));
	});

	const resolved = await Promise.race([refreshPromise, timeoutPromise]);
	return resolved || cached || 'Current User';
}

async function autoUpdateLastEditMetaAfterSave(document: vscode.TextDocument): Promise<void> {
	const safeLines = resolveCheckLines();
	const gitUserName = await refreshGitUserName(document.uri);
	const edits = collectLastEditOnSaveTextEdits({
		document,
		checkLines: safeLines,
		lastEditors: gitUserName || 'Current User',
		lastEditTime: formatLocalDateTime(new Date()),
	});
	if (edits.length === 0) {
		return;
	}

	const edit = new vscode.WorkspaceEdit();
	for (const textEdit of edits) {
		edit.replace(document.uri, textEdit.range, textEdit.newText);
	}

	const applied = await vscode.workspace.applyEdit(edit);
	if (!applied) {
		logWarn('Auto update LastEdit metadata after save failed: workspace.applyEdit returned false.');
		return;
	}

	const uriKey = document.uri.toString();
	skipNextDidSaveForUri.add(uriKey);
	const saved = await document.save();
	if (!saved) {
		skipNextDidSaveForUri.delete(uriKey);
		logWarn('Auto update LastEdit metadata after save failed: document.save returned false.');
	}
}

async function maybeShowKoroFileHeaderConflictWarning(context: vscode.ExtensionContext): Promise<void> {
	if (!readAutoUpdateLastEditOnSave()) {
		return;
	}
	if (context.workspaceState.get<boolean>(KORO_CONFLICT_WARNING_SHOWN_KEY)) {
		return;
	}
	if (!vscode.extensions.getExtension(KORO_FILE_HEADER_EXTENSION_ID)) {
		return;
	}

	await vscode.window.showWarningMessage(
		'检测到已安装 koroFileHeader。当前扩展默认开启“保存时自动刷新 LastEditors/LastEditTime”，若两者都在保存时写入文件头，可能出现字段相互覆盖。建议在任一扩展中关闭保存自动更新。',
		'知道了'
	);
	await context.workspaceState.update(KORO_CONFLICT_WARNING_SHOWN_KEY, true);
}

/**
 * VS Code 扩展激活入口：注册命令并在执行时向文件顶部插入头注释。
 *
 * @param context VS Code 提供的扩展上下文，用于管理订阅生命周期
 */
export function activate(context: vscode.ExtensionContext) {
	logChannel = vscode.window.createOutputChannel('Git Original Author Header', { log: true });
	context.subscriptions.push(logChannel);
	void maybeShowKoroFileHeaderConflictWarning(context).catch(error => {
		logWarn('Show koroFileHeader conflict warning failed:', error);
	});

	const insertDisposable = vscode.commands.registerCommand('git-original-author-header.insertGitOriginalHeader', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('没有活跃的编辑器窗口！');
			return;
		}

		const commentStyleConfig = readCommentStyleConfig();
		const result = await insertGitOriginalHeaderForDocument({
			document: editor.document,
			editor,
			mode: 'single',
			commentStyleConfig,
			unknownCommentStylePicker: async (input) => {
				const picked = await vscode.window.showQuickPick(
					[
						{ label: 'C 块注释', description: '/* ... */', style: 'cBlock' as const },
						{ label: 'HTML 注释', description: '<!-- ... -->', style: 'htmlBlock' as const },
						{ label: '双斜杠行注释', description: '// ...', style: 'slashLine' as const },
						{ label: '井号行注释', description: '# ...', style: 'hashLine' as const },
						{ label: 'PowerShell 块注释', description: '<# ... #>', style: 'powershellBlock' as const },
						{ label: 'Lua 块注释', description: '--[[ ... ]]', style: 'luaBlock' as const },
					],
					{ title: `无法自动识别注释方式（languageId=${input.languageId}），请选择一种用于插入文件头` }
				);
				return picked?.style ?? null;
			},
		});

		if (result.kind === 'inserted') {
			vscode.window.showInformationMessage('已插入包含原始Git作者的文件头！');
			return;
		}
		if (result.kind === 'skipped') {
			switch (result.reason) {
				case 'noCommentLanguage':
					vscode.window.showWarningMessage('该文件类型不支持注释（例如 JSON）。已跳过插入文件头。你可以在设置中为该类型指定注释风格，或改用支持注释的语言模式（如 JSONC）。');
					return;
				case 'unknownCommentStyle':
					vscode.window.showWarningMessage(`无法判断该文件的注释方式（languageId=${editor.document.languageId}）。已跳过插入；可在设置中配置 commentStyleByLanguage/commentStyleByExtension。`);
					return;
				case 'dirtyDocument':
					vscode.window.showWarningMessage('当前文件有未保存修改，为避免冲突已跳过插入。请先保存文件后重试。');
					return;
				default:
					vscode.window.showWarningMessage('当前文件无法插入文件头（已跳过）。');
					return;
			}
		}

		logWarn('Insert header failed:', result);
		vscode.window.showErrorMessage(`插入文件头失败：${result.message}`);
	});

	const batchDisposable = vscode.commands.registerCommand(
		'git-original-author-header.batchInsertMissingHeadersInFolder',
		async (uri?: vscode.Uri) => {
			await batchInsertMissingHeadersInFolder(uri);
		}
	);

	const updateLastEditDisposable = vscode.commands.registerCommand('git-original-author-header.updateHeaderLastEditMeta', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('没有活跃的编辑器窗口！');
			return;
		}

		const batchConfig = readBatchConfig();
		const gitUserName = await getCurrentGitUserName(editor.document.uri);
		const result = await updateHeaderLastEditMetaForDocument({
			document: editor.document,
			editor,
			checkLines: batchConfig.commentCheckLines,
			lastEditors: gitUserName || 'Current User',
			lastEditTime: formatLocalDateTime(new Date()),
		});

		if (result.kind === 'updated') {
			vscode.window.showInformationMessage('已更新文件头中的 LastEditors 和 LastEditTime。');
			return;
		}
		if (result.kind === 'skipped') {
			switch (result.reason) {
				case 'headerNotFound':
					vscode.window.showWarningMessage('当前文件未检测到可更新的文件头注释。');
					return;
				case 'missingLastFields':
					vscode.window.showWarningMessage('检测到文件头，但缺少 LastEditors 或 LastEditTime 字段，已跳过更新。');
					return;
				case 'dirtyDocument':
					vscode.window.showWarningMessage('当前文件有未保存修改，为避免冲突已跳过更新。请先保存文件后重试。');
					return;
				case 'notFileDocument':
					vscode.window.showWarningMessage('当前文档不是本地文件，已跳过更新。');
					return;
				default:
					vscode.window.showWarningMessage('当前文件无法更新 Last 字段（已跳过）。');
					return;
			}
		}

		logWarn('Update LastEdit metadata failed:', result);
		vscode.window.showErrorMessage(`更新 Last 字段失败：${result.message}`);
	});

	const batchUpdateLastEditDisposable = vscode.commands.registerCommand(
		'git-original-author-header.batchUpdateHeaderLastEditMetaInFolder',
		async (uri?: vscode.Uri) => {
			await batchUpdateHeaderLastEditMetaInFolder(uri);
		}
	);

	const autoUpdateOnSaveDisposable = vscode.workspace.onWillSaveTextDocument(event => {
		if (!readAutoUpdateLastEditOnSave()) {
			return;
		}

		const document = event.document;
		if (document.uri.scheme !== 'file') {
			return;
		}

		event.waitUntil((async (): Promise<vscode.TextEdit[]> => {
			try {
				const safeLines = resolveCheckLines();
				const lastEditors = await resolveLastEditorsForWillSave(document.uri);
				return collectLastEditOnSaveTextEdits({
					document,
					checkLines: safeLines,
					lastEditors,
					lastEditTime: formatLocalDateTime(new Date()),
				});
			} catch (error) {
				logWarn('Auto update LastEdit metadata on save failed:', error);
				return [];
			}
		})());
	});

	const autoUpdateAfterSaveDisposable = vscode.workspace.onDidSaveTextDocument(document => {
		if (!readAutoUpdateLastEditOnSave()) {
			return;
		}
		if (document.uri.scheme !== 'file') {
			return;
		}

		const uriKey = document.uri.toString();
		if (skipNextDidSaveForUri.has(uriKey)) {
			skipNextDidSaveForUri.delete(uriKey);
			return;
		}

		void autoUpdateLastEditMetaAfterSave(document).catch(error => {
			logWarn('Auto update LastEdit metadata after save failed:', error);
		});
	});

	context.subscriptions.push(insertDisposable, batchDisposable, updateLastEditDisposable, batchUpdateLastEditDisposable, autoUpdateOnSaveDisposable, autoUpdateAfterSaveDisposable);
}

/**
 * VS Code 扩展停用钩子。
 */
export function deactivate() { }
