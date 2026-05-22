/*
 * @Author: Anonymous-CZ
 * @Date: 2026-05-14 13:36:28
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-22 16:03:48
 * @FilePath: /insertGitOriginalHeader/src/batch/batchUpdateHeaderLastEditMetaInFolder.ts
 * @Description: 递归扫描文件夹并批量更新文件头中的 LastEditors/LastEditTime
 */
import * as vscode from 'vscode';
import * as path from 'path';
import { open } from 'fs/promises';
import { readBatchConfig } from '../settings';
import { hasExistingGitOriginalAuthorHeader } from './headerDetector';
import { isProbablyBinaryFile } from './binary';
import { runWithConcurrency } from './concurrency';
import { getCurrentGitUserName } from '../insertHeader';
import { formatLocalDateTime } from '../dateTime';
import { updateHeaderLastEditMetaForDocument } from '../updateLastEditMeta';

interface ScanOutcome {
	allFiles: vscode.Uri[];
	eligibleFiles: vscode.Uri[];
	headerFiles: vscode.Uri[];
	skippedBinaryFiles: vscode.Uri[];
}

interface ProcessOutcome {
	success: vscode.Uri[];
	failed: Array<{ uri: vscode.Uri; message: string }>;
	skippedNoHeader: vscode.Uri[];
	skippedMissingLastFields: vscode.Uri[];
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

	const headerFiles: vscode.Uri[] = [];
	for (const uri of eligibleFiles) {
		const headText = await readFileHeadText(uri.fsPath);
		const hasHeader = hasExistingGitOriginalAuthorHeader(headText, batchConfig.commentCheckLines);
		if (hasHeader) {
			headerFiles.push(uri);
		}
	}

	return { allFiles, eligibleFiles, headerFiles, skippedBinaryFiles };
}

function formatUriListForOutputChannel(uris: vscode.Uri[]): string {
	return uris.map(u => u.fsPath).join('\n');
}

function buildReport(outcome: ProcessOutcome): string {
	const lines: string[] = [];
	lines.push('Git Original Author Header - Batch LastEdit Update Report');
	lines.push('');
	lines.push(`成功: ${outcome.success.length}`);
	lines.push(`失败: ${outcome.failed.length}`);
	lines.push(`跳过(无文件头): ${outcome.skippedNoHeader.length}`);
	lines.push(`跳过(缺少 Last 字段): ${outcome.skippedMissingLastFields.length}`);
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

	if (outcome.skippedMissingLastFields.length > 0) {
		lines.push('缺少 Last 字段(已跳过):');
		lines.push(formatUriListForOutputChannel(outcome.skippedMissingLastFields));
		lines.push('');
	}

	return lines.join('\n');
}

export async function batchUpdateHeaderLastEditMetaInFolder(folderUriFromExplorer?: vscode.Uri): Promise<void> {
	const targetFolderUri = await pickTargetFolder(folderUriFromExplorer);
	if (!targetFolderUri) {
		return;
	}

	const batchConfig = readBatchConfig();
	const outputChannel = vscode.window.createOutputChannel('Git Original Author Header (Batch Update LastEdit)');

	let scan: ScanOutcome;
	try {
		scan = await scanFolder(targetFolderUri);
	} catch (error) {
		vscode.window.showErrorMessage(`扫描文件夹失败：${String(error)}`);
		return;
	}

	const noHeaderCount = scan.eligibleFiles.length - scan.headerFiles.length;
	const message = `扫描完成：共找到 ${scan.allFiles.length} 个文件，符合条件 ${scan.eligibleFiles.length} 个，其中 ${scan.headerFiles.length} 个包含可更新文件头（无文件头 ${noHeaderCount} 个）。是否继续？`;
	const action = await vscode.window.showInformationMessage(message, '继续', '显示详情', '取消');
	if (!action || action === '取消') {
		return;
	}
	if (action === '显示详情') {
		outputChannel.clear();
		outputChannel.appendLine(`目标文件夹: ${targetFolderUri.fsPath}`);
		outputChannel.appendLine('');
		outputChannel.appendLine(`可更新文件(${scan.headerFiles.length}):`);
		outputChannel.appendLine(formatUriListForOutputChannel(scan.headerFiles));
		outputChannel.show(true);

		const actionAfterDetails = await vscode.window.showInformationMessage('已输出详情到 Output 面板。是否继续执行批量更新 Last 字段？', '继续', '取消');
		if (actionAfterDetails !== '继续') {
			return;
		}
	}

	if (scan.headerFiles.length === 0) {
		vscode.window.showInformationMessage('没有发现可更新 LastEditors/LastEditTime 的文件头。');
		return;
	}

	const outcome: ProcessOutcome = {
		success: [],
		failed: [],
		skippedNoHeader: [],
		skippedMissingLastFields: [],
		skippedDirty: [],
		cancelled: false,
	};

	const concurrency = batchConfig.continueOnError ? batchConfig.batchConcurrency : 1;
	let stopRequested = false;

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: '批量更新 LastEditors/LastEditTime',
			cancellable: true,
		},
		async (progress, token) => {
			const total = scan.headerFiles.length;

			await runWithConcurrency({
				items: scan.headerFiles,
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
						if (!hasExistingGitOriginalAuthorHeader(headText, batchConfig.commentCheckLines)) {
							outcome.skippedNoHeader.push(uri);
							return;
						}

						const document = await vscode.workspace.openTextDocument(uri);
						const currentGitUserName = await getCurrentGitUserName(uri);
						const result = await updateHeaderLastEditMetaForDocument({
							document,
							checkLines: batchConfig.commentCheckLines,
							lastEditors: currentGitUserName || 'Current User',
							lastEditTime: formatLocalDateTime(new Date()),
						});

						if (result.kind === 'updated') {
							outcome.success.push(uri);
							return;
						}
						if (result.kind === 'skipped') {
							switch (result.reason) {
								case 'headerNotFound':
									outcome.skippedNoHeader.push(uri);
									return;
								case 'missingLastFields':
									outcome.skippedMissingLastFields.push(uri);
									return;
								case 'dirtyDocument':
									outcome.skippedDirty.push(uri);
									return;
								default:
									outcome.skippedNoHeader.push(uri);
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

	const summary = `处理完成：成功 ${outcome.success.length}，失败 ${outcome.failed.length}，跳过(无文件头) ${outcome.skippedNoHeader.length}，跳过(缺少 Last 字段) ${outcome.skippedMissingLastFields.length}，跳过(文件有未保存修改) ${outcome.skippedDirty.length}。`;
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
