import * as assert from 'assert';

import { hasExistingGitOriginalAuthorHeader } from '../batch/headerDetector';

suite('batch header detector', () => {
	test('detects header when markers are in first N lines', () => {
		const text = [
			'/*',
			' * @Author: A',
			' * @Date: 2024-01-01 00:00:00',
			' * @FilePath: /x/y.ts',
			' */',
			'const x = 1;',
		].join('\n');
		assert.strictEqual(hasExistingGitOriginalAuthorHeader(text, 20), true);
	});

	test('does not detect when markers are after checkLines', () => {
		const text = [
			'line1',
			'line2',
			'line3',
			'line4',
			'@Author: A',
			'@Date: D',
			'@FilePath: P',
		].join('\n');
		assert.strictEqual(hasExistingGitOriginalAuthorHeader(text, 3), false);
	});

	test('requires all three markers', () => {
		const text = [
			'@Author: A',
			'@Date: D',
			'// missing file path marker',
		].join('\n');
		assert.strictEqual(hasExistingGitOriginalAuthorHeader(text, 20), false);
	});
});
