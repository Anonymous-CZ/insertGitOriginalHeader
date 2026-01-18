import * as assert from 'assert';

import { getUnknownFileBehavior, resolveCommentStyle } from '../commentStyle';

suite('commentStyle resolution', () => {
	test('resolves by default language mapping', () => {
		const r = resolveCommentStyle({ languageId: 'typescript', fileName: 'a.ts' });
		assert.strictEqual(r.style, 'cBlock');
		assert.strictEqual(r.reason, 'defaultByLanguage');
	});

	test('resolves by configured language override', () => {
		const r = resolveCommentStyle({
			languageId: 'python',
			fileName: 'a.py',
			config: { commentStyleByLanguage: { python: 'slashLine' } },
		});
		assert.strictEqual(r.style, 'slashLine');
		assert.strictEqual(r.reason, 'configuredByLanguage');
	});

	test('resolves by configured extension override', () => {
		const r = resolveCommentStyle({
			languageId: 'plaintext',
			fileName: 'a.custom',
			config: { commentStyleByExtension: { '.custom': 'hashLine' } },
		});
		assert.strictEqual(r.style, 'hashLine');
		assert.strictEqual(r.reason, 'configuredByExtension');
	});

	test('json is treated as no-comment language', () => {
		const r = resolveCommentStyle({ languageId: 'json', fileName: 'a.json' });
		assert.strictEqual(r.style, null);
		assert.strictEqual(r.reason, 'noCommentLanguage');
	});

	test('unknown behavior default is skip', () => {
		assert.strictEqual(getUnknownFileBehavior(undefined), 'skip');
	});
});
