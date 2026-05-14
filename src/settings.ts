/*
 * @Author: Anonymous-CZ
 * @Date: 2026-05-14 11:01:04
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-14 11:06:24
 * @FilePath: /insertGitOriginalHeader/src/settings.ts
 * @Description: 读取 VS Code Settings（注释风格配置与批量处理配置）
 */
import * as vscode from 'vscode';
import type { CommentStyle, CommentStyleConfig, UnknownFileBehavior } from './commentStyle';

export interface BatchConfig {
	batchConcurrency: number;
	batchExcludePatterns: string[];
	batchIncludeExtensions: string[];
	commentCheckLines: number;
	skipBinaryFiles: boolean;
	continueOnError: boolean;
	generateReport: boolean;
}

export function readCommentStyleConfig(): CommentStyleConfig {
	const config = vscode.workspace.getConfiguration('git-original-author-header');
	return {
		commentStyleByLanguage: config.get<Record<string, CommentStyle>>('commentStyleByLanguage'),
		commentStyleByExtension: config.get<Record<string, CommentStyle>>('commentStyleByExtension'),
		unknownFileBehavior: config.get<UnknownFileBehavior>('unknownFileBehavior'),
	};
}

export function readBatchConfig(): BatchConfig {
	const config = vscode.workspace.getConfiguration('git-original-author-header');
	return {
		batchConcurrency: config.get<number>('batchConcurrency') ?? 5,
		batchExcludePatterns: config.get<string[]>('batchExcludePatterns') ?? [],
		batchIncludeExtensions: config.get<string[]>('batchIncludeExtensions') ?? [],
		commentCheckLines: config.get<number>('commentCheckLines') ?? 20,
		skipBinaryFiles: config.get<boolean>('skipBinaryFiles') ?? true,
		continueOnError: config.get<boolean>('continueOnError') ?? false,
		generateReport: config.get<boolean>('generateReport') ?? true,
	};
}
