/*
 * @Author: Anonymous-CZ
 * @Date: 2026-05-14 11:01:06
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-14 11:07:21
 * @FilePath: /insertGitOriginalHeader/src/batch/batchInsertMissingHeadersInFolder.ts
 * @Description: 递归扫描文件夹并为缺失文件头的文件批量插入 Git 原始作者注释
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { open } from 'fs/promises';
import { readBatchConfig, readCommentStyleConfig } from '../settings';
import { hasExistingGitOriginalAuthorHeader } from './headerDetector';
import { isProbablyBinaryFile } from './binary';
import { runWithConcurrency } from './concurrency';
import { insertGitOriginalHeaderForDocument, type UnknownCommentStylePicker } from '../insertHeader';

interface ScanOutcome {
	allFiles: vscode.Uri[];
	eligibleFiles: vscode.Uri[];
	missingHeaderFiles: vscode.Uri[];
	skippedBinaryFiles: vscode.Uri[];
}

interface ProcessOutcome {
	success: vscode.Uri[];
	failed: Array<{ uri: vscode.Uri; message: string }>;
	skippedAlreadyHasHeader: vscode.Uri[];
	skippedNoCommentLanguage: vscode.Uri[];
	skippedUnknownCommentStyle: vscode.Uri[];
	skippedDirty: vscode.Uri[];
	cancelled: boolean;
}

function normalizeExtensions(list: string[]): string[] {
	return (list ?? [])
		.map(s => s.trim().toLowerCase())
		.filter(Boolean)
		.map(s => (s.startsWith('.') ? s : `.${s}`));
}

function buildExcludeGlob(patterns: string[]): string | undefined {
	const cleaned = (patterns ?? []).map(p => p.trim()).filter(Boolean);
	if (cleaned.length === 0) {
		return undefined;
	}
	if (cleaned.length === 1) {
		return cleaned[0];
	}
	return `{${cleaned.join(',')}}`;
}

async function readFileHeadText(filePath: string, maxBytes: number = 65536): Promise<string> {
	const handle = await open(filePath, 'r');
	try {
		const buffer = Buffer.alloc(maxBytes);
		const { bytesRead } = await handle.read(buffer, 0, maxBytes, 0);
		if (bytesRead <= 0) {
			return '';
		}
		return buffer.subarray(0, bytesRead).toString('utf8');
	} finally {
		await handle.close();
	}
}

async function scanFolder(folderUri: vscode.Uri): Promise<ScanOutcome> {
	const batchConfig = readBatchConfig();
	const includeExtensions = normalizeExtensions(batchConfig.batchIncludeExtensions);

	const defaultExcludes = [
		'**/node_modules/**',
		'**/.git/**',
		'**/dist/**',
		'**/build/**',
		'**/out/**',
		'**/pnpm-lock.yaml',
		'**/package-lock.json',
		'**/yarn.lock',
	];
	const excludeGlob = buildExcludeGlob([...defaultExcludes, ...(batchConfig.batchExcludePatterns ?? [])]);

	const include = new vscode.RelativePattern(folderUri.fsPath, '**/*');
	const allFiles = await vscode.workspace.findFiles(include, excludeGlob);

	const skippedBinaryFiles: vscode.Uri[] = [];
	const eligibleFiles: vscode.Uri[] = [];

	for (const uri of allFiles) {
		if (uri.scheme !== 'file') {
			continue;
		}

		const ext = path.extname(uri.fsPath).toLowerCase();
		if (includeExtensions.length > 0 && !includeExtensions.includes(ext)) {
			continue;
		}

		if (batchConfig.skipBinaryFiles) {
			const isBinary = await isProbablyBinaryFile(uri.fsPath);
			if (isBinary) {
				skippedBinaryFiles.push(uri);
				continue;
			}
		}

		eligibleFiles.push(uri);
	}

	const missingHeaderFiles: vscode.Uri[] = [];
	for (const uri of eligibleFiles) {
		const headText = await readFileHeadText(uri.fsPath);
		const hasHeader = hasExistingGitOriginalAuthorHeader(headText, batchConfig.commentCheckLines);
		if (!hasHeader) {
			missingHeaderFiles.push(uri);
		}
	}

	return { allFiles, eligibleFiles, missingHeaderFiles, skippedBinaryFiles };
}

function formatUriListForOutputChannel(uris: vscode.Uri[]): string {
	return uris.map(u => u.fsPath).join('\n');
}

