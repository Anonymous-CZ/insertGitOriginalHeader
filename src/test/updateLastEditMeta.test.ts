import * as assert from 'assert';

import { collectLastEditMetaLineUpdates } from '../updateLastEditMeta';

suite('updateLastEditMeta', () => {
	test('updates Last fields for cBlock-style header lines', () => {
		const lines = [
			'/*',
			' * @Author: Alice',
			' * @Date: 2024-01-01 00:00:00',
			' * @LastEditors: OldUser',
			' * @LastEditTime: 2024-01-01 00:00:01',
			' * @FilePath: /repo/src/a.ts',
			' * @Description: ',
			' */',
		];

		const result = collectLastEditMetaLineUpdates({
			lines,
			checkLines: 20,
			lastEditors: 'NewUser',
			lastEditTime: '2026-05-22 12:00:00',
		});

		assert.strictEqual(result.kind, 'updatable');
		if (result.kind !== 'updatable') {
			return;
		}

		assert.deepStrictEqual(result.updates, [
			{ line: 3, text: ' * @LastEditors: NewUser' },
			{ line: 4, text: ' * @LastEditTime: 2026-05-22 12:00:00' },
		]);
	});

	test('updates Last fields for hash-line style header lines', () => {
		const lines = [
			'# @Author: Alice',
			'# @Date: 2024-01-01 00:00:00',
			'# @LastEditors: Before',
			'# @LastEditTime: 2024-01-01 00:00:01',
			'# @FilePath: /repo/src/a.py',
			'# @Description: ',
		];

		const result = collectLastEditMetaLineUpdates({
			lines,
			checkLines: 20,
			lastEditors: 'After',
			lastEditTime: '2026-05-22 13:00:00',
		});

		assert.strictEqual(result.kind, 'updatable');
		if (result.kind !== 'updatable') {
			return;
		}

		assert.deepStrictEqual(result.updates, [
			{ line: 2, text: '# @LastEditors: After' },
			{ line: 3, text: '# @LastEditTime: 2026-05-22 13:00:00' },
		]);
	});

	test('skips when extension header markers are missing', () => {
		const result = collectLastEditMetaLineUpdates({
			lines: ['const a = 1;'],
			checkLines: 20,
			lastEditors: 'A',
			lastEditTime: '2026-05-22 13:00:00',
		});
		assert.deepStrictEqual(result, { kind: 'skipped', reason: 'headerNotFound' });
	});

	test('skips when header exists but Last fields are missing', () => {
		const lines = [
			'/*',
			' * @Author: Alice',
			' * @Date: 2024-01-01 00:00:00',
			' * @FilePath: /repo/src/a.ts',
			' */',
		];
		const result = collectLastEditMetaLineUpdates({
			lines,
			checkLines: 20,
			lastEditors: 'A',
			lastEditTime: '2026-05-22 13:00:00',
		});
		assert.deepStrictEqual(result, { kind: 'skipped', reason: 'missingLastFields' });
	});

	test('respects checkLines when locating header', () => {
		const lines = [
			'line1',
			'line2',
			'line3',
			'/*',
			' * @Author: Alice',
			' * @Date: 2024-01-01 00:00:00',
			' * @LastEditors: Before',
			' * @LastEditTime: 2024-01-01 00:00:01',
			' * @FilePath: /repo/src/a.ts',
			' */',
		];
		const result = collectLastEditMetaLineUpdates({
			lines,
			checkLines: 3,
			lastEditors: 'After',
			lastEditTime: '2026-05-22 13:00:00',
		});
		assert.deepStrictEqual(result, { kind: 'skipped', reason: 'headerNotFound' });
	});
});
