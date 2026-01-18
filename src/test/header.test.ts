import * as assert from 'assert';

import { renderHeaderBodyLines, wrapWithComment } from '../header';

suite('header rendering', () => {
	test('wrapWithComment cBlock uses /* */', () => {
		const text = wrapWithComment('cBlock', ['@Author: A']);
		assert.ok(text.startsWith('/*\n'));
		assert.ok(text.includes(' * @Author: A\n'));
		assert.ok(text.endsWith(' */\n'));
	});

	test('wrapWithComment htmlBlock uses <!-- -->', () => {
		const text = wrapWithComment('htmlBlock', ['@Author: A']);
		assert.ok(text.startsWith('<!--\n'));
		assert.ok(text.includes(' * @Author: A\n'));
		assert.ok(text.endsWith('-->\n'));
	});

	test('wrapWithComment hashLine prefixes each line', () => {
		const text = wrapWithComment('hashLine', ['@Author: A', '@Date: D']);
		assert.strictEqual(text, '# @Author: A\n# @Date: D\n');
	});

	test('renderHeaderBodyLines includes required fields', () => {
		const lines = renderHeaderBodyLines({
			author: 'A',
			date: '2024-01-02 03:04:05',
			lastEditors: 'B',
			lastEditTime: '2024-01-02 03:04:06',
			filePath: 'x/y.ts',
			description: '',
		});
		assert.ok(lines.some(l => l.startsWith('@Author: ')));
		assert.ok(lines.some(l => l.startsWith('@Date: ')));
		assert.ok(lines.some(l => l.startsWith('@LastEditors: ')));
		assert.ok(lines.some(l => l.startsWith('@LastEditTime: ')));
		assert.ok(lines.some(l => l.startsWith('@FilePath: ')));
		assert.ok(lines.some(l => l.startsWith('@Description: ')));
	});
});
