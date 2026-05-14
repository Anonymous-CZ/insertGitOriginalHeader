/*
 * @Author: Anonymous-CZ
 * @Date: 2026-05-14 11:01:05
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-14 11:06:51
 * @FilePath: /insertGitOriginalHeader/src/batch/concurrency.ts
 * @Description: 简单的受控并发队列（无外部依赖）
 */
import type * as vscode from 'vscode';

export async function runWithConcurrency<TItem, TResult>(input: {
	items: TItem[];
	concurrency: number;
	token?: vscode.CancellationToken;
	worker: (item: TItem, index: number) => Promise<TResult>;
}): Promise<TResult[]> {
	const concurrency = Math.max(1, Math.floor(input.concurrency));
	const results = new Array<TResult>(input.items.length);

	let nextIndex = 0;

	const runOne = async (): Promise<void> => {
		while (true) {
			if (input.token?.isCancellationRequested) {
				return;
			}
			const index = nextIndex;
			nextIndex++;
			if (index >= input.items.length) {
				return;
			}
			results[index] = await input.worker(input.items[index], index);
		}
	};

	const workers = Array.from({ length: Math.min(concurrency, input.items.length) }, () => runOne());
	await Promise.all(workers);
	return results;
}
