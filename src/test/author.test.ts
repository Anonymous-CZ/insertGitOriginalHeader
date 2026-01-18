import * as assert from 'assert';

import { pickAuthor } from '../author';

suite('author fallback', () => {
	test('uses git original author when available', () => {
		const author = pickAuthor({ gitOriginalAuthor: 'Alice', currentGitUserName: 'Bob' });
		assert.strictEqual(author, 'Alice');
	});

	test('falls back to current git user when git author missing', () => {
		const author = pickAuthor({ gitOriginalAuthor: '   ', currentGitUserName: 'Bob' });
		assert.strictEqual(author, 'Bob');
	});

	test('falls back to Unknown Author when both missing', () => {
		const author = pickAuthor({ gitOriginalAuthor: '', currentGitUserName: '' });
		assert.strictEqual(author, 'Unknown Author');
	});
});
