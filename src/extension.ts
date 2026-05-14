/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-18 13:30:06
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-14 11:06:00
 * @FilePath: /insertGitOriginalHeader/src/extension.ts
 * @Description: VS Code 扩展入口：获取 Git 原始作者/时间并按注释风格插入文件头。
 */

import * as vscode from 'vscode';
import type { CommentStyle } from './commentStyle';
import { readCommentStyleConfig } from './settings';
import { insertGitOriginalHeaderForDocument } from './insertHeader';
import { batchInsertMissingHeadersInFolder } from './batch/batchInsertMissingHeadersInFolder';
const DEBUG_LOG_ENABLED = process.env.GIT_ORIGINAL_AUTHOR_HEADER_DEBUG === '1'; // 设为 "1" 时输出调试日志

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

/**
 * VS Code 扩展激活入口：注册命令并在执行时向文件顶部插入头注释。
 *
 * @param context VS Code 提供的扩展上下文，用于管理订阅生命周期
 */
export function activate(context: vscode.ExtensionContext) {
	logChannel = vscode.window.createOutputChannel('Git Original Author Header', { log: true });
	context.subscriptions.push(logChannel);

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

	context.subscriptions.push(insertDisposable, batchDisposable);
}

/**
 * VS Code 扩展停用钩子。
 */
export function deactivate() { }
