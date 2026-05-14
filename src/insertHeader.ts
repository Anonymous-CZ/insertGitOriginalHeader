/*
 * @Author: Anonymous-CZ
 * @Date: 2026-05-14 11:01:05
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-14 11:06:09
 * @FilePath: /insertGitOriginalHeader/src/insertHeader.ts
 * @Description: 复用的“插入 Git 原始作者文件头”实现（单文件/批量共用）
 */
import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { stat } from 'fs/promises';
import { formatProjectRootFilePath } from './filePath';
import { formatLocalDateTime, parseLocalDateTimeString, pickEarliestDate } from './dateTime';
import { getUnknownFileBehavior, resolveCommentStyle, type CommentStyle, type CommentStyleConfig } from './commentStyle';
import { renderHeaderBodyLines, wrapWithComment } from './header';
import { pickAuthor } from './author';
import { buildGitOriginalCommitArgs, parseGitOriginalCommitStdout, toGitPathSpec, type GitCommitInfo } from './gitOriginalCommit';

const execFileAsync = promisify(execFile);

export type InsertMode = 'single' | 'batch';

export type InsertHeaderResult =
	| { kind: 'inserted'; commentStyle: CommentStyle }
	| { kind: 'skipped'; reason: 'noCommentLanguage' | 'unknownCommentStyle' | 'notFileDocument' | 'dirtyDocument' }
	| { kind: 'failed'; reason: 'applyEditFailed' | 'saveFailed'; message: string };

export interface UnknownCommentStyleInput {
	languageId: string;
	fileName: string;
}

export type UnknownCommentStylePicker = (input: UnknownCommentStyleInput) => Promise<CommentStyle | null>;

function getGitCwdForUri(targetUri: vscode.Uri | undefined): string | undefined {
	if (targetUri && targetUri.scheme === 'file') {
		const folder = vscode.workspace.getWorkspaceFolder(targetUri);
		if (folder) {
			return folder.uri.fsPath;
		}
	}

	const firstFolder = vscode.workspace.workspaceFolders?.[0];
	if (firstFolder) {
		return firstFolder.uri.fsPath;
	}

	// Back-compat for older VS Code APIs / older workspace shapes
	return vscode.workspace.rootPath ?? undefined;
}

async function getCurrentGitUserName(documentUri: vscode.Uri): Promise<string> {
	try {
		const { stdout } = await execFileAsync('git', ['config', 'user.name'], { cwd: getGitCwdForUri(documentUri) });
		return (stdout ?? '').trim();
	} catch {
		return '';
	}
}

async function getFileBirthTime(filePath: string): Promise<Date | null> {
	try {
		const stats = await stat(filePath);
		const birthtime = stats.birthtime;
		if (!birthtime || Number.isNaN(birthtime.getTime()) || birthtime.getTime() === 0) {
			return null;
		}
		return birthtime;
	} catch {
		return null;
	}
}

async function getOriginalGitCommitInfo(input: { filePath: string; documentUri: vscode.Uri }): Promise<GitCommitInfo> {
	const cwd = getGitCwdForUri(input.documentUri);
	const pathSpec = cwd ? toGitPathSpec(input.filePath, cwd) : input.filePath;
	const args = buildGitOriginalCommitArgs(pathSpec, { followRenames: true });

	try {
		const { stdout } = await execFileAsync('git', args, { cwd });
		return parseGitOriginalCommitStdout(stdout ?? '');
	} catch {
		return { author: '', date: '' };
	}
}

async function resolveUnknownCommentStyle(input: {
	languageId: string;
	fileName: string;
	config: CommentStyleConfig;
	picker?: UnknownCommentStylePicker;
}): Promise<CommentStyle | null> {
	const unknownBehavior = getUnknownFileBehavior(input.config);
	if (unknownBehavior === 'skip') {
		return null;
	}
	if (unknownBehavior === 'fallback') {
		return 'cBlock';
	}

	// unknownBehavior === 'prompt'
	if (!input.picker) {
		return null;
	}
	return input.picker({ languageId: input.languageId, fileName: input.fileName });
}

export async function insertGitOriginalHeaderForDocument(input: {
	document: vscode.TextDocument;
	editor?: vscode.TextEditor;
	mode: InsertMode;
	commentStyleConfig: CommentStyleConfig;
	unknownCommentStylePicker?: UnknownCommentStylePicker;
}): Promise<InsertHeaderResult> {
	const document = input.document;
	if (document.uri.scheme !== 'file') {
		return { kind: 'skipped', reason: 'notFileDocument' };
	}
	if (document.isDirty) {
		return { kind: 'skipped', reason: 'dirtyDocument' };
	}

	const filePath = document.fileName;
	const documentUri = document.uri;
	const languageId = document.languageId;

	const resolved = resolveCommentStyle({ languageId, fileName: filePath, config: input.commentStyleConfig });
	if (resolved.reason === 'noCommentLanguage') {
		return { kind: 'skipped', reason: 'noCommentLanguage' };
	}

	let chosenCommentStyle = resolved.style;
	if (!chosenCommentStyle) {
		chosenCommentStyle = await resolveUnknownCommentStyle({
			languageId,
			fileName: filePath,
			config: input.commentStyleConfig,
			picker: input.unknownCommentStylePicker,
		});
		if (!chosenCommentStyle) {
			return { kind: 'skipped', reason: 'unknownCommentStyle' };
		}
	}

	const currentGitUserName = await getCurrentGitUserName(documentUri);

	const originalCommitInfo = await getOriginalGitCommitInfo({ filePath, documentUri });
	const originalAuthor = pickAuthor({
		gitOriginalAuthor: originalCommitInfo.author,
		currentGitUserName,
	});
	const gitOriginalDateString = originalCommitInfo.date;
	const gitOriginalDate = parseLocalDateTimeString(gitOriginalDateString);

	const fileBirthTime = await getFileBirthTime(filePath);
	const chosenDate = pickEarliestDate(gitOriginalDate, fileBirthTime) ?? parseLocalDateTimeString('1970-01-01 00:00:00')!;
	const chosenDateString = formatLocalDateTime(chosenDate);

	const lastEditor = currentGitUserName || 'Current User';
	const currentDateTime = formatLocalDateTime(new Date());
	const relativeFilePath = formatProjectRootFilePath(filePath);

	const headerLines = renderHeaderBodyLines({
		author: originalAuthor,
		date: chosenDateString,
		lastEditors: lastEditor,
		lastEditTime: currentDateTime,
		filePath: relativeFilePath,
		description: '',
	});
	const header = wrapWithComment(chosenCommentStyle, headerLines);

	if (input.editor && input.editor.document === document) {
		await input.editor.edit(editBuilder => {
			editBuilder.insert(new vscode.Position(0, 0), header);
		});
		return { kind: 'inserted', commentStyle: chosenCommentStyle };
	}

	const edit = new vscode.WorkspaceEdit();
	edit.insert(documentUri, new vscode.Position(0, 0), header);
	const applied = await vscode.workspace.applyEdit(edit);
	if (!applied) {
		return { kind: 'failed', reason: 'applyEditFailed', message: '无法应用编辑（workspace.applyEdit 返回 false）' };
	}
	const saved = await document.save();
	if (!saved) {
		return { kind: 'failed', reason: 'saveFailed', message: '无法保存文件（document.save 返回 false）' };
	}

	return { kind: 'inserted', commentStyle: chosenCommentStyle };
}
