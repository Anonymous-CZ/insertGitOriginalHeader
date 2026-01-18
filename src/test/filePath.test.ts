import * as assert from 'assert';
import * as vscode from 'vscode';
import { formatProjectRootFilePath, toPosixPath } from '../filePath';

suite('filePath', () => {
	test('toPosixPath: replaces backslashes with forward slashes', () => {
		assert.strictEqual(toPosixPath('a\\b\\c'), 'a/b/c');
	});

	test('formatProjectRootFilePath: adds leading slash and normalizes separators for workspace-relative paths', () => {
		const original = vscode.workspace.asRelativePath;
		try {
			(vscode.workspace.asRelativePath as unknown as (pathOrUri: string, includeWorkspaceFolder?: boolean) => string) = () =>
				'insertGitOriginalHeader\\src\\extension.ts';

			assert.strictEqual(
				formatProjectRootFilePath('D:/any/insertGitOriginalHeader/src/extension.ts'),
				'/insertGitOriginalHeader/src/extension.ts'
			);
		} finally {
			(vscode.workspace.asRelativePath as unknown as typeof vscode.workspace.asRelativePath) = original;
		}
	});

	test('formatProjectRootFilePath: keeps absolute paths absolute (no leading slash added)', () => {
		const original = vscode.workspace.asRelativePath;
		try {
			(vscode.workspace.asRelativePath as unknown as (pathOrUri: string, includeWorkspaceFolder?: boolean) => string) = () =>
				'C:\\outside\\repo\\file.ts';

			assert.strictEqual(formatProjectRootFilePath('C:/outside/repo/file.ts'), 'C:/outside/repo/file.ts');
		} finally {
			(vscode.workspace.asRelativePath as unknown as typeof vscode.workspace.asRelativePath) = original;
		}
	});
});
