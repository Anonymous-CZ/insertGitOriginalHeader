import * as assert from 'assert';
import * as vscode from 'vscode';

import { readAutoUpdateLastEditOnSave } from '../settings';

suite('settings', () => {
	test('readAutoUpdateLastEditOnSave defaults to true', () => {
		const original = vscode.workspace.getConfiguration;
		try {
			(vscode.workspace.getConfiguration as unknown as typeof vscode.workspace.getConfiguration) = () => ({
				get: () => undefined,
			} as unknown as vscode.WorkspaceConfiguration);

			assert.strictEqual(readAutoUpdateLastEditOnSave(), true);
		} finally {
			(vscode.workspace.getConfiguration as unknown as typeof vscode.workspace.getConfiguration) = original;
		}
	});

	test('readAutoUpdateLastEditOnSave reads configured true', () => {
		const original = vscode.workspace.getConfiguration;
		try {
			(vscode.workspace.getConfiguration as unknown as typeof vscode.workspace.getConfiguration) = () => ({
				get: <T>(section: string): T | undefined => {
					if (section === 'autoUpdateLastEditOnSave') {
						return true as T;
					}
					return undefined;
				},
			} as unknown as vscode.WorkspaceConfiguration);

			assert.strictEqual(readAutoUpdateLastEditOnSave(), true);
		} finally {
			(vscode.workspace.getConfiguration as unknown as typeof vscode.workspace.getConfiguration) = original;
		}
	});
});