function buildReport(outcome: ProcessOutcome): string {
	const lines: string[] = [];
	lines.push('Git Original Author Header - Batch Report');
	lines.push('');
	lines.push(`成功: ${outcome.success.length}`);
	lines.push(`失败: ${outcome.failed.length}`);
	lines.push(`跳过(已有文件头): ${outcome.skippedAlreadyHasHeader.length}`);
	lines.push(`跳过(不支持注释): ${outcome.skippedNoCommentLanguage.length}`);
	lines.push(`跳过(无法判断注释方式): ${outcome.skippedUnknownCommentStyle.length}`);
	lines.push(`跳过(文件有未保存修改): ${outcome.skippedDirty.length}`);
	lines.push(`已取消: ${outcome.cancelled ? '是' : '否'}`);
	lines.push('');

	if (outcome.failed.length > 0) {
		lines.push('失败文件:');
		for (const item of outcome.failed) {
			lines.push(`- ${item.uri.fsPath}`);
			lines.push(`  ${item.message}`);
		}
		lines.push('');
	}

	if (outcome.skippedUnknownCommentStyle.length > 0) {
		lines.push('无法判断注释方式(已跳过):');
		lines.push(formatUriListForOutputChannel(outcome.skippedUnknownCommentStyle));
		lines.push('');
	}

	return lines.join('\n');
}

