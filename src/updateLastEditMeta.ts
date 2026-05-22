/*
 * @Author: Anonymous-CZ
 * @Date: 2026-05-22 11:37:30
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-22 13:59:47
 * @FilePath: /insertGitOriginalHeader/src/updateLastEditMeta.ts
 * @Description: 仅更新文件头中的 LastEditors/LastEditTime 字段
 */

import * as vscode from 'vscode';

export interface HeaderLineUpdate {
	line: number;
	text: string;
}

export type CollectLastEditMetaUpdateResult =
	| { kind: 'updatable'; updates: HeaderLineUpdate[] }
	| { kind: 'skipped'; reason: 'headerNotFound' | 'missingLastFields' };

export type UpdateHeaderLastEditMetaResult =
	| { kind: 'updated' }
	| { kind: 'skipped'; reason: 'notFileDocument' | 'dirtyDocument' | 'headerNotFound' | 'missingLastFields' }
	| { kind: 'failed'; reason: 'applyEditFailed' | 'saveFailed'; message: string };

function clampCheckLines(checkLines: number): number {
	return Math.max(1, Math.min(200, Math.floor(checkLines)));
}

function replaceHeaderFieldValue(line: string, field: '@LastEditors' | '@LastEditTime', value: string): string | null {
	const fieldIndex = line.indexOf(field);
	if (fieldIndex < 0) {
		return null;
	}

	const colonIndex = line.indexOf(':', fieldIndex + field.length);
	if (colonIndex < 0) {
		return null;
	}

	const afterColon = line.slice(colonIndex + 1);
	const leadingWhitespace = /^\s*/.exec(afterColon)?.[0] ?? ' ';
	const separator = leadingWhitespace.length > 0 ? leadingWhitespace : ' ';
	return `${line.slice(0, colonIndex + 1)}${separator}${value}`;
}

export function collectLastEditMetaLineUpdates(input: {
	lines: string[];
	checkLines: number;
	lastEditors: string;
	lastEditTime: string;
}): CollectLastEditMetaUpdateResult {
	const safeLines = clampCheckLines(input.checkLines);
	const headLines = input.lines.slice(0, safeLines);

	const hasHeader =
		headLines.some(line => line.includes('@Author')) &&
		headLines.some(line => line.includes('@Date')) &&
		headLines.some(line => line.includes('@FilePath'));
	if (!hasHeader) {
		return { kind: 'skipped', reason: 'headerNotFound' };
	}

	const lastEditorsLine = headLines.findIndex(line => line.includes('@LastEditors'));
	const lastEditTimeLine = headLines.findIndex(line => line.includes('@LastEditTime'));
	if (lastEditorsLine < 0 || lastEditTimeLine < 0) {
		return { kind: 'skipped', reason: 'missingLastFields' };
	}

	const nextLastEditorsLine = replaceHeaderFieldValue(headLines[lastEditorsLine], '@LastEditors', input.lastEditors);
	const nextLastEditTimeLine = replaceHeaderFieldValue(headLines[lastEditTimeLine], '@LastEditTime', input.lastEditTime);
	if (!nextLastEditorsLine || !nextLastEditTimeLine) {
		return { kind: 'skipped', reason: 'missingLastFields' };
	}

	return {
		kind: 'updatable',
		updates: [
			{ line: lastEditorsLine, text: nextLastEditorsLine },
			{ line: lastEditTimeLine, text: nextLastEditTimeLine },
		],
	};
}

export async function updateHeaderLastEditMetaForDocument(input: {
	document: vscode.TextDocument;
	editor?: vscode.TextEditor;
	checkLines: number;
	lastEditors: string;
	lastEditTime: string;
}): Promise<UpdateHeaderLastEditMetaResult> {
	const document = input.document;
	if (document.uri.scheme !== 'file') {
		return { kind: 'skipped', reason: 'notFileDocument' };
	}
	if (document.isDirty) {
		return { kind: 'skipped', reason: 'dirtyDocument' };
	}

	const lines = Array.from({ length: document.lineCount }, (_, index) => document.lineAt(index).text);
	const collected = collectLastEditMetaLineUpdates({
		lines,
		checkLines: input.checkLines,
		lastEditors: input.lastEditors,
		lastEditTime: input.lastEditTime,
	});
	if (collected.kind === 'skipped') {
		return collected;
	}

	if (input.editor && input.editor.document === document) {
		const edited = await input.editor.edit(editBuilder => {
			for (const update of collected.updates) {
				const line = document.lineAt(update.line);
				editBuilder.replace(new vscode.Range(update.line, 0, update.line, line.text.length), update.text);
			}
		});
		if (!edited) {
			return { kind: 'failed', reason: 'applyEditFailed', message: '无法应用编辑（TextEditor.edit 返回 false）' };
		}
		return { kind: 'updated' };
	}

	const edit = new vscode.WorkspaceEdit();
	for (const update of collected.updates) {
		const line = document.lineAt(update.line);
		edit.replace(document.uri, new vscode.Range(update.line, 0, update.line, line.text.length), update.text);
	}

	const applied = await vscode.workspace.applyEdit(edit);
	if (!applied) {
		return { kind: 'failed', reason: 'applyEditFailed', message: '无法应用编辑（workspace.applyEdit 返回 false）' };
	}

	const saved = await document.save();
	if (!saved) {
		return { kind: 'failed', reason: 'saveFailed', message: '无法保存文件（document.save 返回 false）' };
	}

	return { kind: 'updated' };
}