export async function batchInsertMissingHeadersInFolder(folderUriFromExplorer?: vscode.Uri): Promise<void> {
	const targetFolderUri = await pickTargetFolder(folderUriFromExplorer);
	if (!targetFolderUri) {
		return;
	}

	const batchConfig = readBatchConfig();
	const commentStyleConfig = readCommentStyleConfig();
	const outputChannel = vscode.window.createOutputChannel('Git Original Author Header (Batch)');

	let scan: ScanOutcome;
	try {
		scan = await scanFolder(targetFolderUri);
	} catch (error) {
		vscode.window.showErrorMessage(`扫描文件夹失败：${String(error)}`);
		return;
	}

	const alreadyHasHeaderCount = scan.eligibleFiles.length - scan.missingHeaderFiles.length;
	const message = `扫描完成：共找到 ${scan.allFiles.length} 个文件，符合条件 ${scan.eligibleFiles.length} 个，其中 ${scan.missingHeaderFiles.length} 个缺少文件头（已有文件头 ${alreadyHasHeaderCount} 个）。是否继续？`;
	const action = await vscode.window.showInformationMessage(message, '继续', '显示详情', '取消');
	if (!action || action === '取消') {
		return;
	}
	if (action === '显示详情') {
		outputChannel.clear();
		outputChannel.appendLine(`目标文件夹: ${targetFolderUri.fsPath}`);
		outputChannel.appendLine('');
		outputChannel.appendLine(`缺少文件头(${scan.missingHeaderFiles.length}):`);
		outputChannel.appendLine(formatUriListForOutputChannel(scan.missingHeaderFiles));
		outputChannel.show(true);

		const actionAfterDetails = await vscode.window.showInformationMessage('已输出详情到 Output 面板。是否继续执行批量补充？', '继续', '取消');
		if (actionAfterDetails !== '继续') {
			return;
		}
	}

	if (scan.missingHeaderFiles.length === 0) {
		vscode.window.showInformationMessage('没有发现需要补充文件头的文件。');
		return;
	}

	const unknownStyleCache = new Map<string, Awaited<ReturnType<UnknownCommentStylePicker>>>();
	const unknownCommentStylePicker: UnknownCommentStylePicker = async (input) => {
		const ext = path.extname(input.fileName).toLowerCase();
		const key = `${input.languageId}::${ext}`;
		if (unknownStyleCache.has(key)) {
			return unknownStyleCache.get(key)!;
		}

		const picked = await vscode.window.showQuickPick(
			[
				{ label: '跳过该类文件', description: '本次批量处理将跳过此类未知注释文件', style: null },
				{ label: 'C 块注释', description: '/* ... */', style: 'cBlock' as const },
				{ label: 'HTML 注释', description: '<!-- ... -->', style: 'htmlBlock' as const },
				{ label: '双斜杠行注释', description: '// ...', style: 'slashLine' as const },
				{ label: '井号行注释', description: '# ...', style: 'hashLine' as const },
				{ label: 'PowerShell 块注释', description: '<# ... #>', style: 'powershellBlock' as const },
				{ label: 'Lua 块注释', description: '--[[ ... ]]', style: 'luaBlock' as const },
			],
			{ title: `无法自动识别注释方式（languageId=${input.languageId}, ext=${ext || '(none)'}），请选择用于插入文件头的注释风格` }
		);
		const chosen = picked?.style ?? null;
		unknownStyleCache.set(key, chosen);
		return chosen;
	};

	const outcome: ProcessOutcome = {
		success: [],
		failed: [],
		skippedAlreadyHasHeader: [],
		skippedNoCommentLanguage: [],
		skippedUnknownCommentStyle: [],
		skippedDirty: [],
		cancelled: false,
	};

	const concurrency = batchConfig.continueOnError ? batchConfig.batchConcurrency : 1;
	let stopRequested = false;

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: '批量补充文件头注释',
			cancellable: true,
		},
		async (progress, token) => {
			const total = scan.missingHeaderFiles.length;

			await runWithConcurrency({
				items: scan.missingHeaderFiles,
				concurrency,
				token,
				worker: async (uri, index) => {
					if (token.isCancellationRequested || stopRequested) {
						return;
					}

					progress.report({
						message: `${path.basename(uri.fsPath)} (${index + 1}/${total})`,
						increment: (1 / total) * 100,
					});

					try {
						const headText = await readFileHeadText(uri.fsPath);
						if (hasExistingGitOriginalAuthorHeader(headText, batchConfig.commentCheckLines)) {
							outcome.skippedAlreadyHasHeader.push(uri);
							return;
						}

						const document = await vscode.workspace.openTextDocument(uri);
						const result = await insertGitOriginalHeaderForDocument({
							document,
							mode: 'batch',
							commentStyleConfig,
							unknownCommentStylePicker,
						});
						if (result.kind === 'inserted') {
							outcome.success.push(uri);
							return;
						}
						if (result.kind === 'skipped') {
							switch (result.reason) {
								case 'noCommentLanguage':
									outcome.skippedNoCommentLanguage.push(uri);
									return;
								case 'unknownCommentStyle':
									outcome.skippedUnknownCommentStyle.push(uri);
									return;
								case 'dirtyDocument':
									outcome.skippedDirty.push(uri);
									return;
								default:
									outcome.skippedUnknownCommentStyle.push(uri);
									return;
							}
						}

						outcome.failed.push({ uri, message: result.message });
						if (!batchConfig.continueOnError) {
							stopRequested = true;
							return;
						}
					} catch (error) {
						const message = `处理失败：${String(error)}`;
						outcome.failed.push({ uri, message });
						if (!batchConfig.continueOnError) {
							stopRequested = true;
							return;
						}
					}
				},
			});

			if (token.isCancellationRequested) {
				outcome.cancelled = true;
			}
		}
	);

	const summary = `处理完成：成功 ${outcome.success.length}，失败 ${outcome.failed.length}，跳过(已有文件头) ${outcome.skippedAlreadyHasHeader.length}，跳过(不支持注释) ${outcome.skippedNoCommentLanguage.length}，跳过(无法判断注释方式) ${outcome.skippedUnknownCommentStyle.length}。`;
	if (!batchConfig.generateReport) {
		vscode.window.showInformationMessage(summary);
		return;
	}

	const report = buildReport(outcome);
	const finalAction = await vscode.window.showInformationMessage(summary, '查看报告', '复制报告');
	if (finalAction === '复制报告') {
		await vscode.env.clipboard.writeText(report);
		vscode.window.showInformationMessage('已复制批量处理报告到剪贴板。');
	}
	if (finalAction === '查看报告') {
		const doc = await vscode.workspace.openTextDocument({ content: report, language: 'text' });
		await vscode.window.showTextDocument(doc, { preview: false });
	}
}

async function pickTargetFolder(folderUriFromExplorer?: vscode.Uri): Promise<vscode.Uri | null> {
	if (folderUriFromExplorer && folderUriFromExplorer.scheme === 'file') {
		return folderUriFromExplorer;
	}

	const defaultUri = vscode.workspace.workspaceFolders?.[0]?.uri;
	const picked = await vscode.window.showOpenDialog({
		canSelectFiles: false,
		canSelectFolders: true,
		canSelectMany: false,
		openLabel: '选择文件夹',
		defaultUri,
	});
	return picked?.[0] ?? null;
}
